import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Layers, BarChart3, TrendingUp, Info } from 'lucide-react';
import { DataSourceBadge } from '../common/DataSourceBadge';

interface ChartDataPoint {
  skill: string;
  demandIndex: number;
  coverageIndex: number;
  type: 'GAP' | 'ALIGNED' | 'OVERSUPPLY';
}

const COMPARISON_CHART_DATA: ChartDataPoint[] = [
  { skill: 'DSA / Algorithms', demandIndex: 95, coverageIndex: 92, type: 'ALIGNED' },
  { skill: 'Linux / OS', demandIndex: 89, coverageIndex: 94, type: 'ALIGNED' },
  { skill: 'Python', demandIndex: 89, coverageIndex: 88, type: 'ALIGNED' },
  { skill: 'SQL & DBMS', demandIndex: 84, coverageIndex: 85, type: 'ALIGNED' },
  { skill: 'Docker', demandIndex: 94, coverageIndex: 12, type: 'GAP' },
  { skill: 'AWS Cloud', demandIndex: 96, coverageIndex: 20, type: 'GAP' },
  { skill: 'Kubernetes', demandIndex: 91, coverageIndex: 5, type: 'GAP' },
  { skill: 'Terraform IaC', demandIndex: 82, coverageIndex: 0, type: 'GAP' },
  { skill: '8086 Assembly', demandIndex: 14, coverageIndex: 78, type: 'OVERSUPPLY' },
  { skill: 'Desktop Java', demandIndex: 20, coverageIndex: 72, type: 'OVERSUPPLY' },
];

const DOMAIN_ALIGNMENT_DATA = [
  { domain: 'Core Systems & OS', score: 92, status: 'Aligned' },
  { domain: 'Data Structures & Algo', score: 95, status: 'Aligned' },
  { domain: 'Databases & SQL', score: 85, status: 'Aligned' },
  { domain: 'Distributed Systems', score: 32, status: 'Moderate Gap' },
  { domain: 'Cloud Architecture', score: 18, status: 'Critical Gap' },
  { domain: 'DevOps & Containers', score: 12, status: 'Critical Gap' },
];

export const CurriculumChartSection: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'SKILLS' | 'DOMAINS'>('SKILLS');

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Labour Market vs. Curricular Coverage Analytics
            </h2>
            <DataSourceBadge source="SIH26134 Industry Benchmark Index" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative analysis of employer demand index versus current credit hours and lab depth
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveChart('SKILLS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeChart === 'SKILLS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skill Comparison
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('DOMAINS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeChart === 'DOMAINS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Domain Breakdown
          </button>
        </div>
      </div>

      {/* Chart 1: Skill Comparison */}
      {activeChart === 'SKILLS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <p>
              Compares <span className="font-semibold text-slate-800">Industry Demand Index (0-100)</span> with <span className="font-semibold text-slate-800">Curriculum Depth Index (0-100)</span>.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-900" />
                <span className="text-[11px] font-medium text-slate-700">Industry Demand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500" />
                <span className="text-[11px] font-medium text-slate-700">Curriculum Coverage</span>
              </div>
            </div>
          </div>

          <div className="w-full h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={COMPARISON_CHART_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <XAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}
                  formatter={(value: any, name: any) => [
                    `${value}/100`,
                    name === 'demandIndex' ? 'Industry Demand' : 'Curriculum Depth',
                  ]}
                />
                <Bar
                  dataKey="demandIndex"
                  fill="#0f172a"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="coverageIndex"
                  fill="#6366f1"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Analytical Footnote */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900">Visual Diagnosis:</strong> Notice the stark deficit in <span className="font-semibold text-rose-700">Docker (94 vs 12)</span> and <span className="font-semibold text-rose-700">AWS (96 vs 20)</span>, contrasted with the inverse oversupply in <span className="font-semibold text-amber-700">8086 Assembly (14 demand vs 78 curriculum)</span>.
            </p>
          </div>
        </div>
      )}

      {/* Chart 2: Domain Breakdown */}
      {activeChart === 'DOMAINS' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Aggregate alignment percentage per computer engineering department discipline
          </p>

          <div className="space-y-3 pt-2">
            {DOMAIN_ALIGNMENT_DATA.map((domain, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{domain.domain}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[11px] font-bold ${
                      domain.score >= 70 ? 'text-emerald-700' : domain.score >= 40 ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {domain.score}%
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      domain.score >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : domain.score >= 40 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {domain.status}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      domain.score >= 70 ? 'bg-emerald-600' : domain.score >= 40 ? 'bg-amber-500' : 'bg-rose-600'
                    }`}
                    style={{ width: `${domain.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Academic tracks in foundational algorithms (95%) and core OS (92%) meet international ABET &amp; NBA accreditation standards. Interventions are strictly required in Cloud Architecture (18%) and DevOps (12%).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
