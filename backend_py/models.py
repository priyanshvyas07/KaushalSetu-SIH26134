"""
SQLAlchemy database models for KaushalSetu SIH26134.
Defines all core entities connecting Students, Institutes, Employers, and Admin Market Intelligence.
"""

from datetime import datetime
import json
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    JSON,
)
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    """Core user model supporting Role-Based Access Control."""
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    role = Column(String(32), nullable=False, default="STUDENT")  # STUDENT, INSTITUTE, EMPLOYER, ADMIN
    password_hash = Column(String(256), nullable=False)
    organization_name = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="employer")
    curricula = relationship("Curriculum", back_populates="institute")


class Skill(Base):
    """Canonical industry skill taxonomy with normalization data."""
    __tablename__ = "skills"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False, index=True)
    normalized_name = Column(String(128), nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)
    description = Column(Text, nullable=True)
    market_demand_level = Column(String(16), default="HIGH")  # HIGH, MEDIUM, LOW
    average_salary_bump_pct = Column(Float, default=15.0)

    # Relationships
    demands = relationship("SkillDemand", back_populates="skill")
    curriculum_skills = relationship("CurriculumSkill", back_populates="skill")


class StudentProfile(Base):
    """Candidate profile containing target role, verified skills, and background."""
    __tablename__ = "student_profiles"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False)
    education = Column(Text, nullable=True)
    experience_level = Column(String(64), default="Fresher (0-1 yrs)")
    target_role = Column(String(128), default="DevOps / Cloud Engineer", index=True)
    preferred_location = Column(String(128), default="Bengaluru, Karnataka")
    bio = Column(Text, nullable=True)
    profile_completion_pct = Column(Integer, default=50)
    skills = Column(JSON, default=list)  # List of {skill_id, proficiency, verified, source}
    saved_roadmap_progress = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="student", cascade="all, delete-orphan")
    assessment_results = relationship("AssessmentResult", back_populates="student", cascade="all, delete-orphan")


class Resume(Base):
    """Uploaded student resumes with parsed text and extracted AI skills."""
    __tablename__ = "resumes"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("student_profiles.id"), nullable=False)
    filename = Column(String(256), nullable=False)
    extracted_text = Column(Text, nullable=True)
    extracted_skills = Column(JSON, default=list)
    parsed_ai_data = Column(JSON, default=dict)  # structured {education, experience, projects, certifications}
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("StudentProfile", back_populates="resumes")


class Job(Base):
    """Employer job postings and industry benchmark requirements."""
    __tablename__ = "jobs"

    id = Column(String(64), primary_key=True, index=True)
    employer_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    company = Column(String(128), nullable=False)
    title = Column(String(128), nullable=False, index=True)
    role_category = Column(String(128), nullable=False, index=True)
    description = Column(Text, nullable=False)
    location_city = Column(String(64), default="Bengaluru")
    location_state = Column(String(64), default="Karnataka")
    experience_min_years = Column(Integer, default=0)
    salary_min_lpa = Column(Float, default=8.0)
    salary_max_lpa = Column(Float, default=16.0)
    required_skills = Column(JSON, default=list)  # [{skill_id, min_proficiency}]
    preferred_skills = Column(JSON, default=list)  # [{skill_id, min_proficiency}]
    data_source = Column(String(64), default="REAL VERIFIED")
    posted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employer = relationship("User", back_populates="jobs")


class SkillDemand(Base):
    """Regional & role-specific labour market demand statistics."""
    __tablename__ = "skill_demands"

    id = Column(String(64), primary_key=True, index=True)
    skill_id = Column(String(64), ForeignKey("skills.id"), nullable=False)
    job_role = Column(String(128), nullable=False, index=True)
    state = Column(String(64), default="All India", index=True)
    demand_level = Column(String(16), default="HIGH")  # HIGH, MEDIUM, LOW
    demand_count = Column(Integer, default=1000)
    openings_count = Column(Integer, default=1000)
    supply_index = Column(Float, default=40.0)
    demand_index = Column(Float, default=80.0)
    gap_ratio = Column(Float, default=2.0)
    growth_rate_pct = Column(Float, default=20.0)
    source = Column(String(64), default="DEMO/SEED DATA")
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    skill = relationship("Skill", back_populates="demands")


class Course(Base):
    """Academic programs offered by institutes."""
    __tablename__ = "courses"

    id = Column(String(64), primary_key=True, index=True)
    institute_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    title = Column(String(256), nullable=False)
    department = Column(String(128), default="Computer Engineering")
    degree_level = Column(String(64), default="Undergraduate")
    duration_semesters = Column(Integer, default=8)
    enrolled_students = Column(Integer, default=300)
    target_industry_roles = Column(JSON, default=list)

    # Relationships
    curricula = relationship("Curriculum", back_populates="course_rel", cascade="all, delete-orphan")


