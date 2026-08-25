import React, { useState, useMemo } from 'react';
import {
  ContentOpportunity,
  OpportunityPriority,
  RecommendedAction,
} from '../../types';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  Check,
} from 'lucide-react';

interface ContentOpportunitiesTabProps {
  opportunities: ContentOpportunity[];
  onUpdateOpportunity: (opp: ContentOpportunity) => void;
  onNavigateToActions?: () => void;
}

export const ContentOpportunitiesTab: React.FC<ContentOpportunitiesTabProps> = ({
  opportunities = [],
  onUpdateOpportunity,
  onNavigateToActions,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'frequency' | 'intent' | 'relevance'>('score');

  const clusters = useMemo(() => {
    return Array.from(new Set((opportunities || []).map((o) => o.cluster || 'General')));
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return (opportunities || [])
      .filter((opp) => {
        if (searchFilter) {
          const q = searchFilter.toLowerCase();
          const match =
            (opp.query || '').toLowerCase().includes(q) ||
            (opp.cluster || '').toLowerCase().includes(q) ||
            (opp.priorityReason || '').toLowerCase().includes(q) ||
            (opp.recommendedPage || '').toLowerCase().includes(q);
          if (!match) return false;
        }
        if (priorityFilter !== 'all' && opp.priority !== priorityFilter) return false;
        if (clusterFilter !== 'all' && opp.cluster !== clusterFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return (b.calculatedScore || 0) - (a.calculatedScore || 0);
        if (sortBy === 'frequency') return (b.observationFrequency || 0) - (a.observationFrequency || 0);
        if (sortBy === 'intent') return (b.intentValueScore || 0) - (a.intentValueScore || 0);
        if (sortBy === 'relevance') return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        return (a.query || '').localeCompare(b.query || '');
      });
  }, [opportunities, searchFilter, priorityFilter, clusterFilter, sortBy]);

  const toggleApproval = (opp: ContentOpportunity) => {
    onUpdateOpportunity({
      ...opp,
      humanApproved: !opp.humanApproved,
      priority: !opp.humanApproved && opp.priority === 'Needs validation' ? 'High priority' : opp.priority,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Formula Explanation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Prioritized Content Opportunities Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Rigorously scored content recommendations generated from query frequency, gap severity, and commercial intent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {opportunities.filter((o) => o.humanApproved).length} of {opportunities.length} Approved
            </span>
          </div>
        </div>

        {/* Formula Explainer */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <strong className="text-slate-900 font-semibold">
                Opportunity Scoring Formula (0 - 100):
              </strong>
              <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md font-medium">
                Strategy: Prefer improving existing URLs before creating new ones
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200 inline-block">
              Score = ((Frequency [1-5] × Relevance [1-5] × Intent Value [1-5] × Content Gap [1-5] × Business Value [1-5]) ÷ 3125) × 100
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="High priority">High Priority (Score ≥ 80)</option>
              <option value="Medium priority">Medium Priority (50-79)</option>
              <option value="Low priority">Low Priority (&lt;50)</option>
              <option value="Needs validation">Needs Validation</option>
            </select>
          </div>

          <div>
            <select
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white"
            >
              <option value="all">All Topic Clusters</option>
              {clusters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white"
            >
              <option value="score">Sort by Calculated Score</option>
              <option value="frequency">Observation Frequency</option>
              <option value="intent">Intent Value Score</option>
              <option value="relevance">Commercial Relevance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="space-y-4">
        {filteredOpportunities.map((opp) => {
          const priorityBg =
            opp.priority === 'High priority'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : opp.priority === 'Medium priority'
              ? 'bg-blue-100 text-blue-900 border-blue-300'
              : opp.priority === 'Needs validation'
              ? 'bg-purple-100 text-purple-900 border-purple-300'
              : 'bg-slate-100 text-slate-800 border-slate-300';

          return (
            <div
              key={opp.id}
              className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4 ${
                opp.humanApproved ? 'ring-1 ring-teal-500/40 bg-teal-50/10' : ''
              }`}
            >
              {/* Top Title, Score & Approval */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${priorityBg}`}>
                      {opp.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {opp.cluster}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                      Action: <strong className="text-slate-800">{opp.recommendedAction}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight pt-1">
                    “{opp.query}”
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Intent: <strong className="text-slate-700">{opp.intent}</strong></span>
                    <span>•</span>
                    <span>Funnel: <strong className="text-slate-700">{opp.funnelStage}</strong></span>
                    {opp.searchVolumeEstimate && (
                      <>
                        <span>•</span>
                        <span>Estimated Volume / GSC: <strong className="text-teal-700">{opp.searchVolumeEstimate}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score badge & Approval */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Opportunity Score
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      {opp.calculatedScore}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleApproval(opp)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      opp.humanApproved
                        ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{opp.humanApproved ? 'Approved' : 'Approve'}</span>
                  </button>
                </div>
              </div>

              {/* 5 Factor Breakdown Meters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Obs. Frequency</span>
                  <span className="font-bold text-slate-900">{opp.observationFrequency} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Relevance</span>
                  <span className="font-bold text-slate-900">{opp.relevanceScore} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Intent Value</span>
                  <span className="font-bold text-slate-900">{opp.intentValueScore} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gap Severity</span>
                  <span className="font-bold text-slate-900">{opp.contentGapScore} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Citation Potential</span>
                  <span className="font-bold text-slate-900">{opp.citationPotentialScore} / 5</span>
                </div>
              </div>

              {/* Strategic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Strategic Rationale & Business Impact:
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {opp.priorityReason}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Recommended Target Page:
                    </span>
                    {opp.recommendedPage.startsWith('http') ? (
                      <a
                        href={opp.recommendedPage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px] truncate pt-0.5"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{opp.recommendedPage}</span>
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-800">{opp.recommendedPage}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-slate-600 pt-1">
                    <span>
                      Coverage Status:{' '}
                      <strong className="text-slate-900 font-semibold">{opp.targetSiteCoverage}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Competitor Cited:{' '}
                      <strong className={opp.competitorCited ? 'text-amber-700' : 'text-slate-700'}>
                        {opp.competitorCited ? 'Yes' : 'No'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
