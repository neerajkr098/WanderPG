# WanderPG — Agent Instructions

WanderPG helps students find PG (paying guest) accommodation near their college. Owners publish listings; students search, compare and contact owners.

## Read first, every session
1. `docs/PRD.md` — what we build and what is out of scope.
2. `docs/SECURITY.md` — non-negotiable security rules.
3. `docs/ARCHITECTURE.md` and `docs/DATABASE.md` — structure and data model.
4. `docs/MIGRATION_PLAN.md` — we are evolving the existing WanderNest Express/MongoDB app, not rewriting it.

## Rules
- Inspect existing code before changing it. Reuse `middleware.js`, `utils/`, `cloudConfig.js` and the EJS layout.
- Make one scoped change at a time. Do not change unrelated files.
- Never hard-code credentials, colleges, PG results, distances or coordinates. Distances come from MongoDB `$geoNear`.
- Never print, log or commit `.env` values. Never paste real secrets into code, docs or prompts.
- Do not invent business rules. If a requirement conflicts with a doc, stop and ask (see `docs/PROMPTS.md`).
- Do not add a dependency without stating why and checking it with `npm audit`.
- Update the relevant doc when behaviour, schema, routes or security rules change.

## Done means
Requirements met, acceptance criteria in `docs/PRD.md` satisfied, `npm test` and `npm run lint` pass, `npm audit` shows no high or critical issues, docs updated.
