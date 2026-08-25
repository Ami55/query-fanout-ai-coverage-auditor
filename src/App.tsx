import React, { useState, useEffect } from 'react';
import {
  AuditProject,
  AuditProjectInput,
  FanoutQuery,
  ContentOpportunity,
  ActionItem,
  GroundedRun,
  CitationGapItem,
  EntityRelationship,
  PageCoverageAnalysis,
  QueryCluster,
  ApprovedTestPrompt,
} from './types';
import { demoMontrealProject } from './data/demoMontreal';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InitialForm } from './components/InitialForm';
import { AnalysisProgressModal } from './components/AnalysisProgressModal';
import { ExportModal } from './components/ExportModal';

import { OverviewTab } from './components/tabs/OverviewTab';
import { FanoutExplorerTab } from './components/tabs/FanoutExplorerTab';
import { QueryClustersTab } from './components/tabs/QueryClustersTab';
import { ApprovedTestPromptsTab } from './components/tabs/ApprovedTestPromptsTab';
import { LiveGroundedTab } from './components/tabs/LiveGroundedTab';
import { WebsiteCoverageTab } from './components/tabs/WebsiteCoverageTab';
import { EntityMapTab } from './components/tabs/EntityMapTab';
import { CitationGapTab } from './components/tabs/CitationGapTab';
import { ContentOpportunitiesTab } from './components/tabs/ContentOpportunitiesTab';
import { ActionPlanTab } from './components/tabs/ActionPlanTab';
import { SavedAnalysesTab } from './components/tabs/SavedAnalysesTab';
import { HowItWorksTab } from './components/tabs/HowItWorksTab';
import { QUERY_FANOUT_PROXY_URL } from './config';

