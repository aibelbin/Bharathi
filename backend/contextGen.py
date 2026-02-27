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
    # Determine file type from URL path (strip query params)
    path = url.split("?")[0].lower()
    if path.endswith(".pdf"):
        return _extract_text_from_pdf(data)
    elif any(path.endswith(ext) for ext in _IMAGE_EXTENSIONS):
        return _extract_text_from_image(data)
    else:
        # Fallback: try PDF first, then image
        try:
            return _extract_text_from_pdf(data)
        except Exception:
            return _extract_text_from_image(data)


# ── Main ingestion ──────────────────────────────────────────────────────────
def ingest(company_id: str) -> None:
    """
    Full ingestion pipeline:
    1. Fetch company from `context` table
    2. Download & extract text from linked document
    3. Chunk the merged text
    4. Generate embeddings via Google Generative AI
    5. Store each chunk in `company_embeddings`
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

    name: str = company.get("name", "")
    description: str = company.get("description", "")
    content_url: str = company.get("content", "")

    # 2. Extract document text
    document_text = ""
    if content_url:
        document_text = _extract_text(content_url)

    # 3. Merge into a single string
    merged_text = "\n\n".join(
        part for part in [
            f"Company: {name}",
            f"Context: {description}",
            f"Document:\n{document_text}",
        ] if part
    )

    # 4. Split into chunks
    chunks = _splitter.split_text(merged_text)
    if not chunks:
        raise ValueError("No text chunks produced — nothing to embed.")

    # 5. Generate embeddings
    vectors = _embeddings.embed_documents(chunks)

    # 6. Insert each chunk as a row
    rows = [
        {   
            "company_id": company_id,
            "content": chunk,
            "embedding": vector,
            "metadata": json.dumps({
                "company_name": name,
                "chunk_index": idx,
                "total_chunks": len(chunks),
            }),
        }
        for idx, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]

    _supabase.table("company_embeddings").insert(rows).execute()

    print(f"Stored successfully — {len(rows)} chunks embedded for '{name}'")


# ── Standalone execution ────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python contextGen.py <company_id>")
        sys.exit(1)
    ingest(sys.argv[1])
