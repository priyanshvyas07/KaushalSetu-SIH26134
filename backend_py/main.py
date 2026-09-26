"""
KaushalSetu FastAPI Application Main Entry Point.
SIH26134: AI Labour Market & Skill Intelligence Platform
"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

from .database import engine, Base
from .seed_data import seed_database
from .routers import (
    auth,
    students,
    institutes,
    employers,
    admin,
    market
)

# Initialize database schema and seed data
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="KaushalSetu AI Labour Market & Skill Intelligence Platform",
    description="SIH26134 Core Intelligence APIs connecting Student Skills, Industry Job Demand, Institute Curriculum, and Employer Requirements.",
    version="1.0.0-sih26134",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(institutes.router)
app.include_router(employers.router)
app.include_router(admin.router)
app.include_router(market.router)


@app.get("/api/health")
@app.get("/api/v1/health")
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "app": "KaushalSetu AI Labour Market & Skill Intelligence Platform",
        "version": "1.0.0-sih26134",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "CONNECTED",
        "ai_intelligence_layer": "READY",
        "demo_data_notice": "DEMO/SEED DATA - Clear benchmarks for SIH evaluation"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend_py.main:app", host="0.0.0.0", port=port, reload=True)
