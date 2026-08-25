import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  Globe,
  Layers,
  Zap,
  Send,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  Cpu,
  BarChart3,
  ListOrdered,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Target,
  FileSpreadsheet,
  Workflow,
  Compass,
} from 'lucide-react';

interface HowItWorksTabProps {
  onStartNewAudit?: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const HowItWorksTab: React.FC<HowItWorksTabProps> = ({
  onStartNewAudit,
  onNavigateTab,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'concept',
      title: '1. Core Concept & AI Fan-Out',
      shortTitle: 'Concept & Fan-Out',
      icon: Sparkles,
      tag: 'GEO & AI Search Paradigm',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      heading: 'What is Query Fan-Out in Modern AI Search Engines?',
      description:
        'When a user asks an AI search engine (such as Google AI Overviews, Gemini, SearchGPT, or Perplexity) a broad prompt like "What should a first-time traveller know before visiting Montreal?", the model does not run a single keyword search. Instead, it breaks down the query into multiple sub-queries, entity lookups, and specialized follow-ups.',
      details: [
        {
          title: 'The Single Prompt to Multi-Query Paradigm',
          body: 'A single high-level question dynamically expands into dozens of sub-topics: safety tips, neighbourhood guides, public transit passes, seasonal clothing, tipping customs, and localized booking intents.',
        },
        {
          title: 'Why Traditional SEO Misses Fan-Out Gaps',
          body: 'Traditional SEO monitors 10 blue links for static keywords. AI engines aggregate information across multi-turn grounding searches, citing domains that best answer specific sub-entities and contextual caveats.',
        },
        {
          title: 'Classification Standard',
          body: 'Every query in this explorer is strictly classified as Observed (actually run in Gemini live grounding), SERP-Validated, AI-Predicted, or GSC-Observed.',
        },
      ],
      diagram: {
        root: 'Seed Prompt: "First-time visitor to Montreal (55+)"',
        branches: [
          'Montreal public transit OPUS card for seniors',
          'Old Montreal cobblestone walking safety',
          'Is tipping 15% standard in Quebec restaurants?',
          'Best small group private walking tours Old Port',
        ],
      },
    },
    {
      id: 'grounding',
      title: '2. Multi-Run Grounded Search',
      shortTitle: 'Multi-Run Grounding',
      icon: Globe,
      tag: 'Live Observation',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      heading: 'Observing Real Gemini Search Execution Across Multiple Runs',
      description:
        'To uncover genuine search behavior rather than pure guesswork, the system executes real Gemini API calls with Google Search Grounding enabled across multiple runs (3 to 5 iterations).',
      details: [
        {
          title: 'Capturing "webSearchQueries"',
          body: 'We extract the exact search strings Gemini generated and executed to fetch web grounding context, recording observation frequencies and search variation patterns.',
        },
        {
          title: 'Citation & Source Chunk Mapping',
          body: 'Every domain cited in the model response is extracted, attributed, and indexed against target and competitor domains to calculate baseline share of voice.',
        },
        {
          title: 'Frequency & Stability Analysis',
          body: 'Queries executed across 100% of runs represent core non-negotiable intent anchors, while single-run queries reveal niche long-tail fan-out paths.',
        },
      ],
      diagram: {
        root: 'Gemini Multi-Run Grounding Engine',
        branches: [
          'Run 1: Captures 6 live web search queries + 8 cited sources',
          'Run 2: Explores alternate angle with 5 search variations',
          'Run 3: Validates seasonal & demographic intent nuances',
        ],
      },
    },
    {
      id: 'clustering',
      title: '3. Intent Clustering & Entity Graphs',
      shortTitle: 'Topical Architecture',
      icon: Layers,
      tag: 'Semantic Architecture',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      heading: 'Structuring Fan-out into Actionable Clusters & Entity Maps',
      description:
        'Raw queries are synthesized into topical journey clusters, aligned with customer decision stages, and mapped to an entity knowledge graph.',
      details: [
        {
          title: 'User Journey Classification',
          body: 'Queries are mapped into 5 clear stages: Initial Discovery & Orientation, Planning & Research, Comparison & Evaluation, Logistics & Practicalities, and Direct Booking & Transaction.',
        },
        {
          title: 'Entity Relationship Modeling',
          body: 'We extract key named entities (landmarks, transit networks, cultural concepts, brands) and evaluate whether your target site has strong, partial, or missing coverage.',
        },
        {
          title: 'Cluster Health & Opportunity Formulas',
          body: 'Each cluster displays estimated volume, dominant search intent, target domain coverage status, and quick-win opportunity potential.',
        },
      ],
      diagram: {
        root: 'Query Cluster Hierarchy',
        branches: [
          'Cluster: Transit & Mobility (Logistics Stage, 1,900 Est. Vol)',
          'Cluster: Historic Neighbourhoods (Discovery Stage, 4,200 Est. Vol)',
          'Cluster: Verified Private Guides (Transaction Stage, 1,100 Est. Vol)',
        ],
      },
    },
    {
      id: 'scoring',
      title: '4. Scoring Matrix & Action Plan',
      shortTitle: 'Opportunity Scoring',
      icon: Zap,
      tag: 'Prioritization Matrix',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      heading: 'Automated Opportunity Scoring & Content Action Backlog',
      description:
        'Not all queries have equal business value. Our scoring engine computes a composite Opportunity Score (0-100) to prioritize high-impact optimizations.',
      details: [
        {
          title: 'The Composite Scoring Formula',
          body: 'Calculated Score = (Commercial Relevance × 0.40) + (Intent Value × 0.30) + (Observation Frequency × 0.20) + (Target Coverage Gap × 0.10).',
        },
        {
          title: 'Action Plan Categorization',
          body: 'Generates prioritized tasks across 5 workstreams: New Content Creation, Page Optimization, Entity & Schema Expansion, Internal Linking, and Authority/Citation Building.',
        },
        {
          title: 'Ready for Editorial Handoff',
          body: 'Tasks include target URLs, evidence from AI grounding, recommended content formats (FAQ, comparison guide, itinerary), and estimated impact.',
        },
      ],
      diagram: {
        root: 'Opportunity Scoring Matrix',
        branches: [
          'High Priority (Score 80-100): Immediate content creation / citation gap fix',
          'Medium Priority (Score 60-79): On-page entity & schema enhancement',
          'Monitor (Score <60): Long-tail informational topics',
        ],
      },
    },
    {
      id: 'testing',
      title: '5. Prompt Testing Queue & Export',
      shortTitle: 'Testing & Export',
      icon: Send,
      tag: 'Workflow & Delivery',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      heading: 'Exporting Approved Test Prompts & Multi-Format Reports',
      description:
        'Close the loop by creating prompt test suites to benchmark your visibility across LLMs over time, and export executive briefs or raw data.',
      details: [
        {
          title: 'Approved Test Prompts Suite',
          body: 'Filter and curate realistic consumer prompts across baseline, demographic, budget, constraint, and competitor comparison variations.',
        },
        {
          title: 'Structured Prompt Metadata',
          body: 'Each test prompt includes target domain, competitors to track, expected cited entities, cluster tag, and approval status.',
        },
        {
          title: 'Comprehensive Export Capabilities',
          body: 'Download findings in CSV (Queries, Coverage, Opportunities, Action Plan), JSON format, or a Markdown brief ready for client delivery.',
        },
      ],
      diagram: {
        root: 'Production Export Pipeline',
        branches: [
          'CSV / Spreadsheet: 4 separate granular data sheets',
          'JSON Schema: Machine-readable payload for automated prompt testing',
          'Executive Brief: Clean Markdown report with findings & next steps',
        ],
      },
    },
  ];

