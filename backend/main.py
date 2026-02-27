from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextGen import ingest

app = FastAPI(title="Bharathi API")


class IngestRequest(BaseModel):
    company_id: str


@app.post("/ingest")
async def ingest_company(req: IngestRequest):
    try:
        ingest(req.company_id)
        return {"status": "ok", "message": "Stored successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
