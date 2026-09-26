# KaushalSetu: AI Labour Market & Skill Intelligence Platform (SIH26134)
## Architecture, Data Models, API Specifications, & AI Pipelines

### 1. High-Level System Architecture

```
[ External / Ingested Data ]
  ├── Job Market Postings (Portals, Employer Job Builder)
  ├── Institute Curricula (PDF / Syllabus docs / AICTE / UGC)
  ├── Student Profiles & Resumes (PDF / DOCX / Text)
  └── Employer Demand Surveys & Emerging Skill Trends
            │
            ▼
[ Ingestion & Normalization Layer ]
  ├── Text Extractor (PDF Base64 / Multimodal Gemini 3.8 Flash Parser)
  ├── Skill Taxonomy & Canonical Alias Normalizer (React.js -> React, K8s -> Kubernetes)
  └── Multi-dimensional Categorization (Cloud, DevOps, AI/ML, Core Engg, Soft Skills)
            │
            ▼
[ Explainable Mathematical Intelligence Engine ]
  ├── Deterministic Matching Engine: Score = ∑(w_i * Match_i) / ∑(w_i)
  ├── Labour Market Demand Engine: Demand_Index = f(JobOpenings, GrowthRate, EmployerUrgency)
  ├── Institutional Supply Engine: Supply_Index = f(GraduatingStudents, CourseEnrollment)
  ├── Gap & Shortage Detection: Shortage = High Demand + Low Supply; Oversupply = Low Demand + High Supply
  └── Curriculum Alignment Metric: Score = (Covered Market Skills) / (Total Market Required Skills) * 100
            │
            ▼
[ GenAI Reasoning & Synthesis Layer (Google Gemini 3.8 Flash via @google/genai) ]
  ├── Unstructured Document Parsing (Resume, Syllabus, Job JDs)
  ├── Explainable Gap Diagnostic (Contextual why-explanations based on exact profile & market metrics)
  ├── Actionable Learning Roadmaps (Foundation -> Intermediate -> Advanced -> Capstone)
  └── Career Copilot Grounding (Grounded in student profile + regional market telemetry)
            │
            ▼
[ Role-Based Intelligence Dashboards ]
  ├── 1. Student: Resume Intelligence, Gap Analysis, Job Match, Roadmap, Skill Assessment, Copilot
  ├── 2. Institute: Curriculum Analyzer, Market Alignment, Skill Shortage/Oversupply, AI Recommendations
  ├── 3. Employer: Job Requirement Builder, AI JD Generator, Candidate Matching, Industry Survey
  └── 4. Admin / Govt: Labour Market Macro Intel, India Geo Heatmap, Shortages, Curriculum Audits, CSV Reports
```

---

### 2. Database Entity-Relationship (ER) Diagram Description

Entities & Relationships (PostgreSQL Schema):

1. **User**: `id (UUID PK)`, `email`, `password_hash`, `role (STUDENT | INSTITUTE | EMPLOYER | ADMIN)`, `name`, `organization_name`, `created_at`
2. **StudentProfile**: `id (UUID PK)`, `user_id (FK -> User)`, `target_role`, `preferred_location`, `experience_level`, `education`, `bio`, `profile_completion_pct`
3. **Skill**: `id (UUID PK)`, `canonical_name` (e.g. "React", "Docker", "AWS"), `category (Frontend, Cloud, DevOps, AI, etc.)`, `description`, `market_demand_level (HIGH | MEDIUM | LOW)`
4. **SkillAlias**: `id (UUID PK)`, `skill_id (FK -> Skill)`, `alias` (e.g. "ReactJS", "React.js", "K8s", "Amazon Web Services")
5. **StudentSkill**: `id (UUID PK)`, `student_id (FK -> StudentProfile)`, `skill_id (FK -> Skill)`, `proficiency (BEGINNER | INTERMEDIATE | ADVANCED)`, `verified (BOOLEAN)`, `source (RESUME | ASSESSMENT | SELF)`
6. **Institute**: `id (UUID PK)`, `user_id (FK -> User)`, `name`, `code`, `state`, `district`, `accreditation`
7. **Course**: `id (UUID PK)`, `institute_id (FK -> Institute)`, `title`, `degree_level`, `duration_semesters`, `enrollment_capacity`
8. **Curriculum**: `id (UUID PK)`, `course_id (FK -> Course)`, `academic_year`, `syllabus_text`, `alignment_score`
9. **CurriculumSkill**: `id (UUID PK)`, `curriculum_id (FK -> Curriculum)`, `skill_id (FK -> Skill)`, `coverage_depth (CONCEPTUAL | PRACTICAL | CAPSTONE)`
10. **Employer**: `id (UUID PK)`, `user_id (FK -> User)`, `company_name`, `industry`, `headquarters`, `verified`
11. **Job**: `id (UUID PK)`, `employer_id (FK -> Employer)`, `title`, `role_category`, `location_city`, `location_state`, `experience_min`, `salary_range`, `description`, `created_at`
12. **JobSkill**: `id (UUID PK)`, `job_id (FK -> Job)`, `skill_id (FK -> Skill)`, `is_required (BOOLEAN)`, `min_proficiency`
13. **SkillDemand**: `id (UUID PK)`, `skill_id (FK -> Skill)`, `state`, `openings_count`, `growth_rate_pct`, `demand_index`, `sample_flag`
14. **TrainingSupply**: `id (UUID PK)`, `skill_id (FK -> Skill)`, `state`, `seats_capacity`, `graduates_per_year`, `supply_index`, `sample_flag`
15. **Assessment**: `id (UUID PK)`, `skill_id (FK -> Skill)`, `title`, `questions_json`, `duration_minutes`
16. **AssessmentResult**: `id (UUID PK)`, `student_id (FK -> StudentProfile)`, `assessment_id (FK -> Assessment)`, `score`, `passed`, `completed_at`
17. **EmployerRequirementSurvey**: `id (UUID PK)`, `employer_id (FK -> Employer)`, `hard_to_hire_skills`, `emerging_skills`, `fresher_gaps`, `submitted_at`
18. **Recommendation**: `id (UUID PK)`, `target_type (STUDENT | INSTITUTE | GOVT)`, `target_id`, `recommendation_text`, `evidence_data_json`, `created_at`

