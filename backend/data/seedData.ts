import {
  User,
  StudentProfile,
  Job,
  Course,
  Curriculum,
  StateSkillDemand,
  Assessment,
  EmployerSurveySubmission,
  AIRecommendation
} from '../types/models';

export const SEED_USERS: User[] = [
  {
    id: 'usr-student-1',
    email: 'arjun.sharma@sih.gov.in',
    passwordHash: 'argon_dummy_hash_student',
    role: 'STUDENT',
    name: 'Arjun Sharma',
    organizationName: 'PICT Pune (Computer Engg 2026)',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'usr-institute-1',
    email: 'dean.academic@pict.ac.in',
    passwordHash: 'argon_dummy_hash_institute',
    role: 'INSTITUTE',
    name: 'Prof. Ramesh Kulkarni',
    organizationName: 'Pune Institute of Computer Technology (PICT)',
    createdAt: '2025-11-01T10:30:00Z'
  },
  {
    id: 'usr-employer-1',
    email: 'talent@razorpay.com',
    passwordHash: 'argon_dummy_hash_employer',
    role: 'EMPLOYER',
    name: 'Priya Sundaram',
    organizationName: 'Razorpay Software Pvt Ltd',
    createdAt: '2025-12-10T14:20:00Z'
  },
  {
    id: 'usr-admin-1',
    email: 'director.skill@msde.gov.in',
    passwordHash: 'argon_dummy_hash_admin',
    role: 'ADMIN',
    name: 'Dr. Sunita Deshmukh',
    organizationName: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    createdAt: '2025-08-01T08:00:00Z'
  }
];

export const SEED_STUDENT_PROFILE: StudentProfile = {
  id: 'stu-profile-1',
  userId: 'usr-student-1',
  targetRole: 'DevOps / Cloud Engineer',
  preferredLocation: 'Bengaluru, Karnataka / Pune, Maharashtra',
  experienceLevel: 'Fresher (0-1 yrs)',
  education: 'B.Tech in Computer Engineering (2022-2026), GPA 8.7/10',
  bio: 'Final year undergraduate passionate about cloud infrastructure, Linux systems administration, and automated CI/CD release engineering.',
  profileCompletionPct: 85,
  skills: [
    { skillId: 'sk-linux', proficiency: 'INTERMEDIATE', verified: true, source: 'RESUME' },
    { skillId: 'sk-git', proficiency: 'ADVANCED', verified: true, source: 'ASSESSMENT' },
    { skillId: 'sk-python', proficiency: 'INTERMEDIATE', verified: true, source: 'RESUME' },
    { skillId: 'sk-sql', proficiency: 'INTERMEDIATE', verified: false, source: 'SELF' },
    { skillId: 'sk-problem-solving', proficiency: 'INTERMEDIATE', verified: true, source: 'ASSESSMENT' }
    // Note: Missing AWS, Docker, Kubernetes, Terraform for Target DevOps Role!
  ],
  resumeFileName: 'Arjun_Sharma_DevOps_Resume_2026.pdf',
  resumeText: `Arjun Sharma
Email: arjun.sharma@sih.gov.in | Phone: +91 98230 45678 | GitHub: github.com/arjun-devops
PICT Pune - B.Tech Computer Engineering (2022-2026) | CGPA: 8.7

TECHNICAL SKILLS:
- Languages: Python, Bash Shell Scripting, C++, SQL
- Systems & Tools: Linux (Ubuntu/Debian), Git, GitHub, Vim, Nginx
- Core: Data Structures, Computer Networks, Operating Systems

PROJECTS:
1. Automated Server Health Monitor (Python & Bash)
Built a daemon monitoring memory, disk I/O and CPU thresholds; alerts via Slack Webhooks.
2. High-Throughput URL Shortener (Python, PostgreSQL, Redis)
Designed indexed database schemas and microsecond caching layer.`,
  savedRoadmapProgress: {
    'mod-docker-basics': true,
    'mod-docker-compose': false,
    'mod-aws-core': false,
    'mod-k8s-pods': false
  }
};

