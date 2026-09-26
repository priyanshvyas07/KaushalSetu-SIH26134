"""
Institute Intelligence Router:
Syllabus PDF / text ingestion, 4-quadrant gap classification, explainable weighted alignment scores, and AI recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid

from ..database import get_db
from ..models import User, Course, Curriculum, CurriculumSkill, EmployerSurvey, Recommendation
from ..schemas import CurriculumUploadRequest, InstituteOverviewResponse
from ..auth import get_current_user_optional
from ..ai.document_processor import doc_processor
from ..ai.skill_normalizer import skill_normalizer, CANONICAL_SKILLS_DATA
from ..ai.curriculum_engine import curriculum_engine
from ..ai.llm_service import llm_service
from ..ai.analytics_engine import analytics_engine

router = APIRouter(prefix="/api/v1/institutes", tags=["Institute Core Intelligence"])


@router.get("/overview")
def get_institute_overview(db: Session = Depends(get_db)):
    """Retrieve institutional metrics, degree programs, curriculum alignment and top shortages."""
    courses = db.query(Course).all()
    total_students = sum(c.enrolled_students for c in courses) if courses else 500

    curriculum = db.query(Curriculum).first()
    curriculum_skills = []
    if curriculum:
        cur_skills_db = db.query(CurriculumSkill).filter(CurriculumSkill.curriculum_id == curriculum.id).all()
        curriculum_skills = [
            {
                "skill_id": cs.skill_id,
                "coverage_level": cs.coverage_level,
                "semester_taught": cs.semester_taught,
                "hours_dedicated": cs.hours_dedicated
            }
            for cs in cur_skills_db
        ]

    audit_report = curriculum_engine.audit_curriculum(
        curriculum_skills,
        courses[0].title if courses else "B.Tech Computer Engineering",
        curriculum.syllabus_raw if curriculum else ""
    )

    shortages = analytics_engine.get_skill_shortages()[:5]

    return {
        "totalCourses": len(courses) if courses else 2,
        "totalEnrolledStudents": total_students,
        "averageAlignmentScore": audit_report["alignment_score"],
        "auditReport": {
            "curriculumId": audit_report["curriculum_id"],
            "courseTitle": audit_report["course_title"],
            "alignmentScore": audit_report["alignment_score"],
            "scoreCalculationMethod": audit_report["score_calculation_method"],
            "totalMarketSkillsEvaluated": audit_report["total_market_skills_evaluated"],
            "coveredMarketSkillsCount": audit_report["covered_market_skills_count"],
            "missingHighDemandSkillsCount": audit_report["missing_high_demand_skills_count"],
            "comparisonTable": [
                {
                    "skill": {
                        "id": row["skill"]["id"],
                        "canonicalName": row["skill"]["name"],
                        "category": row["skill"]["category"],
                        "description": row["skill"]["description"],
                        "marketDemandLevel": row["skill"]["market_demand_level"],
                        "averageSalaryBumpPct": row["skill"]["average_salary_bump_pct"]
                    },
                    "marketDemand": row["market_demand"],
                    "openingsInIndia": row["openings_in_india"],
                    "coverageStatus": row["coverage_status"],
                    "coverageDepth": row["coverage_depth"],
                    "semesterTaught": row["semester_taught"],
                    "hoursDedicated": row["hours_dedicated"],
                    "urgency": row["urgency"]
                }
                for row in audit_report["comparison_table"]
            ],
            "aiCurriculumRecommendations": audit_report["ai_curriculum_recommendations"],
            "trainingSupplyVsDemandSummary": audit_report["training_supply_vs_demand_summary"]
        },
        "topIndustryShortages": shortages,
        "instituteName": "Pune Institute of Computer Technology (PICT)",
        "accreditationStatus": "NAAC A+ / NBA Accredited Autonomous Institute"
    }


@router.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    """List all registered academic degree programs."""
    courses = db.query(Course).all()
    return {
        "courses": [
            {
                "id": c.id,
                "title": c.title,
                "department": c.department,
                "degreeLevel": c.degree_level,
                "durationSemesters": c.duration_semesters,
                "enrolledStudents": c.enrolled_students,
                "targetIndustryRoles": c.target_industry_roles or []
            }
            for c in courses
        ]
    }


@router.get("/curriculum/{course_id}")
def get_curriculum(course_id: str, db: Session = Depends(get_db)):
    """Retrieve audited curriculum for a specific course ID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    curriculum = db.query(Curriculum).filter(Curriculum.course_id == course_id).first()
    if not curriculum:
        curriculum = db.query(Curriculum).first()

    cur_skills_db = db.query(CurriculumSkill).filter(CurriculumSkill.curriculum_id == curriculum.id).all() if curriculum else []
    curriculum_skills = [
        {
            "skill_id": cs.skill_id,
            "coverage_level": cs.coverage_level,
            "semester_taught": cs.semester_taught,
            "hours_dedicated": cs.hours_dedicated
        }
        for cs in cur_skills_db
    ]

    report = curriculum_engine.audit_curriculum(
        curriculum_skills,
        course.title if course else "B.Tech Computer Engineering",
        curriculum.syllabus_raw if curriculum else ""
    )

    return {
        "course": course,
        "curriculum": curriculum,
        "report": report
    }


