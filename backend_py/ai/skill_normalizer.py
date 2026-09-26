"""
Skill Normalization and Taxonomy Engine for KaushalSetu.
Standardizes messy user & resume skill strings into canonical entities.
Example: 'ReactJS', 'React.js', 'React JS' -> 'React'
         'Postgres', 'PSQL', 'pg'          -> 'PostgreSQL'
"""

import re
from typing import List, Dict, Optional, Tuple

CANONICAL_SKILLS_DATA = [
    # Cloud & DevOps
    {"id": "sk-aws", "name": "AWS", "normalized_name": "aws", "category": "Cloud & DevOps", "description": "Amazon Web Services cloud architecture and services (EC2, S3, Lambda, IAM)", "market_demand_level": "HIGH", "average_salary_bump_pct": 24.0},
    {"id": "sk-docker", "name": "Docker", "normalized_name": "docker", "category": "Cloud & DevOps", "description": "Containerization, Dockerfile authoring, multi-stage builds and compose", "market_demand_level": "HIGH", "average_salary_bump_pct": 20.0},
    {"id": "sk-k8s", "name": "Kubernetes", "normalized_name": "kubernetes", "category": "Cloud & DevOps", "description": "Container orchestration, Pods, Deployments, Services, Helm charts and ingress", "market_demand_level": "HIGH", "average_salary_bump_pct": 28.0},
    {"id": "sk-linux", "name": "Linux", "normalized_name": "linux", "category": "Cloud & DevOps", "description": "Unix/Linux system administration, shell scripting (Bash), permissions and networking", "market_demand_level": "HIGH", "average_salary_bump_pct": 15.0},
    {"id": "sk-git", "name": "Git", "normalized_name": "git", "category": "Cloud & DevOps", "description": "Distributed version control, branching, PR workflows, merge resolution and CI hooks", "market_demand_level": "HIGH", "average_salary_bump_pct": 12.0},
    {"id": "sk-terraform", "name": "Terraform", "normalized_name": "terraform", "category": "Cloud & DevOps", "description": "Infrastructure as Code (IaC), state management, HCL syntax and cloud provisioning", "market_demand_level": "HIGH", "average_salary_bump_pct": 25.0},
    {"id": "sk-ci-cd", "name": "CI/CD Pipelines", "normalized_name": "ci/cd pipelines", "category": "Cloud & DevOps", "description": "Continuous integration and deployment with GitHub Actions, GitLab CI, or Jenkins", "market_demand_level": "HIGH", "average_salary_bump_pct": 22.0},

    # AI & Data Science
    {"id": "sk-python", "name": "Python", "normalized_name": "python", "category": "AI & Data Science", "description": "Python programming, data structures, libraries and automation", "market_demand_level": "HIGH", "average_salary_bump_pct": 18.0},
    {"id": "sk-genai", "name": "Generative AI", "normalized_name": "generative ai", "category": "AI & Data Science", "description": "LLMs, prompt engineering, RAG architectures, Gemini / OpenAI SDKs and agents", "market_demand_level": "HIGH", "average_salary_bump_pct": 35.0},
    {"id": "sk-ml", "name": "Machine Learning", "normalized_name": "machine learning", "category": "AI & Data Science", "description": "Supervised/unsupervised algorithms, scikit-learn, model evaluation and metrics", "market_demand_level": "HIGH", "average_salary_bump_pct": 26.0},
    {"id": "sk-nlp", "name": "Natural Language Processing", "normalized_name": "natural language processing", "category": "AI & Data Science", "description": "Tokenization, embeddings, transformer models, semantic search and vector stores", "market_demand_level": "HIGH", "average_salary_bump_pct": 27.0},
    {"id": "sk-pytorch", "name": "PyTorch", "normalized_name": "pytorch", "category": "AI & Data Science", "description": "Deep learning neural networks, tensor computation, autograd and model fine-tuning", "market_demand_level": "HIGH", "average_salary_bump_pct": 29.0},
    {"id": "sk-sql", "name": "SQL", "normalized_name": "sql", "category": "AI & Data Science", "description": "Relational query design, indexing, window functions, CTEs and performance tuning", "market_demand_level": "HIGH", "average_salary_bump_pct": 16.0},
    {"id": "sk-data-eng", "name": "Data Engineering", "normalized_name": "data engineering", "category": "AI & Data Science", "description": "ETL/ELT pipelines, Apache Spark, Kafka streaming and data lakehouses", "market_demand_level": "HIGH", "average_salary_bump_pct": 27.0},

    # Frontend
    {"id": "sk-react", "name": "React", "normalized_name": "react", "category": "Frontend", "description": "React component lifecycle, hooks, state management, SPA architecture and Next.js", "market_demand_level": "HIGH", "average_salary_bump_pct": 20.0},
    {"id": "sk-typescript", "name": "TypeScript", "normalized_name": "typescript", "category": "Frontend", "description": "Static typing, generics, interfaces, strict compiler rules and modern ES features", "market_demand_level": "HIGH", "average_salary_bump_pct": 22.0},
    {"id": "sk-tailwind", "name": "Tailwind CSS", "normalized_name": "tailwind css", "category": "Frontend", "description": "Utility-first CSS framework, responsive design, dark mode and custom config", "market_demand_level": "MEDIUM", "average_salary_bump_pct": 12.0},
    {"id": "sk-javascript", "name": "JavaScript", "normalized_name": "javascript", "category": "Frontend", "description": "Modern JavaScript (ES6+), event loop, closures, async/await and DOM manipulation", "market_demand_level": "HIGH", "average_salary_bump_pct": 15.0},
    {"id": "sk-html-css", "name": "HTML5 & CSS3", "normalized_name": "html5 & css3", "category": "Frontend", "description": "Semantic HTML markup, CSS flexbox, grid, animations and web accessibility (a11y)", "market_demand_level": "MEDIUM", "average_salary_bump_pct": 10.0},

    # Backend
    {"id": "sk-nodejs", "name": "Node.js", "normalized_name": "node.js", "category": "Backend", "description": "Server-side JavaScript runtime, event-driven I/O, Express and microservices", "market_demand_level": "HIGH", "average_salary_bump_pct": 19.0},
    {"id": "sk-fastapi", "name": "FastAPI", "normalized_name": "fastapi", "category": "Backend", "description": "Asynchronous Python web framework, Pydantic data validation and OpenAPI docs", "market_demand_level": "HIGH", "average_salary_bump_pct": 21.0},
    {"id": "sk-java", "name": "Java", "normalized_name": "java", "category": "Backend", "description": "Object-oriented programming, Spring Boot enterprise frameworks and JVM tuning", "market_demand_level": "HIGH", "average_salary_bump_pct": 18.0},
    {"id": "sk-postgresql", "name": "PostgreSQL", "normalized_name": "postgresql", "category": "Backend", "description": "Advanced relational database, ACID transactions, JSONB and pgvector indexing", "market_demand_level": "HIGH", "average_salary_bump_pct": 20.0},
    {"id": "sk-rest-api", "name": "RESTful API Design", "normalized_name": "restful api design", "category": "Backend", "description": "HTTP verbs, idempotency, status codes, JWT authentication and rate limiting", "market_demand_level": "HIGH", "average_salary_bump_pct": 15.0},
    {"id": "sk-redis", "name": "Redis", "normalized_name": "redis", "category": "Backend", "description": "In-memory key-value caching, Pub/Sub messaging and session management", "market_demand_level": "MEDIUM", "average_salary_bump_pct": 17.0},

    # Cybersecurity
    {"id": "sk-cybersec", "name": "Cybersecurity", "normalized_name": "cybersecurity", "category": "Cybersecurity", "description": "Threat modeling, network security, zero-trust architecture and vulnerability analysis", "market_demand_level": "HIGH", "average_salary_bump_pct": 30.0},
    {"id": "sk-owasp", "name": "OWASP Top 10", "normalized_name": "owasp top 10", "category": "Cybersecurity", "description": "Web application vulnerability remediation (SQLi, XSS, CSRF, auth bypass)", "market_demand_level": "HIGH", "average_salary_bump_pct": 23.0},

    # Core Engineering & Soft Skills
    {"id": "sk-problem-solving", "name": "Problem Solving & DSA", "normalized_name": "problem solving & dsa", "category": "Soft Skills & Leadership", "description": "Data structures, algorithms, asymptotic analysis and competitive programming", "market_demand_level": "HIGH", "average_salary_bump_pct": 22.0},
    {"id": "sk-agile", "name": "Agile & Scrum", "normalized_name": "agile & scrum", "category": "Soft Skills & Leadership", "description": "Sprint planning, backlog grooming, standups, retrospectives and Jira", "market_demand_level": "MEDIUM", "average_salary_bump_pct": 12.0},
    {"id": "sk-comm", "name": "Technical Communication", "normalized_name": "technical communication", "category": "Soft Skills & Leadership", "description": "Cross-functional engineering communication, design docs and stakeholder presentations", "market_demand_level": "HIGH", "average_salary_bump_pct": 16.0}
]

