"""
Pydantic schemas for request validation and response serialisation in KaushalSetu APIs.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ==========================================
# AUTH SCHEMAS
# ==========================================

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=128)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field("STUDENT", description="STUDENT, INSTITUTE, EMPLOYER, ADMIN")
    organization_name: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    organization_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthTokenResponse(BaseModel):
    message: str
    token: str
    user: UserResponse


# ==========================================
# SKILL & TAXONOMY SCHEMAS
# ==========================================

class SkillBase(BaseModel):
    id: str
    name: str
    normalized_name: str
    category: str
    description: Optional[str] = None
    market_demand_level: str = "HIGH"
    average_salary_bump_pct: float = 15.0

    class Config:
        from_attributes = True


class SkillNormalizeRequest(BaseModel):
    raw_text: str


class SkillNormalizeResponse(BaseModel):
    raw_input: str
    normalized_skill: Optional[SkillBase] = None
    matched_alias: Optional[str] = None
    is_canonical: bool = False


# ==========================================
# STUDENT SCHEMAS
# ==========================================

class StudentSkillItem(BaseModel):
    skill_id: str
    skill_name: Optional[str] = None
    category: Optional[str] = None
    proficiency: str = "INTERMEDIATE"  # BEGINNER, INTERMEDIATE, ADVANCED
    verified: bool = False
    source: str = "RESUME"  # RESUME, ASSESSMENT, SELF
    last_evaluated: Optional[str] = None


class StudentProfileUpdateRequest(BaseModel):
    target_role: Optional[str] = None
    preferred_location: Optional[str] = None
    experience_level: Optional[str] = None
    education: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[StudentSkillItem]] = None


class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    preferred_location: str
    experience_level: str
    education: Optional[str] = None
    bio: Optional[str] = None
    profile_completion_pct: int
    skills: List[Dict[str, Any]]
    resume_file_name: Optional[str] = None
    resume_text: Optional[str] = None

    class Config:
        from_attributes = True


class ResumeUploadRequest(BaseModel):
    resume_text: Optional[str] = None
    base64_pdf: Optional[str] = None
    file_name: Optional[str] = "Uploaded_Resume.pdf"


class SkillGapItem(BaseModel):
    skill: SkillBase
    market_demand: str
    is_missing: bool
    is_weak: bool
    priority: str = "HIGH"
    explanation: Optional[str] = None


class StudentSkillGapResponse(BaseModel):
    target_role: str
    market_skills_needed: List[SkillGapItem]
    strong_count: int
    missing_count: int
    overall_preparedness_pct: int
    data_source: str = "DEMO/SEED DATA - Aggregated from Indian Tech Roles"


class RoadmapModule(BaseModel):
    id: str
    title: str
    skill: str
    estimated_hours: int
    is_completed: bool = False


class RoadmapStage(BaseModel):
    id: str
    title: str
    level: str  # BEGINNER, INTERMEDIATE, ADVANCED, CAPSTONE
    modules: List[RoadmapModule]


class StudentRoadmapResponse(BaseModel):
    stages: List[RoadmapStage]
    progress_pct: int
    total_modules: int
    completed_modules: int


class RoadmapProgressUpdate(BaseModel):
    module_id: str
    is_completed: bool


# ==========================================
# INSTITUTE SCHEMAS
# ==========================================

class CurriculumUploadRequest(BaseModel):
    course_id: Optional[str] = "crs-pict-cs"
    syllabus_raw: Optional[str] = None
    base64_pdf: Optional[str] = None
    academic_year: Optional[str] = "2026-2027"


class CurriculumComparisonRow(BaseModel):
    skill: SkillBase
    market_demand: str
    openings_in_india: int
    coverage_status: str  # COVERED, MISSING, PARTIAL
    coverage_depth: Optional[str] = None
    semester_taught: Optional[int] = None
    hours_dedicated: Optional[int] = None
    urgency: str  # CRITICAL, HIGH, MODERATE, LOW


class AIRecommendationItem(BaseModel):
    category: str
    title: str
    details: str
    market_evidence: str


class CurriculumAuditReport(BaseModel):
    curriculum_id: str
    course_title: str
    alignment_score: float
    score_calculation_method: str
    total_market_skills_evaluated: int
    covered_market_skills_count: int
    missing_high_demand_skills_count: int
    comparison_table: List[CurriculumComparisonRow]
    ai_curriculum_recommendations: List[AIRecommendationItem]
    training_supply_vs_demand_summary: Dict[str, List[str]]


class InstituteOverviewResponse(BaseModel):
    total_courses: int
    total_enrolled_students: int
    average_alignment_score: float
    audit_report: Optional[CurriculumAuditReport] = None
    top_industry_shortages: List[Dict[str, Any]]
    institute_name: str
    accreditation_status: str


# ==========================================
# EMPLOYER SCHEMAS
# ==========================================

class JobSkillRequirement(BaseModel):
    skill_id: str
    is_required: bool = True
    min_proficiency: str = "INTERMEDIATE"


class JobCreateRequest(BaseModel):
    title: str
    role_category: str = "Software Engineering"
    location_city: str = "Bengaluru"
    location_state: str = "Karnataka"
    experience_min_years: int = 0
    salary_min_lpa: float = 8.0
    salary_max_lpa: float = 16.0
    description: str
    skills: List[JobSkillRequirement]


class JobResponse(BaseModel):
    id: str
    employer_name: str
    title: str
    role_category: str
    location_city: str
    location_state: str
    experience_min_years: int
    salary_min_lpa: float
    salary_max_lpa: float
    description: str
    skills: List[Dict[str, Any]]
    posted_at: datetime
    data_source: str

    class Config:
        from_attributes = True


class JobAnalysisRequest(BaseModel):
    prompt: str


class EmployerSurveyRequest(BaseModel):
    employer_name: str
    industry: str
    hard_to_hire_skills: List[str]
    emerging_skills: List[str]
    fresher_gaps: List[str]
    recommended_certifications: List[str]
    additional_remarks: Optional[str] = None


# ==========================================
# ADMIN SCHEMAS
# ==========================================

class AdminOverviewResponse(BaseModel):
    jobs_analysed: int
    skills_analysed: int
    critical_shortages_count: int
    oversupply_count: int
    total_openings_analyzed: int
    average_curriculum_alignment: float
    total_technical_institutes_monitored: int
    annual_graduating_capacity: int
    top_demanded_skills: List[SkillBase]
    emerging_skills_count: int
    recommendations: List[Dict[str, Any]]
    data_source_label: str = "DEMO/SEED DATA"


class CopilotRequest(BaseModel):
    query: str
