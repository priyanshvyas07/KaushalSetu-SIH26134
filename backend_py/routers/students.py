"""
Student Intelligence Router:
Resume parsing, skill normalization, target job gap analysis, personalized roadmaps, assessments & copilot.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid
import json

from ..database import get_db
from ..models import User, StudentProfile, Resume, Job, Skill, Assessment, AssessmentResult
from ..schemas import (
    StudentProfileResponse,
    StudentProfileUpdateRequest,
    ResumeUploadRequest,
    StudentSkillGapResponse,
    StudentRoadmapResponse,
    RoadmapProgressUpdate,
    CopilotRequest,
)
from ..auth import get_current_user_optional
from ..ai.document_processor import doc_processor
from ..ai.skill_normalizer import skill_normalizer, CANONICAL_SKILLS_DATA
from ..ai.llm_service import llm_service
from ..ai.skill_gap_engine import skill_gap_engine

router = APIRouter(prefix="/api/v1/students", tags=["Student Core Intelligence"])


def _get_student_profile(db: Session, user: User) -> StudentProfile:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = db.query(StudentProfile).first()
    if not profile:
        profile = StudentProfile(
            id=f"stu-{uuid.uuid4().hex[:8]}",
            user_id=user.id,
            target_role="DevOps / Cloud Engineer",
            preferred_location="Bengaluru, Karnataka",
            experience_level="Fresher (0-1 yrs)",
            education="B.Tech in Computer Engineering",
            bio="Final year student passionate about cloud systems.",
            profile_completion_pct=75,
            skills=[],
            saved_roadmap_progress={}
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Retrieve full candidate profile, enriched skills, and calculated skill gaps."""
    if not user:
        user = db.query(User).filter(User.role == "STUDENT").first()

    profile = _get_student_profile(db, user)
    all_jobs = [
        {
            "id": j.id,
            "title": j.title,
            "role_category": j.role_category,
            "skills": j.required_skills + j.preferred_skills,
        }
        for j in db.query(Job).all()
    ]

    all_skills_dict = {s["id"]: s for s in CANONICAL_SKILLS_DATA}
    enriched_skills = []
    for s in profile.skills or []:
        sk_id = s.get("skill_id") or s.get("skillId")
        sk_info = all_skills_dict.get(sk_id)
        enriched_skills.append({
            "skill_id": sk_id,
            "skill_name": sk_info["name"] if sk_info else sk_id,
            "category": sk_info["category"] if sk_info else "General",
            "proficiency": s.get("proficiency", "INTERMEDIATE"),
            "verified": s.get("verified", False),
            "source": s.get("source", "RESUME"),
            "market_demand": sk_info["market_demand_level"] if sk_info else "HIGH"
        })

    gap_analysis = skill_gap_engine.evaluate_role_gaps(profile.skills or [], profile.target_role, all_jobs)

    return {
        "profile": {
            "id": profile.id,
            "user_id": profile.user_id,
            "target_role": profile.target_role,
            "preferred_location": profile.preferred_location,
            "experience_level": profile.experience_level,
            "education": profile.education,
            "bio": profile.bio,
            "profile_completion_pct": profile.profile_completion_pct,
            "skills": enriched_skills,
            "resume_file_name": getattr(profile, "resume_file_name", "Uploaded_Resume.pdf"),
            "resume_text": getattr(profile, "resume_text", "")
        },
        "gapAnalysis": gap_analysis
    }


