# Query Fan-out App Update

This version is configured to call:

`https://gemini-proxy-2-pearl.vercel.app/api/query-fanout-auditor`

## Deploy the updated app

1. Replace the files in the Query Fan-out GitHub repository with this package.
2. Commit the changes. Vercel should redeploy the frontend automatically.
3. In Vercel, open the `gemini-proxy-2-pearl` project.
4. Confirm `GEMINI_API_KEY` exists under **Settings > Environment Variables** for Production.
5. Add prepaid Gemini API credits or replace the key with one from a funded Google AI project.
6. Redeploy the proxy after changing the environment variable.

The proxy root URL may show `404 NOT_FOUND`; that is expected for an API-only project. The route used by this app is `/api/query-fanout-auditor`.

## Included fixes

- Uses the correct Pearl proxy hostname.
- Displays the real proxy/Gemini error instead of silently loading demo results.
- Stops the audit when a grounded run fails.
- Sends country and language to grounded-search requests.
- Sends uploaded Google Search Console query data to coverage analysis.

## Verification

The project passes `tsc --noEmit` and the Vite production build.
