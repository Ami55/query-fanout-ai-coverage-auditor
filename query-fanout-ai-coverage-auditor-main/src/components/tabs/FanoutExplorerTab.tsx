import React, { useState, useMemo } from 'react';
import {
  FanoutQuery,
  QueryClassification,
  SearchIntent,
  FunnelStage,
} from '../../types';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  GitBranch,
  Table as TableIcon,
  Sparkles,
  ArrowUpDown,
  RotateCw,
  Copy,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Merge,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { ClassificationBadge } from '../ClassificationBadge';
import { Tooltip } from '../Tooltip';

interface FanoutExplorerTabProps {
  queries: FanoutQuery[];
  onUpdateQuery: (query: FanoutQuery) => void;
  onDeleteQuery: (id: string) => void;
  onAddQuery: (query: FanoutQuery) => void;
  onMergeQueries: (sourceId: string, targetId: string) => void;
  onRerunQuery?: (query: FanoutQuery) => void;
}

export const FanoutExplorerTab: React.FC<FanoutExplorerTabProps> = ({
  queries = [],
  onUpdateQuery,
  onDeleteQuery,
  onAddQuery,
  onMergeQueries,
  onRerunQuery,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<'all' | 'approved' | 'unapproved'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'relevance' | 'frequency' | 'alphabetical'>('frequency');

  // Modals / Editing state
  const [editingQuery, setEditingQuery] = useState<FanoutQuery | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [targetMergeId, setTargetMergeId] = useState<string>('');

  // Tree collapsed clusters state
  const [collapsedClusters, setCollapsedClusters] = useState<Record<string, boolean>>({});

  const clusters = useMemo(() => {
    return Array.from(new Set((queries || []).map((q) => q.cluster || 'General'))).sort();
  }, [queries]);

  const filteredQueries = useMemo(() => {
    return (queries || [])
      .filter((q) => {
        if (searchFilter) {
          const searchLower = searchFilter.toLowerCase();
          const matchSearch =
            (q.query || '').toLowerCase().includes(searchLower) ||
            (q.parentTopic || '').toLowerCase().includes(searchLower) ||
            (q.relevantEntities || []).some((e) => (e || '').toLowerCase().includes(searchLower));
          if (!matchSearch) return false;
        }
        if (selectedCluster !== 'all' && q.cluster !== selectedCluster) return false;
        if (selectedClassification !== 'all' && q.classification !== selectedClassification) return false;
        if (selectedIntent !== 'all' && q.intent !== selectedIntent) return false;
        if (selectedStage !== 'all' && q.funnelStage !== selectedStage) return false;
        if (selectedApproval === 'approved' && !q.humanApproved) return false;
        if (selectedApproval === 'unapproved' && q.humanApproved) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'confidence') return (b.confidence || 0) - (a.confidence || 0);
        if (sortBy === 'relevance') return (b.commercialRelevance || 0) - (a.commercialRelevance || 0);
        if (sortBy === 'frequency') return (b.observationFrequency || 0) - (a.observationFrequency || 0);
        return (a.query || '').localeCompare(b.query || '');
      });
  }, [
    queries,
    searchFilter,
    selectedCluster,
    selectedClassification,
    selectedIntent,
    selectedStage,
    selectedApproval,
    sortBy,
  ]);

  const toggleApproval = (q: FanoutQuery) => {
    onUpdateQuery({
      ...q,
      humanApproved: !q.humanApproved,
      classification: !q.humanApproved ? 'Human-Approved Opportunity' : q.classification,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuery) return;
    onUpdateQuery(editingQuery);
    setEditingQuery(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const newQuery: FanoutQuery = {
      id: `manual-q-${Date.now()}`,
      query: form.query.value.trim(),
      classification: form.classification.value,
      parentTopic: form.parentTopic.value.trim() || 'Manual Entry',
      cluster: form.cluster.value.trim() || 'General',
      intent: form.intent.value,
      funnelStage: form.stage.value,
      relevantEntities: form.entities.value
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
      expectedAnswerType: form.answerType.value.trim() || 'Direct answer',
      commercialRelevance: Number(form.relevance.value) || 3,
      confidence: 90,
      sourceOfDiscovery: 'Manually Added by Strategist',
      humanApproved: true,
    };
    onAddQuery(newQuery);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search fan-out queries, entities, parent topics..."
              className="w-full pl-9 pr-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Switcher & Action Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* View Mode Toggle */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Table View
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'tree' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" /> Interactive Tree
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Query
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cluster</label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs outline-none focus:bg-white"
            >
              <option value="all">All Clusters ({clusters.length})</option>
              {clusters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Classification</label>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs outline-none focus:bg-white"
            >
              <option value="all">All Classifications</option>
              <option value="Observed Gemini Search Query">Observed Gemini Search Query</option>
              <option value="AI-Predicted Fan-out">AI-Predicted Fan-out</option>
              <option value="SERP-Validated Query">SERP-Validated Query</option>
              <option value="GSC-Observed Query">GSC-Observed Query</option>
              <option value="Human-Approved Opportunity">Human-Approved Opportunity</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Intent</label>
            <select
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs outline-none focus:bg-white"
            >
              <option value="all">All Intents</option>
              <option value="Informational">Informational</option>
              <option value="Commercial investigation">Commercial investigation</option>
              <option value="Transactional">Transactional</option>
              <option value="Problem-solving">Problem-solving</option>
              <option value="Planning">Planning</option>
              <option value="Comparative">Comparative</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Funnel Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs outline-none focus:bg-white"
            >
              <option value="all">All Stages</option>
              <option value="Inspiration">Inspiration</option>
              <option value="Research">Research</option>
              <option value="Planning">Planning</option>
              <option value="Comparison">Comparison</option>
              <option value="Decision">Decision</option>
              <option value="Booking">Booking</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Approval Status</label>
            <select
              value={selectedApproval}
              onChange={(e) => setSelectedApproval(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs outline-none focus:bg-white"
            >
              <option value="all">All Items</option>
              <option value="approved">Approved Only</option>
              <option value="unapproved">Pending Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs outline-none focus:bg-white"
            >
              <option value="frequency">Observation Frequency</option>
              <option value="relevance">Commercial Relevance</option>
              <option value="confidence">Confidence Score</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: Primary Working Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-700">
              Showing {filteredQueries.length} of {queries.length} Fan-out Queries
            </span>
            <span className="text-[11px] text-slate-500">
              Click query row or icons to edit, approve, or rerun
            </span>
          </div>

          <div className="overflow-x-auto max-h-[650px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-10">Approve</th>
                  <th className="py-3 px-4 min-w-[280px]">Query & Classification</th>
                  <th className="py-3 px-4 min-w-[130px]">Cluster</th>
                  <th className="py-3 px-4 min-w-[120px]">Intent & Stage</th>
                  <th className="py-3 px-4 min-w-[160px]">Entities</th>
                  <th className="py-3 px-4 text-center">Obs. Freq</th>
                  <th className="py-3 px-4 text-center">Comm. Rel</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No queries match the active search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((q) => (
                    <tr
                      key={q.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        q.humanApproved ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      {/* Approval toggle */}
                      <td className="py-3 px-4 align-top">
                        <button
                          type="button"
                          onClick={() => toggleApproval(q)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                            q.humanApproved
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'border-slate-300 hover:border-teal-500 text-transparent'
                          }`}
                          title={q.humanApproved ? 'Approved for content plan' : 'Click to approve'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Query & Classification */}
                      <td className="py-3 px-4 align-top space-y-1">
                        <div className="font-semibold text-slate-900 text-sm leading-snug">
                          {q.query}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <ClassificationBadge classification={q.classification} size="sm" />
                          <span className="text-[11px] text-slate-500">
                            Parent: <strong className="text-slate-700">{q.parentTopic}</strong>
                          </span>
                        </div>
                        {q.expectedAnswerType && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 italic">
                            Expected answer: {q.expectedAnswerType}
                          </div>
                        )}
                      </td>

                      {/* Cluster */}
                      <td className="py-3 px-4 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          {q.cluster}
                        </span>
                      </td>

                      {/* Intent & Stage */}
                      <td className="py-3 px-4 align-top space-y-1">
                        <div className="text-xs font-medium text-slate-800">{q.intent}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                          {q.funnelStage}
                        </div>
                      </td>

                      {/* Entities */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex flex-wrap gap-1">
                          {(q.relevantEntities || []).slice(0, 3).map((e, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {e}
                            </span>
                          ))}
                          {(q.relevantEntities || []).length > 3 && (
                            <span className="text-[10px] text-slate-400">
                              +{(q.relevantEntities || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Observation Frequency */}
                      <td className="py-3 px-4 align-top text-center">
                        {q.observationFrequency !== undefined ? (
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-emerald-800">
                              {q.observationFrequency}%
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {q.observationCount || 1} runs
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      {/* Commercial Relevance */}
                      <td className="py-3 px-4 align-top text-center">
                        <div className="inline-flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                          {Array.from({ length: q.commercialRelevance || 0 }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onRerunQuery && (
                            <button
                              type="button"
                              onClick={() => onRerunQuery(q)}
                              className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                              title="Rerun search grounding for this query"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingQuery(q)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Edit query details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteQuery(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                            title="Delete query"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: Interactive Query Tree */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600" /> Hierarchical Cluster & Intent Tree
              </h3>
              <p className="text-xs text-slate-500">
                Visual relationship mapping of query fan-out branching from parent topic
              </p>
            </div>
            <button
              onClick={() => setCollapsedClusters({})}
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Expand All Clusters
            </button>
          </div>

          <div className="space-y-4">
            {clusters.map((cluster) => {
              const clusterQueries = filteredQueries.filter((q) => q.cluster === cluster);
              if (clusterQueries.length === 0) return null;
              const isCollapsed = collapsedClusters[cluster];

              return (
                <div key={cluster} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div
                    onClick={() =>
                      setCollapsedClusters((prev) => ({ ...prev, [cluster]: !prev[cluster] }))
                    }
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="font-bold text-sm text-slate-900">{cluster}</span>
                      <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                        {clusterQueries.length} {clusterQueries.length === 1 ? 'query' : 'queries'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>
                        {clusterQueries.filter((q) => q.humanApproved).length} approved
                      </span>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-4 space-y-3 bg-white divide-y divide-slate-100">
                      {clusterQueries.map((q) => (
                        <div
                          key={q.id}
                          className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                                {q.query}
                              </span>
                              <ClassificationBadge classification={q.classification} size="sm" />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                              <span>Intent: <strong className="text-slate-700">{q.intent}</strong></span>
                              <span>•</span>
                              <span>Stage: <strong className="text-slate-700">{q.funnelStage}</strong></span>
                              {q.observationFrequency !== undefined && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-semibold">
                                    Observed in {q.observationFrequency}% of runs
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleApproval(q)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                                q.humanApproved
                                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{q.humanApproved ? 'Approved' : 'Approve'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuery(q)}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Query Modal */}
      {editingQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-0">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Fan-out Query</h3>
              <button
                onClick={() => setEditingQuery(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Query Text</label>
                <input
                  type="text"
                  value={editingQuery.query}
                  onChange={(e) => setEditingQuery({ ...editingQuery, query: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Classification</label>
                  <select
                    value={editingQuery.classification}
                    onChange={(e) =>
                      setEditingQuery({ ...editingQuery, classification: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                  >
                    <option value="Observed Gemini Search Query">Observed Gemini Search Query</option>
                    <option value="AI-Predicted Fan-out">AI-Predicted Fan-out</option>
                    <option value="SERP-Validated Query">SERP-Validated Query</option>
                    <option value="GSC-Observed Query">GSC-Observed Query</option>
                    <option value="Human-Approved Opportunity">Human-Approved Opportunity</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cluster</label>
                  <input
                    type="text"
                    value={editingQuery.cluster}
                    onChange={(e) => setEditingQuery({ ...editingQuery, cluster: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Search Intent</label>
                  <select
                    value={editingQuery.intent}
                    onChange={(e) =>
                      setEditingQuery({ ...editingQuery, intent: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                  >
                    <option value="Informational">Informational</option>
                    <option value="Commercial investigation">Commercial investigation</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Problem-solving">Problem-solving</option>
                    <option value="Planning">Planning</option>
                    <option value="Comparative">Comparative</option>
                    <option value="Local">Local</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commercial Relevance (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingQuery.commercialRelevance}
                    onChange={(e) =>
                      setEditingQuery({ ...editingQuery, commercialRelevance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editApproved"
                  checked={editingQuery.humanApproved}
                  onChange={(e) =>
                    setEditingQuery({ ...editingQuery, humanApproved: e.target.checked })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="editApproved" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Approved by Human Strategist
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuery(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Query Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-0">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Fan-out Query Manually</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Query <span className="text-red-500">*</span></label>
                <input
                  name="query"
                  type="text"
                  required
                  placeholder="e.g. montreal walking tour step-free pace"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Classification</label>
                  <select
                    name="classification"
                    defaultValue="Human-Approved Opportunity"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                  >
                    <option value="Human-Approved Opportunity">Human-Approved Opportunity</option>
                    <option value="AI-Predicted Fan-out">AI-Predicted Fan-out</option>
                    <option value="SERP-Validated Query">SERP-Validated Query</option>
                    <option value="GSC-Observed Query">GSC-Observed Query</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cluster</label>
                  <input
                    name="cluster"
                    defaultValue="Planning"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Search Intent</label>
                  <select name="intent" defaultValue="Commercial investigation" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none">
                    <option value="Informational">Informational</option>
                    <option value="Commercial investigation">Commercial investigation</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Problem-solving">Problem-solving</option>
                    <option value="Planning">Planning</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Funnel Stage</label>
                  <select name="stage" defaultValue="Comparison" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none">
                    <option value="Research">Research</option>
                    <option value="Planning">Planning</option>
                    <option value="Comparison">Comparison</option>
                    <option value="Booking">Booking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relevant Entities (comma separated)</label>
                <input
                  name="entities"
                  placeholder="e.g. Old Montreal, ToursByLocals, Cobblestones"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Topic</label>
                  <input
                    name="parentTopic"
                    defaultValue="Tour Planning"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commercial Rel. (1-5)</label>
                  <input
                    name="relevance"
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Answer Type</label>
                <input
                  name="answerType"
                  placeholder="e.g. Pacing and accessible guide overview"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Add to Fan-out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
