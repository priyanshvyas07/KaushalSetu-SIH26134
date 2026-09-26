import React, { useState } from 'react';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Target,
  Briefcase,
  GitFork,
  CheckCircle2,
  Bot,
  Layers,
  BarChart3,
  Lightbulb,
  MessageSquare,
  PlusCircle,
  Users,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Download,
  Building2,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentTab,
  onTabChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItemsMap: Record<UserRole, { id: string; label: string; icon: any; badge?: string }[]> = {
    STUDENT: [
      { id: 'overview', label: 'Overview & Profile', icon: LayoutDashboard },
      { id: 'copilot', label: 'AI Career Copilot', icon: Bot, badge: 'Live AI' },
      { id: 'resume', label: 'Resume Intelligence', icon: FileText },
      { id: 'gaps', label: 'Skill Gap Analysis', icon: Target },
      { id: 'jobs', label: 'Job Matching', icon: Briefcase },
      { id: 'roadmap', label: 'Learning Roadmap', icon: GitFork },
      { id: 'assessment', label: 'Skill Assessments', icon: CheckCircle2 },
    ],
    INSTITUTE: [
      { id: 'overview', label: 'Institutional Overview', icon: LayoutDashboard },
      { id: 'curriculum', label: 'Curriculum Analyzer', icon: Layers },
      { id: 'alignment', label: 'Industry vs Curriculum', icon: BarChart3 },
      { id: 'recommendations', label: 'AI Curriculum Recommendations', icon: Lightbulb, badge: '4 New' },
      { id: 'feedback', label: 'Employer Feedback', icon: MessageSquare },
    ],
    EMPLOYER: [
      { id: 'overview', label: 'Hiring Overview', icon: LayoutDashboard },
      { id: 'builder', label: 'Job Requirement Builder', icon: PlusCircle },
      { id: 'candidates', label: 'Candidate Matching', icon: Users },
      { id: 'survey', label: 'Industry Demand Survey', icon: MessageSquare },
    ],
    ADMIN: [
      { id: 'overview', label: 'National Intel Overview', icon: LayoutDashboard },
      { id: 'market', label: 'Labour Market Demands', icon: TrendingUp },
      { id: 'heatmap', label: 'Geographic Heatmap', icon: MapPin },
      { id: 'shortages', label: 'Skill Shortage Detection', icon: AlertTriangle },
      { id: 'ecosystem', label: 'Training Ecosystem', icon: Layers },
      { id: 'reports', label: 'Export Reports (CSV)', icon: Download },
    ],
  };

  const navItems = navItemsMap[currentRole] || [];

  return (
    <>
      {/* Mobile Drawer Trigger (visible on small screens) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            {currentRole} Navigation:
          </span>
          <span className="text-xs text-indigo-700 font-semibold truncate">
            {navItems.find(n => n.id === currentTab)?.label || currentTab}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 justify-between transition-all`}
      >
        <div className="space-y-4">
          {/* Workspace contextual badge */}
          <div className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                {currentRole} WORKSPACE
              </span>
              {currentRole === 'INSTITUTE' && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Autonomous
                </span>
              )}
            </div>
            {currentRole === 'INSTITUTE' && (
              <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                PICT Pune (Computer Engg)
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon, badge }) => {
              const isActive = currentTab === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    onTabChange(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-indigo-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </div>
                  {badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quiet Grounded Trust Card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1.5 mt-6">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900 text-xs">Labour Intel Engine</span>
          </div>
          <p className="text-slate-600 leading-snug">
            Triangulating real industrial vacancies, university curricula, and student competency matrices.
          </p>
          <div className="pt-1 text-[10px] text-slate-400 font-mono">
            SIH26134 · MSDE Grounded
          </div>
        </div>
      </aside>
    </>
  );
};
