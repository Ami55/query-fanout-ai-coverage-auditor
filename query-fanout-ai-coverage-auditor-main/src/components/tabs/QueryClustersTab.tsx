import React, { useState, useMemo } from 'react';
import {
  QueryCluster,
  FanoutQuery,
  RecommendedContentFormat,
  OpportunityPriority,
  CoverageStatus,
  SearchIntent,
  FunnelStage,
} from '../../types';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Combine,
  Split,
  Send,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Check,
  AlertTriangle,
  FileText,
  Tag,
  Compass,
} from 'lucide-react';
import { ClassificationBadge } from '../ClassificationBadge';
import { Tooltip } from '../Tooltip';

interface QueryClustersTabProps {
  clusters: QueryCluster[];
  queries: FanoutQuery[];
  targetDomain: string;
  onUpdateCluster: (updated: QueryCluster) => void;
  onDeleteCluster: (clusterId: string) => void;
  onAddCluster: (newCluster: QueryCluster) => void;
  onMergeClusters: (sourceId: string, targetId: string) => void;
  onMoveQuery: (queryId: string, sourceClusterId: string, targetClusterId: string) => void;
  onGeneratePromptsForCluster: (cluster: QueryCluster) => void;
  onNavigateToPrompts?: () => void;
}

const CONTENT_FORMATS: RecommendedContentFormat[] = [
  'Hub page',
  'New section on an existing page',
  'Supporting article',
  'Destination page',
  'Attraction page',
  'Guide-profile enhancement',
  'FAQ',
  'Comparison page',
  'Itinerary',
  'Planning resource',
  'No new content required',
];

const PRIORITIES: OpportunityPriority[] = [
  'High priority',
  'Medium priority',
  'Low priority',
  'Needs validation',
];

const COVERAGE_STATUSES: CoverageStatus[] = [
  'Covered',
  'Partially covered',
  'Not covered',
  'Covered but not cited',
];

