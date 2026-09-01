export type QueryClassification =
  | 'Observed Gemini Search Query'
  | 'AI-Predicted Fan-out'
  | 'SERP-Validated Query'
  | 'GSC-Observed Query'
  | 'Human-Approved Opportunity';

export type SearchIntent =
  | 'Informational'
  | 'Navigational'
  | 'Commercial investigation'
  | 'Transactional'
  | 'Local'
  | 'Comparative'
  | 'Planning'
  | 'Problem-solving';

export type FunnelStage =
  | 'Inspiration'
  | 'Research'
  | 'Planning'
  | 'Comparison'
  | 'Decision'
  | 'Booking'
  | 'Post-purchase';

export type CoverageStatus =
  | 'Covered'
  | 'Partially covered'
  | 'Not covered'
  | 'Wrong page type'
  | 'Covered but not cited'
  | 'Possible cannibalisation'
  | 'Technical issue'
  | 'Unable to verify';

export type RecommendedAction =
  | 'Keep as is'
  | 'Add a section'
  | 'Expand an existing section'
  | 'Update outdated information'
  | 'Improve answer clarity'
  | 'Add first-hand expertise'
  | 'Add guide insights'
  | 'Add supporting evidence'
  | 'Improve entity relationships'
  | 'Add internal links'
  | 'Merge overlapping pages'
  | 'Create supporting content'
  | 'Create a new hub page'
  | 'Fix indexing or crawlability'
  | 'Human review required';

export type SourceType =
  | 'Official or government'
  | 'Tourism board'
  | 'Editorial publisher'
  | 'Marketplace'
  | 'Local business'
  | 'Forum or user-generated content'
  | 'Academic'
  | 'News'
  | 'Competitor'
  | 'Target domain'
  | 'Other';

export type ActionStatus = 'Proposed' | 'Approved' | 'In progress' | 'Completed' | 'Rejected';

export type ActionCategory =
  | 'Quick wins'
  | 'Update existing page'
  | 'Create supporting content'
  | 'Add local expertise'
  | 'Improve internal linking'
  | 'Technical fixes'
  | 'Human validation';

export type OpportunityPriority = 'High priority' | 'Medium priority' | 'Low priority' | 'Needs validation';

export interface FanoutQuery {
  id: string;
  query: string;
  classification: QueryClassification;
  parentTopic: string;
  cluster: string;
  intent: SearchIntent;
  funnelStage: FunnelStage;
  relevantEntities: string[];
  expectedAnswerType: string;
  commercialRelevance: number; // 1-5
  confidence: number; // 0-100%
  sourceOfDiscovery: string;
  humanApproved: boolean;
  observationCount?: number; // In how many grounded runs was this query or subtopic observed?
  observationFrequency?: number; // percentage (e.g. 80%)
  notes?: string;
}

export interface GroundedChunk {
  uri: string;
  title: string;
  domain: string;
  sourceType: SourceType;
  snippet?: string;
}

export interface GroundingSupport {
  segmentText: string;
  groundingChunkIndices: number[];
  confidenceScore?: number;
}

export interface GroundedRun {
  runNumber: number;
  timestamp: string;
  userPrompt: string;
  country: string;
  language: string;
  executedSearchQueries: string[]; // actual queries sent to Google Search
  groundedResponseText: string;
  citedChunks: GroundedChunk[];
  groundingSupports: GroundingSupport[];
  status: 'completed' | 'failed' | 'fallback_predicted';
  errorMessage?: string;
}

export interface WebsitePage {
  url: string;
  title: string;
  pageType: string;
  snippet?: string;
  status: 'verified' | 'uploaded' | 'sitemap_indexed' | 'crawl_error';
}

export interface PageCoverageAnalysis {
  queryId: string;
  query: string;
  cluster: string;
  mostRelevantUrl: string;
  pageTitle: string;
  pageType: string;
  coverageStatus: CoverageStatus;
  coverageConfidence: number; // 0-100%
  relevantTextSection: string;
  missingInformation: string;
  recommendedAction: RecommendedAction;
  suggestedInternalLinks: string[];
  isTargetDomainCited: boolean;
  isCompetitorCited: boolean;
  competingCitedDomains: string[];
}

