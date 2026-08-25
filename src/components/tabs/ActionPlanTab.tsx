import React, { useState, useMemo } from 'react';
import {
  ActionItem,
  ActionCategory,
  ActionStatus,
} from '../../types';
import {
  CheckCircle2,
  Clock,
  Zap,
  Layers,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  Edit2,
  Plus,
  Users,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface ActionPlanTabProps {
  actionItems: ActionItem[];
  onUpdateActionItem: (item: ActionItem) => void;
  targetDomain: string;
}

const CATEGORIES: ActionCategory[] = [
  'Quick wins',
  'Update existing page',
  'Create supporting content',
  'Add local expertise',
  'Improve internal linking',
  'Technical fixes',
  'Human validation',
];

export const ActionPlanTab: React.FC<ActionPlanTabProps> = ({
  actionItems = [],
  onUpdateActionItem,
  targetDomain,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredItems = useMemo(() => {
    return (actionItems || []).filter((item) => {
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const match =
          (item.title || '').toLowerCase().includes(q) ||
          (item.reason || '').toLowerCase().includes(q) ||
          (item.evidence || '').toLowerCase().includes(q) ||
          (item.recommendedUrl || '').toLowerCase().includes(q) ||
          (item.supportingQuery || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      return true;
    });
  }, [actionItems, searchFilter, selectedCategory, selectedStatus]);

  const handleStatusChange = (item: ActionItem, newStatus: ActionStatus) => {
    onUpdateActionItem({
      ...item,
      status: newStatus,
    });
  };

  const approvedCompletedCount = (actionItems || []).filter(
    (a) => a.status === 'Approved' || a.status === 'Completed'
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-600" /> Strategic Action Plan & Content Backlog
            </h2>
            <p className="text-xs text-slate-500">
              Categorized implementation plan with priority, assigned owners, and target URLs for {targetDomain}.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              {approvedCompletedCount} of {(actionItems || []).length} Approved / Completed
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search action items..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white"
            >
              <option value="all">All 7 Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Proposed">Proposed</option>
              <option value="Approved">Approved</option>
              <option value="In progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Items List by Category */}
      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const categoryItems = filteredItems.filter((i) => i.category === cat);
          if (categoryItems.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span>{cat}</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {categoryItems.length} {categoryItems.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {categoryItems.map((item) => {
                  const priorityColor =
                    item.priority === 'Immediate'
                      ? 'bg-rose-100 text-rose-800 border-rose-200 font-black'
                      : item.priority === 'High'
                      ? 'bg-amber-100 text-amber-900 border-amber-200 font-bold'
                      : item.priority === 'Medium'
                      ? 'bg-blue-100 text-blue-900 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200';

                  const statusColor =
                    item.status === 'Approved'
                      ? 'bg-teal-50 text-teal-800 border-teal-300'
                      : item.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : item.status === 'In progress'
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : item.status === 'Rejected'
                      ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                      : 'bg-slate-50 text-slate-700 border-slate-300';

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3.5 text-xs"
                    >
                      {/* Top row: Priority, Title, Status Selector */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] border ${priorityColor}`}>
                              {item.priority}
                            </span>
                            <span className="text-slate-400 font-medium text-[11px]">
                              Effort: <strong className="text-slate-700">{item.effort}</strong> • Impact: <strong className="text-slate-700">{item.expectedImpact}</strong>
                            </span>
                            {item.owner && (
                              <span className="text-slate-400 text-[11px]">
                                Owner: <strong className="text-slate-700">{item.owner}</strong>
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 pt-0.5">{item.title}</h4>
                        </div>

                        {/* Status dropdown */}
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item, e.target.value as ActionStatus)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-bold outline-none cursor-pointer ${statusColor}`}
                          >
                            <option value="Proposed">Proposed</option>
                            <option value="Approved">Approved</option>
                            <option value="In progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {/* Reason & Evidence */}
                      <div className="space-y-1">
                        <p className="text-slate-700 leading-relaxed font-normal">
                          {item.reason}
                        </p>
                        {item.evidence && (
                          <p className="text-slate-500 text-[11px] italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            Evidence: {item.evidence}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {item.recommendedUrl && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
                              Target URL
                            </span>
                            {item.recommendedUrl.startsWith('http') ? (
                              <a
                                href={item.recommendedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px] truncate"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.recommendedUrl}</span>
                              </a>
                            ) : (
                              <span className="text-slate-700 font-mono text-[11px] truncate block">
                                {item.recommendedUrl}
                              </span>
                            )}
                          </div>
                        )}

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
                            Supporting Query
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] border border-slate-200 inline-block">
                            “{item.supportingQuery}”
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/50">
                          Note: {item.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
