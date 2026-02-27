from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from contextGen import ingest
from dotenv import load_dotenv
from imageGen import generate_ad_poster
import boto3
from botocore.config import Config
import os
import uuid

load_dotenv()

app = FastAPI(title="Bharathi API")

R2_ENDPOINT = os.getenv("R2_ENDPOINT")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
R2_BUCKET = os.getenv("R2_BUCKET_NAME")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")  
from botocore.config import Config

s3 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",
    config=Config(
        max_pool_connections=50,
        retries={"max_attempts": 2},
        connect_timeout=5,
        read_timeout=30,
    ),
)

class IngestRequest(BaseModel):
    company_id: str


class PosterRequest(BaseModel):
    company_prompt: str
    platform: str = "instagram_square"
    logo_url: Optional[str] = None

def upload_to_r2(filepath: str):

    filename = os.path.basename(filepath)
    key = f"bharathi/{filename}"

    with open(filepath, "rb") as f:
        s3.put_object(
            Bucket=R2_BUCKET,
            Key=key,
            Body=f,
            ContentType="image/png"
        )

    return f"{R2_PUBLIC_URL}/{key}"

@app.post("/ingest")
async def ingest_company(req: IngestRequest):
    try:
        ingest(req.company_id)
        return {"status": "ok", "message": "Stored successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-poster")
async def create_poster(req: PosterRequest):

    result = generate_ad_poster(
        req.company_prompt,
        req.platform,
        req.logo_url
    )

    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result["error"]
        )
    
    file_url = upload_to_r2(result["filepath"])
    print(file_url)
    return file_url

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
