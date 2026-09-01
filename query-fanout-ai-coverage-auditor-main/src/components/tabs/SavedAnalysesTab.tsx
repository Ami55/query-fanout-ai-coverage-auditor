import React, { useState } from 'react';
import { AuditProject } from '../../types';
import {
  FolderOpen,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Trash2,
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Plus,
} from 'lucide-react';

interface SavedAnalysesTabProps {
  savedProjects: AuditProject[];
  currentProjectId: string;
  onOpenProject: (project: AuditProject) => void;
  onDuplicateProject: (project: AuditProject) => void;
  onDeleteProject: (projectId: string) => void;
  onNewAnalysis: () => void;
}

export const SavedAnalysesTab: React.FC<SavedAnalysesTabProps> = ({
  savedProjects,
  currentProjectId,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  onNewAnalysis,
}) => {
  const [baselineId, setBaselineId] = useState<string>(
    savedProjects[0]?.id || ''
  );
  const [comparisonId, setComparisonId] = useState<string>(
    savedProjects[1]?.id || savedProjects[0]?.id || ''
  );
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const baselineProject = savedProjects.find((p) => p.id === baselineId);
  const comparisonProject = savedProjects.find((p) => p.id === comparisonId);

  // Compute diff when comparing
  const diff = React.useMemo(() => {
    if (!baselineProject || !comparisonProject) return null;

    const baseQueries = baselineProject.queries || [];
    const compQueries = comparisonProject.queries || [];
    const baseCitations = baselineProject.citations || [];
    const compCitations = comparisonProject.citations || [];
    const baseCoverage = baselineProject.coverageAnalyses || [];
    const compCoverage = comparisonProject.coverageAnalyses || [];

    const baseQuerySet = new Set(baseQueries.map((q) => (q.query || '').toLowerCase()));
    const compQuerySet = new Set(compQueries.map((q) => (q.query || '').toLowerCase()));

    const newQueries = compQueries.filter(
      (q) => !baseQuerySet.has((q.query || '').toLowerCase())
    );
    const lostQueries = baseQueries.filter(
      (q) => !compQuerySet.has((q.query || '').toLowerCase())
    );

    const baseDomainSet = new Set(baseCitations.map((c) => (c.domain || '').toLowerCase()));
    const compDomainSet = new Set(compCitations.map((c) => (c.domain || '').toLowerCase()));

    const newCitedDomains = compCitations.filter(
      (c) => !baseDomainSet.has((c.domain || '').toLowerCase())
    );
    const lostCitedDomains = baseCitations.filter(
      (c) => !compDomainSet.has((c.domain || '').toLowerCase())
    );

    const baseCovered = baseCoverage.filter((c) => c.coverageStatus === 'Covered').length;
    const compCovered = compCoverage.filter((c) => c.coverageStatus === 'Covered').length;

    const baseTargetCitations = baselineProject.summary?.targetCitations || 0;
    const compTargetCitations = comparisonProject.summary?.targetCitations || 0;

    return {
      newQueries,
      lostQueries,
      newCitedDomains,
      lostCitedDomains,
      coveredDelta: compCovered - baseCovered,
      targetCitationDelta: compTargetCitations - baseTargetCitations,
    };
  }, [baselineProject, comparisonProject]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-teal-600" /> Saved Audits & Time-Based Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Manage saved audit snapshots and run diff comparisons between baseline and subsequent crawl dates.
            </p>
          </div>

          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Start New Audit
          </button>
        </div>
      </div>

      {/* Comparison Engine Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-600" /> Multi-Date Snapshot Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Select two saved audits to identify new queries, lost citations, and coverage improvements over time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Baseline Audit Snapshot (Earlier Date)
            </label>
            <select
              value={baselineId}
              onChange={(e) => setBaselineId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs outline-none"
            >
              {savedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({new Date(p.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Comparison Audit Snapshot (Later Date)
            </label>
            <select
              value={comparisonId}
              onChange={(e) => setComparisonId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs outline-none"
            >
              {savedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({new Date(p.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Diff Results Grid */}
        {diff && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Temporal Delta & Visibility Comparison
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800 block">New Queries Discovered</span>
                <span className="text-2xl font-bold text-emerald-900 mt-1 block">+{diff.newQueries.length}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-800 block">Queries Lost</span>
                <span className="text-2xl font-bold text-amber-900 mt-1 block">-{diff.lostQueries.length}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[11px] font-semibold text-blue-900 block">Coverage Improvement</span>
                <span className="text-2xl font-bold text-blue-950 mt-1 block">
                  {diff.coveredDelta >= 0 ? `+${diff.coveredDelta}` : diff.coveredDelta}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-semibold text-indigo-900 block">Target Citations Delta</span>
                <span className="text-2xl font-bold text-indigo-950 mt-1 block">
                  {diff.targetCitationDelta >= 0 ? `+${diff.targetCitationDelta}` : diff.targetCitationDelta}
                </span>
              </div>
            </div>

            {/* List of New vs Lost queries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-emerald-800 block">Newly Emerged Queries:</span>
                {diff.newQueries.length === 0 ? (
                  <span className="text-slate-400 italic">No new queries emerged in comparison.</span>
                ) : (
                  <ul className="space-y-1">
                    {diff.newQueries.slice(0, 5).map((q, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{q.query}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-amber-800 block">Queries Dropped / Lost:</span>
                {diff.lostQueries.length === 0 ? (
                  <span className="text-slate-400 italic">No previous queries were dropped.</span>
                ) : (
                  <ul className="space-y-1">
                    {diff.lostQueries.slice(0, 5).map((q, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-slate-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{q.query}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Projects Inventory List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Saved Projects & Audits Library ({savedProjects.length})
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {savedProjects.map((p) => {
            const isCurrent = p.id === currentProjectId;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                  isCurrent ? 'border-teal-500 ring-1 ring-teal-500/30' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                        Active Project
                      </span>
                    )}
                    {p.isDemo && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Demo
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    “{p.input.seedPrompt}”
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span>Target: <strong className="text-slate-600">{p.input.targetDomain}</strong></span>
                    <span>•</span>
                    <span>{p.queries.length} queries</span>
                    <span>•</span>
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenProject(p)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                  >
                    Open Project
                  </button>

                  <button
                    onClick={() => onDuplicateProject(p)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Duplicate project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {!p.isDemo && (
                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-0">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Saved Audit?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this project snapshot? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProject(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
