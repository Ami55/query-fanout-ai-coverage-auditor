import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  Globe,
  Layers,
  Target,
  CheckCircle2,
  Zap,
  Send,
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  Cpu,
  BarChart3,
  ListOrdered,
  FileCheck,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewAudit?: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenNewAudit,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'concept',
      title: '1. Core Concept & AI Fan-Out',
      icon: Sparkles,
      tag: 'GEO & AI Search',
      heading: 'What is Query Fan-Out in AI Search Engines?',
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
        root: 'Seed: "First-time visitor to Montreal (55+)"',
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
      icon: Globe,
      tag: 'Live Observation',
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
      icon: Layers,
      tag: 'Semantic Architecture',
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
      icon: Zap,
      tag: 'Prioritization',
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
      icon: Send,
      tag: 'Workflow & Export',
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

  const currentStepData = steps[activeStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  How It Works &amp; Operating Instructions
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  5-Step Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Five guided steps for running, reviewing and exporting an AI coverage audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 shrink-0 overflow-x-auto">
          <div className="flex space-x-2 min-w-max pb-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-300' : 'text-slate-500'}`} />
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Active Step Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {currentStepData.tag}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {currentStepData.heading}
              </h3>
            </div>
            <div className="text-xs text-slate-400 font-medium shrink-0">
              Step {activeStep + 1} of {steps.length}
            </div>
          </div>

          {/* Overview Description */}
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {currentStepData.description}
          </p>

          {/* Detailed Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentStepData.details.map((detail, dIdx) => (
              <div
                key={dIdx}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold inline-flex items-center justify-center shrink-0">
                      {dIdx + 1}
                    </span>
                    {detail.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    {detail.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Architecture Diagram Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-teal-300">
                Example Architecture Pipeline
              </span>
              <span className="text-[11px] text-slate-400">Step {activeStep + 1} Workflow</span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-white flex items-center gap-2">
                <StepIcon className="w-4 h-4 text-teal-300 shrink-0" />
                <span>{currentStepData.diagram.root}</span>
              </div>

              <div className="pl-6 space-y-1.5 border-l-2 border-dashed border-teal-500/40 ml-4 py-1">
                {currentStepData.diagram.branches.map((branch, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-2 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-200 flex items-center gap-2"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{branch}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={activeStep === steps.length - 1}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNewAudit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNewAudit();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Start New Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
