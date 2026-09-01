import React, { useState, useMemo } from 'react';
import {
  ApprovedTestPrompt,
  PromptVariationType,
  PromptApprovalStatus,
  QueryCluster,
  AuditProjectInput,
} from '../../types';
import {
  Send,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  FileSpreadsheet,
  FileCode,
  Search,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  Tag,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Tooltip } from '../Tooltip';

interface ApprovedTestPromptsTabProps {
  prompts: ApprovedTestPrompt[];
  clusters: QueryCluster[];
  projectInput: AuditProjectInput;
  projectId: string;
  projectName: string;
  onUpdatePrompt: (updated: ApprovedTestPrompt) => void;
  onDeletePrompt: (promptId: string) => void;
  onAddPrompt: (newPrompt: ApprovedTestPrompt) => void;
  onOpenExportModal: () => void;
  onGenerateMorePrompts?: () => void;
}

const VARIATION_TYPES: PromptVariationType[] = [
  'Broad discovery',
  'Specific question',
  'Recommendation',
  'Comparison',
  'Problem-solving',
  'Commercial investigation',
  'Transactional',
  'Audience-specific',
  'Constraint-specific',
  'Follow-up question',
];

export const ApprovedTestPromptsTab: React.FC<ApprovedTestPromptsTabProps> = ({
  prompts,
  clusters,
  projectInput,
  projectId,
  projectName,
  onUpdatePrompt,
  onDeletePrompt,
  onAddPrompt,
  onOpenExportModal,
  onGenerateMorePrompts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<string>('all');
  const [filterCluster, setFilterCluster] = useState<string>('all');
  const [editingPrompt, setEditingPrompt] = useState<ApprovedTestPrompt | null>(null);
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(() => {
    // Default to selecting all approved prompts or all prompts
    return new Set((prompts || []).map((p) => p.prompt_id));
  });

  // Keep selection in sync when prompts list changes
  React.useEffect(() => {
    setSelectedPromptIds((prev) => {
      const next = new Set(prev);
      (prompts || []).forEach((p) => {
        if (p.selectedForExport !== false && !next.has(p.prompt_id)) {
          next.add(p.prompt_id);
        }
      });
      return next;
    });
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return (prompts || []).filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.test_prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.query_cluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reason_for_testing.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.business_objective.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || p.prompt_variation_type === filterType;
      const matchesApproval = filterApproval === 'all' || p.approval_status === filterApproval;
      const matchesCluster = filterCluster === 'all' || p.query_cluster === filterCluster;

      return matchesSearch && matchesType && matchesApproval && matchesCluster;
    });
  }, [prompts, searchQuery, filterType, filterApproval, filterCluster]);

  const approvedCount = (prompts || []).filter((p) => p.approval_status === 'Approved').length;
  const pendingCount = (prompts || []).filter((p) => p.approval_status === 'Pending').length;
  const selectedCount = selectedPromptIds.size;

  const toggleSelectPrompt = (promptId: string) => {
    setSelectedPromptIds((prev) => {
      const next = new Set(prev);
      if (next.has(promptId)) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPromptIds.size === filteredPrompts.length) {
      setSelectedPromptIds(new Set());
    } else {
      setSelectedPromptIds(new Set(filteredPrompts.map((p) => p.prompt_id)));
    }
  };

  const handleToggleApproval = (prompt: ApprovedTestPrompt, newStatus: PromptApprovalStatus) => {
    onUpdatePrompt({
      ...prompt,
      approval_status: newStatus,
    });
  };

  const handleCreateNewPrompt = () => {
    const newP: ApprovedTestPrompt = {
      prompt_id: `prompt-${Date.now()}`,
      project_id: projectId || 'proj-default',
      project_name: projectName || 'Query Fan-out Audit',
      seed_prompt: projectInput.seedPrompt || '',
      test_prompt: projectInput.seedPrompt || `What should travellers know about ${projectInput.destinationOrSubject || 'this destination'}?`,
      prompt_variation_type: 'Specific question',
      query_cluster: clusters[0]?.name || 'Private Walking Tours',
      search_intent: 'Informational',
      journey_stage: 'Consideration',
      subject: projectInput.destinationOrSubject || 'Current audit subject',
      audience: projectInput.targetAudience || 'Mature Travellers',
      country: projectInput.country || 'Canada',
      language: projectInput.language || 'English',
      target_domain: projectInput.targetDomain || 'toursbylocals.com',
      target_url: projectInput.uploadedUrls?.[0] || `https://${projectInput.targetDomain || 'toursbylocals.com'}/`,
      competitor_domains: projectInput.competitorDomains || ['tripadvisor.com', 'viator.com'],
      business_objective: projectInput.businessObjective || 'Drive direct bookings for private tours',
      business_priority: 'High priority',
      reason_for_testing: `Test whether AI engines cite ${projectInput.targetDomain || 'the target domain'} for this query.`,
      source_classification: 'AI-Predicted Fan-out',
      approval_status: 'Approved',
      selectedForExport: true,
    };
    onAddPrompt(newP);
    setEditingPrompt(newP);
  };

  // Direct CSV Export download for Citation Reverse Engineering
  const handleExportCSV = (exportSelectedOnly = true) => {
    const exportList = exportSelectedOnly
      ? prompts.filter((p) => selectedPromptIds.has(p.prompt_id))
      : prompts;

    if (exportList.length === 0) return;

    const headers = [
      'project_id',
      'project_name',
      'prompt_id',
      'seed_prompt',
      'test_prompt',
      'prompt_variation_type',
      'query_cluster',
      'search_intent',
      'journey_stage',
      'subject',
      'audience',
      'country',
      'language',
      'target_domain',
      'target_url',
      'competitor_domains',
      'business_objective',
      'business_priority',
      'reason_for_testing',
      'source_classification',
      'approval_status',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [
      headers.join(','),
      ...exportList.map((p) =>
        [
          escapeCsv(p.project_id || projectId),
          escapeCsv(p.project_name || projectName),
          escapeCsv(p.prompt_id),
          escapeCsv(p.seed_prompt || projectInput.seedPrompt),
          escapeCsv(p.test_prompt),
          escapeCsv(p.prompt_variation_type),
          escapeCsv(p.query_cluster),
          escapeCsv(p.search_intent),
          escapeCsv(p.journey_stage),
          escapeCsv(p.subject || projectInput.destinationOrSubject),
          escapeCsv(p.audience || projectInput.targetAudience),
          escapeCsv(p.country || projectInput.country),
          escapeCsv(p.language || projectInput.language),
          escapeCsv(p.target_domain || projectInput.targetDomain),
          escapeCsv(p.target_url),
          escapeCsv(p.competitor_domains || projectInput.competitorDomains),
          escapeCsv(p.business_objective || projectInput.businessObjective),
          escapeCsv(p.business_priority),
          escapeCsv(p.reason_for_testing),
          escapeCsv(p.source_classification),
          escapeCsv(p.approval_status),
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `citation_testing_prompts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct JSON Export download
  const handleExportJSON = (exportSelectedOnly = true) => {
    const exportList = exportSelectedOnly
      ? prompts.filter((p) => selectedPromptIds.has(p.prompt_id))
      : prompts;

    if (exportList.length === 0) return;

    const payload = exportList.map((p) => ({
      project_id: p.project_id || projectId,
      project_name: p.project_name || projectName,
      prompt_id: p.prompt_id,
      seed_prompt: p.seed_prompt || projectInput.seedPrompt,
      test_prompt: p.test_prompt,
      prompt_variation_type: p.prompt_variation_type,
      query_cluster: p.query_cluster,
      search_intent: p.search_intent,
      journey_stage: p.journey_stage,
      subject: p.subject || projectInput.destinationOrSubject,
      audience: p.audience || projectInput.targetAudience,
      country: p.country || projectInput.country,
      language: p.language || projectInput.language,
      target_domain: p.target_domain || projectInput.targetDomain,
      target_url: p.target_url,
      competitor_domains: p.competitor_domains || projectInput.competitorDomains,
      business_objective: p.business_objective || projectInput.businessObjective,
      business_priority: p.business_priority,
      reason_for_testing: p.reason_for_testing,
      source_classification: p.source_classification,
      approval_status: p.approval_status,
    }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `citation_testing_prompts_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Handoff Action */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Citation Handoff Queue
              </span>
              <span className="text-xs text-slate-500">
                {prompts.length} total prompts ({approvedCount} approved)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Approved Test Prompts
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Prepare, refine, and approve natural-language query variations derived from your fan-out clusters. These prompts are structured specifically for handoff into the separate <strong>AI Citation Reverse Engineering</strong> application.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => handleExportJSON(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              title="Download selected test prompts in standardized JSON schema"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-600" /> Export JSON ({selectedCount})
            </button>

            <button
              onClick={() => handleExportCSV(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              title="Download selected test prompts in CSV format"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" /> Export CSV ({selectedCount})
            </button>

            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Full Handoff Hub
            </button>

            <button
              onClick={handleCreateNewPrompt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Prompt
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompts, clusters, reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Variation Types</option>
            {VARIATION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={filterCluster}
            onChange={(e) => setFilterCluster(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Clusters</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Approval Statuses</option>
            <option value="Approved">Approved ({approvedCount})</option>
            <option value="Pending">Pending ({pendingCount})</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Selection bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <button
            onClick={handleSelectAll}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {selectedPromptIds.size === filteredPrompts.length && filteredPrompts.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-teal-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All in View ({filteredPrompts.length})</span>
          </button>

          <span className="text-slate-500">
            {selectedCount} of {prompts.length} prompts queued for export
          </span>
        </div>
      </div>

      {/* Prompts Cards List */}
      <div className="space-y-3">
        {filteredPrompts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
            No test prompts match your active search and filter criteria.
          </div>
        ) : (
          filteredPrompts.map((p) => {
            const isSelected = selectedPromptIds.has(p.prompt_id);

            return (
              <div
                key={p.prompt_id}
                className={`bg-white rounded-2xl border p-5 transition-all space-y-3 ${
                  isSelected ? 'border-teal-300 shadow-2xs' : 'border-slate-200'
                } ${
                  p.approval_status === 'Approved'
                    ? 'border-l-4 border-l-emerald-500'
                    : p.approval_status === 'Rejected'
                    ? 'border-l-4 border-l-rose-400 opacity-60'
                    : 'border-l-4 border-l-amber-400'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => toggleSelectPrompt(p.prompt_id)}
                      className="cursor-pointer text-slate-600 hover:text-teal-600"
                      title={isSelected ? 'Deselect from export' : 'Select for export'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {p.prompt_id}
                    </span>

                    {/* Variation type pill */}
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      {p.prompt_variation_type}
                    </span>

                    {/* Cluster tag */}
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" /> {p.query_cluster}
                    </span>

                    {/* Intent & Funnel */}
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {p.search_intent} · {p.journey_stage}
                    </span>
                  </div>

                  {/* Right side controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                      <button
                        onClick={() => handleToggleApproval(p, 'Approved')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          p.approval_status === 'Approved'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleToggleApproval(p, 'Pending')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          p.approval_status === 'Pending'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleToggleApproval(p, 'Rejected')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          p.approval_status === 'Rejected'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Reject
                      </button>
                    </div>

                    <button
                      onClick={() => setEditingPrompt(p)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Edit prompt specifications"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeletePrompt(p.prompt_id)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Prompt Text in high contrast display */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Natural Language Test Prompt
                  </span>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    “{p.test_prompt}”
                  </p>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reason for Testing:</span>
                    <p className="text-slate-700 leading-tight mt-0.5">{p.reason_for_testing}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Website URL:</span>
                    <a
                      href={p.target_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:underline font-medium inline-flex items-center gap-1 mt-0.5 truncate max-w-full"
                    >
                      <span className="truncate">{p.target_url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Competitor Benchmark Domains:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(p.competitor_domains || []).map((comp, i) => (
                        <span key={i} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingPrompt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Citation Test Prompt</h3>
              <button onClick={() => setEditingPrompt(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Natural Language Test Prompt</label>
                <textarea
                  rows={2}
                  value={editingPrompt.test_prompt}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, test_prompt: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Variation Type</label>
                  <select
                    value={editingPrompt.prompt_variation_type}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_variation_type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    {VARIATION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Cluster</label>
                  <select
                    value={editingPrompt.query_cluster}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, query_cluster: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    {clusters.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Testing</label>
                <textarea
                  rows={2}
                  value={editingPrompt.reason_for_testing}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, reason_for_testing: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relevant Target URL</label>
                  <input
                    type="text"
                    value={editingPrompt.target_url}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, target_url: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Priority</label>
                  <input
                    type="text"
                    value={editingPrompt.business_priority}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, business_priority: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Objective</label>
                <input
                  type="text"
                  value={editingPrompt.business_objective}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, business_objective: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingPrompt(null)}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdatePrompt(editingPrompt);
                  setEditingPrompt(null);
                }}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
