import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import utils.logging  # noqa: F401
from api import router as nocarz_router
from config import get_settings
from db import init_db
from services import get_model_service

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized.")

    logger.info("Loading ML models...")
    get_model_service()
    logger.info("ML models loaded.")

    logger.info("Application startup complete.")
    yield
    logger.info("Application shutdown complete.")


app = FastAPI(
    title="Nocarz Price Prediction API",
    description="Microservice for predicting accommodation prices for Nocarz platform.",
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(nocarz_router)


@app.get("/")
async def root():
    return {
        "name": "Nocarz Price Prediction API",
        "version": settings.app_version,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
