# KaushalSetu – AI Labour Market & Skill Intelligence Platform
**Smart India Hackathon (SIH) Problem Statement: SIH26134**

KaushalSetu is a unified, AI-powered Labour Market & Skill Intelligence Platform engineered to connect:
- **Student Skills & Resumes**
- **Industry Job Demands & Corporate Prerequisite Thresholds**
- **Institute Curriculum & Syllabus Coursework**
- **Employer Hiring Requirements & Candidate Matching**
- **Government / Admin Macro Labour Market Policy Telemetry**

---

## 🏗 System Architecture

KaushalSetu is built as a clean modular monolith with distinct intelligence layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (REACT + TS)                         │
│   • Student Portal      • Institute Dashboard    • Employer Console     │
│   • Admin/Govt View     • India Skill Heatmap    • Career Copilot Chat  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST APIs (/api/v1/...)
┌────────────────────────────────────▼────────────────────────────────────┐
│                       BACKEND CORE & API GATEWAY                        │
│   • JWT Auth & RBAC (/api/v1/auth)                                      │
│   • Student Workflow (/api/v1/students)                                 │
│   • Institute Syllabus Intelligence (/api/v1/institutes)                │
│   • Employer Hiring & Candidate Match (/api/v1/employers)               │
│   • Policy Analytics & Heatmaps (/api/v1/admin)                         │
│   • Canonical Taxonomy & Normalization (/api/v1/market)                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                          AI INTELLIGENCE LAYER                          │
│   ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│   │ Document Processing    │  │ Skill Normalization Engine           │  │
│   │ (PyMuPDF & python-docx)│  │ (Multi-tier Canonical Dictionary)    │  │
│   └────────────────────────┘  └──────────────────────────────────────┘  │
│   ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│   │ Skill Gap Engine       │  │ Curriculum Audit Engine              │  │
│   │ (Deterministic Formula)│  │ (4-Quadrant Market Classification)   │  │
│   └────────────────────────┘  └──────────────────────────────────────┘  │
│   ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│   │ Configurable LLM Layer │  │ Macro Analytics Engine               │  │
│   │ (Gemini / OpenAI / SDK)│  │ (Geographic Demand & Gap Ratios)     │  │
│   └────────────────────────┘  └──────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                             DATABASE LAYER                              │
│   PostgreSQL / SQLite with SQLAlchemy & TypeScript Repository Store     │
│   (Users, Profiles, Resumes, Skills, Jobs, Curricula, Gaps, Roadmaps)   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Core Intelligence Workflows

### 1. Student Core Workflow
1. **Resume Ingestion**: Student uploads a resume (PDF, DOCX, or text).
2. **Text & Skill Extraction**: Document processor extracts content; AI and canonical regex parse technical competencies.
3. **Target Job Selection**: Student chooses career target (e.g., *DevOps / Cloud Engineer*).
4. **Skill Normalization**: Variants like `ReactJS`, `React.js` $\rightarrow$ `React`; `Postgres`, `PSQL` $\rightarrow$ `PostgreSQL`.
5. **Deterministic Gap Calculation**:
   $$\text{Match \%} = \left( \frac{\text{Matched Mandatory}}{\text{Total Mandatory}} \times 0.70 + \frac{\text{Matched Preferred}}{\text{Total Preferred}} \times 0.30 \right) \times 100$$
6. **Dashboard Output**: Displays matched skills, missing mandatory skills, priority level, and candidate fit percentile.
7. **Personalized Roadmap**: Generates structured, staged learning modules with progress tracking.
8. **Career Copilot**: AI assistant answers queries grounded in student verified profile telemetry.

### 2. Institute Core Workflow
1. **Syllabus Ingestion**: Institute uploads course syllabus document (PDF / text).
2. **Curriculum Extraction**: Maps credit hours, subjects, lab practicals, and covered technologies.
3. **Industry Demand Comparison**: Evaluates syllabus against benchmark national hiring vacancies.
4. **4-Quadrant Skill Matrix**:
   - **High Demand + Low Coverage** $\rightarrow$ `Critical Skill Gap` *(Urgent Reform)*
   - **High Demand + High Coverage** $\rightarrow$ `Well Aligned`
   - **Low Demand + High Coverage** $\rightarrow$ `Oversupply Risk` *(Credit Bloat)*
   - **Low Demand + Low Coverage** $\rightarrow$ `Low Priority`
