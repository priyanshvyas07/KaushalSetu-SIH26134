import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ActionDetailModal, ActionDetailData } from './ActionDetailModal';

const RECOMMENDATIONS: ActionDetailData[] = [
  {
    title: 'Add Practical Docker & Kubernetes Containerization Modules',
    category: 'Practical Lab Addition',
    priority: 'CRITICAL',
    alignmentImpact: '+18.2% Projected Alignment Gain',
    problem: 'Docker and Kubernetes are absent from university coursework, creating severe hiring drop-off in campus placement drives.',
    evidence: 'Over 45,000 open DevOps & backend roles in Bengaluru & Pune cite containerization as a non-negotiable threshold. 92% of surveyed tech recruiters test Dockerfile construction.',
    suggestedAction: 'Introduce a 36-hour hands-on lab module in Semester 5 covering multi-stage builds, Docker Compose networks, and Kubernetes pod deployments.',
    targetSemester: 'Semester 5 (Integrated with OS & Networks)',
    hoursNeeded: '36 Hours (12 Theory + 24 Practical Labs)',
    requiredResources: 'Linux Lab with Docker Desktop or Podman installed',
    proposedSyllabus: `MODULE: Cloud-Native Infrastructure & Containerization (36 Hours)
- Unit 1: Container Core Principles (8 hrs)
  Linux cgroups, namespaces, copy-on-write storage drivers. Docker CLI & daemon architecture.
- Unit 2: Production Containerization (10 hrs)
  Multi-stage Dockerfiles, minimal Alpine/Distroless bases, caching optimization, Compose orchestration.
- Unit 3: Kubernetes Foundations (12 hrs)
  Control plane vs worker nodes, Pod lifecycle, ReplicaSets, Deployments, ClusterIP & NodePort Services.
- Unit 4: Practical Capstone (6 hrs)
  Deploy multi-tier web application (React + Node.js + PostgreSQL) with health probes and ConfigMaps.`,
  },
  {
    title: 'Transition Theoretical Cloud to Live AWS Infrastructure as Code (Terraform)',
    category: 'Curriculum Modernization',
    priority: 'HIGH',
    alignmentImpact: '+12.5% Projected Alignment Gain',
    problem: 'Current cloud elective relies on legacy OpenStack theoretical slides with zero hands-on public cloud experience.',
    evidence: 'Cloud Systems Engineer positions offer a 24% median salary premium (₹14 LPA avg vs ₹9.5 LPA generic fresher). Recruiter feedback from Persistent Systems emphasizes lack of cloud credentials.',
    suggestedAction: 'Modernize the syllabus to focus on live AWS console architecture (IAM, EC2, S3, VPC) managed through declarative Terraform HCL scripts.',
    targetSemester: 'Semester 6 (Core Elective)',
    hoursNeeded: '42 Hours (18 Theory + 24 Cloud Labs)',
    requiredResources: 'AWS Academy free educator tier / Cloud Sandbox',
    proposedSyllabus: `MODULE: Cloud Infrastructure & Declarative IaC (42 Hours)
- Unit 1: AWS Core Foundations & IAM (10 hrs)
  Shared responsibility model, IAM policies, roles, instance profiles, VPC subnets and security groups.
- Unit 2: Serverless & Storage Architecture (10 hrs)
  Amazon S3 lifecycle rules, AWS Lambda event handlers, API Gateway integration.
- Unit 3: Infrastructure as Code with Terraform (12 hrs)
  HCL syntax, provider configuration, state file locking via S3/DynamoDB, modular architecture.
- Unit 4: Live Cloud Audit (10 hrs)
  Automated provisioning of high-availability 2-tier architecture with Terraform apply and destroy hooks.`,
  },
  {
    title: 'Reduce Excessive Low-Demand Module Hours (Legacy 8086 Assembly & Desktop GUI)',
    category: 'Credit Optimization',
    priority: 'MEDIUM',
    alignmentImpact: 'Reclaims 24 Credit Hours',
    problem: 'University allocates 28 hours to 16-bit 8086 assembly and 32 hours to Java Swing desktop interfaces, causing syllabus overload while missing modern technologies.',
    evidence: 'Less than 2% of annual campus corporate hiring drives evaluate 8086 assembly or desktop GUI tools. Razorpay and Swiggy evaluate REST APIs, microservices, and containerization.',
    suggestedAction: 'Condense 8086 assembly to 8 conceptual hours; deprecate Java Swing in favor of modern Web REST APIs and React component architecture.',
    targetSemester: 'Semester 4 & Semester 5 Adjustments',
    hoursNeeded: 'Reduce from 60h total to 16h total',
    requiredResources: 'Curriculum Council BoS Scheme Revision',
    proposedSyllabus: `SYLLABUS REALLOCATION NOTICE:
1. Microprocessor Course: Retain 8 hours covering CPU registers, memory segments, and interrupt vectors; eliminate 20 hours of legacy DOS interrupt lab drills.
2. OOP Course: Replace Java Swing GUI applets with RESTful API architecture using Spring Boot or FastAPI.
3. Reallocated Credits: Direct 24 newly freed contact hours into the Cloud-Native Infrastructure Lab.`,
  },
  {
    title: 'Introduce Automated CI/CD Capstone Project with GitHub Actions',
    category: 'Industry-Oriented Project',
    priority: 'HIGH',
    alignmentImpact: '+6.8% Projected Alignment Gain',
    problem: 'Students complete academic projects without continuous integration, automated testing, or deployment automation, leading to a 76% fresher probation PR failure rate.',
    evidence: 'Employer survey submissions from Razorpay, Swiggy, and CRED reveal that freshers lack pull request etiquette, automated test running, and git branch protection knowledge.',
    suggestedAction: 'Mandate that all 6th-semester term capstone projects integrate a GitHub Actions CI pipeline running linting, unit tests, and automated build verification.',
    targetSemester: 'Semester 6 Project Work',
    hoursNeeded: '16 Hours Project Mentorship',
    requiredResources: 'GitHub Education Campus Program (Unlimited Actions runners)',
    proposedSyllabus: `CAPSTONE EVALUATION RUBRIC REQUIREMENT:
- Every student repo must include .github/workflows/ci.yml:
  1. Trigger on pull_request to main branch
  2. Run automated test runner (pytest / jest)
  3. Execute automated code quality & security scan (SonarCloud / ESLint)
  4. Build and push container image to GitHub Packages with automated semver tagging.`,
  },
];

