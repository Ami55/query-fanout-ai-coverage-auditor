import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <p className="font-normal text-slate-600">
            © 2026 Query Fan-out &amp; AI Coverage Auditor. Developed by <strong className="font-semibold text-teal-700">Ami - SEO Girl</strong>. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400" /> Grounded Search & AI Coverage Intelligence
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Google Search Grounding via Gemini</span>
        </div>
      </div>
    </footer>
  );
};