SKILL_ALIASES_MAP = {
    # React variants
    "react": "sk-react", "reactjs": "sk-react", "react.js": "sk-react", "react js": "sk-react", "react native": "sk-react",
    # AWS variants
    "aws": "sk-aws", "aws cloud": "sk-aws", "amazon web services": "sk-aws", "ec2": "sk-aws", "s3": "sk-aws", "aws lambda": "sk-aws",
    # Docker
    "docker": "sk-docker", "dockerfile": "sk-docker", "docker compose": "sk-docker", "containerization": "sk-docker", "containers": "sk-docker",
    # Kubernetes
    "kubernetes": "sk-k8s", "k8s": "sk-k8s", "kube": "sk-k8s", "helm": "sk-k8s",
    # Linux
    "linux": "sk-linux", "bash": "sk-linux", "shell scripting": "sk-linux", "ubuntu": "sk-linux", "unix": "sk-linux",
    # Git
    "git": "sk-git", "github": "sk-git", "gitlab": "sk-git", "version control": "sk-git",
    # Python
    "python": "sk-python", "python3": "sk-python", "py": "sk-python",
    # GenAI
    "genai": "sk-genai", "gen ai": "sk-genai", "generative ai": "sk-genai", "llm": "sk-genai", "llms": "sk-genai", "rag": "sk-genai", "prompt engineering": "sk-genai", "gemini": "sk-genai", "chatgpt": "sk-genai", "large language models": "sk-genai",
    # Machine Learning
    "ml": "sk-ml", "machine learning": "sk-ml", "scikit-learn": "sk-ml", "sklearn": "sk-ml",
    # PyTorch
    "pytorch": "sk-pytorch", "torch": "sk-pytorch", "deep learning": "sk-pytorch", "tensorflow": "sk-pytorch",
    # PostgreSQL
    "postgresql": "sk-postgresql", "postgres": "sk-postgresql", "psql": "sk-postgresql", "pg": "sk-postgresql",
    # TypeScript
    "typescript": "sk-typescript", "ts": "sk-typescript",
    # JavaScript
    "javascript": "sk-javascript", "js": "sk-javascript", "es6": "sk-javascript",
    # Node.js
    "nodejs": "sk-nodejs", "node.js": "sk-nodejs", "node": "sk-nodejs", "express": "sk-nodejs", "express.js": "sk-nodejs",
    # FastAPI
    "fastapi": "sk-fastapi", "fast api": "sk-fastapi",
    # Terraform
    "terraform": "sk-terraform", "iac": "sk-terraform", "infrastructure as code": "sk-terraform",
    # CI/CD
    "ci/cd": "sk-ci-cd", "cicd": "sk-ci-cd", "continuous integration": "sk-ci-cd", "github actions": "sk-ci-cd", "jenkins": "sk-ci-cd",
    # Tailwind
    "tailwind": "sk-tailwind", "tailwindcss": "sk-tailwind", "tailwind css": "sk-tailwind",
    # SQL
    "sql": "sk-sql", "mysql": "sk-sql", "rdbms": "sk-sql", "sqlite": "sk-sql",
    # Data Engineering
    "data engineering": "sk-data-eng", "spark": "sk-data-eng", "apache spark": "sk-data-eng", "kafka": "sk-data-eng", "etl": "sk-data-eng",
    # Cybersecurity
    "cybersecurity": "sk-cybersec", "cyber security": "sk-cybersec", "infosec": "sk-cybersec", "ethical hacking": "sk-cybersec"
}