export const QueryClustersTab: React.FC<QueryClustersTabProps> = ({
  clusters,
  queries,
  targetDomain,
  onUpdateCluster,
  onDeleteCluster,
  onAddCluster,
  onMergeClusters,
  onMoveQuery,
  onGeneratePromptsForCluster,
  onNavigateToPrompts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [expandedClusterIds, setExpandedClusterIds] = useState<Set<string>>(
    new Set((clusters || []).slice(0, 3).map((c) => c.id))
  );

  // Modal / Editing states
  const [editingCluster, setEditingCluster] = useState<QueryCluster | null>(null);
  const [isCreatingCluster, setIsCreatingCluster] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [movingQueryId, setMovingQueryId] = useState<string | null>(null);
  const [moveTargetClusterId, setMoveTargetClusterId] = useState<string>('');

  // Filtering
  const filteredClusters = useMemo(() => {
    return (clusters || []).filter((cluster) => {
      const matchesSearch =
        searchQuery === '' ||
        cluster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cluster.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cluster.representativeQuery.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cluster.primaryUserNeed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cluster.supportingQueries || []).some((q) => q.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = selectedPriority === 'all' || cluster.priority === selectedPriority;
      const matchesCoverage = selectedCoverage === 'all' || cluster.coverageStatus === selectedCoverage;
      const matchesFormat = selectedFormat === 'all' || cluster.recommendedContentFormat === selectedFormat;
      const matchesApproval =
        approvalFilter === 'all' ||
        (approvalFilter === 'approved' && cluster.humanApproved) ||
        (approvalFilter === 'pending' && !cluster.humanApproved);

      return matchesSearch && matchesPriority && matchesCoverage && matchesFormat && matchesApproval;
    });
  }, [clusters, searchQuery, selectedPriority, selectedCoverage, selectedFormat, approvalFilter]);

  const toggleExpand = (id: string) => {
    setExpandedClusterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleApprove = (cluster: QueryCluster) => {
    onUpdateCluster({
      ...cluster,
      humanApproved: !cluster.humanApproved,
    });
  };

  const handleToggleSelectForTesting = (cluster: QueryCluster) => {
    onUpdateCluster({
      ...cluster,
      selectedForTesting: !cluster.selectedForTesting,
    });
  };

  const handleExecuteMerge = () => {
    if (mergeSourceId && mergeTargetId && mergeSourceId !== mergeTargetId) {
      onMergeClusters(mergeSourceId, mergeTargetId);
      setIsMergeModalOpen(false);
      setMergeSourceId(null);
      setMergeTargetId(null);
    }
  };

  const handleExecuteMoveQuery = (queryId: string, currentClusterId: string) => {
    if (moveTargetClusterId && moveTargetClusterId !== currentClusterId) {
      onMoveQuery(queryId, currentClusterId, moveTargetClusterId);
      setMovingQueryId(null);
      setMoveTargetClusterId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Topic & Semantic Taxonomy
              </span>
              <span className="text-xs text-slate-500">{clusters.length} total clusters</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Query Clusters
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Group semantically related fan-out queries by user intent while preserving specific entity and informational needs. Review coverage on <strong className="text-slate-800">{targetDomain}</strong>, assign content formats, and approve clusters for citation testing.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMergeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Combine className="w-3.5 h-3.5" /> Merge Clusters
            </button>
            <button
              onClick={() => {
                const newClust: QueryCluster = {
                  id: `cluster-${Date.now()}`,
                  name: 'New Custom Cluster',
                  description: 'Description of intent and subtopic.',
                  primaryUserNeed: 'User is looking for specific information.',
                  representativeQuery: 'example query phrase',
                  supportingQueries: [],
                  queryClassifications: ['AI-Predicted Fan-out'],
                  relevantEntities: [],
                  intentMix: ['Informational'],
                  journeyStages: ['Comparison'],
                  existingTargetPage: `https://${targetDomain}/`,
                  coverageStatus: 'Not covered',
                  recommendedContentFormat: 'Supporting article',
                  priority: 'Medium priority',
                  humanApproved: true,
                  selectedForTesting: true,
                };
                onAddCluster(newClust);
                setEditingCluster(newClust);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Cluster
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clusters or queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={selectedCoverage}
            onChange={(e) => setSelectedCoverage(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Coverage Statuses</option>
            {COVERAGE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Content Formats</option>
            {CONTENT_FORMATS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Approval States</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Clusters List */}
      <div className="space-y-4">
        {filteredClusters.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
            No clusters match your active filter criteria.
          </div>
        ) : (
          filteredClusters.map((cluster) => {
            const isExpanded = expandedClusterIds.has(cluster.id);
            const queryCount = (cluster.supportingQueries?.length || 0) + 1;

            return (
              <div
                key={cluster.id}
                className={`bg-white rounded-2xl border transition-all ${
                  cluster.humanApproved ? 'border-slate-200 shadow-2xs' : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                {/* Cluster Card Header */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleExpand(cluster.id)}
                      className="mt-1 p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{cluster.name}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                          {queryCount} {queryCount === 1 ? 'query' : 'queries'}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            cluster.priority === 'High priority'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : cluster.priority === 'Medium priority'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {cluster.priority}
                        </span>

                        {/* Coverage Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            cluster.coverageStatus === 'Covered'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : cluster.coverageStatus === 'Partially covered'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {cluster.coverageStatus}
                        </span>

                        {/* Format Badge */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {cluster.recommendedContentFormat}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{cluster.description}</p>
                      
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                        <strong className="text-slate-700">Primary Need:</strong> {cluster.primaryUserNeed}
                      </div>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => handleToggleSelectForTesting(cluster)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                        cluster.selectedForTesting
                          ? 'bg-teal-50 text-teal-800 border-teal-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Select cluster for AI citation audit prompt generation"
                    >
                      <Check className={`w-3.5 h-3.5 ${cluster.selectedForTesting ? 'text-teal-600' : 'text-slate-400'}`} />
                      <span>{cluster.selectedForTesting ? 'Selected for Testing' : 'Select for Test'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleApprove(cluster)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                        cluster.humanApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {cluster.humanApproved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Review
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onGeneratePromptsForCluster(cluster)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
                      title="Generate test prompt variations from this cluster"
                    >
                      <Send className="w-4 h-4 text-teal-600" />
                    </button>

                    <button
                      onClick={() => setEditingCluster(cluster)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Edit cluster details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteCluster(cluster.id)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete cluster"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Cluster Details & Queries */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4 rounded-b-2xl">
                    {/* Meta Specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Representative Query:</span>
                        <span className="font-semibold text-slate-900 font-mono text-[11px] block mt-0.5">
                          “{cluster.representativeQuery}”
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Existing Target Page:</span>
                        <a
                          href={cluster.existingTargetPage}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-teal-700 hover:underline inline-flex items-center gap-1 mt-0.5 truncate max-w-full"
                        >
                          <span className="truncate">{cluster.existingTargetPage}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[11px]">Relevant Entities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(cluster.relevantEntities || []).length > 0 ? (
                            cluster.relevantEntities.map((ent, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                {ent}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">None assigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Supporting Queries Sub-table */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-teal-600" /> Member Queries in this Cluster
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {1 + (cluster.supportingQueries?.length || 0)} queries
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Primary representative query */}
                        <div className="flex items-center justify-between p-2.5 bg-teal-50/40 rounded-lg border border-teal-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-teal-600 text-white px-1.5 py-0.2 rounded">Primary</span>
                            <span className="font-semibold text-slate-900 font-mono text-[11px]">{cluster.representativeQuery}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">Anchor query</span>
                        </div>

                        {/* Supporting queries list */}
                        {(cluster.supportingQueries || []).map((queryText, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs group"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span className="text-slate-800 font-mono text-[11px]">{queryText}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Move query selector */}
                              {movingQueryId === queryText ? (
                                <div className="flex items-center gap-1">
                                  <select
                                    value={moveTargetClusterId}
                                    onChange={(e) => setMoveTargetClusterId(e.target.value)}
                                    className="text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5"
                                  >
                                    <option value="">Select target cluster...</option>
                                    {clusters
                                      .filter((c) => c.id !== cluster.id)
                                      .map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                      ))}
                                  </select>
                                  <button
                                    onClick={() => handleExecuteMoveQuery(queryText, cluster.id)}
                                    className="px-2 py-0.5 bg-teal-600 text-white text-[10px] rounded font-semibold cursor-pointer"
                                  >
                                    Move
                                  </button>
                                  <button
                                    onClick={() => setMovingQueryId(null)}
                                    className="px-1.5 py-0.5 text-slate-400 hover:text-slate-700 text-[10px] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setMovingQueryId(queryText)}
                                  className="text-[11px] text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
                                >
                                  <span>Move query</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Cluster Modal */}
      {editingCluster && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Query Cluster</h3>
              <button
                onClick={() => setEditingCluster(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cluster Name</label>
                <input
                  type="text"
                  value={editingCluster.name}
                  onChange={(e) => setEditingCluster({ ...editingCluster, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCluster.description}
                  onChange={(e) => setEditingCluster({ ...editingCluster, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary User Need</label>
                <input
                  type="text"
                  value={editingCluster.primaryUserNeed}
                  onChange={(e) => setEditingCluster({ ...editingCluster, primaryUserNeed: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recommended Content Format</label>
                  <select
                    value={editingCluster.recommendedContentFormat}
                    onChange={(e) => setEditingCluster({ ...editingCluster, recommendedContentFormat: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    {CONTENT_FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editingCluster.priority}
                    onChange={(e) => setEditingCluster({ ...editingCluster, priority: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coverage Status</label>
                  <select
                    value={editingCluster.coverageStatus}
                    onChange={(e) => setEditingCluster({ ...editingCluster, coverageStatus: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    {COVERAGE_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target URL</label>
                  <input
                    type="text"
                    value={editingCluster.existingTargetPage}
                    onChange={(e) => setEditingCluster({ ...editingCluster, existingTargetPage: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingCluster(null)}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateCluster(editingCluster);
                  setEditingCluster(null);
                }}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Clusters Modal */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Combine className="w-4 h-4 text-teal-600" /> Merge Two Clusters
              </h3>
              <button onClick={() => setIsMergeModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Combine all queries, entities, and intent requirements from the source cluster into the target cluster. The source cluster will be removed.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Cluster (to absorb):</label>
                <select
                  value={mergeSourceId || ''}
                  onChange={(e) => setMergeSourceId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select source cluster...</option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === mergeTargetId}>
                      {c.name} ({1 + (c.supportingQueries?.length || 0)} queries)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Cluster (to retain):</label>
                <select
                  value={mergeTargetId || ''}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select target destination cluster...</option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === mergeSourceId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteMerge}
                disabled={!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Merge Clusters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
