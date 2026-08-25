import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Utility with exponential backoff for Gemini API calls to gracefully handle rate limits / 429 quota errors
async function callGeminiWithRetry<T>(
  fn: (ai: GoogleGenAI) => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1500
): Promise<T> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('Gemini API key is not configured in the workspace settings.');
  }

  let delay = initialDelayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn(ai);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isQuotaOrRateLimit =
        errorMsg.includes('429') ||
        errorMsg.includes('RESOURCE_EXHAUSTED') ||
        errorMsg.includes('quota') ||
        errorMsg.includes('rate limit') ||
        errorMsg.includes('Overloaded') ||
        error?.status === 429;

      if (isQuotaOrRateLimit && attempt < maxRetries) {
        console.warn(`[Gemini API] 429/Resource Exhausted encountered on attempt ${attempt}/${maxRetries}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error('Gemini API call failed after retries.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Helper to determine source classification
function classifyDomainSourceType(domain: string, targetDomain: string, competitors: string[]): string {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
  const cleanTarget = targetDomain.toLowerCase().replace(/^www\./, '');
  const cleanComps = competitors.map((c) => c.toLowerCase().replace(/^www\./, ''));

  if (cleanDomain === cleanTarget || cleanDomain.endsWith('.' + cleanTarget)) {
    return 'Target domain';
  }
  if (cleanComps.some((c) => cleanDomain === c || cleanDomain.endsWith('.' + c))) {
    return 'Competitor';
  }
  if (cleanDomain.includes('.gc.ca') || cleanDomain.includes('.gov') || cleanDomain.includes('.org') && cleanDomain.includes('mtl.org') || cleanDomain.includes('tourism') || cleanDomain.includes('tourisme') || cleanDomain.includes('bonjourquebec')) {
    return cleanDomain.includes('.gc.ca') || cleanDomain.includes('.gov') ? 'Official or government' : 'Tourism board';
  }
  if (cleanDomain.includes('tripadvisor') || cleanDomain.includes('viator') || cleanDomain.includes('getyourguide') || cleanDomain.includes('klook')) {
    return 'Competitor';
  }
  if (cleanDomain.includes('lonelyplanet') || cleanDomain.includes('fodors') || cleanDomain.includes('thepointsguy') || cleanDomain.includes('cntraveler') || cleanDomain.includes('timeout') || cleanDomain.includes('nytimes') || cleanDomain.includes('blog')) {
    return 'Editorial publisher';
  }
  if (cleanDomain.includes('reddit') || cleanDomain.includes('quora') || cleanDomain.includes('tripadvisor') && cleanDomain.includes('forum')) {
    return 'Forum or user-generated content';
  }
  if (cleanDomain.includes('.edu') || cleanDomain.includes('university')) {
    return 'Academic';
  }
  return 'Local business';
}

// 1. Live Grounded Search Run
app.post('/api/audit/run-grounded', async (req, res) => {
  try {
    const { prompt, audience, destination, targetDomain, competitorDomains = [], runNumber = 1, totalRuns = 1 } = req.body;

    const constructedPrompt = `${prompt}${audience ? ` (Target audience: ${audience})` : ''}${destination ? ` (Destination/Subject: ${destination})` : ''}`;

    const response = await callGeminiWithRetry(async (ai) => {
      return await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: constructedPrompt,
        config: {
          systemInstruction: `You are an AI Search Engine and SEO Visibility Auditor analyzing query fan-out.
When responding, provide a comprehensive, fact-grounded answer based strictly on real web sources.
Include specific local logistics, safety, pacing, seasonal details, and entity relationships.`,
          tools: [{ googleSearch: {} }],
        },
      });
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata as any;
    const webSearchQueries: string[] = groundingMetadata?.webSearchQueries || [];
    const groundingChunks: any[] = groundingMetadata?.groundingChunks || [];
    const groundingSupports: any[] = groundingMetadata?.groundingSupports || [];

    const citedChunks = groundingChunks.map((chunk: any) => {
      const uri = chunk.web?.uri || '';
      let domain = '';
      try {
        if (uri) domain = new URL(uri).hostname.replace(/^www\./, '');
      } catch (e) {
        domain = uri;
      }
      return {
        uri,
        title: chunk.web?.title || 'Web Resource',
        domain,
        sourceType: classifyDomainSourceType(domain, targetDomain || '', competitorDomains),
        snippet: '',
      };
    });

    const parsedSupports = groundingSupports.map((sup: any) => ({
      segmentText: sup.segment?.text || '',
      groundingChunkIndices: sup.groundingChunkIndices || [],
      confidenceScore: sup.confidenceScores?.[0] || 0.9,
    }));

    return res.json({
      runNumber,
      totalRuns,
      timestamp: new Date().toISOString(),
      userPrompt: constructedPrompt,
      country: req.body.country || 'Canada',
      language: req.body.language || 'English',
      executedSearchQueries: webSearchQueries,
      groundedResponseText: response.text || '',
      citedChunks,
      groundingSupports: parsedSupports,
      status: 'completed',
      groundingAvailable: true,
    });
  } catch (error: any) {
    console.error('Error running grounded search:', error);
    return res.status(500).json({
      error: error.message || 'Failed to complete grounded search run',
      groundingAvailable: false,
    });
  }
});

// 2. Predict Deep Fan-out Queries
app.post('/api/audit/predict-fanout', async (req, res) => {
  try {
    const { seedPrompt, audience, destination, targetDomain, observedQueries = [], depth = 'Standard' } = req.body;

    const queryCount = depth === 'Deep' ? 18 : depth === 'Standard' ? 12 : 8;

    const fanoutPrompt = `Analyze the seed prompt: "${seedPrompt}".
Destination/Subject: "${destination}"
Target Audience: "${audience}"
Target Domain: "${targetDomain}"
Observed Grounded Queries from Search so far: ${JSON.stringify(observedQueries)}

Generate a structured fan-out of ${queryCount} predicted related queries across realistic clusters (e.g., Planning, Timing and seasonality, Location, Transportation, Cost, Experiences, Attractions, Food and culture, Accessibility, Safety, Comparisons, Local knowledge, Commercial investigation, Transactional intent, Follow-up questions).

For each query, output:
- query (natural search query string)
- parentTopic
- cluster
- intent (one of: 'Informational' | 'Navigational' | 'Commercial investigation' | 'Transactional' | 'Local' | 'Comparative' | 'Planning' | 'Problem-solving')
- funnelStage (one of: 'Inspiration' | 'Research' | 'Planning' | 'Comparison' | 'Decision' | 'Booking' | 'Post-purchase')
- relevantEntities (array of entity strings)
- expectedAnswerType (description of ideal answer structure)
- commercialRelevance (integer 1 to 5)
- confidence (integer 50 to 99)`;

    const response = await callGeminiWithRetry(async (ai) => {
      return await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: fanoutPrompt,
        config: {
          systemInstruction: 'You are an expert SEO taxonomist and Search Intent Analyst. Return valid JSON only.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                query: { type: Type.STRING },
                parentTopic: { type: Type.STRING },
                cluster: { type: Type.STRING },
                intent: { type: Type.STRING },
                funnelStage: { type: Type.STRING },
                relevantEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
                expectedAnswerType: { type: Type.STRING },
                commercialRelevance: { type: Type.INTEGER },
                confidence: { type: Type.INTEGER },
              },
              required: ['query', 'parentTopic', 'cluster', 'intent', 'funnelStage', 'relevantEntities', 'expectedAnswerType', 'commercialRelevance', 'confidence'],
            },
          },
        },
      });
    });

    const parsed = JSON.parse(response.text || '[]');
    const mapped = parsed.map((item: any, idx: number) => ({
      id: `pred-q-${Date.now()}-${idx + 1}`,
      query: item.query,
      classification: 'AI-Predicted Fan-out' as const,
      parentTopic: item.parentTopic || 'Related Need',
      cluster: item.cluster || 'Planning',
      intent: item.intent || 'Informational',
      funnelStage: item.funnelStage || 'Research',
      relevantEntities: item.relevantEntities || [],
      expectedAnswerType: item.expectedAnswerType || 'Detailed answer',
      commercialRelevance: Number(item.commercialRelevance) || 3,
      confidence: Number(item.confidence) || 85,
      sourceOfDiscovery: 'AI Model Query Prediction Engine',
      humanApproved: false,
    }));

    return res.json({ queries: mapped });
  } catch (error: any) {
    console.error('Error generating predicted fan-out:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate fan-out queries' });
  }
});

// 3. Full Audit Analysis (Coverage matching, entity extraction, citations gap, opportunities scoring, action plan)
app.post('/api/audit/analyze-coverage', async (req, res) => {
  try {
    const {
      seedPrompt,
      destination,
      audience,
      targetDomain,
      competitorDomains = [],
      queries = [],
      groundedRuns = [],
      sitemapUrls = [],
      uploadedUrls = [],
      uploadedGscQueries = [],
    } = req.body;

    const targetUrls = Array.from(new Set([...(sitemapUrls || []), ...(uploadedUrls || [])]));

    const analysisPrompt = `Perform a comprehensive SEO & AI visibility coverage audit for:
Seed Prompt: "${seedPrompt}"
Destination/Subject: "${destination}"
Target Audience: "${audience}"
Target Domain: "${targetDomain}"
Competitors: ${JSON.stringify(competitorDomains)}
Target Site Known URLs: ${JSON.stringify(targetUrls.slice(0, 40))}
Queries to analyze: ${JSON.stringify(queries.slice(0, 30))}
Grounded Search Runs & Citations: ${JSON.stringify(groundedRuns.slice(0, 5))}
GSC Queries: ${JSON.stringify(uploadedGscQueries.slice(0, 10))}

TASK:
1. Match each query to the most relevant target-domain URL (or suggest appropriate hub/detail URL) and assign coverageStatus:
   'Covered' | 'Partially covered' | 'Not covered' | 'Wrong page type' | 'Covered but not cited' | 'Possible cannibalisation' | 'Technical issue' | 'Unable to verify'.
   Assign recommendedAction: 'Keep as is' | 'Add a section' | 'Expand an existing section' | 'Update outdated information' | 'Improve answer clarity' | 'Add first-hand expertise' | 'Add guide insights' | 'Add supporting evidence' | 'Improve entity relationships' | 'Add internal links' | 'Merge overlapping pages' | 'Create supporting content' | 'Create a new hub page' | 'Fix indexing or crawlability' | 'Human review required'.

2. Extract key entities (Attraction, Neighbourhood, Concept, Place, Organisation, Food, Activity) with relationships ('Located in' | 'Near' | 'Best visited during' | 'Connected by' | 'Suitable for' | 'Part of' | 'Compared with' | 'Requires' | 'Known to local guides for' | 'Often combined with'), importance, target coverage, missing relationships, and recommended content placement.

3. Calculate Content Opportunities scoring using exact formula:
   Frequency (1-5) * Relevance (1-5) * Intent Value (1-5) * Content Gap (1-5) * Business Value (1-5).
   Normalise to 100.
   Priority: 'High priority' (score >= 80) | 'Medium priority' (65-79) | 'Low priority' (50-64) | 'Needs validation' (< 50).

4. Generate prioritized Action Items grouped across categories:
   'Quick wins' | 'Update existing page' | 'Create supporting content' | 'Add local expertise' | 'Improve internal linking' | 'Technical fixes' | 'Human validation'.

5. Executive summary answering: What is working, Where target website is missing, What should be prioritised, What requires human validation.

Return strict JSON format matching the schema.`;

    const response = await callGeminiWithRetry(async (ai) => {
      return await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: analysisPrompt,
        config: {
          systemInstruction: `You are a Principal AI Search Strategist. Use precise domain terminology. Never invent mock data. Provide rigorous evidence-based justifications.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coverageAnalyses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    query: { type: Type.STRING },
                    cluster: { type: Type.STRING },
                    mostRelevantUrl: { type: Type.STRING },
                    pageTitle: { type: Type.STRING },
                    pageType: { type: Type.STRING },
                    coverageStatus: { type: Type.STRING },
                    coverageConfidence: { type: Type.INTEGER },
                    relevantTextSection: { type: Type.STRING },
                    missingInformation: { type: Type.STRING },
                    recommendedAction: { type: Type.STRING },
                    suggestedInternalLinks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isTargetDomainCited: { type: Type.BOOLEAN },
                    isCompetitorCited: { type: Type.BOOLEAN },
                    competingCitedDomains: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['query', 'cluster', 'mostRelevantUrl', 'pageTitle', 'coverageStatus', 'recommendedAction'],
                },
              },
              entities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING },
                    relationshipToMainTopic: { type: Type.STRING },
                    relationshipType: { type: Type.STRING },
                    relevantQueryClusters: { type: Type.ARRAY, items: { type: Type.STRING } },
                    importance: { type: Type.STRING },
                    targetSiteCoverage: { type: Type.STRING },
                    competitorCoverage: { type: Type.STRING },
                    citationFrequency: { type: Type.INTEGER },
                    missingContextualRelationships: { type: Type.STRING },
                    recommendedContentPlacement: { type: Type.STRING },
                  },
                  required: ['name', 'type', 'relationshipToMainTopic', 'relationshipType', 'importance', 'targetSiteCoverage', 'recommendedContentPlacement'],
                },
              },
              opportunities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    query: { type: Type.STRING },
                    cluster: { type: Type.STRING },
                    intent: { type: Type.STRING },
                    funnelStage: { type: Type.STRING },
                    observationFrequency: { type: Type.INTEGER },
                    relevanceScore: { type: Type.INTEGER },
                    intentValueScore: { type: Type.INTEGER },
                    contentGapScore: { type: Type.INTEGER },
                    citationPotentialScore: { type: Type.INTEGER },
                    calculatedScore: { type: Type.INTEGER },
                    priority: { type: Type.STRING },
                    priorityReason: { type: Type.STRING },
                    recommendedPage: { type: Type.STRING },
                    recommendedAction: { type: Type.STRING },
                    targetSiteCoverage: { type: Type.STRING },
                    competitorCited: { type: Type.BOOLEAN },
                    searchVolumeEstimate: { type: Type.STRING },
                  },
                  required: ['query', 'cluster', 'priority', 'priorityReason', 'recommendedPage', 'recommendedAction', 'calculatedScore'],
                },
              },
              actionPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    title: { type: Type.STRING },
                    supportingQuery: { type: Type.STRING },
                    recommendedUrl: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                    expectedImpact: { type: Type.STRING },
                    effort: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    owner: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ['category', 'title', 'supportingQuery', 'recommendedUrl', 'reason', 'evidence', 'expectedImpact', 'effort', 'priority'],
                },
              },
              summary: {
                type: Type.OBJECT,
                properties: {
                  strongCoverageSummary: { type: Type.STRING },
                  quickWinsSummary: { type: Type.STRING },
                  contentGapsSummary: { type: Type.STRING },
                  citationOpportunitiesSummary: { type: Type.STRING },
                  whatIsWorking: { type: Type.ARRAY, items: { type: Type.STRING } },
                  whereMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
                  whatToPrioritise: { type: Type.ARRAY, items: { type: Type.STRING } },
                  requiresHumanValidation: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['strongCoverageSummary', 'quickWinsSummary', 'contentGapsSummary', 'citationOpportunitiesSummary', 'whatIsWorking', 'whereMissing', 'whatToPrioritise', 'requiresHumanValidation'],
              },
            },
            required: ['coverageAnalyses', 'entities', 'opportunities', 'actionPlan', 'summary'],
          },
        },
      });
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing coverage:', error);
    return res.status(500).json({ error: error.message || 'Failed to complete coverage analysis' });
  }
});