export interface EntityRelationship {
  id: string;
  name: string;
  type: 'Person' | 'Place' | 'Attraction' | 'Neighbourhood' | 'Organisation' | 'Concept' | 'Product' | 'Activity' | 'Food';
  relationshipToMainTopic: string; // e.g. "Located in Old Montreal", "Best visited during autumn"
  relationshipType:
    | 'Located in'
    | 'Near'
    | 'Best visited during'
    | 'Connected by'
    | 'Suitable for'
    | 'Part of'
    | 'Compared with'
    | 'Requires'
    | 'Known to local guides for'
    | 'Often combined with';
  relevantQueryClusters: string[];
  importance: 'Critical' | 'High' | 'Medium' | 'Supporting';
  targetSiteCoverage: 'Comprehensive' | 'Partial' | 'Missing' | 'Unclear';
  competitorCoverage: 'High' | 'Moderate' | 'Low';
  citationFrequency: number;
  missingContextualRelationships: string;
  recommendedContentPlacement: string;
}

export interface CitationGapItem {
  id: string;
  domain: string;
  url: string;
  sourceType: SourceType;
  citationCount: number;
  citationShare: number; // percentage
  associatedQueries: string[];
  supportedStatements: string[];
  isCompetitor: boolean;
  isTargetDomain: boolean;
  gapReason: string;
  targetEligibilityAdvice: string;
}

export type RecommendedContentFormat =
  | 'Hub page'
  | 'New section on an existing page'
  | 'Supporting article'
  | 'Destination page'
  | 'Attraction page'
  | 'Guide-profile enhancement'
  | 'FAQ'
  | 'Comparison page'
  | 'Itinerary'
  | 'Planning resource'
  | 'No new content required';

export type PromptVariationType =
  | 'Broad discovery'
  | 'Specific question'
  | 'Recommendation'
  | 'Comparison'
  | 'Problem-solving'
  | 'Commercial investigation'
  | 'Transactional'
  | 'Audience-specific'
  | 'Constraint-specific'
  | 'Follow-up question';

export type PromptApprovalStatus = 'Approved' | 'Pending' | 'Rejected';

export interface QueryCluster {
  id: string;
  name: string;
  description: string;
  primaryUserNeed: string;
  representativeQuery: string;
  supportingQueries: string[];
  queryClassifications: QueryClassification[];
  relevantEntities: string[];
  intentMix: SearchIntent[];
  journeyStages: FunnelStage[];
  existingTargetPage: string;
  coverageStatus: CoverageStatus;
  recommendedContentFormat: RecommendedContentFormat;
  priority: OpportunityPriority;
  humanApproved: boolean;
  selectedForTesting: boolean;
}

export interface ApprovedTestPrompt {
  prompt_id: string;
  project_id: string;
  project_name: string;
  seed_prompt: string;
  test_prompt: string;
  prompt_variation_type: PromptVariationType;
  query_cluster: string;
  search_intent: string;
  journey_stage: string;
  subject: string;
  audience: string;
  country: string;
  language: string;
  target_domain: string;
  target_url: string;
  competitor_domains: string[];
  business_objective: string;
  business_priority: string;
  reason_for_testing: string;
  source_classification: string;
  approval_status: PromptApprovalStatus;
  selectedForExport?: boolean;
}