class SkillNormalizer:
    def __init__(self):
        self.skills_by_id = {s["id"]: s for s in CANONICAL_SKILLS_DATA}

    def normalize(self, raw_input: str) -> Optional[Dict]:
        """Normalize a raw skill name into canonical skill dict."""
        if not raw_input or not isinstance(raw_input, str):
            return None

        clean = raw_input.strip().lower()

        # 1. Direct match on canonical name or normalized_name
        for s in CANONICAL_SKILLS_DATA:
            if s["name"].lower() == clean or s["normalized_name"] == clean:
                return s

        # 2. Match on alias map
        if clean in SKILL_ALIASES_MAP:
            skill_id = SKILL_ALIASES_MAP[clean]
            return self.skills_by_id.get(skill_id)

        # 3. Punctuation-stripped fuzzy matching
        sanitized = re.sub(r'[^a-z0-9]', '', clean)
        for alias, skill_id in SKILL_ALIASES_MAP.items():
            if re.sub(r'[^a-z0-9]', '', alias) == sanitized:
                return self.skills_by_id.get(skill_id)

        return None

    def extract_from_text(self, text: str) -> List[Dict]:
        """Boundary-aware regex extraction of canonical skills from freeform resume / job text."""
        if not text:
            return []

        found = {}
        padded = f" {text.lower()} "

        # Scan canonical names
        for skill in CANONICAL_SKILLS_DATA:
            escaped = re.escape(skill["name"].lower())
            pattern = rf'(?:[^a-z0-9]|^){escaped}(?:[^a-z0-9]|$)'
            if re.search(pattern, padded, re.IGNORECASE):
                found[skill["id"]] = skill

        # Scan aliases
        for alias, skill_id in SKILL_ALIASES_MAP.items():
            if skill_id in found:
                continue
            escaped = re.escape(alias.lower())
            pattern = rf'(?:[^a-z0-9]|^){escaped}(?:[^a-z0-9]|$)'
            if re.search(pattern, padded, re.IGNORECASE):
                skill = self.skills_by_id.get(skill_id)
                if skill:
                    found[skill["id"]] = skill

        return list(found.values())

    def normalize_list(self, raw_list: List[str]) -> List[Dict]:
        """Normalize a list of raw skill strings, deduplicating results."""
        results = {}
        for raw in raw_list:
            norm = self.normalize(raw)
            if norm and norm["id"] not in results:
                results[norm["id"]] = norm
        return list(results.values())


skill_normalizer = SkillNormalizer()