5. **Explainable Alignment Score**:
   $$\text{Alignment Score} = \frac{\sum (\text{Covered Skill} \times \text{Depth Multiplier} \times \text{Demand Weight})}{\sum \text{Total Benchmark Demand Weight}} \times 100$$
6. **Grounded AI Recommendations**: Actionable interventions citing market evidence, salary premiums, and sample syllabi.

### 3. Employer Core Workflow
1. **AI Job Requirement Generator**: Transforms unstructured prompt (e.g., *"I need a junior DevOps engineer"*) into normalized requirements and salary bands.
2. **Candidate Ranking**: Deterministically ranks registered students based on verified skill competencies.
3. **Industry Feedback Surveys**: Employers submit observations on fresher skill gaps to update national intelligence telemetry.

### 4. Admin & Government Macro Telemetry
1. **Labour Market Indicators**: National vacancy indices, YoY growth rates, and shortage counts.
2. **Geographic Heatmap**: State-by-state demand, supply indices, and gap ratios ($\text{Demand} / \text{Supply}$).
3. **CSV Export**: Comprehensive analytical exports for policy formulation.

---

## 🗄 Database Design

| Model | Description | Key Attributes |
|---|---|---|
| `User` | RBAC accounts | `id`, `name`, `email`, `role`, `password_hash`, `organization_name`, `created_at` |
| `StudentProfile` | Candidate background | `id`, `user_id`, `education`, `experience_level`, `target_role`, `preferred_location`, `skills`, `profile_completion_pct` |
| `Resume` | Uploaded resumes | `id`, `student_id`, `filename`, `extracted_text`, `extracted_skills`, `parsed_ai_data`, `uploaded_at` |
| `Skill` | Canonical skill taxonomy | `id`, `name`, `normalized_name`, `category`, `description`, `market_demand_level`, `average_salary_bump_pct` |
| `Job` | Industry vacancies | `id`, `employer_id`, `company`, `title`, `role_category`, `description`, `salary_min_lpa`, `required_skills`, `preferred_skills` |
| `SkillDemand` | Regional market telemetry | `id`, `skill_id`, `job_role`, `state`, `demand_level`, `openings_count`, `supply_index`, `gap_ratio` |
| `Course` | Academic degree programs | `id`, `institute_id`, `title`, `department`, `degree_level`, `enrolled_students` |
| `Curriculum` | Syllabus documents | `id`, `course_id`, `program`, `academic_year`, `syllabus_raw`, `alignment_score`, `last_audited` |
| `CurriculumSkill` | Course competency mappings | `id`, `curriculum_id`, `skill_id`, `coverage_level`, `semester_taught`, `hours_dedicated` |
| `SkillGap` | Evaluated gap records | `id`, `entity_type`, `entity_id`, `skill_id`, `demand_level`, `current_level`, `gap_score`, `priority` |
| `LearningRoadmap`| Personalized progression | `id`, `student_id`, `target_role`, `recommended_skills`, `roadmap_steps`, `progress_pct` |
| `Assessment` | MCQ verification quizzes | `id`, `skill_id`, `skill_name`, `title`, `duration_minutes`, `questions` |
| `EmployerSurvey`| Recruiter feedback | `id`, `employer_name`, `industry`, `hard_to_hire_skills`, `emerging_skills`, `fresher_gaps` |
| `Recommendation`| AI evidence-backed suggestions | `id`, `entity_type`, `title`, `recommendation`, `priority`, `evidence`, `data_source` |

> [!NOTE]
> All demo and prototype records are clearly marked with `DEMO/SEED DATA` data source labels.

---

## 🚀 API Specification (Version 1)

### Authentication
- `POST /api/v1/auth/register` — Register student, institute, employer, or admin user.
- `POST /api/v1/auth/login` — Authenticate and receive JWT access token.
- `GET /api/v1/auth/me` — Retrieve active authenticated session.

