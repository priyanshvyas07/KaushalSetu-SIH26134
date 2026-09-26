import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StatusBadge, StatusVariant } from '../common/StatusBadge';

export interface SkillInsightItem {
  id: string;
  name: string;
  category: string;
  type: 'CRITICAL_GAP' | 'ALIGNED' | 'OVERSUPPLY';
  demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  openingsCount: number;
  curriculumStatus: string;
  hoursDedicated?: number;
  semesterTaught?: number;
  whyClassified: string;
  recommendedAction: string;
  sampleEmployers: string[];
}

const DEFAULT_SKILL_INSIGHTS: SkillInsightItem[] = [
  // 1. CRITICAL SKILL GAPS
  {
    id: 'sk-docker',
    name: 'Docker & Containerization',
    category: 'Cloud & DevOps',
    type: 'CRITICAL_GAP',
    demandLevel: 'HIGH',
    openingsCount: 39900,
    curriculumStatus: 'Absent from Core Syllabus',
    whyClassified: 'High hiring volume across Razorpay, Swiggy, and Persistent; mandatory for cloud deployment but zero hands-on lab hours exist in current scheme.',
    recommendedAction: 'Add 36-hour practical containerization lab in Semester 5 (Multi-stage Docker builds & Compose).',
    sampleEmployers: ['Razorpay', 'Swiggy', 'Persistent Systems', 'CRED'],
  },
  {
    id: 'sk-aws',
    name: 'AWS Cloud Architecture',
    category: 'Cloud & DevOps',
    type: 'CRITICAL_GAP',
    demandLevel: 'HIGH',
    openingsCount: 45400,
    curriculumStatus: 'Theoretical Overview Only (Elective)',
    whyClassified: 'Cloud Systems Engineer positions offer a 24% median salary premium (₹14 LPA avg); college course currently covers only legacy theoretical slides.',
    recommendedAction: 'Transition theoretical elective to live AWS console labs (EC2, S3, IAM, VPC, and Lambda).',
    sampleEmployers: ['Persistent Systems', 'Tata Elxsi', 'Amazon', 'Infosys'],
  },
  {
    id: 'sk-k8s',
    name: 'Kubernetes Cluster Orchestration',
    category: 'Cloud & DevOps',
    type: 'CRITICAL_GAP',
    demandLevel: 'HIGH',
    openingsCount: 22800,
    curriculumStatus: 'Absent from Core Syllabus',
    whyClassified: '92% of enterprise hiring managers evaluate Kubernetes microservices deployment; absent from university coursework.',
    recommendedAction: 'Introduce Pods, Deployments, and Helm charts module in Semester 6 Distributed Systems.',
    sampleEmployers: ['Razorpay', 'CRED', 'Flipkart', 'Zomato'],
  },
  {
    id: 'sk-terraform',
    name: 'Terraform (Infrastructure as Code)',
    category: 'Cloud & DevOps',
    type: 'CRITICAL_GAP',
    demandLevel: 'HIGH',
    openingsCount: 16200,
    curriculumStatus: 'Absent from Core Syllabus',
    whyClassified: 'Infrastructure as Code is standard practice for modern platform engineers; students currently lack automated provisioning skills.',
    recommendedAction: 'Integrate 8 hours of Terraform HCL scripting into modern DevOps curriculum.',
    sampleEmployers: ['Razorpay', 'Thoughtworks', 'Persistent Systems'],
  },

  // 2. ALIGNED SKILLS
  {
    id: 'sk-linux',
    name: 'Linux & Shell Scripting',
    category: 'Cloud & DevOps',
    type: 'ALIGNED',
    demandLevel: 'HIGH',
    openingsCount: 52000,
    curriculumStatus: 'Covered · Practical Labs (Sem 5)',
    hoursDedicated: 48,
    semesterTaught: 5,
    whyClassified: '48 lab practical hours covering Bash pipes, process hierarchies, and permissions match corporate hiring criteria exceptionally well.',
    recommendedAction: 'Maintain current syllabus depth; optionally introduce container namespaces demonstration.',
    sampleEmployers: ['All Major Tech Employers'],
  },
  {
    id: 'sk-python',
    name: 'Python Programming',
    category: 'AI & Data Science',
    type: 'ALIGNED',
    demandLevel: 'HIGH',
    openingsCount: 68500,
    curriculumStatus: 'Covered · Practical Labs (Sem 4)',
    hoursDedicated: 40,
    semesterTaught: 4,
    whyClassified: 'Coursework incorporates OOP, file I/O, and data processing with high syllabus rigor meeting campus placement criteria.',
    recommendedAction: 'Continue existing coursework; recommend FastAPI asynchronous framework for web tracks.',
    sampleEmployers: ['Swiggy', 'Tata Elxsi', 'Persistent', 'CRED'],
  },
  {
    id: 'sk-sql',
    name: 'SQL & Relational DBMS',
    category: 'AI & Data Science',
    type: 'ALIGNED',
    demandLevel: 'HIGH',
    openingsCount: 58000,
    curriculumStatus: 'Covered · Practical Labs (Sem 5)',
    hoursDedicated: 45,
    semesterTaught: 5,
    whyClassified: 'Relational algebra, normalization (1NF-BCNF), and indexing are thoroughly covered with weekly MySQL/PostgreSQL query labs.',
    recommendedAction: 'Retain current lab curriculum; introduce EXPLAIN ANALYZE performance tuning exercise.',
    sampleEmployers: ['Razorpay', 'Swiggy', 'Persistent', 'CRED'],
  },
  {
    id: 'sk-problem-solving',
    name: 'Data Structures & Algorithms (DSA)',
    category: 'Core Computer Engineering',
    type: 'ALIGNED',
    demandLevel: 'HIGH',
    openingsCount: 75000,
    curriculumStatus: 'Covered · Rigorous Labs (Sem 3)',
    hoursDedicated: 60,
    semesterTaught: 3,
    whyClassified: '60 hours of trees, graphs, dynamic programming, and asymptotic complexity align with online coding evaluation benchmarks.',
    recommendedAction: 'Sustain strong algorithmic foundations; encourage participation in national hackathons.',
    sampleEmployers: ['All Campus Recruiters'],
  },

  // 3. OVERSUPPLY RISKS
  {
    id: 'sk-desktop-java',
    name: 'Desktop Java / Swing GUI',
    category: 'Legacy Software',
    type: 'OVERSUPPLY',
    demandLevel: 'LOW',
    openingsCount: 3100,
    curriculumStatus: 'Over-allocated (32 Dedicated Hours)',
    hoursDedicated: 32,
    semesterTaught: 4,
    whyClassified: 'Under 3% of enterprise software roles recruit for desktop Swing apps; industry has migrated entirely to Web and Cloud architectures.',
    recommendedAction: 'Deprecate Swing modules; reallocate 24 lab hours toward React or modern Web APIs.',
    sampleEmployers: ['Legacy Maintenance Vendors'],
  },
  {
    id: 'sk-8086',
    name: '8086 Microprocessor Assembly',
    category: 'Legacy Hardware',
    type: 'OVERSUPPLY',
    demandLevel: 'LOW',
    openingsCount: 1800,
    curriculumStatus: 'Over-allocated (28 Dedicated Hours)',
    hoursDedicated: 28,
    semesterTaught: 4,
    whyClassified: 'Less than 2% of campus recruitment drives evaluate 16-bit 8086 assembly; creates curricular bloat without employability advantage.',
    recommendedAction: 'Condense assembly to 8 conceptual hours; repurpose remaining 20 hours to distributed microservices.',
    sampleEmployers: ['Niche Embedded Only'],
  },
];

