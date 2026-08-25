import React, { useState } from 'react';
import { AuditProject } from '../types';
import {
  Download,
  Copy,
  Check,
  FileText,
  FileSpreadsheet,
  Printer,
  Code,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  project: AuditProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const queries = project?.queries || [];
  const coverageAnalyses = project?.coverageAnalyses || [];
  const opportunities = project?.opportunities || [];
  const actionItems = project?.actionPlan || project?.actionItems || [];
  const citations = project?.citations || [];
  const summary = project?.summary || {
    totalQueries: queries.length,
    observedQueriesCount: 0,
    sourcesCount: citations.length,
    targetCitations: 0,
    coveredCount: 0,
    missingCount: 0,
    strongCoverageSummary: '',
    quickWinsSummary: '',
    contentGapsSummary: '',
    citationOpportunitiesSummary: '',
    whatIsWorking: [],
    whereMissing: [],
    whatToPrioritise: [],
    requiresHumanValidation: [],
  };

  // Helper to trigger browser file download
  const triggerDownload = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // CSV Generator for Queries
  const generateQueriesCSV = () => {
    const headers = [
      'Query',
      'Classification',
      'Parent Topic',
      'Cluster',
      'Search Intent',
      'Funnel Stage',
      'Observation Frequency (%)',
      'Commercial Relevance (1-5)',
      'Confidence (%)',
      'Expected Answer Type',
      'Relevant Entities',
      'Human Approved',
    ];
    const rows = queries.map((q) => [
      `"${(q.query || '').replace(/"/g, '""')}"`,
      `"${q.classification || ''}"`,
      `"${(q.parentTopic || '').replace(/"/g, '""')}"`,
      `"${(q.cluster || '').replace(/"/g, '""')}"`,
      `"${q.intent || ''}"`,
      `"${q.funnelStage || ''}"`,
      q.observationFrequency || 0,
      q.commercialRelevance || 3,
      q.confidence || 85,
      `"${(q.expectedAnswerType || '').replace(/"/g, '""')}"`,
      `"${(q.relevantEntities || []).join(', ')}"`,
      q.humanApproved ? 'Yes' : 'No',
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  // CSV Generator for Coverage
  const generateCoverageCSV = () => {
    const headers = [
      'Query',
      'Target Domain',
      'Coverage Status',
      'Confidence (%)',
      'Best Matching URL',
      'Relevant Section',
      'Missing Information',
      'Target Domain Cited',
      'Competitor Cited',
      'Recommended Action',
    ];
    const rows = coverageAnalyses.map((c) => [
      `"${(c.query || '').replace(/"/g, '""')}"`,
      `"${project?.input?.targetDomain || ''}"`,
      `"${c.coverageStatus || ''}"`,
      c.coverageConfidence || 85,
      `"${(c.mostRelevantUrl || '').replace(/"/g, '""')}"`,
      `"${(c.relevantTextSection || '').replace(/"/g, '""')}"`,
      `"${(c.missingInformation || '').replace(/"/g, '""')}"`,
      c.isTargetDomainCited ? 'Yes' : 'No',
      c.isCompetitorCited ? (c.competingCitedDomains || []).join('; ') || 'Yes' : 'No',
      `"${c.recommendedAction || ''}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  // CSV Generator for Opportunities
  const generateOpportunitiesCSV = () => {
    const headers = [
      'Query',
      'Cluster',
      'Priority',
      'Calculated Score (0-100)',
      'Search Intent',
      'Funnel Stage',
      'Target Site Coverage',
      'Competitor Cited',
      'Recommended Action',
      'Recommended Page',
      'Priority Reason',
      'Human Approved',
    ];
    const rows = opportunities.map((o) => [
      `"${(o.query || '').replace(/"/g, '""')}"`,
      `"${(o.cluster || '').replace(/"/g, '""')}"`,
      `"${o.priority || ''}"`,
      o.calculatedScore || 0,
      `"${o.intent || ''}"`,
      `"${o.funnelStage || ''}"`,
      `"${o.targetSiteCoverage || ''}"`,
      o.competitorCited ? 'Yes' : 'No',
      `"${o.recommendedAction || ''}"`,
      `"${(o.recommendedPage || '').replace(/"/g, '""')}"`,
      `"${(o.priorityReason || '').replace(/"/g, '""')}"`,
      o.humanApproved ? 'Yes' : 'No',
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  // CSV Generator for Action Items
  const generateActionsCSV = () => {
    const headers = [
      'Category',
      'Priority',
      'Title',
      'Supporting Query',
      'Recommended URL',
      'Reason',
      'Evidence',
      'Expected Impact',
      'Effort',
      'Owner',
      'Status',
    ];
    const rows = actionItems.map((a) => [
      `"${a.category || ''}"`,
      `"${a.priority || ''}"`,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${(a.supportingQuery || '').replace(/"/g, '""')}"`,
      `"${(a.recommendedUrl || '').replace(/"/g, '""')}"`,
      `"${(a.reason || '').replace(/"/g, '""')}"`,
      `"${(a.evidence || '').replace(/"/g, '""')}"`,
      `"${a.expectedImpact || ''}"`,
      `"${a.effort || ''}"`,
      `"${a.owner || ''}"`,
      `"${a.status || ''}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  // Executive Markdown Summary
  const generateExecutiveBriefText = () => {
    const workingList = (summary.whatIsWorking || []).map((w) => `- ${w}`).join('\n') || '- Grounded recognition of core offerings.';
    const missingList = (summary.whereMissing || []).map((m) => `- ${m}`).join('\n') || '- Uncovered long-tail planning queries.';
    const prioritiseList = (summary.whatToPrioritise || []).map((p) => `- ${p}`).join('\n') || '- High commercial intent gaps.';
    const topActions = actionItems.slice(0, 5).map((a) => `- [${a.priority}] ${a.title} (${a.category}) - ${a.status}`).join('\n') || '- No immediate backlog tasks.';

    return `# Query Fan-out & AI Coverage Audit Executive Brief
Project: ${project?.name || 'Audit Project'}
Seed Prompt: "${project?.input?.seedPrompt || ''}"
Target Domain: ${project?.input?.targetDomain || ''}
Destination / Subject: ${project?.input?.destinationOrSubject || 'N/A'}
Audience: ${project?.input?.targetAudience || 'General'}
Date: ${project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}

## Strategic Summary
- Total Fan-out Queries: ${queries.length}
- Observed Grounded Queries: ${summary.observedQueriesCount || 0}
- Sources Cited: ${citations.length}
- Target Domain Citations: ${summary.targetCitations || 0}
- Covered Topics: ${summary.coveredCount || 0}
- Content Gaps: ${summary.missingCount || 0}

## Four Strategic Pillars
1. Strong Coverage: ${summary.strongCoverageSummary || 'N/A'}
2. Quick Wins: ${summary.quickWinsSummary || 'N/A'}
3. Content Gaps: ${summary.contentGapsSummary || 'N/A'}
4. Citation Opportunities: ${summary.citationOpportunitiesSummary || 'N/A'}

## What is Working
${workingList}

## Where Target is Missing
${missingList}

## What Should Be Prioritised
${prioritiseList}

## Top Action Items
${topActions}
`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-teal-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Export Audit Datasets & Executive Reports
              </h3>
              <p className="text-xs text-slate-500">
                Download structured CSV spreadsheets, JSON payloads, or copy the strategic briefing.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Dedicated Handoff Section: Export for Citation Reverse Engineering */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-600 text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                  Export for Citation Reverse Engineering
                </h4>
                <p className="text-[11px] text-teal-800">
                  Shared standardized schema for seamless handoff into multi-platform citation testing.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full border border-teal-300">
              {(project?.testPrompts || []).length || (queries || []).length} Prompts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 bg-white rounded-xl border border-teal-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Citation Handoff (JSON)</span>
                <span className="text-[10px] text-slate-500">Standard prompt testing JSON payload</span>
              </div>
              <button
                onClick={() => {
                  const testPrompts = project?.testPrompts && project.testPrompts.length > 0
                    ? project.testPrompts
                    : queries.slice(0, 10).map((q, idx) => ({
                        project_id: project?.id || 'proj-default',
                        project_name: project?.name || 'Audit Project',
                        prompt_id: `prompt-${idx + 1}`,
                        seed_prompt: project?.input?.seedPrompt || '',
                        test_prompt: q.query,
                        prompt_variation_type: 'Specific question',
                        query_cluster: q.cluster,
                        search_intent: q.intent,
                        journey_stage: q.funnelStage,
                        subject: project?.input?.destinationOrSubject || 'Montreal',
                        audience: project?.input?.targetAudience || 'Mature Travellers',
                        country: project?.input?.country || 'Canada',
                        language: project?.input?.language || 'English',
                        target_domain: project?.input?.targetDomain || 'toursbylocals.com',
                        target_url: `https://${project?.input?.targetDomain || 'toursbylocals.com'}/`,
                        competitor_domains: project?.input?.competitorDomains || [],
                        business_objective: project?.input?.businessObjective || '',
                        business_priority: 'High priority',
                        reason_for_testing: 'Evaluate search engine and AI mode citation coverage.',
                        source_classification: q.classification,
                        approval_status: 'Approved',
                      }));

                  triggerDownload(
                    `citation_reverse_engineering_prompts_${Date.now()}.json`,
                    JSON.stringify(testPrompts, null, 2),
                    'application/json'
                  );
                }}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> JSON Schema
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-teal-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Citation Handoff (CSV)</span>
                <span className="text-[10px] text-slate-500">Standard prompt testing spreadsheet</span>
              </div>
              <button
                onClick={() => {
                  const testPrompts = project?.testPrompts && project.testPrompts.length > 0
                    ? project.testPrompts
                    : queries.slice(0, 10).map((q, idx) => ({
                        project_id: project?.id || 'proj-default',
                        project_name: project?.name || 'Audit Project',
                        prompt_id: `prompt-${idx + 1}`,
                        seed_prompt: project?.input?.seedPrompt || '',
                        test_prompt: q.query,
                        prompt_variation_type: 'Specific question',
                        query_cluster: q.cluster,
                        search_intent: q.intent,
                        journey_stage: q.funnelStage,
                        subject: project?.input?.destinationOrSubject || 'Montreal',
                        audience: project?.input?.targetAudience || 'Mature Travellers',
                        country: project?.input?.country || 'Canada',
                        language: project?.input?.language || 'English',
                        target_domain: project?.input?.targetDomain || 'toursbylocals.com',
                        target_url: `https://${project?.input?.targetDomain || 'toursbylocals.com'}/`,
                        competitor_domains: (project?.input?.competitorDomains || []).join('; '),
                        business_objective: project?.input?.businessObjective || '',
                        business_priority: 'High priority',
                        reason_for_testing: 'Evaluate search engine and AI mode citation coverage.',
                        source_classification: q.classification,
                        approval_status: 'Approved',
                      }));

                  const headers = [
                    'project_id',
                    'project_name',
                    'prompt_id',
                    'seed_prompt',
                    'test_prompt',
                    'prompt_variation_type',
                    'query_cluster',
                    'search_intent',
                    'journey_stage',
                    'subject',
                    'audience',
                    'country',
                    'language',
                    'target_domain',
                    'target_url',
                    'competitor_domains',
                    'business_objective',
                    'business_priority',
                    'reason_for_testing',
                    'source_classification',
                    'approval_status',
                  ];

                  const escapeCsv = (val: any) => {
                    if (val === null || val === undefined) return '""';
                    if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
                    return `"${String(val).replace(/"/g, '""')}"`;
                  };

                  const csvRows = [
                    headers.join(','),
                    ...testPrompts.map((p: any) =>
                      [
                        escapeCsv(p.project_id),
                        escapeCsv(p.project_name),
                        escapeCsv(p.prompt_id),
                        escapeCsv(p.seed_prompt),
                        escapeCsv(p.test_prompt),
                        escapeCsv(p.prompt_variation_type),
                        escapeCsv(p.query_cluster),
                        escapeCsv(p.search_intent),
                        escapeCsv(p.journey_stage),
                        escapeCsv(p.subject),
                        escapeCsv(p.audience),
                        escapeCsv(p.country),
                        escapeCsv(p.language),
                        escapeCsv(p.target_domain),
                        escapeCsv(p.target_url),
                        escapeCsv(p.competitor_domains),
                        escapeCsv(p.business_objective),
                        escapeCsv(p.business_priority),
                        escapeCsv(p.reason_for_testing),
                        escapeCsv(p.source_classification),
                        escapeCsv(p.approval_status),
                      ].join(',')
                    ),
                  ];

                  triggerDownload(
                    `citation_reverse_engineering_prompts_${Date.now()}.csv`,
                    csvRows.join('\n'),
                    'text/csv'
                  );
                }}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> CSV Schema
              </button>
            </div>
          </div>
        </div>

        {/* CSV Spreadsheets Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> CSV Dataset Downloads
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Fan-out Queries CSV</span>
                <span className="text-[11px] text-slate-500">{queries.length} queries with classifications</span>
              </div>
              <button
                onClick={() =>
                  triggerDownload(
                    `fanout-queries-${project?.input?.targetDomain || 'target'}.csv`,
                    generateQueriesCSV(),
                    'text/csv'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Website Coverage CSV</span>
                <span className="text-[11px] text-slate-500">{coverageAnalyses.length} audited URLs & statuses</span>
              </div>
              <button
                onClick={() =>
                  triggerDownload(
                    `website-coverage-${project?.input?.targetDomain || 'target'}.csv`,
                    generateCoverageCSV(),
                    'text/csv'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Content Opportunities CSV</span>
                <span className="text-[11px] text-slate-500">{opportunities.length} scored recommendations</span>
              </div>
              <button
                onClick={() =>
                  triggerDownload(
                    `content-opportunities-${project?.input?.targetDomain || 'target'}.csv`,
                    generateOpportunitiesCSV(),
                    'text/csv'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Action Plan Backlog CSV</span>
                <span className="text-[11px] text-slate-500">{actionItems.length} prioritized tasks & owners</span>
              </div>
              <button
                onClick={() =>
                  triggerDownload(
                    `action-plan-${project?.input?.targetDomain || 'target'}.csv`,
                    generateActionsCSV(),
                    'text/csv'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>
          </div>
        </div>

        {/* JSON & Executive Brief Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" /> Executive Brief & Raw Project Payload
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Complete Project JSON</span>
                <span className="text-[11px] text-slate-500">Full audit state with grounded runs</span>
              </div>
              <button
                onClick={() =>
                  triggerDownload(
                    `audit-project-${project?.id || 'export'}.json`,
                    JSON.stringify(project, null, 2),
                    'application/json'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Code className="w-3 h-3" /> JSON
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Copy Markdown Brief</span>
                <span className="text-[11px] text-slate-500">Clipboard executive strategic overview</span>
              </div>
              <button
                onClick={() => handleCopyText(generateExecutiveBriefText(), 'brief')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                {copied === 'brief' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