  const currentStep = steps[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-4 border border-teal-400/30">
            <Workflow className="w-3.5 h-3.5" /> Generative Engine Optimization (GEO) Methodology
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            How Query Fan-Out Explorer Works
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Understand how generative search engines break down broad seed prompts into multi-angle search queries, map citations to entities, audit your domain's coverage gaps, and prioritize revenue-driving optimizations.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {onStartNewAudit && (
              <button
                onClick={onStartNewAudit}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Start New Live Audit
              </button>
            )}
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('overview')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium border border-white/20 transition-all cursor-pointer"
              >
                View Montreal Demo Audit <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5-Step Pipeline Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-400">0{idx + 1}</span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Stage {idx + 1}
                </p>
                <p className={`text-xs font-bold mt-0.5 ${isActive ? 'text-blue-950' : 'text-slate-800'}`}>
                  {step.shortTitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Detail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Stage Explanation */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentStep.badgeColor}`}>
                  {currentStep.tag}
                </span>
                <span className="text-xs text-slate-400 font-medium">Stage {activeStep + 1} of 5</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {currentStep.heading}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {currentStep.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{detail.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{detail.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action buttons between stages */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeStep === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                ← Previous Stage
              </button>
              <button
                disabled={activeStep === steps.length - 1}
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeStep === steps.length - 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                }`}
              >
                Next Stage: {steps[Math.min(steps.length - 1, activeStep + 1)].shortTitle} →
              </button>
            </div>
          </div>

          {/* Right Column: Visual Diagram / Flow Simulation */}
          <div className="w-full lg:w-96 shrink-0 bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-inner flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <StepIcon className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Process Visualizer
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono">
                  Live Grounding
                </span>
              </div>

              {/* Root node */}
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 mb-4 text-center">
                <p className="text-[11px] font-semibold text-teal-300 uppercase tracking-wide mb-0.5">
                  Input / Anchor
                </p>
                <p className="text-xs font-bold text-white line-clamp-2">
                  {currentStep.diagram.root}
                </p>
              </div>

              {/* Connecting arrow */}
              <div className="flex justify-center my-2">
                <div className="w-0.5 h-4 bg-teal-500/50" />
              </div>

              {/* Branch nodes */}
              <div className="space-y-2">
                {currentStep.diagram.branches.map((branch, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                    <p className="text-xs text-slate-200 leading-snug">{branch}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom summary card */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Verified search activity via Google Search Grounding (Gemini 3.6 Flash).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-2">1. Grounded Search Observation</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instead of synthetic query generation, we execute real multi-run search grounding to extract verified <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[11px]">webSearchQueries</code> executed by the LLM.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-2">2. Entity & Gap Analysis</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Named entities and search intents are linked to your website's URL inventory to detect exact content gaps, weak authority nodes, and competitor citations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-2">3. Prioritized Opportunity Matrix</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Composite 0-100 opportunity scores convert complex search data into actionable briefs, schema upgrades, and prompt test suites for editorial execution.
          </p>
        </div>
      </div>
    </div>
  );
};