@router.post("/curriculum/upload")
@router.post("/curriculum/analyze")
def upload_and_analyze_curriculum(req: CurriculumUploadRequest, db: Session = Depends(get_db)):
    """
    Core Institute Workflow:
    Upload Syllabus PDF/Text -> AI & Deterministic Extraction -> Industry Comparison -> Recalculate Alignment & Recommendations.
    """
    syllabus_text = ""
    if req.base64_pdf:
        syllabus_text = doc_processor.extract_text_from_base64(req.base64_pdf, "pdf")
    elif req.syllabus_raw:
        syllabus_text = req.syllabus_raw

    if not syllabus_text:
        raise HTTPException(status_code=400, detail="Syllabus content is required.")

    # 1. AI analysis & Skill Extraction
    ai_audit = llm_service.analyze_curriculum(syllabus_text)
    extracted_skills = skill_normalizer.extract_from_text(syllabus_text)

    # 2. Combine deterministic and AI skills
    recognized_ids = set()
    curriculum_skill_items = []

    for item in extracted_skills:
        if item["id"] not in recognized_ids:
            recognized_ids.add(item["id"])
            curriculum_skill_items.append({
                "skill_id": item["id"],
                "coverage_level": "PRACTICAL",
                "semester_taught": 5,
                "hours_dedicated": 36
            })

    for ai_sk in ai_audit.get("extracted_skills", []):
        if isinstance(ai_sk, dict) and ai_sk.get("id") and ai_sk["id"] not in recognized_ids:
            recognized_ids.add(ai_sk["id"])
            curriculum_skill_items.append({
                "skill_id": ai_sk["id"],
                "coverage_level": "CONCEPTUAL",
                "semester_taught": 6,
                "hours_dedicated": 20
            })

    # 3. Audit against benchmark
    course_id = req.course_id or "crs-pict-cs"
    course = db.query(Course).filter(Course.id == course_id).first()
    course_title = course.title if course else "B.Tech Computer Engineering"

    report = curriculum_engine.audit_curriculum(curriculum_skill_items, course_title, syllabus_text)

    # 4. Save new curriculum record
    new_curr = Curriculum(
        id=f"cur-{uuid.uuid4().hex[:8]}",
        course_id=course_id,
        academic_year=req.academic_year or "2026-2027",
        syllabus_raw=syllabus_text,
        alignment_score=report["alignment_score"]
    )
    db.add(new_curr)
    db.commit()

    for item in curriculum_skill_items:
        cs_rec = CurriculumSkill(
            id=f"cs-{uuid.uuid4().hex[:8]}",
            curriculum_id=new_curr.id,
            skill_id=item["skill_id"],
            coverage_level=item["coverage_level"],
            semester_taught=item["semester_taught"],
            hours_dedicated=item["hours_dedicated"]
        )
        db.add(cs_rec)

    db.commit()

    return {
        "message": "Curriculum successfully uploaded, analyzed, and audited against industry benchmarks.",
        "alignmentScore": report["alignment_score"],
        "coveredSkillsCount": report["covered_market_skills_count"],
        "missingHighDemandSkillsCount": report["missing_high_demand_skills_count"],
        "report": {
            "curriculumId": new_curr.id,
            "courseTitle": course_title,
            "alignmentScore": report["alignment_score"],
            "scoreCalculationMethod": report["score_calculation_method"],
            "totalMarketSkillsEvaluated": report["total_market_skills_evaluated"],
            "coveredMarketSkillsCount": report["covered_market_skills_count"],
            "missingHighDemandSkillsCount": report["missing_high_demand_skills_count"],
            "comparisonTable": [
                {
                    "skill": {
                        "id": row["skill"]["id"],
                        "canonicalName": row["skill"]["name"],
                        "category": row["skill"]["category"],
                        "description": row["skill"]["description"],
                        "marketDemandLevel": row["skill"]["market_demand_level"],
                        "averageSalaryBumpPct": row["skill"]["average_salary_bump_pct"]
                    },
                    "marketDemand": row["market_demand"],
                    "openingsInIndia": row["openings_in_india"],
                    "coverageStatus": row["coverage_status"],
                    "coverageDepth": row["coverage_depth"],
                    "semesterTaught": row["semester_taught"],
                    "hoursDedicated": row["hours_dedicated"],
                    "urgency": row["urgency"]
                }
                for row in report["comparison_table"]
            ],
            "aiCurriculumRecommendations": report["ai_curriculum_recommendations"],
            "trainingSupplyVsDemandSummary": report["training_supply_vs_demand_summary"]
        },
        "aiAudit": ai_audit
    }


@router.get("/industry-gap")
def get_industry_gap(db: Session = Depends(get_db)):
    """Return institutional skill comparison table."""
    return get_institute_overview(db)


@router.get("/recommendations")
def get_curriculum_recommendations(db: Session = Depends(get_db)):
    """Retrieve grounded AI recommendations for academic leadership."""
    overview = get_institute_overview(db)
    return {"recommendations": overview["auditReport"]["aiCurriculumRecommendations"]}


@router.get("/employer-feedback")
def get_employer_feedback(db: Session = Depends(get_db)):
    """Retrieve industry surveys submitted by corporate hiring partners."""
    surveys = db.query(EmployerSurvey).order_by(EmployerSurvey.submitted_at.desc()).all()
    return {
        "surveys": [
            {
                "id": s.id,
                "employerName": s.employer_name,
                "industry": s.industry,
                "hardToHireSkills": s.hard_to_hire_skills or [],
                "emergingSkills": s.emerging_skills or [],
                "fresherGaps": s.fresher_gaps or [],
                "recommendedCertifications": s.recommended_certifications or [],
                "additionalRemarks": s.additional_remarks or "",
                "submittedAt": s.submitted_at.isoformat() if s.submitted_at else ""
            }
            for s in surveys
        ]
    }