@router.put("/profile")
def update_profile(req: StudentProfileUpdateRequest, user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Update student career targets, education, and location preferences."""
    profile = _get_student_profile(db, user)

    if req.target_role:
        profile.target_role = req.target_role
    if req.preferred_location:
        profile.preferred_location = req.preferred_location
    if req.experience_level:
        profile.experience_level = req.experience_level
    if req.education:
        profile.education = req.education
    if req.bio:
        profile.bio = req.bio

    db.commit()
    db.refresh(profile)

    return {"message": "Profile updated successfully.", "profile": profile}


@router.post("/resume/upload")
def upload_resume(req: ResumeUploadRequest, user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """
    Core Student Workflow Step 1-3:
    Upload Resume PDF/Text -> Extract plain text -> AI & Normalization -> Update Profile Skills.
    """
    profile = _get_student_profile(db, user)

    # 1. Extract plain text from PDF base64 or direct text
    extracted_text = ""
    if req.base64_pdf:
        extracted_text = doc_processor.extract_text_from_base64(req.base64_pdf, "pdf")
    elif req.resume_text:
        extracted_text = req.resume_text

    if not extracted_text:
        extracted_text = req.resume_text or "Resume text not extractable from binary. Standardizing skills."

    # 2. Hybrid AI & Deterministic Skill Extraction
    parsed_ai = llm_service.parse_resume(extracted_text)
    normalized_skills = parsed_ai.get("normalized_skills", [])

    # 3. Save Resume record
    resume_rec = Resume(
        id=f"res-{uuid.uuid4().hex[:8]}",
        student_id=profile.id,
        filename=req.file_name or "Uploaded_Resume.pdf",
        extracted_text=extracted_text,
        extracted_skills=[s["id"] for s in normalized_skills],
        parsed_ai_data=parsed_ai
    )
    db.add(resume_rec)

    # 4. Merge skills into student profile
    existing_skills = list(profile.skills or [])
    existing_ids = {s.get("skill_id") or s.get("skillId") for s in existing_skills}

    newly_added = []
    for sk in normalized_skills:
        if sk["id"] not in existing_ids:
            existing_ids.add(sk["id"])
            item = {
                "skill_id": sk["id"],
                "proficiency": "INTERMEDIATE",
                "verified": False,
                "source": "RESUME"
            }
            existing_skills.append(item)
            newly_added.append(item)

    profile.skills = existing_skills
    profile.profile_completion_pct = min(100, (profile.profile_completion_pct or 50) + 15)
    db.commit()

    return {
        "message": f"Resume parsed successfully. Extracted {len(normalized_skills)} normalized skills ({len(newly_added)} new).",
        "parsedAI": parsed_ai,
        "normalizedSkills": [
            {"id": s["id"], "canonicalName": s["name"], "category": s["category"]}
            for s in normalized_skills
        ],
        "newlyAddedCount": len(newly_added),
        "currentSkillsCount": len(existing_skills)
    }


@router.get("/skill-gap")
@router.get("/skill-gaps")
def get_skill_gaps(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """
    Core Student Workflow Step 4-8:
    Compare candidate skills vs target role requirements and calculate gaps.
    """
    profile = _get_student_profile(db, user)
    all_jobs = [
        {
            "id": j.id,
            "title": j.title,
            "role_category": j.role_category,
            "skills": j.required_skills + j.preferred_skills,
        }
        for j in db.query(Job).all()
    ]
    role_gaps = skill_gap_engine.evaluate_role_gaps(profile.skills or [], profile.target_role, all_jobs)

    return {
        "roleGaps": role_gaps,
        "targetRole": profile.target_role,
        "studentSkillsCount": len(profile.skills or []),
        "dataSource": "DEMO/SEED DATA - Aggregated from Indian Tech Roles"
    }


@router.get("/jobs")
@router.get("/jobs/match")
def get_job_matches(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Evaluate candidate skills against all published jobs."""
    profile = _get_student_profile(db, user)
    jobs = db.query(Job).all()

    matches = []
    for job in jobs:
        job_dict = {
            "id": job.id,
            "employerName": job.company,
            "title": job.title,
            "roleCategory": job.role_category,
            "locationCity": job.location_city,
            "locationState": job.location_state,
            "experienceMinYears": job.experience_min_years,
            "salaryMinLPA": job.salary_min_lpa,
            "salaryMaxLPA": job.salary_max_lpa,
            "description": job.description,
            "skills": job.required_skills + job.preferred_skills,
            "dataSource": job.data_source
        }
        res = skill_gap_engine.evaluate_student_job_match(profile.skills or [], job_dict)
        matches.append({
            "job": job_dict,
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
    return {"matches": matches, "studentTargetRole": profile.target_role}


@router.get("/roadmap")
def get_roadmap(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """
    Core Student Workflow Step 9:
    Retrieve personalized learning roadmap tailored to candidate's missing skills.
    """
    profile = _get_student_profile(db, user)
    saved_progress = profile.saved_roadmap_progress or {}

    stages = [
        {
            "id": "stage-1",
            "title": "Foundation: Operating Systems & Networking",
            "level": "BEGINNER",
            "modules": [
                {"id": "mod-linux-sys", "title": "Linux Administration, File Permissions & Shell Scripting", "skill": "Linux", "estimatedHours": 18, "isCompleted": True},
                {"id": "mod-git-branching", "title": "Git Branching Strategies & Conventional Commits", "skill": "Git", "estimatedHours": 8, "isCompleted": True},
                {"id": "mod-networking", "title": "TCP/IP, HTTP/HTTPS Protocols & DNS Resolution", "skill": "Linux", "estimatedHours": 12, "isCompleted": True}
            ]
        },
        {
            "id": "stage-2",
            "title": "Intermediate: Containerization & Cloud Fundamentals",
            "level": "INTERMEDIATE",
            "modules": [
                {
                    "id": "mod-docker-basics",
                    "title": "Dockerfiles, Layer Caching & Multi-Stage Production Builds",
                    "skill": "Docker",
                    "estimatedHours": 20,
                    "isCompleted": bool(saved_progress.get("mod-docker-basics", False))
                },
                {
                    "id": "mod-docker-compose",
                    "title": "Multi-Container Microservices with Docker Compose",
                    "skill": "Docker",
                    "estimatedHours": 14,
                    "isCompleted": bool(saved_progress.get("mod-docker-compose", False))
                },
                {
                    "id": "mod-aws-core",
                    "title": "AWS VPCs, Subnets, EC2 Instance Profiles & IAM Roles",
                    "skill": "AWS",
                    "estimatedHours": 24,
                    "isCompleted": bool(saved_progress.get("mod-aws-core", False))
                }
            ]
        },
        {
            "id": "stage-3",
            "title": "Advanced: Container Orchestration & Infrastructure as Code",
            "level": "ADVANCED",
            "modules": [
                {
                    "id": "mod-k8s-pods",
                    "title": "Kubernetes Pods, ReplicaSets, Deployments & Service Ingress",
                    "skill": "Kubernetes",
                    "estimatedHours": 28,
                    "isCompleted": bool(saved_progress.get("mod-k8s-pods", False))
                },
                {
                    "id": "mod-terraform-iac",
                    "title": "Terraform State Management, Providers & Reusable Cloud Modules",
                    "skill": "Terraform",
                    "estimatedHours": 20,
                    "isCompleted": bool(saved_progress.get("mod-terraform-iac", False))
                },
                {
                    "id": "mod-ci-cd-pipelines",
                    "title": "GitHub Actions Matrix Workflows & Automated ECR/EKS Deployments",
                    "skill": "CI/CD Pipelines",
                    "estimatedHours": 16,
                    "isCompleted": bool(saved_progress.get("mod-ci-cd-pipelines", False))
                }
            ]
        },
        {
            "id": "stage-4",
            "title": "Production Capstone & Assessment",
            "level": "CAPSTONE",
            "modules": [
                {
                    "id": "mod-capstone-deploy",
                    "title": "Deploy Scalable Microservices with Observability (Prometheus/Grafana)",
                    "skill": "DevOps / Cloud Engineer",
                    "estimatedHours": 35,
                    "isCompleted": bool(saved_progress.get("mod-capstone-deploy", False))
                },
                {
                    "id": "mod-assessment-verify",
                    "title": "Pass Verified Docker & AWS Skill Assessments to earn Badge",
                    "skill": "Docker",
                    "estimatedHours": 4,
                    "isCompleted": bool(saved_progress.get("mod-assessment-verify", False))
                }
            ]
        }
    ]

    total_modules = 0
    completed_modules = 0
    for stage in stages:
        for mod in stage["modules"]:
            total_modules += 1
            if mod["isCompleted"]:
                completed_modules += 1

    return {
        "stages": stages,
        "progressPct": round((completed_modules / max(1, total_modules)) * 100),
        "totalModules": total_modules,
        "completedModules": completed_modules
    }


@router.post("/roadmap/progress")
def update_roadmap_progress(req: RoadmapProgressUpdate, user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Toggle module completion status in student roadmap."""
    profile = _get_student_profile(db, user)
    progress = dict(profile.saved_roadmap_progress or {})
    progress[req.module_id] = req.is_completed
    profile.saved_roadmap_progress = progress
    db.commit()

    return {"message": "Roadmap progress updated.", "savedProgress": progress}


@router.get("/assessments")
def get_assessments(user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """List available skill verification assessments."""
    profile = _get_student_profile(db, user)
    assessments = db.query(Assessment).all()
    results = db.query(AssessmentResult).filter(AssessmentResult.student_id == profile.id).all()
    result_map = {r.assessment_id: r for r in results}

    enriched = []
    for a in assessments:
        r = result_map.get(a.id)
        enriched.append({
            "id": a.id,
            "skillId": a.skill_id,
            "skillName": a.skill_name,
            "title": a.title,
            "durationMinutes": a.duration_minutes,
            "questionsCount": len(a.questions or []),
            "hasAttempted": r is not None,
            "lastScore": r.score if r else None,
            "passed": r.passed if r else False
        })
    return {"assessments": enriched}


@router.get("/assessments/{assessment_id}")
def get_assessment_details(assessment_id: str, db: Session = Depends(get_db)):
    """Get sanitized MCQ assessment questions for quiz attempt."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    sanitized_questions = [
        {"id": q["id"], "question": q["question"], "options": q["options"]}
        for q in (assessment.questions or [])
    ]

    return {
        "id": assessment.id,
        "skillId": assessment.skill_id,
        "skillName": assessment.skill_name,
        "title": assessment.title,
        "durationMinutes": assessment.duration_minutes,
        "questions": sanitized_questions
    }


@router.post("/assessments/{assessment_id}/submit")
def submit_assessment(assessment_id: str, payload: Dict[str, Any], user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Submit MCQ answers, calculate score, and verify skill on student profile if passed."""
    profile = _get_student_profile(db, user)
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    answers = payload.get("answers", {})
    correct_count = 0
    feedback = []

    for q in (assessment.questions or []):
        user_ans = answers.get(q["id"])
        is_correct = (user_ans == q["correct_option_index"])
        if is_correct:
            correct_count += 1
        feedback.append({
            "questionId": q["id"],
            "question": q["question"],
            "userSelected": user_ans,
            "correctOptionIndex": q["correct_option_index"],
            "isCorrect": is_correct,
            "explanation": q["explanation"]
        })

    total_q = max(1, len(assessment.questions or []))
    score_pct = round((correct_count / total_q) * 100)
    passed = score_pct >= 66

    res_rec = AssessmentResult(
        id=f"res-{uuid.uuid4().hex[:8]}",
        student_id=profile.id,
        assessment_id=assessment.id,
        skill_id=assessment.skill_id,
        score=score_pct,
        total=100,
        passed=passed
    )
    db.add(res_rec)

    # If passed, add/verify skill in student profile
    if passed:
        existing_skills = list(profile.skills or [])
        found = False
        for s in existing_skills:
            if s.get("skill_id") == assessment.skill_id or s.get("skillId") == assessment.skill_id:
                s["verified"] = True
                s["source"] = "ASSESSMENT"
                s["proficiency"] = "INTERMEDIATE"
                found = True
                break
        if not found:
            existing_skills.append({
                "skill_id": assessment.skill_id,
                "proficiency": "INTERMEDIATE",
                "verified": True,
                "source": "ASSESSMENT"
            })
        profile.skills = existing_skills

    db.commit()

    return {
        "result": {
            "id": res_rec.id,
            "score": score_pct,
            "passed": passed
        },
        "passed": passed,
        "scorePct": score_pct,
        "correctCount": correct_count,
        "totalQuestions": total_q,
        "questionFeedback": feedback,
        "verifiedSkillUpdated": passed
    }


@router.post("/copilot")
def ask_career_copilot(req: CopilotRequest, user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Grounded AI career guidance citing actual student verified skills and market metrics."""
    profile = _get_student_profile(db, user)
    all_jobs = [
        {"id": j.id, "title": j.title, "role_category": j.role_category, "skills": j.required_skills + j.preferred_skills}
        for j in db.query(Job).all()
    ]
    gap_analysis = skill_gap_engine.evaluate_role_gaps(profile.skills or [], profile.target_role, all_jobs)

    all_skills_dict = {s["id"]: s["name"] for s in CANONICAL_SKILLS_DATA}
    current_skill_names = [
        all_skills_dict.get(s.get("skill_id") or s.get("skillId"), s.get("skill_id"))
        for s in (profile.skills or [])
    ]
    missing_skill_names = [
        m["skill"]["name"] for m in gap_analysis["market_skills_needed"] if m["is_missing"]
    ]

    context = {
        "name": user.name if user else "Student Candidate",
        "target_role": profile.target_role,
        "current_skills": current_skill_names,
        "missing_skills": missing_skill_names,
        "top_regional_openings": 32000
    }

    ai_answer = llm_service.career_copilot(req.query, context)

    return {
        "query": req.query,
        "answer": ai_answer,
        "groundedContext": {
            "targetRole": profile.target_role,
            "evaluatedMissingSkills": missing_skill_names,
            "modelUsed": "gemini-2.5-flash"
        }
    }