export interface RecommendedActionsSectionProps {
  actions?: ActionDetailData[];
}

export const RecommendedActionsSection: React.FC<RecommendedActionsSectionProps> = ({ actions }) => {
  const [selectedAction, setSelectedAction] = useState<ActionDetailData | null>(null);
  const displayActions = actions && actions.length > 0 ? actions : RECOMMENDATIONS;

  return (
    <>
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                AI Recommended Actions
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Grounded Interventions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted academic interventions with empirical evidence, syllabus snippets, and credit optimization plans
            </p>
          </div>

          <span className="text-[11px] text-slate-500 font-medium self-start sm:self-auto">
            {displayActions.length} Interventions Available
          </span>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {displayActions.map((rec, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)] transition-all space-y-3.5"
            >
              {/* Category & Priority Badge Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {rec.category}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {rec.alignmentImpact}
                  </span>
                </div>

                <StatusBadge
                  label={
                    rec.priority === 'CRITICAL'
                      ? 'Critical Priority'
                      : rec.priority === 'HIGH'
                      ? 'High Priority'
                      : 'Medium Priority'
                  }
                  variant={
                    rec.priority === 'CRITICAL'
                      ? 'critical'
                      : rec.priority === 'HIGH'
                      ? 'info'
                      : 'neutral'
                  }
                />
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {rec.title}
              </h3>

              {/* Problem & Evidence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
                  <span className="font-semibold text-slate-900 text-[11px] block">
                    Curricular Problem:
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {rec.problem}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
                  <span className="font-semibold text-slate-900 text-[11px] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-indigo-600" />
                    <span>Recruiter Evidence:</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {rec.evidence}
                  </p>
                </div>
              </div>

              {/* Suggested Action & CTA */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 text-[11px]">
                    Suggested Action:
                  </span>
                  <p className="text-slate-700 text-[11px]">
                    {rec.suggestedAction}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAction(rec)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAction && (
        <ActionDetailModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
        />
      )}
    </>
  );
};