class Curriculum(Base):
    """Institute syllabus documents and extracted competency structures."""
    __tablename__ = "curricula"

    id = Column(String(64), primary_key=True, index=True)
    institute_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=True)
    program = Column(String(128), default="B.Tech Computer Engineering")
    academic_year = Column(String(32), default="2025-2026")
    document_filename = Column(String(256), nullable=True)
    extracted_text = Column(Text, nullable=True)
    syllabus_raw = Column(Text, nullable=True)
    alignment_score = Column(Float, default=48.2)
    last_audited = Column(DateTime, default=datetime.utcnow)

    # Relationships
    institute = relationship("User", back_populates="curricula")
    course_rel = relationship("Course", back_populates="curricula")
    skills = relationship("CurriculumSkill", back_populates="curriculum", cascade="all, delete-orphan")


class CurriculumSkill(Base):
    """Mapping of individual skills covered within an academic curriculum."""
    __tablename__ = "curriculum_skills"

    id = Column(String(64), primary_key=True, index=True)
    curriculum_id = Column(String(64), ForeignKey("curricula.id"), nullable=False)
    skill_id = Column(String(64), ForeignKey("skills.id"), nullable=False)
    coverage_level = Column(String(32), default="PRACTICAL")  # CONCEPTUAL, PRACTICAL, CAPSTONE
    semester_taught = Column(Integer, default=5)
    hours_dedicated = Column(Integer, default=36)

    # Relationships
    curriculum = relationship("Curriculum", back_populates="skills")
    skill = relationship("Skill", back_populates="curriculum_skills")


class SkillGap(Base):
    """Calculated gap record comparing a student or curriculum against market demand."""
    __tablename__ = "skill_gaps"

    id = Column(String(64), primary_key=True, index=True)
    entity_type = Column(String(32), nullable=False)  # STUDENT, CURRICULUM
    entity_id = Column(String(64), nullable=False, index=True)
    skill_id = Column(String(64), ForeignKey("skills.id"), nullable=False)
    demand_level = Column(String(16), default="HIGH")
    current_level = Column(String(32), default="MISSING")  # MISSING, WEAK, PROFICIENT
    gap_score = Column(Float, default=0.0)  # 0 to 100
    priority = Column(String(16), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    explanation = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)


class LearningRoadmap(Base):
    """Personalized learning roadmap generated for a student."""
    __tablename__ = "learning_roadmaps"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("student_profiles.id"), nullable=False)
    target_role = Column(String(128), nullable=False)
    recommended_skills = Column(JSON, default=list)
    roadmap_steps = Column(JSON, default=list)  # [{stage_id, title, modules: [{id, title, skill, hours, is_completed}]}]
    progress_pct = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = relationship("StudentProfile", back_populates="roadmaps")


class Recommendation(Base):
    """AI recommendations with evidence and rationale for students, institutes, and gov."""
    __tablename__ = "recommendations"

    id = Column(String(64), primary_key=True, index=True)
    entity_type = Column(String(32), nullable=False)  # STUDENT, INSTITUTE, GOVT
    entity_id = Column(String(64), nullable=True)
    title = Column(String(256), nullable=False)
    recommendation = Column(Text, nullable=False)
    priority = Column(String(16), default="HIGH")  # CRITICAL, HIGH, MEDIUM
    confidence_score = Column(Float, default=0.92)
    evidence = Column(JSON, default=dict)
    data_source = Column(String(64), default="DEMO/SEED DATA")
    created_at = Column(DateTime, default=datetime.utcnow)


class Assessment(Base):
    """Objective MCQ skill verification assessments."""
    __tablename__ = "assessments"

    id = Column(String(64), primary_key=True, index=True)
    skill_id = Column(String(64), ForeignKey("skills.id"), nullable=False)
    skill_name = Column(String(128), nullable=False)
    title = Column(String(256), nullable=False)
    duration_minutes = Column(Integer, default=10)
    questions = Column(JSON, default=list)  # [{id, question, options, correct_option_index, explanation}]


class AssessmentResult(Base):
    """Recorded student quiz attempts for skill verification."""
    __tablename__ = "assessment_results"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("student_profiles.id"), nullable=False)
    assessment_id = Column(String(64), ForeignKey("assessments.id"), nullable=False)
    skill_id = Column(String(64), nullable=False)
    score = Column(Integer, default=0)
    total = Column(Integer, default=100)
    passed = Column(Boolean, default=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("StudentProfile", back_populates="assessment_results")


class EmployerSurvey(Base):
    """Feedback from recruiting corporate partners regarding fresher skill deficits."""
    __tablename__ = "employer_surveys"

    id = Column(String(64), primary_key=True, index=True)
    employer_name = Column(String(128), nullable=False)
    industry = Column(String(128), nullable=False)
    hard_to_hire_skills = Column(JSON, default=list)
    emerging_skills = Column(JSON, default=list)
    fresher_gaps = Column(JSON, default=list)
    recommended_certifications = Column(JSON, default=list)
    additional_remarks = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
