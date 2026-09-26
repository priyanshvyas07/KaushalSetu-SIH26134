"""
Labour Market Data Provider & Ingestion Layer for KaushalSetu Python Backend (backend_py).
Isolates DEMO/SEED baseline data from REAL/LIVE ingested market datasets.
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from .skill_normalizer import skill_normalizer


class LabourMarketDataProvider:
    def __init__(self):
        self.mode = os.getenv("DATA_SOURCE", "demo").lower()
        self.last_ingested_at: Optional[str] = None
        self.ingested_jobs_count = 0

    def get_mode(self) -> str:
        return self.mode

    def set_mode(self, mode: str):
        self.mode = "live" if mode.lower() == "live" else "demo"

    def get_metadata(self) -> Dict[str, Any]:
        is_live = self.mode == "live"
        return {
            "type": self.mode,
            "label": "LIVE MARKET DATASET" if is_live else "DEMO / SEED DATA (SIH26134 Benchmark Baseline)",
            "is_live": is_live,
            "source_description": "Live ingested industrial vacancies" if is_live else "SIH26134 benchmark seed dataset model calibrated for Indian tech roles.",
            "total_seed_vacancies": 5,
            "real_ingested_vacancies": self.ingested_jobs_count,
            "last_ingested_timestamp": self.last_ingested_at,
            "notice": (
                "Derived from live ingested employer postings."
                if is_live else
                "DEMO / SEED DATA NOTICE: All macro percentages, openings, and salary ranges are benchmark reference values for hackathon evaluation."
            )
        }

    def ingest_records(self, records: List[Dict[str, Any]], source_name: str = "Open Dataset") -> Dict[str, Any]:
        skills_found = set()
        for r in records:
            title = r.get("title", "Software Engineer")
            skills_raw = r.get("skills", [])
            extracted = skill_normalizer.extract_from_text(f"{title} {' '.join(skills_raw)}")
            for s in extracted:
                skills_found.add(s["name"])

        self.ingested_jobs_count += len(records)
        self.mode = "live"
        self.last_ingested_at = datetime.utcnow().isoformat()

        return {
            "success": True,
            "source_name": source_name,
            "records_processed": len(records),
            "unique_skills_mapped": len(skills_found),
            "new_data_source_state": self.mode,
            "timestamp": self.last_ingested_at
        }


data_provider = LabourMarketDataProvider()
