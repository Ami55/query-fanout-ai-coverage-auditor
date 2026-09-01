import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Download,
  Save,
  PlusCircle,
  FolderOpen,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { AuditProject } from '../types';
import { HowItWorksModal } from './HowItWorksModal';

interface HeaderProps {
  currentProject: AuditProject | null;
  onNewAnalysis: () => void;
  onOpenExport: () => void;
  onSaveProject: () => void;
  onSelectProject: (project: AuditProject) => void;
  savedProjects: AuditProject[];
  isSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  onNewAnalysis,
  onOpenExport,
  onSaveProject,
  onSelectProject,
  savedProjects,
  isSaving,
}) => {
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner for Demo mode */}
      {currentProject?.isDemo && (
        <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-200 text-amber-900 uppercase tracking-wide">
              Demo data — not a live analysis
            </span>
            <span className="text-slate-700 hidden sm:inline">
              Viewing Montreal Travel Planning (55+ Travellers) demo project for ToursByLocals.
            </span>
            <span className="text-slate-600 sm:hidden">
              Viewing Montreal demo for ToursByLocals.
            </span>
            <button
              onClick={onNewAnalysis}
              className="ml-auto text-amber-900 hover:text-amber-950 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              Start Live Audit <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Branding & Subtitle */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Query Fan-out Explorer
                </h1>
                <button
                  type="button"
                  onClick={() => setShowHowItWorksModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>How It Works</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransparencyModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI Transparency</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 sm:line-clamp-none max-w-2xl">
                Discover how a broad user question can expand into related searches, subtopics, entities and content opportunities.
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            {/* Project Switcher Dropdown */}
            {savedProjects.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span className="max-w-[130px] truncate">
                    {currentProject?.name || 'Projects'}
                  </span>
                </button>

                {showProjectsDropdown && (
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Switch Analysis Project
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {savedProjects.map((proj) => (
                        <button
                          key={proj.id}
                          onClick={() => {
                            onSelectProject(proj);
                            setShowProjectsDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                            currentProject?.id === proj.id ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{proj.name}</span>
                          {proj.isDemo && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                              Demo
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentProject && (
              <>
                <button
                  type="button"
                  onClick={onSaveProject}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Save current project to workspace"
                >
                  <Save className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Save</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenExport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="Export reports in CSV, JSON or printable brief"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onNewAnalysis}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Transparency & Query Classification Modal */}
      {showTransparencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-0">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    AI Search Transparency & Classification Standards
                  </h3>
                  <p className="text-xs text-slate-500">
                    Core methodological principles & data classification rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTransparencyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 block font-semibold mb-0.5">
                    Query Fan-out & Grounding Scope Notice
                  </strong>
                  Query fan-out findings include a combination of observed, validated and predicted queries. This application does not have access to Google’s complete private AI Mode or AI Overview query logs. Detailed multi-platform citation testing is handled separately.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  How This Application Classifies Every Query:
                </h4>
                <ul className="space-y-2">
                  <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <strong className="text-emerald-700 font-semibold">1. Observed Gemini Search Query:</strong>
                    <p className="text-slate-600 mt-0.5">
                      A query actually executed by the Gemini grounded-search API (<code className="text-[11px] bg-slate-200 px-1 py-0.5 rounded">webSearchQueries</code>). Verified live search activity.
                    </p>
                  </li>
                  <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <strong className="text-indigo-700 font-semibold">2. AI-Predicted Fan-out:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Generated by the model based on search intent, entity relationships, and user journey needs. Always clearly labelled as predicted.
                    </p>
                  </li>
                  <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <strong className="text-blue-700 font-semibold">3. SERP-Validated Query:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Supported by Google autocomplete, related searches, People Also Ask boxes, or live organic search features.
                    </p>
                  </li>
                  <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <strong className="text-amber-700 font-semibold">4. GSC-Observed Query:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Extracted directly from connected or uploaded Google Search Console performance data files.
                    </p>
                  </li>
                  <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <strong className="text-teal-700 font-semibold">5. Human-Approved Opportunity:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Manually vetted and confirmed by content editors and strategists for implementation.
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTransparencyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={showHowItWorksModal}
        onClose={() => setShowHowItWorksModal(false)}
        onOpenNewAudit={() => {
          setShowHowItWorksModal(false);
          onNewAnalysis();
        }}
      />
    </header>
  );
};
