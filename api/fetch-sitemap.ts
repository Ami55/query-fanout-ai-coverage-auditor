const MAX_URLS = 500;
const MAX_CHILD_SITEMAPS = 12;

function extractLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi))
    .map((match) => match[1]
      .replace(/^<!\[CDATA\[|\]\]>$/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim())
    .filter(Boolean);
}

function assertSafePublicUrl(value: string): URL {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP or HTTPS sitemap URLs are supported.');
  const hostname = url.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '::1' || hostname.endsWith('.local') ||
      /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) ||
      /^169\.254\./.test(hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) {
    throw new Error('Private or local network URLs are not allowed.');
  }
  return url;
}

async function fetchXml(url: string): Promise<string> {
  assertSafePublicUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'application/xml,text/xml,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-CA,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });
    if (!response.ok) {
      const error = new Error(`Remote website blocked the sitemap request (HTTP ${response.status}).`) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    const text = await response.text();
    if (!/<(?:urlset|sitemapindex)\b/i.test(text)) throw new Error('The response is not a recognised XML sitemap.');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const sitemapUrl = String(req.body?.sitemapUrl || '').trim();
    if (!sitemapUrl) return res.status(400).json({ error: 'A sitemap URL is required.' });

    const rootXml = await fetchXml(sitemapUrl);
    const rootLocs = extractLocs(rootXml);
    const isIndex = /<sitemapindex\b/i.test(rootXml);
    let urls: string[] = [];
    let childSitemapsRead = 0;

    if (isIndex) {
      const children = rootLocs.filter((url) => /\.xml(?:\.gz)?(?:[?#]|$)/i.test(url)).slice(0, MAX_CHILD_SITEMAPS);
      const results = await Promise.allSettled(children.map(fetchXml));
      for (const result of results) {
        if (result.status === 'fulfilled') {
          childSitemapsRead += 1;
          urls.push(...extractLocs(result.value));
        }
      }
    } else {
      urls = rootLocs;
    }

    urls = Array.from(new Set(urls))
      .filter((url) => /^https?:\/\//i.test(url))
      .filter((url) => !/\.(?:jpg|jpeg|png|webp|gif|svg|pdf|mp4|zip)(?:[?#]|$)/i.test(url))
      .slice(0, MAX_URLS);

    if (urls.length === 0) {
      return res.status(422).json({
        error: isIndex
          ? 'The sitemap index was accessible, but its child sitemaps could not be read. Upload the XML file or paste URLs instead.'
          : 'The sitemap was accessible but contained no page URLs.'
      });
    }

    return res.status(200).json({
      url: sitemapUrl,
      isIndex,
      childSitemapsRead,
      extractedUrlsCount: urls.length,
      urls,
      crawlStatus: 'success'
    });
  } catch (error: any) {
    const blocked = error?.status === 401 || error?.status === 403 || error?.status === 429;
    const timedOut = error?.name === 'AbortError';
    return res.status(blocked ? 403 : timedOut ? 504 : 500).json({
      error: blocked
        ? 'ToursByLocals blocked the server request. Your sitemap may still be valid—download and upload the XML file below.'
        : timedOut
          ? 'The sitemap request timed out. Upload the XML file below.'
          : error?.message || 'The sitemap could not be read.',
      isCrawlBlocked: blocked
    });
  }
}