export const SEED_JOBS: Job[] = [
  {
    id: 'job-1',
    employerId: 'usr-employer-1',
    employerName: 'Razorpay',
    title: 'Associate DevOps Engineer (Platform Team)',
    roleCategory: 'DevOps / Cloud Engineer',
    locationCity: 'Bengaluru',
    locationState: 'Karnataka',
    experienceMinYears: 0,
    salaryMinLPA: 12,
    salaryMaxLPA: 18,
    description: 'Join our cloud infrastructure team managing high-scale payment gateways processing millions of transactions. You will build resilient Docker images, maintain AWS EKS clusters, and automate Terraform modules.',
    postedAt: '2026-03-01T10:00:00Z',
    dataSource: 'REAL VERIFIED',
    skills: [
      { skillId: 'sk-linux', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-git', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-docker', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-aws', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-k8s', isRequired: false, minProficiency: 'BEGINNER' },
      { skillId: 'sk-terraform', isRequired: false, minProficiency: 'BEGINNER' }
    ]
  },
  {
    id: 'job-2',
    employerId: 'emp-persistent',
    employerName: 'Persistent Systems',
    title: 'Cloud Systems Engineer (AWS/GCP)',
    roleCategory: 'DevOps / Cloud Engineer',
    locationCity: 'Pune',
    locationState: 'Maharashtra',
    experienceMinYears: 1,
    salaryMinLPA: 8.5,
    salaryMaxLPA: 14,
    description: 'Responsible for client cloud migrations, multi-tenant container orchestration, and continuous integration pipelines.',
    postedAt: '2026-03-12T11:30:00Z',
    dataSource: 'SAMPLE BENCHMARK',
    skills: [
      { skillId: 'sk-aws', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-docker', isRequired: true, minProficiency: 'BEGINNER' },
      { skillId: 'sk-linux', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-ci-cd', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-python', isRequired: false, minProficiency: 'INTERMEDIATE' }
    ]
  },
  {
    id: 'job-3',
    employerId: 'emp-swiggy',
    employerName: 'Swiggy Tech',
    title: 'Backend Platform Engineer (Python / Go)',
    roleCategory: 'Backend Developer',
    locationCity: 'Hyderabad',
    locationState: 'Telangana',
    experienceMinYears: 1,
    salaryMinLPA: 14,
    salaryMaxLPA: 22,
    description: 'Scale our order dispatch microservices handling 100k requests/sec. Experience with asynchronous Python, PostgreSQL clustering, and distributed caching.',
    postedAt: '2026-03-18T16:00:00Z',
    dataSource: 'SAMPLE BENCHMARK',
    skills: [
      { skillId: 'sk-python', isRequired: true, minProficiency: 'ADVANCED' },
      { skillId: 'sk-postgresql', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-redis', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-rest-api', isRequired: true, minProficiency: 'ADVANCED' },
      { skillId: 'sk-docker', isRequired: false, minProficiency: 'BEGINNER' }
    ]
  },
  {
    id: 'job-4',
    employerId: 'emp-tata',
    employerName: 'Tata Elxsi',
    title: 'GenAI & Applied ML Specialist',
    roleCategory: 'AI / ML Engineer',
    locationCity: 'Bengaluru',
    locationState: 'Karnataka',
    experienceMinYears: 0,
    salaryMinLPA: 11,
    salaryMaxLPA: 19,
    description: 'Build enterprise retrieval-augmented generation (RAG) agents, LLM tool-calling pipelines, and vector database indices.',
    postedAt: '2026-03-20T08:45:00Z',
    dataSource: 'SAMPLE BENCHMARK',
    skills: [
      { skillId: 'sk-python', isRequired: true, minProficiency: 'ADVANCED' },
      { skillId: 'sk-genai', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-nlp', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-pytorch', isRequired: false, minProficiency: 'BEGINNER' },
      { skillId: 'sk-sql', isRequired: true, minProficiency: 'INTERMEDIATE' }
    ]
  },
  {
    id: 'job-5',
    employerId: 'emp-cred',
    employerName: 'CRED',
    title: 'Frontend Product Engineer (React/TS)',
    roleCategory: 'Frontend Developer',
    locationCity: 'Bengaluru',
    locationState: 'Karnataka',
    experienceMinYears: 1,
    salaryMinLPA: 16,
    salaryMaxLPA: 26,
    description: 'Craft high-polish, 60fps web user interfaces for consumer fintech products with rigorous accessibility and fluid interaction.',
    postedAt: '2026-03-22T14:10:00Z',
    dataSource: 'REAL VERIFIED',
    skills: [
      { skillId: 'sk-react', isRequired: true, minProficiency: 'ADVANCED' },
      { skillId: 'sk-typescript', isRequired: true, minProficiency: 'ADVANCED' },
      { skillId: 'sk-tailwind', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-rest-api', isRequired: true, minProficiency: 'INTERMEDIATE' },
      { skillId: 'sk-git', isRequired: true, minProficiency: 'INTERMEDIATE' }
    ]
  }
];

export const SEED_COURSES: Course[] = [
  {
    id: 'crs-pict-cs',
    instituteId: 'usr-institute-1',
    title: 'B.Tech in Computer Engineering (Autonomous 2024 Scheme)',
    department: 'Computer Engineering',
    degreeLevel: 'Undergraduate',
    durationSemesters: 8,
    enrolledStudents: 320,
    targetIndustryRoles: ['Software Engineer', 'DevOps / Cloud Engineer', 'Data Analyst']
  },
  {
    id: 'crs-pict-it',
    instituteId: 'usr-institute-1',
    title: 'B.Tech in Information Technology',
    department: 'Information Technology',
    degreeLevel: 'Undergraduate',
    durationSemesters: 8,
    enrolledStudents: 180,
    targetIndustryRoles: ['Full-Stack Developer', 'Cybersecurity Analyst']
  }
];

export const SEED_CURRICULA: Curriculum[] = [
  {
    id: 'cur-pict-cs-2026',
    courseId: 'crs-pict-cs',
    academicYear: '2025-2026',
    syllabusRaw: `PUNE INSTITUTE OF COMPUTER TECHNOLOGY
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
- Hypervisors, private clouds, introductory OpenStack concepts`,
    skills: [
      { skillId: 'sk-linux', coverageDepth: 'PRACTICAL', semesterTaught: 5, hoursDedicated: 48 },
      { skillId: 'sk-python', coverageDepth: 'PRACTICAL', semesterTaught: 4, hoursDedicated: 40 },
      { skillId: 'sk-sql', coverageDepth: 'PRACTICAL', semesterTaught: 5, hoursDedicated: 45 },
      { skillId: 'sk-problem-solving', coverageDepth: 'PRACTICAL', semesterTaught: 3, hoursDedicated: 60 },
      { skillId: 'sk-git', coverageDepth: 'CONCEPTUAL', semesterTaught: 5, hoursDedicated: 12 }
      // NOTE: Docker, Kubernetes, AWS, Terraform, CI/CD are completely absent from core university curriculum!
    ],
    alignmentScore: 48.2, // Explainable: 5 out of 11 industry required skills covered
    lastAudited: '2026-02-10T12:00:00Z'
  }
];

export const SEED_STATE_DEMANDS: StateSkillDemand[] = [
  // Karnataka (Bengaluru)
  { state: 'Karnataka', skillId: 'sk-aws', openingsCount: 14200, growthRatePct: 34, demandIndex: 96, supplyIndex: 42, gapRatio: 2.28, dataSource: 'REAL VERIFIED' },
  { state: 'Karnataka', skillId: 'sk-docker', openingsCount: 12800, growthRatePct: 38, demandIndex: 94, supplyIndex: 38, gapRatio: 2.47, dataSource: 'REAL VERIFIED' },
  { state: 'Karnataka', skillId: 'sk-k8s', openingsCount: 9600, growthRatePct: 45, demandIndex: 91, supplyIndex: 26, gapRatio: 3.50, dataSource: 'REAL VERIFIED' },
  { state: 'Karnataka', skillId: 'sk-genai', openingsCount: 11400, growthRatePct: 82, demandIndex: 98, supplyIndex: 22, gapRatio: 4.45, dataSource: 'REAL VERIFIED' },
  { state: 'Karnataka', skillId: 'sk-react', openingsCount: 16500, growthRatePct: 18, demandIndex: 92, supplyIndex: 88, gapRatio: 1.05, dataSource: 'REAL VERIFIED' },

  // Maharashtra (Pune & Mumbai)
  { state: 'Maharashtra', skillId: 'sk-aws', openingsCount: 10400, growthRatePct: 31, demandIndex: 88, supplyIndex: 40, gapRatio: 2.20, dataSource: 'REAL VERIFIED' },
  { state: 'Maharashtra', skillId: 'sk-docker', openingsCount: 8900, growthRatePct: 35, demandIndex: 85, supplyIndex: 35, gapRatio: 2.42, dataSource: 'REAL VERIFIED' },
  { state: 'Maharashtra', skillId: 'sk-k8s', openingsCount: 6700, growthRatePct: 41, demandIndex: 81, supplyIndex: 24, gapRatio: 3.37, dataSource: 'REAL VERIFIED' },
  { state: 'Maharashtra', skillId: 'sk-genai', openingsCount: 7800, growthRatePct: 75, demandIndex: 89, supplyIndex: 19, gapRatio: 4.68, dataSource: 'SAMPLE BENCHMARK' },
  { state: 'Maharashtra', skillId: 'sk-python', openingsCount: 13200, growthRatePct: 24, demandIndex: 89, supplyIndex: 78, gapRatio: 1.14, dataSource: 'SAMPLE BENCHMARK' },

  // Telangana (Hyderabad)
  { state: 'Telangana', skillId: 'sk-aws', openingsCount: 9200, growthRatePct: 33, demandIndex: 86, supplyIndex: 39, gapRatio: 2.20, dataSource: 'REAL VERIFIED' },
  { state: 'Telangana', skillId: 'sk-docker', openingsCount: 7800, growthRatePct: 36, demandIndex: 82, supplyIndex: 34, gapRatio: 2.41, dataSource: 'REAL VERIFIED' },
  { state: 'Telangana', skillId: 'sk-genai', openingsCount: 7100, growthRatePct: 79, demandIndex: 87, supplyIndex: 20, gapRatio: 4.35, dataSource: 'SAMPLE BENCHMARK' },
  { state: 'Telangana', skillId: 'sk-sql', openingsCount: 11200, growthRatePct: 15, demandIndex: 84, supplyIndex: 82, gapRatio: 1.02, dataSource: 'SAMPLE BENCHMARK' },

  // Tamil Nadu (Chennai & Coimbatore)
  { state: 'Tamil Nadu', skillId: 'sk-aws', openingsCount: 7600, growthRatePct: 28, demandIndex: 80, supplyIndex: 36, gapRatio: 2.22, dataSource: 'SAMPLE BENCHMARK' },
  { state: 'Tamil Nadu', skillId: 'sk-docker', openingsCount: 6500, growthRatePct: 32, demandIndex: 77, supplyIndex: 31, gapRatio: 2.48, dataSource: 'SAMPLE BENCHMARK' },
  { state: 'Tamil Nadu', skillId: 'sk-java', openingsCount: 12400, growthRatePct: 14, demandIndex: 88, supplyIndex: 94, gapRatio: 0.93, dataSource: 'SAMPLE BENCHMARK' }, // Slight oversupply of legacy Java

  // Delhi NCR (Delhi, Noida, Gurugram)
  { state: 'Delhi NCR', skillId: 'sk-aws', openingsCount: 9800, growthRatePct: 32, demandIndex: 87, supplyIndex: 44, gapRatio: 1.98, dataSource: 'REAL VERIFIED' },
  { state: 'Delhi NCR', skillId: 'sk-genai', openingsCount: 8400, growthRatePct: 80, demandIndex: 90, supplyIndex: 25, gapRatio: 3.60, dataSource: 'SAMPLE BENCHMARK' },
  { state: 'Delhi NCR', skillId: 'sk-react', openingsCount: 13900, growthRatePct: 19, demandIndex: 89, supplyIndex: 86, gapRatio: 1.03, dataSource: 'SAMPLE BENCHMARK' },

  // Gujarat (Ahmedabad, Gandhinagar)
  { state: 'Gujarat', skillId: 'sk-docker', openingsCount: 3800, growthRatePct: 29, demandIndex: 65, supplyIndex: 22, gapRatio: 2.95, dataSource: 'SAMPLE BENCHMARK' },
  { state: 'Gujarat', skillId: 'sk-cybersec', openingsCount: 3400, growthRatePct: 42, demandIndex: 68, supplyIndex: 18, gapRatio: 3.77, dataSource: 'SAMPLE BENCHMARK' },

  // West Bengal (Kolkata)
  { state: 'West Bengal', skillId: 'sk-aws', openingsCount: 4200, growthRatePct: 26, demandIndex: 68, supplyIndex: 28, gapRatio: 2.42, dataSource: 'SAMPLE BENCHMARK' },
  { state: 'West Bengal', skillId: 'sk-python', openingsCount: 6900, growthRatePct: 21, demandIndex: 74, supplyIndex: 72, gapRatio: 1.03, dataSource: 'SAMPLE BENCHMARK' },

  // Kerala (Kochi, Thiruvananthapuram)
  { state: 'Kerala', skillId: 'sk-react', openingsCount: 4800, growthRatePct: 22, demandIndex: 72, supplyIndex: 68, gapRatio: 1.06, dataSource: 'SAMPLE BENCHMARK' },
  { state: 'Kerala', skillId: 'sk-cybersec', openingsCount: 2900, growthRatePct: 38, demandIndex: 64, supplyIndex: 19, gapRatio: 3.36, dataSource: 'SAMPLE BENCHMARK' }
];

export const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: 'asmt-docker',
    skillId: 'sk-docker',
    skillName: 'Docker',
    title: 'Docker Containerization & Multi-Stage Builds',
    durationMinutes: 10,
    questions: [
      {
        id: 'q1',
        question: 'Which Dockerfile instruction creates an intermediate layer used for executing build commands?',
        options: ['RUN', 'CMD', 'ENTRYPOINT', 'COPY'],
        correctOptionIndex: 0,
        explanation: 'RUN executes commands during the build phase and commits the results to a new image layer.'
      },
      {
        id: 'q2',
        question: 'What is the primary architectural advantage of a multi-stage Docker build?',
        options: [
          'Decreases CPU usage during runtime',
          'Minimizes final production image size by discarding build tools and intermediate artifacts',
          'Enables automatic Kubernetes horizontal autoscaling',
          'Encrypts secrets directly in image layer digests'
        ],
        correctOptionIndex: 1,
        explanation: 'Multi-stage builds allow compiling in a fat builder container and copying only compiled artifacts into a lightweight scratch/alpine runtime image.'
      },
      {
        id: 'q3',
        question: 'In Docker Compose, what mechanism ensures service B waits for service A to pass health checks before starting?',
        options: ['links', 'depends_on with condition: service_healthy', 'restart: always', 'expose: ports'],
        correctOptionIndex: 1,
        explanation: 'depends_on with condition: service_healthy prevents race conditions during database initialization.'
      }
    ]
  },
  {
    id: 'asmt-aws',
    skillId: 'sk-aws',
    skillName: 'AWS',
    title: 'AWS Cloud Fundamentals & IAM Security',
    durationMinutes: 10,
    questions: [
      {
        id: 'q1',
        question: 'Which AWS service is best suited for managing temporary security credentials for EC2 applications without hardcoding API keys?',
        options: ['AWS IAM Roles with Instance Profiles', 'Root User Access Keys', 'AWS Secrets Manager in plaintext', 'AWS Cognito User Pools'],
        correctOptionIndex: 0,
        explanation: 'IAM Roles attached via Instance Profiles supply short-lived STS credentials automatically rotated by the instance metadata service.'
      },
      {
        id: 'q2',
        question: 'Which AWS VPC component routes outbound traffic from private subnets to the public internet while blocking incoming connections?',
        options: ['Internet Gateway (IGW)', 'NAT Gateway', 'Transit Gateway', 'VPC Peering Connection'],
        correctOptionIndex: 1,
        explanation: 'A NAT Gateway enables outbound internet access for private subnets while preventing unsolicited inbound traffic.'
      }
    ]
  },
  {
    id: 'asmt-git',
    skillId: 'sk-git',
    skillName: 'Git',
    title: 'Git Version Control & Branching Workflows',
    durationMinutes: 8,
    questions: [
      {
        id: 'q1',
        question: 'What is the difference between git fetch and git pull?',
        options: [
          'git pull only downloads tags, git fetch downloads commits',
          'git fetch downloads remote metadata without modifying your working branch; git pull fetches and merges',
          'git fetch pushes local commits; git pull downloads remote commits',
          'They are identical aliases'
        ],
        correctOptionIndex: 1,
        explanation: 'git fetch updates remote tracking branches without altering the working tree; git pull runs fetch followed by merge.'
      }
    ]
  }
];

