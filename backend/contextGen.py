import os
import io
import json
import tempfile
import requests
import pdfplumber
import pytesseract
from PIL import Image
from supabase import create_client, Client
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv


# ── Load env ────────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE: str = os.environ["SUPABASE_SERVICE_ROLE"]
GOOGLE_API_KEY: str = os.environ["GOOGLE_API_KEY"]
GROQ_API_KEY: str = os.environ["GROQ_API_KEY"]
GROQ_MODEL: str = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# ── Clients ─────────────────────────────────────────────────────────────────
_supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GOOGLE_API_KEY,
)

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)

CATEGORIES = ["about_company", "services_or_products"]

# ── Helpers ─────────────────────────────────────────────────────────────────
_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif"}


def _download_file(url: str) -> bytes:
    """Download a file from a public URL and return raw bytes."""
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    return resp.content


def _extract_text_from_pdf(data: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber."""
    text_parts: list[str] = []
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        with pdfplumber.open(tmp.name) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    return "\n".join(text_parts)


def _extract_text_from_image(data: bytes) -> str:
    """Extract text from image bytes using pytesseract."""
    image = Image.open(io.BytesIO(data))
    return pytesseract.image_to_string(image)


def _extract_text(url: str) -> str:
    """Download file from URL and extract text based on file type."""
    data = _download_file(url)
    path = url.split("?")[0].lower()
    if path.endswith(".pdf"):
        return _extract_text_from_pdf(data)
    elif any(path.endswith(ext) for ext in _IMAGE_EXTENSIONS):
        return _extract_text_from_image(data)
    else:
        try:
            return _extract_text_from_pdf(data)
        except Exception:
            return _extract_text_from_image(data)


def _structure_text(merged_text: str) -> dict[str, str]:
    """Call Groq to split merged text into two semantic buckets."""
    system_prompt = (
        "You are a text structuring assistant. Given company information, "
        "split it into exactly two categories.\n\n"
        "Respond with ONLY a valid JSON object, no markdown, no explanation:\n"
        "{\n"
        '  "about_company": "Everything about the company — history, mission, '
        'vision, values, team, founding story, location, culture, etc.",\n'
        '  "services_or_products": "Everything about what the company sells or '
        'offers — products, services, pricing, features, packages, menu items, etc."\n'
        "}\n\n"
        "Rules:\n"
        "- Include ALL relevant text in the appropriate category\n"
        "- If text fits both, put it in the more relevant one\n"
        "- If no info exists for a category, use an empty string\n"
        "- Output ONLY raw JSON, nothing else"
    )

    resp = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": merged_text},
            ],
            "temperature": 0,
            "max_tokens": 4096,
        },
        timeout=60,
    )
    resp.raise_for_status()

    raw = resp.json()["choices"][0]["message"]["content"].strip()

    # Strip markdown fences if present
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        structured = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Groq returned invalid JSON. Parse error: {e}\nRaw output:\n{raw[:500]}"
        )

    # Validate keys
    for key in CATEGORIES:
        if key not in structured:
            structured[key] = ""

    return structured


# ── Main ingestion ──────────────────────────────────────────────────────────
def ingest(company_id: str) -> None:
    """
    2-bucket semantic Tree RAG ingestion pipeline:
    1. Fetch company from `context` table
    2. Download & extract text from linked document
    3. Structure text into about_company / services_or_products via Groq
    4. Chunk each category separately
    5. Generate embeddings via Google Generative AI
    6. Store each chunk in `company_embeddings` with category metadata
    """
    # 1. Fetch company record
    result = (
        _supabase.table("context")
        .select("company_id, company_name, description, content")
        .eq("company_id", company_id)
        .single()
        .execute()
    )
    company = result.data
    if not company:
        raise ValueError(f"No company found with id: {company_id}")

    name: str = company.get("company_name", "")
    description: str = company.get("description", "")
    content_url: str = company.get("content", "")

    # 2. Extract document text
    document_text = ""
    if content_url:
        document_text = _extract_text(content_url)

    # 3. Merge into a single string for structuring
    merged_text = "\n\n".join(
        part for part in [
            f"Company Name: {name}",
            f"Description: {description}",
            f"Document Content:\n{document_text}" if document_text else "",
        ] if part
    )

    # 4. Structure via Groq into two buckets
    print(f"[contextGen] Structuring text for '{name}'...")
    structured = _structure_text(merged_text)

    # 5. Chunk + embed each category
    all_rows: list[dict] = []

    for category in CATEGORIES:
        text = structured.get(category, "").strip()
        if not text:
            print(f"[contextGen] Skipping '{category}' — empty")
            continue

        chunks = _splitter.split_text(text)
        if not chunks:
            continue

        vectors = _embeddings.embed_documents(chunks)

        for idx, (chunk, vector) in enumerate(zip(chunks, vectors)):
            all_rows.append({
                "company_id": company_id,
                "content": chunk,
                "embedding": vector,
                "metadata": json.dumps({
                    "company_name": name,
                    "category": category,
                    "chunk_index": idx,
                }),
            })

        print(f"[contextGen] '{category}' → {len(chunks)} chunks")

    if not all_rows:
        raise ValueError("No text chunks produced — nothing to embed.")

    # 6. Batch insert
    _supabase.table("company_embeddings").insert(all_rows).execute()

    print(f"Stored successfully — {len(all_rows)} chunks embedded for '{name}'")


# ── Standalone execution ────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python contextGen.py <company_id>")
        sys.exit(1)
    ingest(sys.argv[1])
