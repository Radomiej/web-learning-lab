# Umami: Web Learning Lab

Dashboard: https://mws03-52051.wykr.es/websites/9785c7d6-9c5f-4441-8696-47c8d3382ff0
Website ID: `9785c7d6-9c5f-4441-8696-47c8d3382ff0`. Public configuration lives in `src/services/labAnalytics.js`.
Only the exact production hostname is tracked; localhost and preview deployments are excluded.
Set `VITE_ANALYTICS_ENABLED=false` to disable tracking. Browser Do Not Track is respected.

## Events
- `lesson_open`, `task_open`: stable curriculum IDs, topic and current task.
- `topic_change`: topic selection.
- `task_run_started`, `task_run_result`: execution and coarse outcome.
- `technical_error`: uncaught error / unhandled rejection class only, capped at 10 per page.
- `resource_download`: PDF, archive or project export category; no file contents or user filenames.
- `lesson_search`: search usage and length bucket if a search field exists; no search text.
- `task_check_started`, `task_reset`, `solution_open`: check, reset and solution view. Results include check count and error count.

## Privacy and rollout
No student code, SQL, prompts, query results, connection details, names, installation IDs, raw errors or stacks are sent to Umami. No session recordings. Analytics failure never blocks learning.
Java's existing optional teacher session telemetry is a separate feature, unchanged by this integration; its snapshots are not forwarded to Umami.
No extra npm dependencies or private API keys. Deploy this local change to activate collection. Website creation is complete, but production reception has not been verified before deployment.
No tests were added or run for this change. Visual behavior is unchanged; no visual QA was run.
