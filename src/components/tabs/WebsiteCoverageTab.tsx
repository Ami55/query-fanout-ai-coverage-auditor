import React, { useState, useMemo } from 'react';
import {
  PageCoverageAnalysis,
  CoverageStatus,
  RecommendedAction,
} from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  Search,
  Layers,
  Link as LinkIcon,
  Globe,
} from 'lucide-react';

interface WebsiteCoverageTabProps {
  coverageAnalyses: PageCoverageAnalysis[];
  targetDomain: string;
  onNavigateToActions?: () => void;
}

export const WebsiteCoverageTab: React.FC<WebsiteCoverageTabProps> = ({
  coverageAnalyses = [],
  targetDomain,
  onNavigateToActions,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recFilter, setRecFilter] = useState<string>('all');
  const [citationGapOnly, setCitationGapOnly] = useState<boolean>(false);

  const statusConfigs: Record<
    CoverageStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ElementType }
  > = {
    Covered: {
      label: 'Covered',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    'Partially covered': {
      label: 'Partially covered',
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: CheckCircle2,
    },
    'Not covered': {
      label: 'Not covered',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: XCircle,
    },
    'Wrong page type': {
      label: 'Wrong page type',
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: AlertTriangle,
    },
    'Covered but not cited': {
      label: 'Covered but not cited',
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      icon: AlertTriangle,
    },
    'Possible cannibalisation': {
      label: 'Possible cannibalisation',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: AlertTriangle,
    },
    'Technical issue': {
      label: 'Technical issue',
      bg: 'bg-red-50 text-red-800 border-red-200',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: AlertTriangle,
    },
    'Unable to verify': {
      label: 'Unable to verify',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: HelpCircle,
    },
  };

  const actionOptions: RecommendedAction[] = [
    'Keep as is',
    'Add a section',
    'Expand an existing section',
    'Update outdated information',
    'Improve answer clarity',
    'Add first-hand expertise',
    'Add guide insights',
    'Add supporting evidence',
    'Improve entity relationships',
    'Add internal links',
    'Merge overlapping pages',
    'Create supporting content',
    'Create a new hub page',
    'Fix indexing or crawlability',
    'Human review required',
  ];

  const filteredItems = useMemo(() => {
    return coverageAnalyses.filter((item) => {
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const match =
          item.query.toLowerCase().includes(q) ||
          (item.mostRelevantUrl && item.mostRelevantUrl.toLowerCase().includes(q)) ||
          item.relevantTextSection?.toLowerCase().includes(q) ||
          item.missingInformation?.toLowerCase().includes(q) ||
          item.cluster?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'all' && item.coverageStatus !== statusFilter) return false;
      if (recFilter !== 'all' && item.recommendedAction !== recFilter) return false;
      if (citationGapOnly && (!item.isCompetitorCited || item.isTargetDomainCited)) return false;
      return true;
    });
  }, [coverageAnalyses, searchFilter, statusFilter, recFilter, citationGapOnly]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" /> Target Website Coverage & Page Mapping ({targetDomain})
            </h2>
            <p className="text-xs text-slate-500">
              Evaluates whether {targetDomain} covers the specific intent and entities required for each fan-out query.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCitationGapOnly(!citationGapOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                citationGapOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {citationGapOnly ? '✓ Competitor Cited Only' : 'Filter: Competitor Cited & Target Missing'}
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search query, URL or missing info..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white"
            >
              <option value="all">All Coverage Statuses</option>
              <option value="Covered">Covered</option>
              <option value="Partially covered">Partially covered</option>
              <option value="Not covered">Not covered</option>
              <option value="Covered but not cited">Covered but not cited</option>
              <option value="Wrong page type">Wrong page type</option>
              <option value="Possible cannibalisation">Possible cannibalisation</option>
              <option value="Technical issue">Technical issue</option>
              <option value="Unable to verify">Unable to verify</option>
            </select>
          </div>

          <div>
            <select
              value={recFilter}
              onChange={(e) => setRecFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white"
            >
              <option value="all">All Recommended Actions</option>
              {actionOptions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Coverage Cards / Detailed Grid */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
            No coverage records match the selected filters.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const statusConfig = statusConfigs[item.coverageStatus] || statusConfigs['Unable to verify'];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={item.queryId || `cov-${idx}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header row: Query + Status Badge + Recommendation */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{item.query}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusConfig.label}</span>
                      </span>
                      {item.cluster && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                          {item.cluster}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap pt-0.5">
                      <span>
                        Confidence: <strong className="text-slate-800">{item.coverageConfidence || 85}%</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Action: <strong className="text-blue-900">{item.recommendedAction}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Target vs Competitor Citation Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                        item.isTargetDomainCited
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {item.isTargetDomainCited ? '✓ Target Domain Cited' : 'Target Not Cited'}
                    </span>
                    {item.isCompetitorCited && (
                      <span className="text-xs px-2.5 py-1 rounded-md border font-medium bg-amber-50 text-amber-900 border-amber-200">
                        Competitor Cited ({item.competingCitedDomains?.join(', ') || 'Competitors'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Best matching URL & Relevant Section */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-1">
                        Best Matching URL on {targetDomain}
                      </span>
                      {item.mostRelevantUrl ? (
                        <a
                          href={item.mostRelevantUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px] break-all bg-blue-50/50 p-2 rounded-lg border border-blue-100"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span>{item.mostRelevantUrl}</span>
                        </a>
                      ) : (
                        <div className="text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 italic">
                          No relevant matching URL found on target domain inventory.
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                        Relevant Section / Existing Coverage
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {item.relevantTextSection || 'Coverage details evaluating content depth.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Missing Information & Internal Links */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-1">
                        Missing Information / Gaps
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                        {item.missingInformation || 'No critical gaps noted.'}
                      </p>
                    </div>

                    {item.suggestedInternalLinks && item.suggestedInternalLinks.length > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-slate-500" /> Suggested Internal Linking Architecture
                        </span>
                        <ul className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          {item.suggestedInternalLinks.map((link, lIdx) => (
                            <li key={lIdx} className="text-[11px] text-slate-700 font-mono flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="truncate">{link}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