---

### 3. Folder Structure

```
├── backend/
│   ├── api/
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── employer.ts
│   │   ├── institute.ts
│   │   ├── market.ts
│   │   └── student.ts
│   ├── data/
│   │   ├── seedData.ts       # Grounded dataset for Indian labour market, 28 states, tech roles
│   │   └── taxonomy.ts       # Canonical skills + aliases dictionary
│   ├── database/
│   │   └── store.ts          # Relational memory/persistent database engine
│   ├── services/
│   │   ├── analyticsEngine.ts # Shortages, oversupply, geo aggregation
│   │   ├── curriculumEngine.ts# Syllabus parsing & mathematical alignment
│   │   ├── geminiService.ts   # Server-side @google/genai with gemini-3.8-flash
│   │   ├── matchingEngine.ts  # Explainable student-to-job matching formulas
│   │   └── skillExtractor.ts  # Regex + NLP + Gemini fallback skill normalization
│   └── types/
│       └── models.ts
├── docs/
│   └── ARCHITECTURE.md
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── DataBadge.tsx
│   │   │   ├── DisclaimerBanner.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── maps/
│   │   │   └── IndiaHeatmap.tsx
│   │   └── widgets/
│   │       ├── AlignmentBreakdown.tsx
│   │       ├── AssessmentModal.tsx
│   │       ├── MetricCard.tsx
│   │       └── SkillGapVisualizer.tsx
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── employer/
│   │   ├── institute/
│   │   └── student/
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── index.ts
├── server.ts                 # Full-stack entry point (Express API + Vite middleware)
└── package.json
```

---

### 4. Mathematical Formulas & Explainable Matching

1. **Skill Match Score**:
   $$\text{Match \%} = \left( \frac{|\text{StudentSkills} \cap \text{JobRequiredSkills}|}{|\text{JobRequiredSkills}|} \times 0.7 + \frac{|\text{StudentSkills} \cap \text{JobPreferredSkills}|}{\max(1, |\text{JobPreferredSkills}|)} \times 0.3 \right) \times 100$$

2. **Curriculum Alignment Score**:
   $$\text{Alignment \%} = \frac{\sum_{s \in \text{CoveredSkills}} \text{MarketDemandWeight}(s)}{\sum_{s \in \text{IndustryBenchmarkSkills}} \text{MarketDemandWeight}(s)} \times 100$$

3. **Skill Shortage / Oversupply Index**:
   $$\text{Gap Ratio} = \frac{\text{Normalized Demand Index}}{\max(0.1, \text{Normalized Supply Index})}$$
   - If $\text{Gap Ratio} > 1.4$ and Demand is HIGH $\rightarrow$ **Critical Shortage**
   - If $\text{Gap Ratio} < 0.6$ and Supply is HIGH $\rightarrow$ **Skill Oversupply**

---

### 5. AI Pipelines & Safety Disclaimers

All GenAI interactions utilize `gemini-3.8-flash` exclusively on the server side:
- **Resume Intelligence**: Parses unstructured text into canonical skills mapped to the taxonomy.
- **Curriculum Intelligence**: Maps syllabus modules to modern industrial competencies.
- **Career Copilot**: Injects the student's exact missing skills, job opening counts, and regional salary benchmarks into the system prompt.
- **Data Quality Labeling**: All synthesized statistics are strictly labeled with data flags: `[REAL VERIFIED DATA]`, `[SAMPLE HACKATHON BENCHMARK]`, and `[MODEL FORECAST]`.
