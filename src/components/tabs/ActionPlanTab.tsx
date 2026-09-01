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
  ListChecks,
  Target,
  AlertTriangle,
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
  const [selectedQueue, setSelectedQueue] = useState<string>('all');

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
      if (selectedQueue !== 'all' && item.executionQueue !== selectedQueue) return false;
      return true;
    });
  }, [actionItems, searchFilter, selectedCategory, selectedStatus, selectedQueue]);

  const queueCounts = useMemo(() => ({
    'Do now': actionItems.filter((item) => item.executionQueue === 'Do now').length,
    'Do next': actionItems.filter((item) => item.executionQueue === 'Do next').length,
    Monitor: actionItems.filter((item) => item.executionQueue === 'Monitor').length,
  }), [actionItems]);

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

      {/* Plain-language workflow */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-teal-300" /> How to use this action plan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            ['1', 'Choose a task', 'Start in Do now. Approve one task and assign its named owner.'],
            ['2', 'Make the change', 'Use the target page, required change, and completion checklist in the task card.'],
            ['3', 'Verify the result', 'Repeat the AI prompts and review Search Console after 14–28 days.'],
          ].map(([number, title, text]) => (
            <div key={number} className="rounded-xl bg-white/10 border border-white/15 p-3">
              <div className="w-6 h-6 rounded-full bg-teal-300 text-slate-950 font-black flex items-center justify-center mb-2">{number}</div>
              <div className="font-bold mb-1">{title}</div>
              <p className="text-slate-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Execution queues */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['Do now', 'Do next', 'Monitor'] as const).map((queue) => (
          <button
            key={queue}
            type="button"
            onClick={() => setSelectedQueue(selectedQueue === queue ? 'all' : queue)}
            className={`text-left rounded-xl border p-4 cursor-pointer transition-all ${selectedQueue === queue
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{queue}</span>
              <span className="rounded-full bg-teal-100 text-teal-900 px-2 py-0.5 text-xs font-black">{queueCounts[queue]}</span>
            </div>
            <p className={`text-[11px] mt-1 ${selectedQueue === queue ? 'text-slate-300' : 'text-slate-500'}`}>
              {queue === 'Do now' ? 'High-value gaps and competitor citation losses.' : queue === 'Do next' ? 'Important supporting improvements.' : 'Lower-confidence ideas to validate first.'}
            </p>
          </button>
        ))}
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
                          <span className="inline-flex mt-1 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">
                            {item.executionQueue || 'Do next'}
                          </span>
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

                      {/* Problem, evidence and exact change */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                          <h5 className="font-bold text-rose-900 flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> What is the problem?</h5>
                          <p className="text-slate-700 leading-relaxed">{item.problem || item.reason}</p>
                        </div>
                        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
                          <h5 className="font-bold text-teal-900 flex items-center gap-1.5 mb-1"><Edit2 className="w-3.5 h-3.5" /> What exactly should change?</h5>
                          <p className="text-slate-700 leading-relaxed">{item.requiredChange || item.notes || item.title}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {item.evidence && (
                          <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <strong>Why it matters / evidence:</strong> {item.evidence}
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

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                        <div>
                          <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Done when</h5>
                          <ul className="space-y-1.5 text-[11px] text-slate-600">
                            {(item.completionChecklist || []).map((step, index) => (
                              <li key={index} className="flex items-start gap-2"><span className="mt-0.5 w-3.5 h-3.5 rounded border border-slate-300 bg-white shrink-0" />{step}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2"><Target className="w-4 h-4 text-blue-600" /> How to verify it worked</h5>
                          <ol className="space-y-1.5 text-[11px] text-slate-600 list-decimal list-inside">
                            {(item.verificationPlan || []).map((step, index) => <li key={index}>{step}</li>)}
                          </ol>
                          {item.successMetric && <p className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-900"><strong>Success:</strong> {item.successMetric}</p>}
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