### Students
- `GET /api/v1/students/profile` — Get candidate profile with verified skills and gaps.
- `PUT /api/v1/students/profile` — Update target role and career preferences.
- `POST /api/v1/students/resume/upload` — Ingest resume PDF/text, normalize skills, and update profile.
- `GET /api/v1/students/skills` — List candidate's registered competencies.
- `GET /api/v1/students/skill-gap` — Compute deterministic gap matrix against target role.
- `GET /api/v1/students/jobs` — Retrieve matched job openings with explainable breakdown.
- `GET /api/v1/students/roadmap` — Get personalized learning roadmap stages.
- `POST /api/v1/students/roadmap/progress` — Update module completion progress.
- `GET /api/v1/students/assessments` — List skill verification MCQ assessments.
- `GET /api/v1/students/assessments/:id` — Retrieve quiz questions.
- `POST /api/v1/students/assessments/:id/submit` — Submit quiz answers and verify skill badge.
- `POST /api/v1/students/copilot` — Career Copilot advice grounded in student profile data.

### Institutes
- `GET /api/v1/institutes/overview` — Get curriculum alignment score, student stats, and critical shortages.
- `GET /api/v1/institutes/courses` — List academic programs.
- `GET /api/v1/institutes/curriculum/:courseId` — Retrieve audit report for a course.
- `POST /api/v1/institutes/curriculum/upload` — Upload syllabus document (PDF/text) for AI audit.
- `POST /api/v1/institutes/curriculum/analyze` — Re-audit syllabus and compute new alignment score.
- `GET /api/v1/institutes/industry-gap` — Retrieve industry vs. syllabus comparison table.
- `GET /api/v1/institutes/recommendations` — Retrieve AI-generated curriculum reforms.
- `GET /api/v1/institutes/employer-feedback` — Retrieve recruiting partner survey submissions.

### Employers
- `GET /api/v1/employers/jobs` — List active job postings.
- `POST /api/v1/employers/job/analyze` — Generate structured requirements via AI.
- `POST /api/v1/employers/jobs` — Publish a new job opening.
- `GET /api/v1/employers/candidates/match/:jobId` — Rank candidates mathematically for a job.
- `POST /api/v1/employers/survey` — Submit industry skill feedback survey.

### Admin & Macro Market
- `GET /api/v1/admin/market-overview` — Macro labour market telemetry summary.
- `GET /api/v1/admin/skill-demand` — Industry and role demand breakdown.
- `GET /api/v1/admin/skill-shortage` — Shortage and oversupply classification list.
- `GET /api/v1/admin/skill-trends` — High-growth emerging skill list.
- `GET /api/v1/admin/heatmap` — State-wise geographic coordinates and demand indices.
- `GET /api/v1/admin/training-supply` — Monitored institutions and training capacity.
- `GET /api/v1/admin/reports/export` — Export data in CSV format.

### Taxonomy & Market
- `GET /api/v1/market/skills` — Full canonical skill dictionary.
- `POST /api/v1/market/normalize-skill` — Standardize arbitrary skill string.

---

## 🛠 Setup & Local Development

### Option A: Integrated Node.js + Express Full-Stack Server (Default)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment variables
cp .env.example .env

# 3. Start the application
npm run dev
```

Visit `http://localhost:3000` to interact with the full web platform.

---

### Option B: Standalone Python FastAPI Backend

```bash
# 1. Navigate to python backend directory
cd backend_py

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run database seed script
python -m backend_py.seed_data

# 5. Start FastAPI development server
uvicorn backend_py.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 🔐 Security & AI Configuration

1. **Environment Variables**: Never commit `.env` files. Use `.env.example` as a template.
2. **AI Provider**: Configurable via `AI_PROVIDER=gemini` or `AI_PROVIDER=openai`. If no API key is provided, the platform automatically utilizes its high-precision deterministic offline heuristic parser.
3. **File Validation**: Uploaded documents are constrained by MIME type checks and file size limits.
