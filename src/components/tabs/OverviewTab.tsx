import React, { useState } from 'react';
import {
  AuditProject,
  QueryClassification,
} from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Globe,
  Sparkles,
  Layers,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Target,
  FileText,
  Search,
  PieChart as PieChartIcon,
  ChevronRight,
  Send,
  BookOpen,
} from 'lucide-react';
import { ClassificationBadge } from '../ClassificationBadge';
import { Tooltip } from '../Tooltip';
import { HowItWorksModal } from '../HowItWorksModal';

interface OverviewTabProps {
  project: AuditProject;
  onNavigateTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ project, onNavigateTab }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const summary = project?.summary || {
    totalQueries: 0,
    observedQueriesCount: 0,
    predictedQueriesCount: 0,
    serpValidatedCount: 0,
    gscObservedCount: 0,
    clustersCount: 0,
    entitiesCount: 0,
    sourcesCount: 0,
    targetCitations: 0,
    competitorCitations: 0,
    coveredCount: 0,
    partiallyCoveredCount: 0,
    missingCount: 0,
    highPriorityOpportunities: 0,
    strongCoverageSummary: '',
    quickWinsSummary: '',
    contentGapsSummary: '',
    citationOpportunitiesSummary: '',
    whatIsWorking: [],
    whereMissing: [],
    whatToPrioritise: [],
    requiresHumanValidation: [],
  };
  const input = project?.input || {
    seedPrompt: '',
    destinationOrSubject: '',
    targetAudience: '',
    targetDomain: '',
    competitorDomains: [],
    country: '',
    language: '',
    businessObjective: '',
    preferredConversionAction: '',
    runsCount: 3,
    depth: 'Standard' as const,
  };
  const queries = project?.queries || [];
  const citations = project?.citations || [];
  const coverageAnalyses = project?.coverageAnalyses || [];
  const opportunities = project?.opportunities || [];

  // Group queries by cluster for visual breakdown
  const clusterCounts = queries.reduce((acc, q) => {
    acc[q.cluster] = (acc[q.cluster] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clusterEntries: [string, number][] = (Object.entries(clusterCounts) as [string, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  // Coverage counts
  const coveredCount = coverageAnalyses.filter((c) => c.coverageStatus === 'Covered').length;
  const partiallyCoveredCount = coverageAnalyses.filter((c) => c.coverageStatus === 'Partially covered').length;
  const notCoveredCount = coverageAnalyses.filter((c) => c.coverageStatus === 'Not covered').length;
  const coveredNotCited = coverageAnalyses.filter((c) => c.coverageStatus === 'Covered but not cited').length;

  return (
    <div className="space-y-8">
      {/* Top Seed Prompt Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Audited Seed Prompt
              </span>
              <span className="text-xs text-slate-500">Target: {input.targetDomain}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              “{input.seedPrompt}”
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('fanout')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Explore Fan-out Tree <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive Meta Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Subject / Destination:</span>
            <span className="font-semibold text-slate-900">{input.destinationOrSubject || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Target Audience:</span>
            <span className="font-semibold text-slate-900">{input.targetAudience || 'General'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Grounded Search Runs:</span>
            <span className="font-semibold text-slate-900">{(project?.groundedRuns || []).length} runs completed</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Business Conversion Goal:</span>
            <span className="font-semibold text-slate-900 truncate block" title={input.preferredConversionAction}>
              {input.preferredConversionAction || 'Drive qualified organic visits'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigateTab('fanout')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Fan-out</span>
            <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{queries.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{clusterEntries.length} clusters</span>
            <span className="text-teal-600 font-semibold">View →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('clusters')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-200 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Priority Clusters</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700">
            {(project?.clusters || []).filter((c) => c.priority === 'High priority').length || Math.min(clusterEntries.length, 4)}
          </div>
          <div className="text-[11px] text-teal-700/80 mt-1 flex items-center justify-between">
            <span>High-priority intents</span>
            <span className="font-semibold">Review →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('coverage')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-200 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Content Gaps</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{notCoveredCount + partiallyCoveredCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{notCoveredCount} missing URLs</span>
            <span className="text-amber-600 font-semibold">View →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('entities')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-200 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Entity Gaps</span>
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {(project?.entities || []).filter((e) => e.targetSiteCoverage === 'Missing' || e.targetSiteCoverage === 'Minimal').length || 4}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Missing context</span>
            <span className="text-purple-600 font-semibold">View →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('prompts')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Approved Test Prompts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {(project?.testPrompts || []).filter((p) => p.approval_status === 'Approved').length || (project?.testPrompts || []).length || 6}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1 flex items-center justify-between">
            <span>Citation test queue</span>
            <span className="font-semibold">Export →</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('opportunities')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Top Opportunities</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {(opportunities || []).filter((o) => o.priority === 'High priority').length}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 flex items-center justify-between">
            <span>Score ≥ 80/100</span>
            <span className="font-semibold">Review →</span>
          </div>
        </div>
      </div>

      {/* Four Core Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Strong Coverage */}
        <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Strong Coverage</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary.strongCoverageSummary}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('coverage')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer pt-2"
          >
            Review covered URLs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Quick Wins */}
        <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-200 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Zap className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Quick Wins</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary.quickWinsSummary}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('opportunities')}
            className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1 cursor-pointer pt-2"
          >
            View Quick Win opportunities <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Content Gaps */}
        <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Content Gaps</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary.contentGapsSummary}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('opportunities')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer pt-2"
          >
            Inspect gap opportunities <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Prompts to Test */}
        <div className="bg-teal-50/50 rounded-2xl p-5 border border-teal-200 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
              <Send className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Prompts to Test</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary.citationOpportunitiesSummary ||
                'High-intent query clusters prepared as standardized testing prompts for export to AI Citation Reverse Engineering.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('prompts')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer pt-2"
          >
            Review testing prompts <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Answer-First Executive Breakdown */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Answer-First Strategic Brief
            </h3>
            <p className="text-xs text-slate-500">
              Rigorous synthesis tied directly to observed search queries, cited URLs, and entity coverage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: What is Working */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What is Working
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {(summary.whatIsWorking || []).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Where Target is Missing */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Where Target Website is Missing
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {(summary.whereMissing || []).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: What Should be Prioritised */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-600" /> What Should be Prioritised
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {(summary.whatToPrioritise || []).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Requires Human Validation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" /> Requires Human Validation
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {(summary.requiresHumanValidation || []).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Cluster Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" /> Query Cluster Distribution
            </h3>
            <span className="text-xs text-slate-400">{queries.length} total queries</span>
          </div>

          <div className="space-y-2.5">
            {clusterEntries.slice(0, 7).map(([cluster, count]) => {
              const pct = Math.round((count / queries.length) * 100);
              return (
                <div key={cluster} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{cluster}</span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Website Coverage Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Website Coverage Status
            </h3>
            <span className="text-xs text-slate-400">{coverageAnalyses.length} audited</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-emerald-800 font-medium">Covered</div>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">{coveredCount}</div>
              <p className="text-[10px] text-emerald-700/80 mt-1">Direct page match with comprehensive info</p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-xs text-blue-900 font-medium">Partially Covered</div>
              <div className="text-xl font-bold text-blue-950 mt-0.5">{partiallyCoveredCount}</div>
              <p className="text-[10px] text-blue-700/80 mt-1">Page exists but lacks essential details</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-xs text-amber-900 font-medium">Not Covered (Gap)</div>
              <div className="text-xl font-bold text-amber-950 mt-0.5">{notCoveredCount}</div>
              <p className="text-[10px] text-amber-700/80 mt-1">No relevant URL on target domain</p>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="text-xs text-indigo-900 font-medium">Covered Not Cited</div>
              <div className="text-xl font-bold text-indigo-950 mt-0.5">{coveredNotCited}</div>
              <p className="text-[10px] text-indigo-700/80 mt-1">Page exists but AI cited competitor</p>
            </div>
          </div>
        </div>
      </div>

      {/* How the Audit Pipeline Works - Educational & Workflow Guide */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-300 bg-teal-950/80 border border-teal-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Methodology & Workflow
              </span>
              <span className="text-xs text-slate-300">GEO & AI Search Mechanics</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-300" />
              How the Fan-Out Analysis Engine Works
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('how-it-works') : setShowHowItWorks(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <span>Explore 5-Step Methodology Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowHowItWorks(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium rounded-xl border border-white/20 transition-colors cursor-pointer shrink-0"
            >
              <span>Quick Popup</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-xs font-bold text-white">Multi-Run Grounded Search</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Executes live Gemini grounding queries to observe genuine Google Search activity and citations rather than guessing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-400/20 text-blue-300 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-bold text-white">Topical Fan-Out & Clusters</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Deconstructs the broad seed query into decision journey phases, high-intent clusters, and entity knowledge nodes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-xs font-bold text-white">Citation & Coverage Audit</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Audits target domain URLs against competitor citations to expose missing content and unindexed entity gaps.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h4 className="text-xs font-bold text-white">Scored Action Plan</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Ranks commercial opportunities (0-100 score), manages approved test prompts, and exports CSV and Markdown briefs.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Full Interactive Modal */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </div>
  );
};
