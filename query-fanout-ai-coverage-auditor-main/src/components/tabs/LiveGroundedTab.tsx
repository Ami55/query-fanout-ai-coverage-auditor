import React, { useState } from 'react';
import { GroundedRun, FanoutQuery } from '../../types';
import {
  Globe,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
  Clock,
  TrendingUp,
  Search,
} from 'lucide-react';
import { ClassificationBadge } from '../ClassificationBadge';
import { Tooltip } from '../Tooltip';

interface LiveGroundedTabProps {
  groundedRuns: GroundedRun[];
  queries: FanoutQuery[];
}

export const LiveGroundedTab: React.FC<LiveGroundedTabProps> = ({
  groundedRuns = [],
  queries = [],
}) => {
  const [activeRunIndex, setActiveRunIndex] = useState(0);

  const safeGroundedRuns = groundedRuns || [];
  const activeRun = safeGroundedRuns[activeRunIndex] || safeGroundedRuns[0];

  // Calculate aggregated observation frequency across all completed runs
  const totalRuns = safeGroundedRuns.length || 1;
  const observedMap = new Map<
    string,
    {
      query: string;
      runs: number[];
      count: number;
    }
  >();

  safeGroundedRuns.forEach((run, rIdx) => {
    const runNum = rIdx + 1;
    (run.executedSearchQueries || []).forEach((qStr) => {
      const norm = qStr.trim().toLowerCase();
      if (!observedMap.has(norm)) {
        observedMap.set(norm, {
          query: qStr,
          runs: [runNum],
          count: 1,
        });
      } else {
        const item = observedMap.get(norm)!;
        if (!item.runs.includes(runNum)) {
          item.runs.push(runNum);
          item.count += 1;
        }
      }
    });
  });

  const aggregatedObservedQueries = Array.from(observedMap.values()).sort(
    (a, b) => b.count - a.count
  );

  const sourcesCited = activeRun
    ? ((activeRun as any).sourcesCited || activeRun.citedChunks || [])
    : [];
  const responseText = activeRun
    ? (activeRun.groundedResponseText || (activeRun as any).responseText || '')
    : '';

  return (
    <div className="space-y-8">
      {/* Top Banner / Explanation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Live Grounded Search Analysis (Gemini Grounding API)
              </h2>
              <p className="text-xs text-slate-500">
                Inspect raw search queries executed by Google Search grounding across {groundedRuns.length} runs.
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            {aggregatedObservedQueries.length} Distinct Search Queries Observed
          </div>
        </div>
      </div>

      {/* Aggregated Observation Frequency Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Aggregated Query Observation Frequency
            </h3>
            <p className="text-xs text-slate-500">
              Calculated exactly as: <code className="text-[11px] bg-slate-200 px-1 py-0.5 rounded font-mono">Number of runs containing query ÷ Total completed runs ({totalRuns})</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 min-w-[260px]">Observed Search Query</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-center">Observation Count</th>
                <th className="py-3 px-4 text-center">Frequency (%)</th>
                <th className="py-3 px-4 text-center">Runs Detected</th>
                <th className="py-3 px-4 text-center">Stability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {aggregatedObservedQueries.map((item, idx) => {
                const freqPct = Math.round((item.count / totalRuns) * 100);
                const stability =
                  freqPct >= 80 ? 'High' : freqPct >= 50 ? 'Medium' : 'Variable';
                const stabilityBg =
                  stability === 'High'
                    ? 'bg-emerald-100 text-emerald-800'
                    : stability === 'Medium'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-700';

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 text-xs sm:text-sm">
                      {item.query}
                    </td>
                    <td className="py-3 px-4">
                      <ClassificationBadge classification="Observed Gemini Search Query" size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {item.count} of {totalRuns} runs
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-800 text-xs px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                        {freqPct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {groundedRuns.map((_, rIdx) => {
                          const runNum = rIdx + 1;
                          const hit = item.runs.includes(runNum);
                          return (
                            <span
                              key={runNum}
                              className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-semibold ${
                                hit
                                  ? 'bg-emerald-700 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}
                              title={hit ? `Observed in Run ${runNum}` : `Not observed in Run ${runNum}`}
                            >
                              {runNum}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${stabilityBg}`}
                      >
                        {stability}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Grounded Run Deep Dive */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Individual Grounded Run Inspector
            </h3>
            <p className="text-xs text-slate-500">
              Inspect the exact response text, source URLs, and search query execution for each individual run
            </p>
          </div>

          {/* Run Switcher Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
            {groundedRuns.map((run, rIdx) => (
              <button
                key={run.id || rIdx}
                onClick={() => setActiveRunIndex(rIdx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeRunIndex === rIdx
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Run {run.runNumber || rIdx + 1}
              </button>
            ))}
          </div>
        </div>

        {activeRun ? (
          <div className="space-y-6">
            {/* Executed Queries for this run */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Queries Executed by Model in Run {activeRun.runNumber}
              </h4>
              <div className="flex flex-wrap gap-2">
                {(activeRun.executedSearchQueries || []).map((q, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-slate-900 text-xs"
                  >
                    <span className="font-semibold">{q}</span>
                    <ClassificationBadge classification="Observed Gemini Search Query" size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Grounded Response Text with Highlights */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Synthesized Grounded AI Response
              </h4>
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                {responseText}
              </div>
            </div>

            {/* Sources & Domains Cited */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Sources & Destination URLs Cited ({sourcesCited.length})</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Grounding chunks mapped from web search call
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sourcesCited.map((source: any, sIdx: number) => {
                  const sourceUrl = source.uri || source.url || '';
                  return (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-1.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 line-clamp-1">{source.title || source.domain}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0 font-medium">
                          {source.domain}
                        </span>
                      </div>

                      {source.snippet && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {source.snippet}
                        </p>
                      )}

                      {sourceUrl && (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium truncate pt-1"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{sourceUrl}</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No grounded run data available.
          </div>
        )}
      </div>
    </div>
  );
};