export const SEED_EMPLOYER_SURVEYS: EmployerSurveySubmission[] = [
  {
    id: 'es-1',
    employerId: 'usr-employer-1',
    employerName: 'Razorpay',
    industry: 'Fintech / Payments',
    hardToHireSkills: ['Kubernetes', 'Terraform', 'Observability (Prometheus/Grafana)', 'Go'],
    emergingSkills: ['Generative AI Agents', 'eBPF Kernel Monitoring', 'Multi-Cloud FinOps'],
    fresherGaps: ['Engineering graduates understand theoretical OS concepts but cannot write a multi-stage Dockerfile or configure a reverse proxy.'],
    recommendedCertifications: ['AWS Solutions Architect Associate (SAA-C03)', 'Certified Kubernetes Administrator (CKA)'],
    additionalRemarks: 'We strongly urge institutes to make lab projects deployable on live cloud accounts rather than local XAMPP servers.',
    submittedAt: '2026-03-15T11:20:00Z'
  },
  {
    id: 'es-2',
    employerId: 'emp-tata',
    employerName: 'Tata Elxsi',
    industry: 'Automotive & Enterprise Software',
    hardToHireSkills: ['PyTorch', 'Vector Databases', 'Embedded Linux'],
    emergingSkills: ['Local LLM Inference Optimization', 'Model Quantization (GGML/GGUF)'],
    fresherGaps: ['Students rely heavily on generic high-level tutorials without understanding memory profiling or vector arithmetic.'],
    recommendedCertifications: ['NVIDIA Deep Learning Institute Certificate', 'TensorFlow Developer'],
    additionalRemarks: 'Industry-academia co-curricula design is vital for 2026.',
    submittedAt: '2026-03-21T09:45:00Z'
  }
];

