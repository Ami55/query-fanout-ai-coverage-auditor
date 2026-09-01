import React, { useState } from 'react';
import {
  Sparkles,
  Globe,
  Users,
  Target,
  FileText,
  Upload,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  BookOpen,
  Info,
} from 'lucide-react';
import { AuditProjectInput } from '../types';
import { Tooltip } from './Tooltip';
import { HowItWorksModal } from './HowItWorksModal';
import { QUERY_FANOUT_PROXY_URL } from '../config';

interface InitialFormProps {
  onSubmit: (input: AuditProjectInput) => void;
  onLoadDemo: () => void;
  isLoading?: boolean;
}

export const InitialForm: React.FC<InitialFormProps> = ({
  onSubmit,
  onLoadDemo,
  isLoading = false,
}) => {
  const [seedPrompt, setSeedPrompt] = useState('What should a first-time traveller know before visiting Montreal?');
  const [destinationOrSubject, setDestinationOrSubject] = useState('Montreal');
  const [targetAudience, setTargetAudience] = useState('First-time travellers aged 55+');
  const [targetDomain, setTargetDomain] = useState('toursbylocals.com');
  const [competitorInput, setCompetitorInput] = useState('');
  const [competitorDomains, setCompetitorDomains] = useState<string[]>([
    'getyourguide.com',
    'viator.com',
    'tripadvisor.ca',
  ]);
  const [country, setCountry] = useState('Canada');
  const [language, setLanguage] = useState('English');
  const [businessObjective, setBusinessObjective] = useState(
    'Help travellers plan their visit and discover relevant private tour experiences.'
  );
  const [preferredConversionAction, setPreferredConversionAction] = useState(
    'Book a customized private tour with a verified local guide'
  );
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [sitemapStatus, setSitemapStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [sitemapMessage, setSitemapMessage] = useState('');
  const [extractedSitemapUrls, setExtractedSitemapUrls] = useState<string[]>([]);
  
  const [urlListText, setUrlListText] = useState('');
  const [gscFileUploaded, setGscFileUploaded] = useState(false);
  const [gscFileName, setGscFileName] = useState('');
  const [uploadedGscQueries, setUploadedGscQueries] = useState<Array<{ query: string; impressions?: number; clicks?: number; position?: number }>>([]);
  
  const [runsCount, setRunsCount] = useState<number>(3);
  const [depth, setDepth] = useState<'Quick' | 'Standard' | 'Deep'>('Deep');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Add competitor domain helper
  const handleAddCompetitor = () => {
    const trimmed = competitorInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (trimmed && !competitorDomains.includes(trimmed)) {
      setCompetitorDomains([...competitorDomains, trimmed]);
      setCompetitorInput('');
    }
  };

  const handleRemoveCompetitor = (domain: string) => {
    setCompetitorDomains(competitorDomains.filter((d) => d !== domain));
  };

  // Test / Fetch Sitemap
  const handleFetchSitemap = async () => {
    if (!sitemapUrl) return;
    setSitemapStatus('fetching');
    setSitemapMessage('Connecting to sitemap endpoint...');

    try {
      const res = await fetch('/api/fetch-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitemapUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSitemapStatus('error');
        setSitemapMessage(data.error || 'The sitemap could not be accessed. Upload the XML file below.');
      } else {
        setSitemapStatus('success');
        setSitemapMessage(`Successfully indexed ${data.extractedUrlsCount} destination & canonical URLs.`);
        setExtractedSitemapUrls(data.urls || []);
      }
    } catch (e: any) {
      setSitemapStatus('error');
      setSitemapMessage('Network error attempting to reach sitemap.');
    }
  };

  // Handle URL file upload
  const handleUrlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const xmlUrls = Array.from(content.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi))
          .map((match) => match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').replace(/&amp;/g, '&').trim())
          .filter((url) => /^https?:\/\//i.test(url));
        if (xmlUrls.length > 0) {
          const uniqueUrls = Array.from(new Set(xmlUrls));
          setUrlListText(uniqueUrls.join('\n'));
          setExtractedSitemapUrls(uniqueUrls);
          setSitemapStatus('success');
          setSitemapMessage(`Successfully imported ${uniqueUrls.length} URLs from the uploaded sitemap file.`);
        } else {
          setUrlListText(content);
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle GSC CSV upload
  const handleGscFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGscFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const lines = content.split('\n').filter((l) => l.trim());
        const queries: Array<{ query: string; impressions?: number; clicks?: number; position?: number }> = [];
        lines.slice(1, 30).forEach((line) => {
          const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols[0]) {
            queries.push({
              query: cols[0],
              clicks: Number(cols[1]) || 0,
              impressions: Number(cols[2]) || 0,
              position: Number(cols[3]) || 0,
            });
          }
        });
        setUploadedGscQueries(queries);
        setGscFileUploaded(true);
      }
    };
    reader.readAsText(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedPrompt.trim()) return;

    const manualUrls = urlListText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));

    const allUrls = Array.from(new Set([...extractedSitemapUrls, ...manualUrls]));

    const projectInput: AuditProjectInput = {
      seedPrompt: seedPrompt.trim(),
      destinationOrSubject: destinationOrSubject.trim(),
      targetAudience: targetAudience.trim(),
      targetDomain: targetDomain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      competitorDomains,
      country,
      language,
      businessObjective: businessObjective.trim(),
      preferredConversionAction: preferredConversionAction.trim(),
      sitemapUrl: sitemapUrl.trim() || undefined,
      uploadedUrls: allUrls.length > 0 ? allUrls : undefined,
      uploadedGscQueries: uploadedGscQueries.length > 0 ? uploadedGscQueries : undefined,
      runsCount,
      depth,
    };

    onSubmit(projectInput);
  };

  const loadMontrealExample = () => {
    setSeedPrompt('What should a first-time traveller know before visiting Montreal?');
    setDestinationOrSubject('Montreal');
    setTargetAudience('First-time travellers aged 55+');
    setTargetDomain('toursbylocals.com');
    setCompetitorDomains(['getyourguide.com', 'viator.com', 'tripadvisor.ca']);
    setBusinessObjective('Help travellers plan their visit and discover relevant private tour experiences.');
    setPreferredConversionAction('Book a customised private tour with a verified local guide');
    setSitemapUrl('https://www.toursbylocals.com/sitemap_destinations_ca.xml');
    setRunsCount(3);
    setDepth('Deep');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Intro hero card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" /> AI Search Visibility & Query Fan-out Auditor
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Configure Query Fan-out & Coverage Audit
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Analyze how AI systems decompose complex prompts into sub-queries, discover the sources and competitors they cite, match your website pages, and generate prioritized content gap opportunities.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer ring-2 ring-teal-300/50"
            >
              <BookOpen className="w-4 h-4 text-slate-950" /> Showcase Example: Montreal Travel Audit
            </button>
            <button
              type="button"
              onClick={loadMontrealExample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium border border-white/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Fill Form with Montreal Fields
            </button>
            <button
              type="button"
              onClick={() => setShowHowItWorks(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 text-xs font-medium border border-blue-400/30 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-blue-300" /> How It Works Guide
            </button>
          </div>
        </div>
      </div>

      {/* Main Configuration Form */}
      <form onSubmit={handleFormSubmit} className="space-y-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {/* Section 1: Core Prompt & Audience */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-600" /> 1. Seed Prompt & Search Context
            </h3>
            <span className="text-xs text-slate-400 font-medium">* Required</span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="seedPrompt" className="block text-xs font-bold text-slate-900 mb-1.5">
                Seed Prompt or Broad Topic <span className="text-red-500">*</span>
              </label>
              <textarea
                id="seedPrompt"
                rows={2}
                value={seedPrompt}
                onChange={(e) => setSeedPrompt(e.target.value)}
                required
                placeholder="e.g. What should a first-time traveller know before visiting Montreal?"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The seed prompt entered into AI Search or Google AI Overviews to trigger query decomposition.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="destinationOrSubject" className="block text-xs font-semibold text-slate-800 mb-1">
                  Destination, Product or Subject
                </label>
                <input
                  id="destinationOrSubject"
                  type="text"
                  value={destinationOrSubject}
                  onChange={(e) => setDestinationOrSubject(e.target.value)}
                  placeholder="e.g. Montreal"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label htmlFor="targetAudience" className="block text-xs font-semibold text-slate-800 mb-1">
                  Target Audience / User Persona
                </label>
                <input
                  id="targetAudience"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. First-time travellers aged 55+"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Target Domain & Competitors */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" /> 2. Target Domain & Competitors
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="targetDomain" className="block text-xs font-bold text-slate-900 mb-1">
                Target Domain <span className="text-red-500">*</span>
              </label>
              <input
                id="targetDomain"
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                required
                placeholder="e.g. toursbylocals.com"
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The primary website whose coverage and citations will be audited.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Competitor Domains (Multiple)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompetitor())}
                  placeholder="e.g. getyourguide.com"
                  className="flex-1 px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Competitor Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {competitorDomains.map((comp) => (
                  <span
                    key={comp}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                  >
                    <span>{comp}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(comp)}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label htmlFor="country" className="block text-xs font-semibold text-slate-800 mb-1">
                Target Country
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Canada"
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label htmlFor="language" className="block text-xs font-semibold text-slate-800 mb-1">
                Language
              </label>
              <input
                id="language"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English"
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Business Objectives & Preferred Conversion */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> 3. Business Context & Strategy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="businessObjective" className="block text-xs font-semibold text-slate-800 mb-1">
                Business Objective
              </label>
              <input
                id="businessObjective"
                type="text"
                value={businessObjective}
                onChange={(e) => setBusinessObjective(e.target.value)}
                placeholder="Help travellers plan their visit and discover relevant private tour experiences."
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="preferredConversionAction" className="block text-xs font-semibold text-slate-800 mb-1">
                Preferred Conversion Action
              </label>
              <input
                id="preferredConversionAction"
                type="text"
                value={preferredConversionAction}
                onChange={(e) => setPreferredConversionAction(e.target.value)}
                placeholder="Book a customised private tour with a verified local guide"
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Website Content, Sitemap & GSC Data */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" /> 4. Sitemap, URL Inventory & GSC Data
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="sitemapUrl" className="block text-xs font-semibold text-slate-800 mb-1">
                Sitemap URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  id="sitemapUrl"
                  type="url"
                  value={sitemapUrl}
                  onChange={(e) => {
                    setSitemapUrl(e.target.value);
                    setSitemapStatus('idle');
                  }}
                  placeholder="e.g. https://example.com/sitemap.xml"
                  className="flex-1 px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={handleFetchSitemap}
                  disabled={sitemapStatus === 'fetching' || !sitemapUrl}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sitemapStatus === 'fetching' ? 'Fetching...' : 'Verify Sitemap'}
                </button>
              </div>

              {sitemapStatus === 'success' && (
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {sitemapMessage}
                </p>
              )}
              {sitemapStatus === 'error' && (
                <p className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {sitemapMessage} (You can also paste URLs manually below)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <label htmlFor="urlListText" className="block text-xs font-semibold text-slate-800">
                    Upload Sitemap / URL List (or Paste URLs)
                  </label>
                </div>
                <textarea
                  id="urlListText"
                  value={urlListText}
                  onChange={(e) => setUrlListText(e.target.value)}
                  placeholder="https://www.toursbylocals.com/Montreal-Tours&#10;https://www.toursbylocals.com/montreal-old-city-walking-tour"
                  className="w-full h-28 px-3.5 py-2.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                />
                <div className="mt-1.5 flex items-center">
                  <label className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center gap-1 font-medium">
                    <Upload className="w-3 h-3" /> Upload XML, text or CSV file
                    <input type="file" accept=".xml,.txt,.csv,text/xml,application/xml" onChange={handleUrlFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Upload GSC Query Performance CSV (Optional)
                  </label>
                  {gscFileUploaded && (
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Loaded
                    </span>
                  )}
                </div>
                <div className="w-full h-28 border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center">
                  {gscFileUploaded ? (
                    <div className="space-y-1 my-auto">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> {gscFileName}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {uploadedGscQueries.length} query records imported
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setGscFileUploaded(false);
                          setUploadedGscQueries([]);
                          setGscFileName('');
                        }}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer font-medium"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block w-full h-full flex flex-col items-center justify-center py-1">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-slate-700 block">
                        Click or drag GSC Query export
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        CSV with Query, Clicks, Impressions, Position
                      </span>
                      <input type="file" accept=".csv" onChange={handleGscFileUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Run Parameters & Analysis Depth */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-teal-600" /> 5. Analysis Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-900">
                  Number of Grounded Analysis Runs: <span className="text-teal-700">{runsCount}</span>
                </label>
                <Tooltip content="Running multiple grounded searches reveals repeated queries, stable citations, and calculates an exact observation frequency percentage. Default is 5.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </Tooltip>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={runsCount}
                onChange={(e) => setRunsCount(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 run (Quick check)</span>
                <span>5 runs (Recommended standard)</span>
                <span>10 runs (Exhaustive)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Analysis Depth & Scope
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Quick', 'Standard', 'Deep'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                      depth === d
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Action Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Executes real-time Gemini grounded search, extracts cited domains, audits target coverage, and scores content gaps.
          </div>

          <button
            type="submit"
            disabled={isLoading || !seedPrompt.trim()}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 hover:from-slate-800 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Run Query Fan-out Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* How It Works Guide Modal */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </div>
  );
};
