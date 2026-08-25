import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Search,
  Globe,
  Database,
  Layers,
  Award,
  FileCheck,
} from 'lucide-react';

interface Stage {
  id: number;
  label: string;
  desc: string;
}

const STAGES: Stage[] = [
  { id: 1, label: 'Understanding seed prompt', desc: 'Analyzing search intent, target audience, and subject entities...' },
  { id: 2, label: 'Generating predicted fan-out', desc: 'Decomposing query clusters across traveller intent stages...' },
  { id: 3, label: 'Running grounded searches', desc: 'Executing live Google Search queries via Gemini API grounding...' },
  { id: 4, label: 'Extracting citations', desc: 'Parsing cited domains, URLs, and text supports across runs...' },
  { id: 5, label: 'Analysing entities', desc: 'Extracting neighbourhoods, landmarks, and relationship mappings...' },
  { id: 6, label: 'Matching website pages', desc: 'Comparing target domain sitemap & content against fan-out queries...' },
  { id: 7, label: 'Scoring opportunities', desc: 'Calculating Frequency × Relevance × Intent × Gap × Potential...' },
  { id: 8, label: 'Preparing recommendations', desc: 'Synthesizing action items, executive summary, and quick wins...' },
];

interface AnalysisProgressModalProps {
  currentStage: number; // 1 to 8
  logMessages: string[];
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  currentStage,
  logMessages,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-teal-300 shadow-md mb-1">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Running Query Fan-out & Coverage Audit
          </h3>
          <p className="text-xs text-slate-500">
            Analyzing grounded queries, cited sources, and target domain coverage in real time.
          </p>
        </div>

        {/* Stages list */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {STAGES.map((stage) => {
            const isCompleted = currentStage > stage.id;
            const isCurrent = currentStage === stage.id;
            const isPending = currentStage < stage.id;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-300 shadow-2xs'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-white border-slate-100 opacity-40 text-slate-400'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                      {stage.id}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-semibold ${
                        isCurrent ? 'text-blue-950' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {stage.id}. {stage.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live execution log */}
        {logMessages.length > 0 && (
          <div className="bg-slate-900 rounded-xl p-3 text-[11px] font-mono text-slate-300 max-h-24 overflow-y-auto space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-teal-400 font-semibold mb-1">
              Live Activity Stream
            </div>
            {logMessages.slice(-4).map((msg, i) => (
              <div key={i} className="leading-snug truncate">
                <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
