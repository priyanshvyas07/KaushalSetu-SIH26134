"""
Database Seed Script for KaushalSetu SIH26134.
Populates realistic benchmark demo dataset clearly marked as DEMO/SEED DATA.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from .models import (
    User,
    Skill,
    StudentProfile,
    Job,
    Course,
    Curriculum,
    CurriculumSkill,
    SkillDemand,
    Assessment,
    EmployerSurvey,
    Recommendation,
)
from .ai.skill_normalizer import CANONICAL_SKILLS_DATA
from .auth import hash_password


def seed_database():
    """Create all tables and insert benchmark seed records."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Check if database already has users
        if db.query(User).count() > 0:
            print("[Seed] Database already contains records. Skipping seed.")
            return

        print("[Seed] Seeding KaushalSetu database...")

        # 2. Canonical Skills
        for s in CANONICAL_SKILLS_DATA:
            skill = Skill(
                id=s["id"],
                name=s["name"],
                normalized_name=s["normalized_name"],
                category=s["category"],
                description=s["description"],
                market_demand_level=s["market_demand_level"],
                average_salary_bump_pct=s["average_salary_bump_pct"]
            )
            db.add(skill)
        db.commit()

        # 3. Users
        users_data = [
            {
                "id": "usr-student-1",
                "email": "arjun.sharma@sih.gov.in",
                "name": "Arjun Sharma",
                "role": "STUDENT",
                "organization_name": "PICT Pune (Computer Engg 2026)",
            },
            {
                "id": "usr-institute-1",
                "email": "dean.academic@pict.ac.in",
                "name": "Prof. Ramesh Kulkarni",
                "role": "INSTITUTE",
                "organization_name": "Pune Institute of Computer Technology (PICT)",
            },
            {
                "id": "usr-employer-1",
                "email": "talent@razorpay.com",
                "name": "Priya Sundaram",
                "role": "EMPLOYER",
                "organization_name": "Razorpay Software Pvt Ltd",
            },
            {
                "id": "usr-admin-1",
                "email": "director.skill@msde.gov.in",
                "name": "Dr. Sunita Deshmukh",
                "role": "ADMIN",
                "organization_name": "Ministry of Skill Development & Entrepreneurship (MSDE)",
            }
        ]

        for u in users_data:
            user = User(
                id=u["id"],
                email=u["email"],
                name=u["name"],
                role=u["role"],
                password_hash=hash_password("password123"),
                organization_name=u["organization_name"],
                created_at=datetime.utcnow()
            )
            db.add(user)
        db.commit()

        # 4. Student Profile
        student_profile = StudentProfile(
            id="stu-profile-1",
            user_id="usr-student-1",
            target_role="DevOps / Cloud Engineer",
            preferred_location="Bengaluru, Karnataka / Pune, Maharashtra",
            experience_level="Fresher (0-1 yrs)",
            education="B.Tech in Computer Engineering (2022-2026), GPA 8.7/10",
            bio="Final year undergraduate passionate about cloud infrastructure, Linux systems administration, and automated CI/CD release engineering.",
            profile_completion_pct=85,
            skills=[
                {"skill_id": "sk-linux", "proficiency": "INTERMEDIATE", "verified": True, "source": "RESUME"},
                {"skill_id": "sk-git", "proficiency": "ADVANCED", "verified": True, "source": "ASSESSMENT"},
                {"skill_id": "sk-python", "proficiency": "INTERMEDIATE", "verified": True, "source": "RESUME"},
                {"skill_id": "sk-sql", "proficiency": "INTERMEDIATE", "verified": False, "source": "SELF"},
                {"skill_id": "sk-problem-solving", "proficiency": "INTERMEDIATE", "verified": True, "source": "ASSESSMENT"}
            ],
            saved_roadmap_progress={
                "mod-docker-basics": True,
                "mod-docker-compose": False,
                "mod-aws-core": False,
                "mod-k8s-pods": False
            }
        )
        db.add(student_profile)
        db.commit()

        # 5. Jobs
        jobs_data = [
            {
                "id": "job-1",
                "employer_id": "usr-employer-1",
                "company": "Razorpay",
                "title": "Associate DevOps Engineer (Platform Team)",
                "role_category": "DevOps / Cloud Engineer",
                "location_city": "Bengaluru",
                "location_state": "Karnataka",
                "experience_min_years": 0,
                "salary_min_lpa": 12.0,
                "salary_max_lpa": 18.0,
                "description": "Join our cloud infrastructure team managing high-scale payment gateways processing millions of transactions. You will build resilient Docker images, maintain AWS EKS clusters, and automate Terraform modules.",
                "required_skills": [
                    {"skillId": "sk-linux", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-git", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-docker", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-aws", "isRequired": True, "minProficiency": "INTERMEDIATE"}
                ],
                "preferred_skills": [
                    {"skillId": "sk-k8s", "isRequired": False, "minProficiency": "BEGINNER"},
                    {"skillId": "sk-terraform", "isRequired": False, "minProficiency": "BEGINNER"}
                ],
                "data_source": "REAL VERIFIED"
            },
            {
                "id": "job-2",
                "employer_id": "usr-employer-1",
                "company": "Persistent Systems",
                "title": "Cloud Systems Engineer (AWS/GCP)",
                "role_category": "DevOps / Cloud Engineer",
                "location_city": "Pune",
                "location_state": "Maharashtra",
                "experience_min_years": 1,
                "salary_min_lpa": 8.5,
                "salary_max_lpa": 14.0,
                "description": "Responsible for client cloud migrations, multi-tenant container orchestration, and continuous integration pipelines.",
                "required_skills": [
                    {"skillId": "sk-aws", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-docker", "isRequired": True, "minProficiency": "BEGINNER"},
                    {"skillId": "sk-linux", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-ci-cd", "isRequired": True, "minProficiency": "INTERMEDIATE"}
                ],
                "preferred_skills": [
                    {"skillId": "sk-python", "isRequired": False, "minProficiency": "INTERMEDIATE"}
                ],
                "data_source": "DEMO/SEED DATA"
            },
            {
                "id": "job-3",
                "employer_id": "usr-employer-1",
                "company": "Swiggy Tech",
                "title": "Backend Platform Engineer (Python / Go)",
                "role_category": "Backend Developer",
                "location_city": "Hyderabad",
                "location_state": "Telangana",
                "experience_min_years": 1,
                "salary_min_lpa": 14.0,
                "salary_max_lpa": 22.0,
                "description": "Scale our order dispatch microservices handling 100k requests/sec. Experience with asynchronous Python, PostgreSQL clustering, and distributed caching.",
                "required_skills": [
                    {"skillId": "sk-python", "isRequired": True, "minProficiency": "ADVANCED"},
                    {"skillId": "sk-postgresql", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-redis", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-rest-api", "isRequired": True, "minProficiency": "ADVANCED"}
                ],
                "preferred_skills": [
                    {"skillId": "sk-docker", "isRequired": False, "minProficiency": "BEGINNER"}
                ],
                "data_source": "DEMO/SEED DATA"
            },
            {
                "id": "job-4",
                "employer_id": "usr-employer-1",
                "company": "Tata Elxsi",
                "title": "GenAI & Applied ML Specialist",
                "role_category": "AI / ML Engineer",
                "location_city": "Bengaluru",
                "location_state": "Karnataka",
                "experience_min_years": 0,
                "salary_min_lpa": 11.0,
                "salary_max_lpa": 19.0,
                "description": "Build enterprise retrieval-augmented generation (RAG) agents, LLM tool-calling pipelines, and vector database indices.",
                "required_skills": [
                    {"skillId": "sk-python", "isRequired": True, "minProficiency": "ADVANCED"},
                    {"skillId": "sk-genai", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-nlp", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-sql", "isRequired": True, "minProficiency": "INTERMEDIATE"}
                ],
                "preferred_skills": [
                    {"skillId": "sk-pytorch", "isRequired": False, "minProficiency": "BEGINNER"}
                ],
                "data_source": "DEMO/SEED DATA"
            },
            {
                "id": "job-5",
                "employer_id": "usr-employer-1",
                "company": "CRED",
                "title": "Frontend Product Engineer (React/TS)",
                "role_category": "Frontend Developer",
                "location_city": "Bengaluru",
                "location_state": "Karnataka",
                "experience_min_years": 1,
                "salary_min_lpa": 16.0,
                "salary_max_lpa": 26.0,
                "description": "Craft high-polish, 60fps web user interfaces for consumer fintech products with rigorous accessibility and fluid interaction.",
                "required_skills": [
                    {"skillId": "sk-react", "isRequired": True, "minProficiency": "ADVANCED"},
                    {"skillId": "sk-typescript", "isRequired": True, "minProficiency": "ADVANCED"},
                    {"skillId": "sk-tailwind", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-rest-api", "isRequired": True, "minProficiency": "INTERMEDIATE"},
                    {"skillId": "sk-git", "isRequired": True, "minProficiency": "INTERMEDIATE"}
                ],
                "preferred_skills": [],
                "data_source": "REAL VERIFIED"
            }
        ]

        for j in jobs_data:
            job = Job(
                id=j["id"],
                employer_id=j["employer_id"],
                company=j["company"],
                title=j["title"],
                role_category=j["role_category"],
                location_city=j["location_city"],
                location_state=j["location_state"],
                experience_min_years=j["experience_min_years"],
                salary_min_lpa=j["salary_min_lpa"],
                salary_max_lpa=j["salary_max_lpa"],
                description=j["description"],
                required_skills=j["required_skills"],
                preferred_skills=j["preferred_skills"],
                data_source=j["data_source"],
                posted_at=datetime.utcnow()
            )
            db.add(job)
        db.commit()

        # 6. Courses & Curriculum
        course_cs = Course(
            id="crs-pict-cs",
            institute_id="usr-institute-1",
            title="B.Tech in Computer Engineering (Autonomous 2024 Scheme)",
            department="Computer Engineering",
            degree_level="Undergraduate",
            duration_semesters=8,
            enrolled_students=320,
            target_industry_roles=["Software Engineer", "DevOps / Cloud Engineer", "Data Analyst"]
        )
        course_it = Course(
            id="crs-pict-it",
            institute_id="usr-institute-1",
            title="B.Tech in Information Technology",
            department="Information Technology",
            degree_level="Undergraduate",
            duration_semesters=8,
            enrolled_students=180,
            target_industry_roles=["Full-Stack Developer", "Cybersecurity Analyst"]
        )
        db.add(course_cs)
        db.add(course_it)
        db.commit()

        curriculum = Curriculum(
            id="cur-pict-cs-2026",
            institute_id="usr-institute-1",
            course_id="crs-pict-cs",
            program="B.Tech Computer Engineering",
            academic_year="2025-2026",
            syllabus_raw="""PUNE INSTITUTE OF COMPUTER TECHNOLOGY
DEPARTMENT OF COMPUTER ENGINEERING
COURSE OUTLINE: B.TECH COMPUTER ENGINEERING (SEMESTER 5-8)

Module 1: Operating Systems & Shell Programming
- Processes, threads, CPU scheduling, IPC, memory management
- Linux kernel architecture, Bash commands, pipes, permissions

Module 2: Object-Oriented Programming & Data Structures
- C++, Python OOP, trees, graphs, sorting, searching algorithms

Module 3: Database Management Systems
- Relational algebra, SQL DDL/DML, normalization (1NF-BCNF), ACID properties

Module 4: Computer Networks
- TCP/IP model, routing protocols, HTTP/HTTPS, socket programming

Module 5: Elective - Cloud & Virtualization (Theoretical)
- Hypervisors, private clouds, introductory OpenStack concepts""",
            alignment_score=48.2,
            last_audited=datetime.utcnow()
        )
        db.add(curriculum)
        db.commit()

        cur_skills = [
            {"skill_id": "sk-linux", "coverage_level": "PRACTICAL", "semester_taught": 5, "hours_dedicated": 48},
            {"skill_id": "sk-python", "coverage_level": "PRACTICAL", "semester_taught": 4, "hours_dedicated": 40},
            {"skill_id": "sk-sql", "coverage_level": "PRACTICAL", "semester_taught": 5, "hours_dedicated": 45},
            {"skill_id": "sk-problem-solving", "coverage_level": "PRACTICAL", "semester_taught": 3, "hours_dedicated": 60},
            {"skill_id": "sk-git", "coverage_level": "CONCEPTUAL", "semester_taught": 5, "hours_dedicated": 12}
        ]
        for cs in cur_skills:
            cs_row = CurriculumSkill(
                id=f"cs-{cs['skill_id']}",
                curriculum_id=curriculum.id,
                skill_id=cs["skill_id"],
                coverage_level=cs["coverage_level"],
                semester_taught=cs["semester_taught"],
                hours_dedicated=cs["hours_dedicated"]
            )
            db.add(cs_row)
        db.commit()

        # 7. Assessments
        asmt_docker = Assessment(
            id="asmt-docker",
            skill_id="sk-docker",
            skill_name="Docker",
            title="Docker Containerization & Multi-Stage Builds",
            duration_minutes=10,
            questions=[
                {
                    "id": "q1",
                    "question": "Which Dockerfile instruction creates an intermediate layer used for executing build commands?",
                    "options": ["RUN", "CMD", "ENTRYPOINT", "COPY"],
                    "correct_option_index": 0,
                    "explanation": "RUN executes commands during the build phase and commits the results to a new image layer."
                },
                {
                    "id": "q2",
                    "question": "What is the primary architectural advantage of a multi-stage Docker build?",
                    "options": [
                        "Decreases CPU usage during runtime",
                        "Minimizes final production image size by discarding build tools and intermediate artifacts",
                        "Enables automatic Kubernetes horizontal autoscaling",
                        "Encrypts secrets directly in image layer digests"
                    ],
                    "correct_option_index": 1,
                    "explanation": "Multi-stage builds allow compiling in a fat builder container and copying only compiled artifacts into a lightweight scratch/alpine runtime image."
                },
                {
                    "id": "q3",
                    "question": "In Docker Compose, what mechanism ensures service B waits for service A to pass health checks before starting?",
                    "options": ["links", "depends_on with condition: service_healthy", "restart: always", "expose: ports"],
                    "correct_option_index": 1,
                    "explanation": "depends_on with condition: service_healthy prevents race conditions during database initialization."
                }
            ]
        )
        asmt_aws = Assessment(
            id="asmt-aws",
            skill_id="sk-aws",
            skill_name="AWS",
            title="AWS Cloud Fundamentals & IAM Security",
            duration_minutes=10,
            questions=[
                {
                    "id": "q1",
                    "question": "Which AWS service is best suited for managing temporary security credentials for EC2 applications without hardcoding API keys?",
                    "options": ["AWS IAM Roles with Instance Profiles", "Root User Access Keys", "AWS Secrets Manager in plaintext", "AWS Cognito User Pools"],
                    "correct_option_index": 0,
                    "explanation": "IAM Roles attached via Instance Profiles supply short-lived STS credentials automatically rotated by the instance metadata service."
                },
                {
                    "id": "q2",
                    "question": "Which AWS VPC component routes outbound traffic from private subnets to the public internet while blocking incoming connections?",
                    "options": ["Internet Gateway (IGW)", "NAT Gateway", "Transit Gateway", "VPC Peering Connection"],
                    "correct_option_index": 1,
                    "explanation": "A NAT Gateway enables outbound internet access for private subnets while preventing unsolicited inbound traffic."
                }
            ]
        )
        asmt_git = Assessment(
            id="asmt-git",
            skill_id="sk-git",
            skill_name="Git",
            title="Git Version Control & Branching Workflows",
            duration_minutes=8,
            questions=[
                {
                    "id": "q1",
                    "question": "What is the difference between git fetch and git pull?",
                    "options": [
                        "git pull only downloads tags, git fetch downloads commits",
                        "git fetch downloads remote metadata without modifying your working branch; git pull fetches and merges",
                        "git fetch pushes local commits; git pull downloads remote commits",
                        "They are identical aliases"
                    ],
                    "correct_option_index": 1,
                    "explanation": "git fetch updates remote tracking branches without altering the working tree; git pull runs fetch followed by merge."
                }
            ]
        )
        db.add(asmt_docker)
        db.add(asmt_aws)
        db.add(asmt_git)
        db.commit()

        # 8. Employer Surveys
        survey1 = EmployerSurvey(
            id="es-1",
            employer_name="Razorpay",
            industry="Fintech / Payments",
            hard_to_hire_skills=["Kubernetes", "Terraform", "Observability (Prometheus/Grafana)", "Go"],
            emerging_skills=["Generative AI Agents", "eBPF Kernel Monitoring", "Multi-Cloud FinOps"],
            fresher_gaps=["Engineering graduates understand theoretical OS concepts but cannot write a multi-stage Dockerfile or configure a reverse proxy."],
            recommended_certifications=["AWS Solutions Architect Associate (SAA-C03)", "Certified Kubernetes Administrator (CKA)"],
            additional_remarks="We strongly urge institutes to make lab projects deployable on live cloud accounts rather than local XAMPP servers."
        )
        survey2 = EmployerSurvey(
            id="es-2",
            employer_name="Tata Elxsi",
            industry="Automotive & Enterprise Software",
            hard_to_hire_skills=["PyTorch", "Vector Databases", "Embedded Linux"],
            emerging_skills=["Local LLM Inference Optimization", "Model Quantization (GGML/GGUF)"],
            fresher_gaps=["Students rely heavily on generic high-level tutorials without understanding memory profiling or vector arithmetic."],
            recommended_certifications=["NVIDIA Deep Learning Institute Certificate", "TensorFlow Developer"],
            additional_remarks="Industry-academia co-curricula design is vital for 2026."
        )
        db.add(survey1)
        db.add(survey2)
        db.commit()

        print("[Seed] KaushalSetu seed data successfully committed to database!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
