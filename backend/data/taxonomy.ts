import { Skill, SkillAlias } from '../types/models';

export const CANONICAL_SKILLS: Skill[] = [
  // Cloud & DevOps
  { id: 'sk-aws', canonicalName: 'AWS', category: 'Cloud & DevOps', description: 'Amazon Web Services cloud architecture and services (EC2, S3, Lambda, IAM)', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 24 },
  { id: 'sk-docker', canonicalName: 'Docker', category: 'Cloud & DevOps', description: 'Containerization, Dockerfile authoring, multi-stage builds and compose', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 20 },
  { id: 'sk-k8s', canonicalName: 'Kubernetes', category: 'Cloud & DevOps', description: 'Container orchestration, Pods, Deployments, Services, Helm charts and ingress', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 28 },
  { id: 'sk-linux', canonicalName: 'Linux', category: 'Cloud & DevOps', description: 'Unix/Linux system administration, shell scripting (Bash), permissions and networking', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 15 },
  { id: 'sk-git', canonicalName: 'Git', category: 'Cloud & DevOps', description: 'Distributed version control, branching, PR workflows, merge resolution and CI hooks', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 12 },
  { id: 'sk-terraform', canonicalName: 'Terraform', category: 'Cloud & DevOps', description: 'Infrastructure as Code (IaC), state management, HCL syntax and cloud provisioning', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 25 },
  { id: 'sk-ci-cd', canonicalName: 'CI/CD Pipelines', category: 'Cloud & DevOps', description: 'Continuous integration and deployment with GitHub Actions, GitLab CI, or Jenkins', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 22 },

  // AI & Data Science
  { id: 'sk-python', canonicalName: 'Python', category: 'AI & Data Science', description: 'Python programming, data structures, libraries and automation', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 18 },
  { id: 'sk-genai', canonicalName: 'Generative AI', category: 'AI & Data Science', description: 'LLMs, prompt engineering, RAG architectures, Gemini / OpenAI SDKs and agents', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 35 },
  { id: 'sk-ml', canonicalName: 'Machine Learning', category: 'AI & Data Science', description: 'Supervised/unsupervised algorithms, scikit-learn, model evaluation and metrics', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 26 },
  { id: 'sk-nlp', canonicalName: 'Natural Language Processing', category: 'AI & Data Science', description: 'Tokenization, embeddings, transformer models, semantic search and vector stores', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 27 },
  { id: 'sk-pytorch', canonicalName: 'PyTorch', category: 'AI & Data Science', description: 'Deep learning neural networks, tensor computation, autograd and model fine-tuning', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 29 },
  { id: 'sk-sql', canonicalName: 'SQL', category: 'AI & Data Science', description: 'Relational query design, indexing, window functions, CTEs and performance tuning', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 16 },
  { id: 'sk-data-eng', canonicalName: 'Data Engineering', category: 'AI & Data Science', description: 'ETL/ELT pipelines, Apache Spark, Kafka streaming and data lakehouses', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 27 },

  // Frontend
  { id: 'sk-react', canonicalName: 'React', category: 'Frontend', description: 'React component lifecycle, hooks, state management, SPA architecture and Next.js', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 20 },
  { id: 'sk-typescript', canonicalName: 'TypeScript', category: 'Frontend', description: 'Static typing, generics, interfaces, strict compiler rules and modern ES features', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 22 },
  { id: 'sk-tailwind', canonicalName: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework, responsive design, dark mode and custom config', marketDemandLevel: 'MEDIUM', averageSalaryBumpPct: 12 },
  { id: 'sk-javascript', canonicalName: 'JavaScript', category: 'Frontend', description: 'Modern JavaScript (ES6+), event loop, closures, async/await and DOM manipulation', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 15 },
  { id: 'sk-html-css', canonicalName: 'HTML5 & CSS3', category: 'Frontend', description: 'Semantic HTML markup, CSS flexbox, grid, animations and web accessibility (a11y)', marketDemandLevel: 'MEDIUM', averageSalaryBumpPct: 10 },

  // Backend
  { id: 'sk-nodejs', canonicalName: 'Node.js', category: 'Backend', description: 'Server-side JavaScript runtime, event-driven I/O, Express and microservices', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 19 },
  { id: 'sk-fastapi', canonicalName: 'FastAPI', category: 'Backend', description: 'Asynchronous Python web framework, Pydantic data validation and OpenAPI docs', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 21 },
  { id: 'sk-java', canonicalName: 'Java', category: 'Backend', description: 'Object-oriented programming, Spring Boot enterprise frameworks and JVM tuning', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 18 },
  { id: 'sk-postgresql', canonicalName: 'PostgreSQL', category: 'Backend', description: 'Advanced relational database, ACID transactions, JSONB and pgvector indexing', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 20 },
  { id: 'sk-rest-api', canonicalName: 'RESTful API Design', category: 'Backend', description: 'HTTP verbs, idempotency, status codes, JWT authentication and rate limiting', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 15 },
  { id: 'sk-redis', canonicalName: 'Redis', category: 'Backend', description: 'In-memory key-value caching, Pub/Sub messaging and session management', marketDemandLevel: 'MEDIUM', averageSalaryBumpPct: 17 },

  // Cybersecurity
  { id: 'sk-cybersec', canonicalName: 'Cybersecurity', category: 'Cybersecurity', description: 'Threat modeling, network security, zero-trust architecture and vulnerability analysis', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 30 },
  { id: 'sk-owasp', canonicalName: 'OWASP Top 10', category: 'Cybersecurity', description: 'Web application vulnerability remediation (SQLi, XSS, CSRF, auth bypass)', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 23 },

  // Soft Skills & Leadership
  { id: 'sk-problem-solving', canonicalName: 'Problem Solving & DSA', category: 'Soft Skills & Leadership', description: 'Data structures, algorithms, asymptotic analysis and competitive programming', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 22 },
  { id: 'sk-agile', canonicalName: 'Agile & Scrum', category: 'Soft Skills & Leadership', description: 'Sprint planning, backlog grooming, standups, retrospectives and Jira', marketDemandLevel: 'MEDIUM', averageSalaryBumpPct: 12 },
  { id: 'sk-comm', canonicalName: 'Technical Communication', category: 'Soft Skills & Leadership', description: 'Cross-functional engineering communication, design docs and stakeholder presentations', marketDemandLevel: 'HIGH', averageSalaryBumpPct: 16 }
];

export const SKILL_ALIASES: SkillAlias[] = [
  // React
  { skillId: 'sk-react', alias: 'react' },
  { skillId: 'sk-react', alias: 'reactjs' },
  { skillId: 'sk-react', alias: 'react.js' },
  { skillId: 'sk-react', alias: 'react js' },
  { skillId: 'sk-react', alias: 'react native' },

  // AWS
  { skillId: 'sk-aws', alias: 'aws' },
  { skillId: 'sk-aws', alias: 'aws cloud' },
  { skillId: 'sk-aws', alias: 'amazon web services' },
  { skillId: 'sk-aws', alias: 'ec2' },
  { skillId: 'sk-aws', alias: 's3' },
  { skillId: 'sk-aws', alias: 'aws lambda' },

  // Kubernetes
  { skillId: 'sk-k8s', alias: 'kubernetes' },
  { skillId: 'sk-k8s', alias: 'k8s' },
  { skillId: 'sk-k8s', alias: 'kube' },

  // Docker
  { skillId: 'sk-docker', alias: 'docker' },
  { skillId: 'sk-docker', alias: 'docker compose' },
  { skillId: 'sk-docker', alias: 'containerization' },

  // Linux
  { skillId: 'sk-linux', alias: 'linux' },
  { skillId: 'sk-linux', alias: 'bash' },
  { skillId: 'sk-linux', alias: 'shell scripting' },
  { skillId: 'sk-linux', alias: 'ubuntu' },
  { skillId: 'sk-linux', alias: 'unix' },

  // Git
  { skillId: 'sk-git', alias: 'git' },
  { skillId: 'sk-git', alias: 'github' },
  { skillId: 'sk-git', alias: 'version control' },
  { skillId: 'sk-git', alias: 'gitlab' },

  // Python
  { skillId: 'sk-python', alias: 'python' },
  { skillId: 'sk-python', alias: 'python3' },
  { skillId: 'sk-python', alias: 'py' },

  // GenAI
  { skillId: 'sk-genai', alias: 'generative ai' },
  { skillId: 'sk-genai', alias: 'genai' },
  { skillId: 'sk-genai', alias: 'gen ai' },
  { skillId: 'sk-genai', alias: 'llms' },
  { skillId: 'sk-genai', alias: 'llm' },
  { skillId: 'sk-genai', alias: 'large language models' },
  { skillId: 'sk-genai', alias: 'rag' },
  { skillId: 'sk-genai', alias: 'prompt engineering' },
  { skillId: 'sk-genai', alias: 'gemini' },

  // Machine Learning
  { skillId: 'sk-ml', alias: 'machine learning' },
  { skillId: 'sk-ml', alias: 'ml' },
  { skillId: 'sk-ml', alias: 'scikit-learn' },
  { skillId: 'sk-ml', alias: 'sklearn' },

  // PyTorch
  { skillId: 'sk-pytorch', alias: 'pytorch' },
  { skillId: 'sk-pytorch', alias: 'torch' },
  { skillId: 'sk-pytorch', alias: 'deep learning' },
  { skillId: 'sk-pytorch', alias: 'tensorflow' },

  // PostgreSQL
  { skillId: 'sk-postgresql', alias: 'postgresql' },
  { skillId: 'sk-postgresql', alias: 'postgres' },
  { skillId: 'sk-postgresql', alias: 'psql' },
  { skillId: 'sk-postgresql', alias: 'pg' },

  // TypeScript
  { skillId: 'sk-typescript', alias: 'typescript' },
  { skillId: 'sk-typescript', alias: 'ts' },

  // JavaScript
  { skillId: 'sk-javascript', alias: 'javascript' },
  { skillId: 'sk-javascript', alias: 'js' },
  { skillId: 'sk-javascript', alias: 'es6' },

  // Node.js
  { skillId: 'sk-nodejs', alias: 'nodejs' },
  { skillId: 'sk-nodejs', alias: 'node.js' },
  { skillId: 'sk-nodejs', alias: 'node' },
  { skillId: 'sk-nodejs', alias: 'express' },
  { skillId: 'sk-nodejs', alias: 'express.js' },

  // FastAPI
  { skillId: 'sk-fastapi', alias: 'fastapi' },
  { skillId: 'sk-fastapi', alias: 'fast api' },

  // Terraform
  { skillId: 'sk-terraform', alias: 'terraform' },
  { skillId: 'sk-terraform', alias: 'iac' },
  { skillId: 'sk-terraform', alias: 'infrastructure as code' },

  // CI/CD
  { skillId: 'sk-ci-cd', alias: 'ci/cd' },
  { skillId: 'sk-ci-cd', alias: 'cicd' },
  { skillId: 'sk-ci-cd', alias: 'continuous integration' },
  { skillId: 'sk-ci-cd', alias: 'github actions' },
  { skillId: 'sk-ci-cd', alias: 'jenkins' },

  // Tailwind
  { skillId: 'sk-tailwind', alias: 'tailwind' },
  { skillId: 'sk-tailwind', alias: 'tailwindcss' },
  { skillId: 'sk-tailwind', alias: 'tailwind css' },

  // SQL
  { skillId: 'sk-sql', alias: 'sql' },
  { skillId: 'sk-sql', alias: 'mysql' },
  { skillId: 'sk-sql', alias: 'rdbms' },

  // Data Engineering
  { skillId: 'sk-data-eng', alias: 'data engineering' },
  { skillId: 'sk-data-eng', alias: 'spark' },
  { skillId: 'sk-data-eng', alias: 'apache spark' },
  { skillId: 'sk-data-eng', alias: 'kafka' },
  { skillId: 'sk-data-eng', alias: 'etl' },

  // Cybersecurity
  { skillId: 'sk-cybersec', alias: 'cybersecurity' },
  { skillId: 'sk-cybersec', alias: 'cyber security' },
  { skillId: 'sk-cybersec', alias: 'infosec' },
  { skillId: 'sk-cybersec', alias: 'ethical hacking' }
];

export function normalizeSkillText(rawSkill: string): Skill | null {
  if (!rawSkill || typeof rawSkill !== 'string') return null;
  const clean = rawSkill.trim().toLowerCase();

  // 1. Direct match on canonical name
  const direct = CANONICAL_SKILLS.find(
    s => s.canonicalName.toLowerCase() === clean
  );
  if (direct) return direct;

  // 2. Match on alias
  const aliasMatch = SKILL_ALIASES.find(
    a => a.alias.toLowerCase() === clean
  );
  if (aliasMatch) {
    return CANONICAL_SKILLS.find(s => s.id === aliasMatch.skillId) || null;
  }

  // 3. Substring / Token matching for punctuation variants like "react-js" or "react/js"
  const sanitized = clean.replace(/[^a-z0-9]/g, '');
  const fuzzyAlias = SKILL_ALIASES.find(a => {
    const aliasSanitized = a.alias.replace(/[^a-z0-9]/g, '');
    return aliasSanitized === sanitized;
  });
  if (fuzzyAlias) {
    return CANONICAL_SKILLS.find(s => s.id === fuzzyAlias.skillId) || null;
  }

  return null;
}