export interface SkillIntelligenceSectionProps {
  items?: SkillInsightItem[];
}

export const SkillIntelligenceSection: React.FC<SkillIntelligenceSectionProps> = ({ items }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL_GAP' | 'ALIGNED' | 'OVERSUPPLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const displayItems = items && items.length > 0 ? items : DEFAULT_SKILL_INSIGHTS;

  const counts = useMemo(() => {
    return {
      all: displayItems.length,
      critical: displayItems.filter(s => s.type === 'CRITICAL_GAP').length,
      aligned: displayItems.filter(s => s.type === 'ALIGNED').length,
      oversupply: displayItems.filter(s => s.type === 'OVERSUPPLY').length,
    };
  }, [displayItems]);

  const filteredSkills = useMemo(() => {
    return displayItems.filter(item => {
      const matchesTab = activeTab === 'ALL' || item.type === activeTab;
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whyClassified.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [displayItems, activeTab, searchQuery]);

  const renderBadgeForType = (type: SkillInsightItem['type']) => {
    switch (type) {
      case 'CRITICAL_GAP':
        return <StatusBadge label="Critical Skill Deficit" variant="critical" />;
      case 'ALIGNED':
        return <StatusBadge label="Well Aligned" variant="success" />;
      case 'OVERSUPPLY':
        return <StatusBadge label="Oversupply Risk" variant="warning" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Skill Intelligence &amp; Labour Market Fit
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              10 Competencies Evaluated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Triangulating industry hiring demand against institutional credit hours and lab depth
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search skill or domain..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* Analytical Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Categories ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CRITICAL_GAP')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'CRITICAL_GAP'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>Critical Skill Gaps ({counts.critical})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ALIGNED')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'ALIGNED'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Aligned Skills ({counts.aligned})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OVERSUPPLY')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'OVERSUPPLY'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>Oversupply Risks ({counts.oversupply})</span>
        </button>
      </div>

      {/* Skill Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map(item => (
          <div
            key={item.id}
            className={`p-5 rounded-xl border transition-all space-y-3 ${
              item.type === 'CRITICAL_GAP'
                ? 'bg-white border-rose-200/90 shadow-[0_1px_2px_rgba(244,63,94,0.03)]'
                : item.type === 'ALIGNED'
                ? 'bg-white border-emerald-200/90 shadow-[0_1px_2px_rgba(16,185,129,0.03)]'
                : 'bg-white border-amber-200/90 shadow-[0_1px_2px_rgba(245,158,11,0.03)]'
            }`}
          >
            {/* Top row: Name & Classification Badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">
                  {item.name}
                </h3>
              </div>
              {renderBadgeForType(item.type)}
            </div>

            {/* Metrics summary row */}
            <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50/80 rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase block">Industry Demand</span>
                <p className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.demandLevel === 'HIGH' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                  <span>{item.demandLevel} · {item.openingsCount.toLocaleString()} Openings</span>
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase block">Curriculum Status</span>
                <p className={`font-semibold mt-0.5 truncate ${
                  item.type === 'CRITICAL_GAP' ? 'text-rose-700' : item.type === 'ALIGNED' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {item.curriculumStatus}
                </p>
              </div>
            </div>

            {/* Why Classified Section */}
            <div className="space-y-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1">
                <span>Classification Rationale:</span>
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {item.whyClassified}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-xs">
              <span className="font-semibold text-slate-900 shrink-0 text-[11px]">
                Action:
              </span>
              <p className="text-slate-700 font-medium text-[11px]">
                {item.recommendedAction}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
          No skills match the current search query or filter.
        </div>
      )}
    </div>
  );
};
