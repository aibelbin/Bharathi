from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from contextGen import ingest
from imageGen import generate_ad_poster

app = FastAPI(title="Bharathi API")


class IngestRequest(BaseModel):
    company_id: str


class PosterRequest(BaseModel):
    company_prompt: str
    platform: str = "instagram_square"
    logo_url: Optional[str] = None


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
        company_prompt=req.company_prompt,
        platform=req.platform,
        logo_source=req.logo_url,
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return FileResponse(
        path=result["filepath"],
        media_type="image/png",
        filename=result["filepath"].split("/")[-1],
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