export const SEED_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec-govt-1',
    targetRoleType: 'GOVT',
    title: 'Urgent Cloud & DevOps Capacity Expansion in Maharashtra & Karnataka',
    actionSummary: 'State technical universities currently produce only 35% of the annual industry demand for containerization (Docker/K8s) and AWS engineers. Mandate cloud credits and container labs in AICTE Model Curriculum 2026.',
    evidenceData: {
      gapRatio: 2.47,
      totalUnmetOpenings: 32600,
      annualGraduatesLackingSkill: 84000,
      impactedStates: ['Maharashtra', 'Karnataka', 'Telangana']
    },
    priority: 'CRITICAL',
    confidenceScore: 0.94,
    dataSourceLabel: 'OBSERVED MARKET DATA'
  },
  {
    id: 'rec-inst-1',
    targetRoleType: 'INSTITUTE',
    title: 'Incorporate Docker & AWS Lab Practicals in 6th Semester Curriculum',
    actionSummary: 'Your current Computer Engineering curriculum alignment score is 48.2%. Adding containerization hands-on modules in Operating Systems Lab will elevate institutional placement readiness by 36%.',
    evidenceData: {
      currentAlignment: 48.2,
      potentialAlignment: 84.5,
      missingDemandedSkills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD Pipelines']
    },
    priority: 'HIGH',
    confidenceScore: 0.91,
    dataSourceLabel: 'OBSERVED MARKET DATA'
  },
  {
    id: 'rec-stu-1',
    targetRoleType: 'STUDENT',
    title: 'Targeted Gap Closure: Docker & AWS Foundations for Razorpay Placement',
    actionSummary: 'You have a 50% deterministic match for the Razorpay Associate DevOps Engineer role. Completing containerization projects and the AWS fundamental assessment will boost your candidate percentile to Top 8%.',
    evidenceData: {
      currentMatchScore: 50.0,
      matchedSkills: ['Linux', 'Git'],
      missingRequiredSkills: ['Docker', 'AWS'],
      averageSalaryAdvantage: '+ ₹4.5 LPA'
    },
    priority: 'CRITICAL',
    confidenceScore: 0.96,
    dataSourceLabel: 'OBSERVED MARKET DATA'
  }
];
