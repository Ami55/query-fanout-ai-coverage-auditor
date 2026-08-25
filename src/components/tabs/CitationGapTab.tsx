import React, { useState, useMemo } from 'react';
import { CitationGapItem, SourceType } from '../../types';
import {
  Layers,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Search,
  Zap,
} from 'lucide-react';

interface CitationGapTabProps {
  citations: CitationGapItem[];
  targetDomain: string;
  onNavigateToActions?: () => void;
}

export const CitationGapTab: React.FC<CitationGapTabProps> = ({
  citations = [],
  targetDomain,
  onNavigateToActions,
}) => {
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const sourceTypes = useMemo(() => {
    return Array.from(new Set(citations.map((c) => c.sourceType))).sort();
  }, [citations]);

  // Aggregate citations by domain
  const domainAggregates = useMemo(() => {
    const map = new Map<
      string,
      {
        domain: string;
        sourceType: SourceType;
        count: number;
        sampleUrls: string[];
        isCompetitor: boolean;
        isTargetDomain: boolean;
        gapReason?: string;
        targetEligibilityAdvice?: string;
      }
    >();

    citations.forEach((c) => {
      if (!map.has(c.domain)) {
        map.set(c.domain, {
          domain: c.domain,
          sourceType: c.sourceType,
          count: c.citationCount || 1,
          sampleUrls: [c.url],
          isCompetitor: c.isCompetitor,
          isTargetDomain: c.isTargetDomain,
          gapReason: c.gapReason,
          targetEligibilityAdvice: c.targetEligibilityAdvice,
        });
      } else {
        const item = map.get(c.domain)!;
        item.count += (c.citationCount || 1);
        if (!item.sampleUrls.includes(c.url)) {
          item.sampleUrls.push(c.url);
        }
      }
    });

    return Array.from(map.values())
      .filter((item) => {
        if (searchFilter) {
          const q = searchFilter.toLowerCase();
          const match =
            item.domain.toLowerCase().includes(q) ||
            item.sourceType.toLowerCase().includes(q) ||
            item.sampleUrls.some((u) => u.toLowerCase().includes(q));
          if (!match) return false;
        }
        if (selectedSourceType !== 'all' && item.sourceType !== selectedSourceType) return false;
        return true;
      })
      .sort((a, b) => b.count - a.count);
  }, [citations, searchFilter, selectedSourceType]);

  const totalCitations = useMemo(() => {
    return citations.reduce((acc, c) => acc + (c.citationCount || 1), 0) || 1;
  }, [citations]);

  const competitorGaps = useMemo(() => {
    return citations.filter((c) => c.isCompetitor || Boolean(c.gapReason));
  }, [citations]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Citation Share & Competitor Authority Gaps
            </h2>
            <p className="text-xs text-slate-500">
              Analysis of verified Google Search grounding citations, domain authority types, and recommendations to earn citations for {targetDomain}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
              {totalCitations} Total Sources Cited
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search domains or URLs..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:bg-white"
            >
              <option value="all">All Source Classifications</option>
              {sourceTypes.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Domain Aggregates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" /> Top Cited Domains & Authority Types
            </h3>
            <p className="text-xs text-slate-500">Domains referenced by Google Search grounding across all runs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">Domain</th>
                <th className="py-3 px-4">Source Classification</th>
                <th className="py-3 px-4 text-center">Citations</th>
                <th className="py-3 px-4 text-center">Share (%)</th>
                <th className="py-3 px-4 min-w-[260px]">Sample Cited URLs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {domainAggregates.map((item, idx) => {
                const isTarget = item.isTargetDomain || item.domain.toLowerCase().includes(targetDomain.toLowerCase());
                const sharePct = Math.round((item.count / totalCitations) * 100);

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isTarget ? 'bg-teal-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span>{item.domain}</span>
                      {isTarget && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                          Target Domain
                        </span>
                      )}
                      {item.isCompetitor && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Competitor
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {item.sourceType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{item.count}</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-900">{sharePct}%</td>
                    <td className="py-3 px-4 space-y-1">
                      {item.sampleUrls.slice(0, 2).map((u, uIdx) => (
                        <a
                          key={uIdx}
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{u}</span>
                        </a>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitor Gap Analysis & Recommendations */}
      {competitorGaps.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Grounding Competitor Gaps & Citation Requirements
              </h3>
              <p className="text-xs text-slate-500">
                Why competitors gained citations on key fan-out queries and what {targetDomain} must add to earn citations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitorGaps.map((gap) => (
              <div
                key={gap.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Domain: {gap.domain}
                    </span>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      Source Type: <span className="text-slate-700">{gap.sourceType}</span>
                    </div>
                  </div>

                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {gap.citationCount} Citations ({gap.citationShare}%)
                  </span>
                </div>

                {gap.associatedQueries && gap.associatedQueries.length > 0 && (
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase mb-1">
                      Associated Queries:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {gap.associatedQueries.map((q, qIdx) => (
                        <span key={qIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                          “{q}”
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gap reason */}
                {gap.gapReason && (
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Authority / Grounding Advantage:
                    </span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                      {gap.gapReason}
                    </p>
                  </div>
                )}

                {/* Advice */}
                {gap.targetEligibilityAdvice && (
                  <div className="space-y-1 text-xs">
                    <span className="text-teal-700 block text-[11px] font-semibold uppercase">
                      Action Required for {targetDomain}:
                    </span>
                    <p className="text-slate-800 bg-teal-50/50 p-2.5 rounded-lg border border-teal-200 leading-relaxed font-medium">
                      {gap.targetEligibilityAdvice}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
