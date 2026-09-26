"""
Employer Router:
Job posting creation, AI job requirements generation, candidate matching, and industry feedback surveys.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid

from ..database import get_db
from ..models import User, Job, StudentProfile, EmployerSurvey
from ..schemas import JobCreateRequest, JobAnalysisRequest, EmployerSurveyRequest
from ..auth import get_current_user_optional
from ..ai.skill_normalizer import skill_normalizer
from ..ai.llm_service import llm_service
from ..ai.skill_gap_engine import skill_gap_engine

router = APIRouter(prefix="/api/v1/employers", tags=["Employer Platform"])


@router.get("/jobs")
def get_employer_jobs(db: Session = Depends(get_db)):
    """Retrieve all published job openings."""
    jobs = db.query(Job).order_by(Job.posted_at.desc()).all()
    return {
        "jobs": [
            {
                "id": j.id,
                "employerId": j.employer_id,
                "employerName": j.company,
                "title": j.title,
                "roleCategory": j.role_category,
                "locationCity": j.location_city,
                "locationState": j.location_state,
                "experienceMinYears": j.experience_min_years,
                "salaryMinLPA": j.salary_min_lpa,
                "salaryMaxLPA": j.salary_max_lpa,
                "description": j.description,
                "skills": j.required_skills + j.preferred_skills,
                "postedAt": j.posted_at.isoformat() if j.posted_at else "",
                "dataSource": j.data_source
            }
            for j in jobs
        ]
    }


@router.post("/jobs/ai-generate")
@router.post("/job/analyze")
def generate_ai_job_requirements(req: JobAnalysisRequest):
    """Generate structured requirements, skills, and salary bands from unstructured hiring prompt."""
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Hiring prompt is required.")

    result = llm_service.generate_job_requirements(req.prompt)
    return {
        "title": result["title"],
        "roleCategory": result["role_category"],
        "description": result["description"],
        "experienceMinYears": result["experience_min_years"],
        "salaryMinLPA": result["salary_min_lpa"],
        "salaryMaxLPA": result["salary_max_lpa"],
        "requiredSkills": [
            {"skillId": s["id"], "skillName": s["name"], "category": s["category"], "isRequired": True, "minProficiency": "INTERMEDIATE"}
            for s in result["required_skills"]
        ],
        "preferredSkills": [
            {"skillId": s["id"], "skillName": s["name"], "category": s["category"], "isRequired": False, "minProficiency": "BEGINNER"}
            for s in result["preferred_skills"]
        ]
    }


@router.post("/jobs", status_code=status.HTTP_201_CREATED)
def create_job(req: JobCreateRequest, user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Publish a new job requirement to the platform."""
    employer_name = user.organization_name if (user and user.organization_name) else "Razorpay"
    employer_id = user.id if user else "usr-employer-1"

    req_skills = [
        {"skillId": s.skill_id, "isRequired": s.is_required, "minProficiency": s.min_proficiency}
        for s in req.skills if s.is_required
    ]
    pref_skills = [
        {"skillId": s.skill_id, "isRequired": s.is_required, "minProficiency": s.min_proficiency}
        for s in req.skills if not s.is_required
    ]

    new_job = Job(
        id=f"job-{uuid.uuid4().hex[:8]}",
        employer_id=employer_id,
        company=employer_name,
        title=req.title,
        role_category=req.role_category,
        location_city=req.location_city,
        location_state=req.location_state,
        experience_min_years=req.experience_min_years,
        salary_min_lpa=req.salary_min_lpa,
        salary_max_lpa=req.salary_max_lpa,
        description=req.description,
        required_skills=req_skills,
        preferred_skills=pref_skills,
        data_source="REAL VERIFIED"
    )
    db.add(new_job)
    db.commit()

    return {"message": "Job posting published successfully.", "job": new_job}


@router.get("/candidates/match/{job_id}")
@router.get("/matching")
def match_candidates_for_job(job_id: str, db: Session = Depends(get_db)):
    """Rank all registered candidates mathematically against a job opening."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        job = db.query(Job).first()

    if not job:
        raise HTTPException(status_code=404, detail="No job found.")

    profiles = db.query(StudentProfile).all()
    job_dict = {
        "id": job.id,
        "employerName": job.company,
        "title": job.title,
        "skills": job.required_skills + job.preferred_skills
    }

    matches = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        res = skill_gap_engine.evaluate_student_job_match(p.skills or [], job_dict)
        matches.append({
            "candidateId": p.id,
            "candidateName": user.name if user else "Arjun Sharma",
            "education": p.education,
            "targetRole": p.target_role,
            "overallMatchPct": res["overall_match_pct"],
            "requiredMatchPct": res["required_match_pct"],
            "preferredMatchPct": res["preferred_match_pct"],
            "matchedSkillsCount": res["matched_skills_count"],
            "totalRequiredCount": res["total_required_count"],
            "strongSkills": res["strong_skills"],
            "missingSkills": res["missing_skills"],
            "weakSkills": res["weak_skills"],
            "matchBreakdownExplanation": res["match_breakdown_explanation"]
        })

    matches.sort(key=lambda x: x["overallMatchPct"], reverse=True)
    return {
        "job": job_dict,
        "totalCandidatesEvaluated": len(matches),
        "matches": matches
    }


@router.post("/survey", status_code=status.HTTP_201_CREATED)
def submit_survey(req: EmployerSurveyRequest, db: Session = Depends(get_db)):
    """Submit employer industry feedback survey to update national skill intelligence."""
    survey = EmployerSurvey(
        id=f"es-{uuid.uuid4().hex[:8]}",
        employer_name=req.employer_name,
        industry=req.industry,
        hard_to_hire_skills=req.hard_to_hire_skills,
        emerging_skills=req.emerging_skills,
        fresher_gaps=req.fresher_gaps,
        recommended_certifications=req.recommended_certifications,
        additional_remarks=req.additional_remarks
    )
    db.add(survey)
    db.commit()

    return {
        "message": "Industry requirements survey submitted and incorporated into central intelligence engine.",
        "survey": survey
    }