export interface ContentOpportunity {
  id: string;
  queryId: string;
  query: string;
  cluster: string;
  classification: QueryClassification;
  intent: SearchIntent;
  funnelStage: FunnelStage;
  observationFrequency: number; // 1-5
  relevanceScore: number; // 1-5
  intentValueScore: number; // 1-5
  contentGapScore: number; // 1-5
  businessValueScore?: number; // 1-5
  citationPotentialScore?: number; // 1-5 (legacy alias)
  calculatedScore: number; // 0-100: (Freq * Rel * Intent * Gap * Business / 3125) * 100
  priority: OpportunityPriority;
  priorityReason: string;
  explanation?: string;
  recommendedPage: string;
  recommendedAction: RecommendedAction;
  targetSiteCoverage: CoverageStatus;
  competitorCited: boolean;
  humanApproved: boolean;
  selectedForTesting?: boolean;
  searchVolumeEstimate?: string;
}

export interface ActionItem {
  id: string;
  category: ActionCategory;
  title: string;
  supportingQuery: string;
  recommendedUrl: string;
  reason: string;
  evidence: string;
  expectedImpact: 'High' | 'Medium' | 'Low';
  effort: 'Low' | 'Medium' | 'High';
  priority: 'Immediate' | 'High' | 'Medium' | 'Low';
  owner: string;
  status: ActionStatus;
  notes: string;
  createdAt: string;
  executionQueue?: 'Do now' | 'Do next' | 'Monitor';
  problem?: string;
  requiredChange?: string;
  completionChecklist?: string[];
  verificationPlan?: string[];
  successMetric?: string;
}

export interface AuditProjectInput {
  seedPrompt: string;
  destinationOrSubject: string;
  targetAudience: string;
  targetDomain: string;
  competitorDomains: string[];
  country: string;
  language: string;
  businessObjective: string;
  preferredConversionAction: string;
  sitemapUrl?: string;
  uploadedUrls?: string[];
  uploadedGscQueries?: Array<{ query: string; impressions?: number; clicks?: number; position?: number }>;
  runsCount: number;
  depth: 'Quick' | 'Standard' | 'Deep';
}

export interface AuditProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  input: AuditProjectInput;
  groundedRuns: GroundedRun[];
  queries: FanoutQuery[];
  clusters: QueryCluster[];
  coverageAnalyses: PageCoverageAnalysis[];
  entities: EntityRelationship[];
  citations: CitationGapItem[];
  opportunities: ContentOpportunity[];
  testPrompts: ApprovedTestPrompt[];
  actionPlan: ActionItem[];
  actionItems?: ActionItem[];
  competitorGaps?: any[];
  summary: {
    totalQueries: number;
    totalQueriesCount?: number;
    observedQueriesCount: number;
    predictedQueriesCount: number;
    serpValidatedCount: number;
    gscObservedCount: number;
    clustersCount: number;
    highPriorityClustersCount?: number;
    approvedTestPromptsCount?: number;
    entitiesCount: number;
    entityGapsCount?: number;
    sourcesCount: number;
    targetCitations?: number;
    competitorCitations?: number;
    coveredCount: number;
    partiallyCoveredCount: number;
    missingCount: number;
    contentGapsCount?: number;
    highPriorityOpportunities: number;
    strongCoverageSummary: string;
    quickWinsSummary: string;
    contentGapsSummary: string;
    promptsToTestSummary?: string;
    citationOpportunitiesSummary?: string;
    whatIsWorking: string[];
    whereMissing: string[];
    whatToPrioritise: string[];
    requiresHumanValidation: string[];
  };
}

// Backward-compatible type aliases
export type CitationItem = CitationGapItem;
export type CompetitorGapItem = CitationGapItem;
export type EntityItem = EntityRelationship;
export type CoverageAnalysis = PageCoverageAnalysis;
export type CoverageRecommendation = RecommendedAction;
export type ContentFormat = string;

export interface ProjectComparisonDiff {
  projectA: { id: string; name: string; date: string };
  projectB: { id: string; name: string; date: string };
  newQueries: string[];
  lostQueries: string[];
  newDomains: string[];
  lostDomains: string[];
  gainedCitations: string[];
  lostCitations: string[];
  coverageImprovements: Array<{ query: string; previousStatus: CoverageStatus; currentStatus: CoverageStatus }>;
  scoreDeltas: Array<{ query: string; oldScore: number; newScore: number; delta: number }>;
}
