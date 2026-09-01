# Live analysis data isolation

- Live projects no longer fall back to the Montreal showcase dataset when a proxy response omits a section.
- Query clusters and test prompts are derived from the current analysis when the coverage response does not provide them.
- Summary totals are calculated from the current project only.
- Previously saved non-Montreal projects are sanitised to remove leaked Montreal rows when loaded.
- Newly created test prompts use the active project subject, query, domain, and uploaded target URL.

The Montreal dataset remains available only through the explicitly labelled showcase/demo action.
