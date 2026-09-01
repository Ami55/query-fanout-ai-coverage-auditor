# Sitemap validation fix

- Sitemap verification now uses this Vercel project’s own `/api/fetch-sitemap` function instead of the shared Gemini proxy.
- Requests use XML-compatible, browser-like headers and a bounded timeout.
- Sitemap indexes can be expanded into page URLs from their child sitemaps.
- HTTP 403 is described correctly as access blocking, not an invalid sitemap.
- XML sitemap files can be uploaded directly and their `<loc>` URLs are extracted in the browser.

The Gemini proxy remains responsible for the AI analysis actions. It is no longer involved in sitemap retrieval.