// 4. Server-side Sitemap & URL Fetcher Proxy
app.post('/api/audit/fetch-sitemap', async (req, res) => {
  try {
    const { sitemapUrl } = req.body;
    if (!sitemapUrl || !sitemapUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Valid URL starting with http:// or https:// is required.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(sitemapUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QueryFanoutAuditor/1.0; +https://ai.studio)',
        Accept: 'application/xml,text/xml,text/plain,*/*',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Remote server returned HTTP ${response.status} ${response.statusText}`,
        isCrawlBlocked: true,
      });
    }

    const text = await response.text();
    // Parse <loc> tags from XML sitemap
    const locMatches = Array.from(text.matchAll(/<loc>(.*?)<\/loc>/gi)).map((m) => m[1].trim());

    // Filter out image or video assets
    const cleanUrls = locMatches
      .filter((u) => !u.match(/\.(jpg|jpeg|png|webp|gif|svg|pdf|mp4|zip)$/i))
      .slice(0, 100);

    const isIndex = text.includes('<sitemapindex') || text.includes('<sitemap>');

    return res.json({
      url: sitemapUrl,
      isIndex,
      extractedUrlsCount: cleanUrls.length,
      urls: cleanUrls,
      crawlStatus: 'success',
    });
  } catch (error: any) {
    console.error('Error fetching sitemap:', error);
    return res.status(500).json({
      error: error.name === 'AbortError' ? 'Sitemap fetch timed out after 8 seconds.' : error.message || 'Failed to fetch sitemap.',
      isCrawlBlocked: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Query Fan-out & AI Coverage Auditor running on http://localhost:${PORT}`);
  });
}

startServer();