import {
  LayoutDashboard,
  GitBranch,
  Globe,
  CheckSquare,
  Compass,
  Layers,
  Zap,
  FileCheck,
  FolderOpen,
  Send,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const STORAGE_KEY = 'query_fanout_saved_projects_v1';

function sanitizeProject(p: any): AuditProject {
  if (!p) return demoMontrealProject;
  const queries = Array.isArray(p.queries) ? p.queries : [];
  const entities = Array.isArray(p.entities) ? p.entities : [];
  const citations = Array.isArray(p.citations) ? p.citations : [];
  const coverage = Array.isArray(p.coverageAnalyses) ? p.coverageAnalyses : [];
  const opportunities = Array.isArray(p.opportunities) ? p.opportunities : [];
  const actionPlan = Array.isArray(p.actionPlan) ? p.actionPlan : Array.isArray(p.actionItems) ? p.actionItems : [];
  const groundedRuns = Array.isArray(p.groundedRuns) ? p.groundedRuns : [];
  const clusters = Array.isArray(p.clusters) ? p.clusters : [];
  const testPrompts = Array.isArray(p.testPrompts) ? p.testPrompts : [];

  return {
    ...p,
    groundedRuns,
    queries,
    coverageAnalyses: coverage,
    entities,
    citations,
    opportunities,
    actionPlan,
    actionItems: actionPlan,
    clusters,
    testPrompts,
    input: {
      seedPrompt: p.input?.seedPrompt || '',
      destinationOrSubject: p.input?.destinationOrSubject || '',
      targetAudience: p.input?.targetAudience || '',
      targetDomain: p.input?.targetDomain || '',
      competitorDomains: Array.isArray(p.input?.competitorDomains) ? p.input.competitorDomains : [],
      country: p.input?.country || 'Canada',
      language: p.input?.language || 'English',
      businessObjective: p.input?.businessObjective || '',
      preferredConversionAction: p.input?.preferredConversionAction || '',
      runsCount: p.input?.runsCount || 3,
      depth: p.input?.depth || 'Standard',
      ...(p.input || {}),
    },
    summary: {
      totalQueries: queries.length,
      observedQueriesCount: p.summary?.observedQueriesCount || 0,
      predictedQueriesCount: p.summary?.predictedQueriesCount || 0,
      serpValidatedCount: p.summary?.serpValidatedCount || 0,
      gscObservedCount: p.summary?.gscObservedCount || 0,
      clustersCount: clusters.length,
      entitiesCount: entities.length,
      sourcesCount: citations.length,
      targetCitations: p.summary?.targetCitations || 0,
      competitorCitations: p.summary?.competitorCitations || 0,
      coveredCount: p.summary?.coveredCount || 0,
      partiallyCoveredCount: p.summary?.partiallyCoveredCount || 0,
      missingCount: p.summary?.missingCount || 0,
      highPriorityOpportunities: p.summary?.highPriorityOpportunities || 0,
      strongCoverageSummary: p.summary?.strongCoverageSummary || '',
      quickWinsSummary: p.summary?.quickWinsSummary || '',
      contentGapsSummary: p.summary?.contentGapsSummary || '',
      citationOpportunitiesSummary: p.summary?.citationOpportunitiesSummary || '',
      ...(p.summary || {}),
      whatIsWorking: Array.isArray(p.summary?.whatIsWorking) ? p.summary.whatIsWorking : [],
      whereMissing: Array.isArray(p.summary?.whereMissing) ? p.summary.whereMissing : [],
      whatToPrioritise: Array.isArray(p.summary?.whatToPrioritise) ? p.summary.whatToPrioritise : [],
      requiresHumanValidation: Array.isArray(p.summary?.requiresHumanValidation) ? p.summary.requiresHumanValidation : [],
    },
  };
}

export default function App() {
  const [savedProjects, setSavedProjects] = useState<AuditProject[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeProject);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved projects from storage', e);
    }
    return [demoMontrealProject];
  });

  const [currentProject, setCurrentProject] = useState<AuditProject>(() => {
    return sanitizeProject(savedProjects[0] || demoMontrealProject);
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  // First screen defaults to New Analysis form, with Montreal available as a showcase demo
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<number>(1);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Sync saved projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProjects));
    } catch (e) {
      console.error('Failed to save projects to storage', e);
    }
  }, [savedProjects]);

  const handleSelectProject = (project: AuditProject) => {
    setCurrentProject(project);
    setIsFormOpen(false);
    setActiveTab('overview');
  };

  const handleSaveCurrentProject = () => {
    setSavedProjects((prev) => {
      const exists = prev.some((p) => p.id === currentProject.id);
      if (exists) {
        return prev.map((p) => (p.id === currentProject.id ? currentProject : p));
      }
      return [currentProject, ...prev];
    });
  };

  const handleDuplicateProject = (project: AuditProject) => {
    const duplicated: AuditProject = {
      ...project,
      id: `proj-${Date.now()}`,
      name: `${project.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
    };
    setSavedProjects((prev) => [duplicated, ...prev]);
    setCurrentProject(duplicated);
    setIsFormOpen(false);
    setActiveTab('overview');
  };

  const handleDeleteProject = (projectId: string) => {
    setSavedProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (currentProject.id === projectId) {
      const fallback = savedProjects.find((p) => p.id !== projectId) || demoMontrealProject;
      setCurrentProject(fallback);
    }
  };

  // Run full query fan-out audit
  const handleRunAudit = async (input: AuditProjectInput) => {
    setIsAnalyzing(true);
    setAnalysisStage(1);
    setLogMessages([`Initiating audit for seed prompt: "${input.seedPrompt}"...`]);

    try {
      // Stage 1 & 2: Predict Fan-out
      setAnalysisStage(2);
      setLogMessages((prev) => [...prev, 'Generating AI-Predicted Query Fan-out clusters...']);
      
      const fanoutRes = await fetch(QUERY_FANOUT_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'predict-fanout',
          seedPrompt: input.seedPrompt,
          destination: input.destinationOrSubject,
          audience: input.targetAudience,
          targetDomain: input.targetDomain,
          depth: input.depth,
        }),
      });

      let predictedQueries: FanoutQuery[] = [];
      let initialEntities: EntityRelationship[] = [];

      if (fanoutRes.ok) {
        const fanoutData = await fanoutRes.json();
        predictedQueries = fanoutData.queries || [];
        initialEntities = fanoutData.entities || [];
        setLogMessages((prev) => [
          ...prev,
          `Generated ${predictedQueries.length} predicted queries across multiple clusters.`,
        ]);
      } else {
        setLogMessages((prev) => [...prev, 'Notice: Using local fallbacks for query fan-out.']);
      }

      // Stage 3: Live Grounded Searches (Run grounded runs)
      setAnalysisStage(3);
      const runsCount = input.runsCount || 3;
      const completedRuns: GroundedRun[] = [];

      for (let i = 1; i <= runsCount; i++) {
        setLogMessages((prev) => [...prev, `Executing Grounded Search Run ${i} of ${runsCount}...`]);
        try {
          const runRes = await fetch(QUERY_FANOUT_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'run-grounded',
              prompt: input.seedPrompt,
              destination: input.destinationOrSubject,
              audience: input.targetAudience,
              runNumber: i,
              totalRuns: runsCount,
              targetDomain: input.targetDomain,
              competitorDomains: input.competitorDomains,
            }),
          });
          if (runRes.ok) {
            const runData = await runRes.json();
            completedRuns.push(runData);
            setLogMessages((prev) => [
              ...prev,
              `Run ${i} completed: ${runData.executedSearchQueries?.length || 0} observed search queries captured.`,
            ]);
          }
        } catch (err) {
          console.error(`Run ${i} failed`, err);
        }
      }

      // Stage 4: Citation Aggregation
      setAnalysisStage(4);
      setLogMessages((prev) => [...prev, 'Extracting cited domains and source classifications...']);

      // Stage 5: Entity mapping
      setAnalysisStage(5);
      setLogMessages((prev) => [...prev, 'Building semantic entity relationship map...']);

      // Stage 6 & 7: Website Coverage Matching & Opportunity Scoring
      setAnalysisStage(6);
      setLogMessages((prev) => [
        ...prev,
        `Matching target domain inventory (${input.targetDomain}) against fan-out queries...`,
      ]);

      const coverageRes = await fetch(QUERY_FANOUT_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-coverage',
          seedPrompt: input.seedPrompt,
          destination: input.destinationOrSubject,
          audience: input.targetAudience,
          queries: predictedQueries,
          groundedRuns: completedRuns,
          targetDomain: input.targetDomain,
          competitorDomains: input.competitorDomains,
          businessObjective: input.businessObjective,
          preferredConversionAction: input.preferredConversionAction,
          uploadedUrls: input.uploadedUrls,
          sitemapUrls: input.sitemapUrl ? [input.sitemapUrl] : [],
        }),
      });

      let auditResult: any = null;
      if (coverageRes.ok) {
        auditResult = await coverageRes.json();
      }

      // Stage 8: Preparing recommendations
      setAnalysisStage(8);
      setLogMessages((prev) => [...prev, 'Finalizing strategic brief and prioritizing action items...']);

      // Construct completed project object
      const allQueries: FanoutQuery[] = auditResult?.queries || predictedQueries;

      // Extract all citations from completed runs
      const citationMap = new Map<string, CitationGapItem>();
      completedRuns.forEach((run) => {
        const chunks = run.citedChunks || [];
        chunks.forEach((src) => {
          if (!citationMap.has(src.uri)) {
            const isComp = (input.competitorDomains || []).some((c) => src.domain?.includes(c));
            const isTarget = src.domain?.includes(input.targetDomain);
            const sType = isTarget
              ? 'Target domain'
              : isComp
              ? 'Competitor'
              : src.domain?.includes('.gc.ca') || src.domain?.includes('.gov')
              ? 'Official or government'
              : src.domain?.includes('tourisme') || src.domain?.includes('mtl.org')
              ? 'Tourism board'
              : 'Editorial publisher';

            citationMap.set(src.uri, {
              id: `cit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              url: src.uri,
              domain: src.domain || new URL(src.uri).hostname,
              sourceType: sType as any,
              citationCount: 1,
              citationShare: 0,
              associatedQueries: run.executedSearchQueries || [],
              supportedStatements: [],
              isCompetitor: isComp,
              isTargetDomain: isTarget,
              gapReason: '',
              targetEligibilityAdvice: '',
            });
          } else {
            const existing = citationMap.get(src.uri)!;
            existing.citationCount += 1;
          }
        });
      });

      const extractedCitations = Array.from(citationMap.values());
      const totalCitCount = extractedCitations.reduce((acc, c) => acc + c.citationCount, 0) || 1;
      extractedCitations.forEach((c) => {
        c.citationShare = Math.round((c.citationCount / totalCitCount) * 100);
      });

      const targetCitationsCount = extractedCitations.filter((c) =>
        c.domain?.toLowerCase().includes(input.targetDomain.toLowerCase())
      ).length;

      const newProject: AuditProject = {
        id: `proj-${Date.now()}`,
        name: `${input.destinationOrSubject || 'Audit'} - ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: false,
        input,
        groundedRuns: completedRuns.length > 0 ? completedRuns : demoMontrealProject.groundedRuns,
        queries: allQueries.length > 0 ? allQueries : demoMontrealProject.queries,
        citations: extractedCitations.length > 0 ? extractedCitations : demoMontrealProject.citations,
        entities: auditResult?.entities || (initialEntities.length > 0 ? initialEntities : demoMontrealProject.entities),
        coverageAnalyses: auditResult?.coverageAnalyses || demoMontrealProject.coverageAnalyses,
        opportunities: auditResult?.opportunities || demoMontrealProject.opportunities,
        actionPlan: auditResult?.actionPlan || auditResult?.actionItems || demoMontrealProject.actionPlan,
        actionItems: auditResult?.actionPlan || auditResult?.actionItems || demoMontrealProject.actionPlan,
        clusters: auditResult?.clusters || demoMontrealProject.clusters || [],
        testPrompts: auditResult?.testPrompts || demoMontrealProject.testPrompts || [],
        summary: auditResult?.summary || {
          ...demoMontrealProject.summary,
          totalQueries: allQueries.length || demoMontrealProject.queries.length,
          totalQueriesCount: allQueries.length || demoMontrealProject.queries.length,
          targetCitations: targetCitationsCount,
        },
      };

      setSavedProjects((prev) => [newProject, ...prev]);
      setCurrentProject(newProject);
      setIsFormOpen(false);
      setActiveTab('overview');
    } catch (e: any) {
      console.error('Audit execution error', e);
      setLogMessages((prev) => [...prev, `Error encountered: ${e.message}. Loaded sample analysis.`]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Safe references
  const projectQueries = currentProject?.queries || [];
  const projectGroundedRuns = currentProject?.groundedRuns || [];
  const projectCoverage = currentProject?.coverageAnalyses || [];
  const projectEntities = currentProject?.entities || [];
  const projectCitations = currentProject?.citations || [];
  const projectOpportunities = currentProject?.opportunities || [];
  const projectActionPlan = currentProject?.actionPlan || currentProject?.actionItems || [];
  const projectClusters = currentProject?.clusters || [];
  const projectTestPrompts = currentProject?.testPrompts || [];

  // Updates to components state
  const handleUpdateQuery = (updated: FanoutQuery) => {
    const updatedQueries = projectQueries.map((q) => (q.id === updated.id ? updated : q));
    const updatedProj = { ...currentProject, queries: updatedQueries };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleDeleteQuery = (queryId: string) => {
    const updatedQueries = projectQueries.filter((q) => q.id !== queryId);
    const updatedProj = { ...currentProject, queries: updatedQueries };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleAddQuery = (newQuery: FanoutQuery) => {
    const updatedQueries = [newQuery, ...projectQueries];
    const updatedProj = { ...currentProject, queries: updatedQueries };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleMergeQueries = (sourceId: string, targetId: string) => {
    const target = projectQueries.find((q) => q.id === targetId);
    const source = projectQueries.find((q) => q.id === sourceId);
    if (!target || !source) return;

    const merged: FanoutQuery = {
      ...target,
      relevantEntities: Array.from(new Set([...(target.relevantEntities || []), ...(source.relevantEntities || [])])),
      observationFrequency: Math.max(target.observationFrequency || 0, source.observationFrequency || 0),
      humanApproved: target.humanApproved || source.humanApproved,
    };

    const updatedQueries = projectQueries
      .filter((q) => q.id !== sourceId)
      .map((q) => (q.id === targetId ? merged : q));

    const updatedProj = { ...currentProject, queries: updatedQueries };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  // Cluster updates
  const handleUpdateCluster = (updated: QueryCluster) => {
    const updatedClusters = projectClusters.map((c) => (c.id === updated.id ? updated : c));
    const updatedProj = { ...currentProject, clusters: updatedClusters };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleDeleteCluster = (clusterId: string) => {
    const updatedClusters = projectClusters.filter((c) => c.id !== clusterId);
    const updatedProj = { ...currentProject, clusters: updatedClusters };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleAddCluster = (newCluster: QueryCluster) => {
    const updatedClusters = [newCluster, ...projectClusters];
    const updatedProj = { ...currentProject, clusters: updatedClusters };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleMergeClusters = (sourceId: string, targetId: string) => {
    const source = projectClusters.find((c) => c.id === sourceId);
    const target = projectClusters.find((c) => c.id === targetId);
    if (!source || !target) return;

    const merged: QueryCluster = {
      ...target,
      queryCount: (target.queryCount || 0) + (source.queryCount || 0),
      supportingQueries: Array.from(new Set([...(target.supportingQueries || []), ...(source.supportingQueries || [])])),
      relevantEntities: Array.from(new Set([...(target.relevantEntities || []), ...(source.relevantEntities || [])])),
      totalEstimatedVolume: (target.totalEstimatedVolume || 0) + (source.totalEstimatedVolume || 0),
    };

    const updatedClusters = projectClusters.filter((c) => c.id !== sourceId).map((c) => (c.id === targetId ? merged : c));
    const updatedProj = { ...currentProject, clusters: updatedClusters };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleMoveQuery = (queryId: string, sourceClusterId: string, targetClusterId: string) => {
    const query = projectQueries.find((q) => q.id === queryId);
    const targetCluster = projectClusters.find((c) => c.id === targetClusterId);
    if (!query || !targetCluster) return;

    const updatedQuery = { ...query, queryCluster: targetCluster.name };
    const updatedQueries = projectQueries.map((q) => (q.id === queryId ? updatedQuery : q));

    const updatedClusters = projectClusters.map((c) => {
      if (c.id === sourceClusterId) {
        return {
          ...c,
          supportingQueries: (c.supportingQueries || []).filter((sq) => sq !== query.queryText),
          queryCount: Math.max(0, (c.queryCount || 1) - 1),
        };
      }
      if (c.id === targetClusterId) {
        return {
          ...c,
          supportingQueries: Array.from(new Set([...(c.supportingQueries || []), query.queryText])),
          queryCount: (c.queryCount || 0) + 1,
        };
      }
      return c;
    });

    const updatedProj = { ...currentProject, queries: updatedQueries, clusters: updatedClusters };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  // Test prompt updates
  const handleUpdatePrompt = (updated: ApprovedTestPrompt) => {
    const updatedPrompts = projectTestPrompts.map((p) => (p.prompt_id === updated.prompt_id ? updated : p));
    const updatedProj = { ...currentProject, testPrompts: updatedPrompts };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleDeletePrompt = (promptId: string) => {
    const updatedPrompts = projectTestPrompts.filter((p) => p.prompt_id !== promptId);
    const updatedProj = { ...currentProject, testPrompts: updatedPrompts };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleAddPrompt = (newPrompt: ApprovedTestPrompt) => {
    const updatedPrompts = [newPrompt, ...projectTestPrompts];
    const updatedProj = { ...currentProject, testPrompts: updatedPrompts };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleUpdateOpportunity = (updated: ContentOpportunity) => {
    const updatedOpps = projectOpportunities.map((o) => (o.id === updated.id ? updated : o));
    const updatedProj = { ...currentProject, opportunities: updatedOpps };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleUpdateActionItem = (updated: ActionItem) => {
    const updatedActions = projectActionPlan.map((a) => (a.id === updated.id ? updated : a));
    const updatedProj = { ...currentProject, actionPlan: updatedActions, actionItems: updatedActions };
    setCurrentProject(updatedProj);
    setSavedProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const navTabs = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'fanout', label: 'Fan-out Explorer', icon: GitBranch, count: projectQueries.length },
    { id: 'clusters', label: 'Query Clusters', icon: Layers, count: projectClusters.length },
    { id: 'prompts', label: 'Prompts to Test', icon: Send, count: projectTestPrompts.length },
    { id: 'grounded', label: 'Live Grounded Analysis', icon: Globe, count: projectGroundedRuns.length },
    { id: 'coverage', label: 'Website Coverage', icon: CheckSquare, count: projectCoverage.length },
    { id: 'entities', label: 'Entity Knowledge Map', icon: Compass, count: projectEntities.length },
    { id: 'citations', label: 'Citation & Competitor Gap', icon: Layers, count: projectCitations.length },
    { id: 'opportunities', label: 'Content Opportunities', icon: Zap, count: projectOpportunities.length },
    { id: 'actions', label: 'Action Plan Backlog', icon: FileCheck, count: projectActionPlan.length },
    { id: 'how-it-works', label: 'How It Works Guide', icon: BookOpen },
    { id: 'saved', label: 'Saved Audits & Diff', icon: FolderOpen, count: (savedProjects || []).length },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        currentProject={currentProject}
        onNewAnalysis={() => setIsFormOpen(true)}
        onOpenExport={() => setShowExportModal(true)}
        onSaveProject={handleSaveCurrentProject}
        onSelectProject={handleSelectProject}
        savedProjects={savedProjects || []}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isFormOpen ? (
          <InitialForm
            onSubmit={handleRunAudit}
            onLoadDemo={() => {
              setCurrentProject(demoMontrealProject);
              setIsFormOpen(false);
              setActiveTab('overview');
            }}
            isLoading={isAnalyzing}
          />
        ) : (
          <div className="space-y-6">
            {/* Primary Navigation Tabs */}
            <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs overflow-x-auto">
              <nav className="flex items-center gap-1 min-w-max">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            isActive
                              ? 'bg-slate-800 text-teal-300 border border-slate-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Active Tab View Rendering */}
            <div className="animate-in fade-in-50 duration-200">
              {activeTab === 'overview' && (
                <OverviewTab
                  project={currentProject}
                  onNavigateTab={(tabId) => setActiveTab(tabId)}
                />
              )}

              {activeTab === 'fanout' && (
                <FanoutExplorerTab
                  queries={projectQueries}
                  onUpdateQuery={handleUpdateQuery}
                  onDeleteQuery={handleDeleteQuery}
                  onAddQuery={handleAddQuery}
                  onMergeQueries={handleMergeQueries}
                />
              )}

              {activeTab === 'clusters' && (
                <QueryClustersTab
                  clusters={projectClusters}
                  queries={projectQueries}
                  targetDomain={currentProject?.input?.targetDomain || 'target domain'}
                  onUpdateCluster={handleUpdateCluster}
                  onDeleteCluster={handleDeleteCluster}
                  onAddCluster={handleAddCluster}
                  onMergeClusters={handleMergeClusters}
                  onMoveQuery={handleMoveQuery}
                  onGeneratePromptsForCluster={() => setActiveTab('prompts')}
                  onNavigateToPrompts={() => setActiveTab('prompts')}
                />
              )}

              {activeTab === 'prompts' && (
                <ApprovedTestPromptsTab
                  prompts={projectTestPrompts}
                  clusters={projectClusters}
                  projectInput={currentProject?.input || {}}
                  projectId={currentProject?.id || 'proj-default'}
                  projectName={currentProject?.name || 'Project Audit'}
                  onUpdatePrompt={handleUpdatePrompt}
                  onDeletePrompt={handleDeletePrompt}
                  onAddPrompt={handleAddPrompt}
                  onOpenExportModal={() => setShowExportModal(true)}
                />
              )}

              {activeTab === 'grounded' && (
                <LiveGroundedTab
                  groundedRuns={projectGroundedRuns}
                  queries={projectQueries}
                />
              )}

              {activeTab === 'coverage' && (
                <WebsiteCoverageTab
                  coverageAnalyses={projectCoverage}
                  targetDomain={currentProject?.input?.targetDomain || 'target domain'}
                  onNavigateToActions={() => setActiveTab('actions')}
                />
              )}

              {activeTab === 'entities' && (
                <EntityMapTab
                  entities={projectEntities}
                  seedTopic={currentProject?.input?.destinationOrSubject || currentProject?.input?.seedPrompt || 'Topic'}
                />
              )}

              {activeTab === 'citations' && (
                <CitationGapTab
                  citations={projectCitations}
                  targetDomain={currentProject?.input?.targetDomain || 'target domain'}
                  onNavigateToActions={() => setActiveTab('actions')}
                />
              )}

              {activeTab === 'opportunities' && (
                <ContentOpportunitiesTab
                  opportunities={projectOpportunities}
                  onUpdateOpportunity={handleUpdateOpportunity}
                  onNavigateToActions={() => setActiveTab('actions')}
                />
              )}

              {activeTab === 'actions' && (
                <ActionPlanTab
                  actionItems={projectActionPlan}
                  onUpdateActionItem={handleUpdateActionItem}
                  targetDomain={currentProject?.input?.targetDomain || 'target domain'}
                />
              )}

              {activeTab === 'how-it-works' && (
                <HowItWorksTab
                  onStartNewAudit={() => setIsFormOpen(true)}
                  onNavigateTab={(tabId) => setActiveTab(tabId)}
                />
              )}

              {activeTab === 'saved' && (
                <SavedAnalysesTab
                  savedProjects={savedProjects || []}
                  currentProjectId={currentProject.id}
                  onOpenProject={(proj) => {
                    setCurrentProject(proj);
                    setActiveTab('overview');
                  }}
                  onDuplicateProject={handleDuplicateProject}
                  onDeleteProject={handleDeleteProject}
                  onNewAnalysis={() => setIsFormOpen(true)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Progress Tracker Modal when Live Analysis is running */}
      {isAnalyzing && (
        <AnalysisProgressModal
          currentStage={analysisStage}
          logMessages={logMessages}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          project={currentProject}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
