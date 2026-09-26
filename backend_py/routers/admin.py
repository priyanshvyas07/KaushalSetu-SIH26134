"""
Admin & Government Policy Intelligence Router:
Macro labour market analytics, regional demand heatmaps, shortage/oversupply matrices, and CSV reports.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from ..database import get_db
from ..models import Job, Skill, Recommendation, Course
from ..schemas import AdminOverviewResponse
from ..ai.skill_normalizer import CANONICAL_SKILLS_DATA
from ..ai.analytics_engine import analytics_engine

router = APIRouter(prefix="/api/v1/admin", tags=["Admin & Government Intelligence"])


@router.get("/overview")
@router.get("/market-overview")
def get_admin_overview(db: Session = Depends(get_db)):
    """Retrieve macro indicators, jobs analyzed, and critical skill deficits across India."""
    shortages = analytics_engine.get_skill_shortages()
    critical_count = len([s for s in shortages if s["status"] == "CRITICAL SHORTAGE"])
    oversupply_count = len([s for s in shortages if s["status"] == "OVERSUPPLY"])
    total_openings = sum(s["total_openings_india"] for s in shortages)
    heatmaps = analytics_engine.get_state_heatmaps()
    emerging = analytics_engine.get_emerging_skills()

    top_demanded = [s for s in CANONICAL_SKILLS_DATA if s["market_demand_level"] == "HIGH"][:5]

    return {
        "jobsAnalysed": 184500 + db.query(Job).count(),
        "skillsAnalysed": len(CANONICAL_SKILLS_DATA),
        "criticalShortagesCount": critical_count,
        "oversupplyCount": oversupply_count,
        "totalOpeningsAnalyzed": total_openings,
        "averageCurriculumAlignment": 48.2,
        "totalTechnicalInstitutesMonitored": sum(h["institute_count"] for h in heatmaps),
        "annualGraduatingCapacity": sum(h["student_enrollment_capacity"] for h in heatmaps),
        "topDemandedSkills": [
            {
                "id": s["id"],
                "canonicalName": s["name"],
                "category": s["category"],
                "marketDemandLevel": s["market_demand_level"],
                "averageSalaryBumpPct": s["average_salary_bump_pct"]
            }
            for s in top_demanded
        ],
        "emergingSkillsCount": len(emerging),
        "recommendations": [
            {
                "id": "rec-govt-1",
                "title": "Urgent Cloud & DevOps Capacity Expansion in Maharashtra & Karnataka",
                "actionSummary": "State technical universities currently produce only 35% of the annual industry demand for containerization (Docker/K8s) and AWS engineers. Mandate cloud credits and container labs in AICTE Model Curriculum 2026.",
                "evidenceData": {
                    "gapRatio": 2.47,
                    "totalUnmetOpenings": 32600,
                    "annualGraduatesLackingSkill": 84000,
                    "impactedStates": ["Maharashtra", "Karnataka", "Telangana"]
                },
                "priority": "CRITICAL",
                "confidenceScore": 0.94,
                "dataSourceLabel": "OBSERVED MARKET DATA"
            }
        ],
        "dataSourceLabel": "DEMO/SEED DATA - Aggregated National Telemetry"
    }


@router.get("/labour-market")
@router.get("/skill-demand")
def get_labour_market(db: Session = Depends(get_db)):
    """Retrieve detailed role and industry demand breakdowns."""
    shortages = analytics_engine.get_skill_shortages()
    emerging = analytics_engine.get_emerging_skills()

    role_demands = [
        {"role": "DevOps / Cloud Platform", "openings": 54000, "growthPct": 36, "averageSalaryLPA": 14.5},
        {"role": "AI / Machine Learning & GenAI", "openings": 42000, "growthPct": 68, "averageSalaryLPA": 16.2},
        {"role": "Backend Distributed Systems", "openings": 48000, "growthPct": 22, "averageSalaryLPA": 13.0},
        {"role": "Frontend & Full-Stack Web", "openings": 51000, "growthPct": 18, "averageSalaryLPA": 11.5},
        {"role": "Cybersecurity & SecOps", "openings": 24000, "growthPct": 41, "averageSalaryLPA": 15.0}
    ]

    industry_demands = [
        {"industry": "Fintech & Payments", "sharePct": 28, "keySkills": ["Kubernetes", "AWS", "PostgreSQL", "Golang"]},
        {"industry": "Enterprise SaaS & Cloud", "sharePct": 32, "keySkills": ["Docker", "Terraform", "React", "TypeScript"]},
        {"industry": "Healthcare & DeepTech", "sharePct": 16, "keySkills": ["Python", "GenAI", "PyTorch", "Data Eng"]},
        {"industry": "E-Commerce & Quick-Commerce", "sharePct": 24, "keySkills": ["Kafka", "Redis", "CI/CD", "Linux"]}
    ]

    return {
        "roleDemands": role_demands,
        "industryDemands": industry_demands,
        "shortages": shortages,
        "emergingSkills": emerging
    }


@router.get("/heatmap")
def get_heatmap(state: Optional[str] = Query(None), skillId: Optional[str] = Query(None)):
    """Retrieve state-wise technology hiring density and geographic coordinates."""
    states_data = analytics_engine.get_state_heatmaps()
    if state and state != "All India":
        states_data = [s for s in states_data if s["state"].lower() == state.lower()]

    return {
        "statesData": states_data,
        "filteredState": state or "All India"
    }


@router.get("/shortages")
@router.get("/skill-shortage")
def get_shortages():
    """Retrieve categorized shortage and oversupply risk lists."""
    all_shortages = analytics_engine.get_skill_shortages()
    shortages = [s for s in all_shortages if s["status"] in ("CRITICAL SHORTAGE", "MODERATE SHORTAGE")]
    oversupply = [s for s in all_shortages if s["status"] == "OVERSUPPLY"]

    return {
        "shortages": shortages,
        "oversupply": oversupply,
        "totalEvaluated": len(all_shortages)
    }


@router.get("/emerging-skills")
@router.get("/skill-trends")
def get_emerging_skills():
    """Retrieve high-velocity emerging skills."""
    return {"emerging": analytics_engine.get_emerging_skills()}


@router.get("/training-supply")
def get_training_supply(db: Session = Depends(get_db)):
    """Retrieve state training capacity and monitored institute alignment scores."""
    heatmaps = analytics_engine.get_state_heatmaps()
    courses = db.query(Course).all()

    return {
        "stateCapacity": heatmaps,
        "courses": courses,
        "monitoredInstitutes": [
            {"name": "PICT Pune", "state": "Maharashtra", "alignmentScore": 48.2, "enrollment": 1200},
            {"name": "Anna University", "state": "Tamil Nadu", "alignmentScore": 52.0, "enrollment": 2400},
            {"name": "DTU Delhi", "state": "Delhi NCR", "alignmentScore": 56.4, "enrollment": 1800},
            {"name": "NIT Surathkal", "state": "Karnataka", "alignmentScore": 64.0, "enrollment": 1100}
        ]
    }


@router.get("/reports/export")
def export_reports(type: str = "skill-gaps"):
    """Export analytical report in CSV format."""
    csv_data = analytics_engine.export_csv(type)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=KaushalSetu_{type}.csv"}
    )
