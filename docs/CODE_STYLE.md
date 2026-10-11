# Code Style & Conventions — WanderPG

## 1. General Principles
- Prefer readable code over clever code.
- Keep functions focused (one job, under about 40 lines).
- Avoid unnecessary abstractions. Three similar lines beat a premature helper.
- Reuse existing middleware, utils and Joi schemas.
- Prefer consistency with existing WanderNest code over personal preference.

## 2. Naming
- **Files**: kebab-case or lowercase (`geo-search.js` or `geoSearch.js`; pick one and keep it. Existing files use lowercase single words, so use `geoSearch.js`).
- **Variables and functions**: camelCase.
- **Classes and Mongoose models**: PascalCase (`Listing`, `College`).
- **Constants**: `UPPER_SNAKE_CASE` for env-level constants only.
- **Views**: lowercase folder per resource (`views/pgs/show.ejs`).
- **Database fields**: camelCase (see `DATABASE.md`).
- **API routes**: plural nouns, lowercase, hyphen for multi-word (`/colleges/:id/pgs`, `/owner/pgs`, `/admin/reports`).
- Routes use `:id` for MongoDB ObjectIds.

## 3. Folder Structure
- `routes/` only wires paths to middleware and controllers.
- `controllers/` handles request and response. No Mongo queries except via services.
- `services/` holds business logic and DB queries (geo search, geocoding, uploads, moderation).
- `models/` holds schemas, indexes and small instance methods. No HTTP code.
- `middleware.js` holds auth, role, ownership and validation guards.
- `utils/` holds generic helpers only.
- Do not create a new top-level folder without updating `ARCHITECTURE.md`.

## 4. Imports
- Use CommonJS (`require`) to match the existing project (`"type": "commonjs"`).
- Group imports: built-in, third-party, local. Blank line between groups.
- Use relative paths with `./` or `../`. No deep imports into `node_modules`.
- Do not import a model in a view or a route file for writes.

## 5. Components (EJS partials)
- Components should:
  - Have a single responsibility (`pgCard.ejs`, `filterPanel.ejs`, `flash.ejs`).
  - Accept data through locals, never query the database.
  - Prefer reusing `views/includes/` partials.
  - Avoid duplicating the card markup in list and map views.

## 6. Functions
- Functions should:
  - Do one logical thing.
  - Have clear names (`buildNearbyPipeline`, not `doStuff`).
  - Avoid unnecessary complexity. Early return for guard clauses.
  - Use `async`/`await`. Never mix callbacks and promises.

## 7. Error Handling
- Use: `wrapAsync` around async route handlers; throw `ExpressError(status, message)` for expected errors; central error handler in `app.js`.
- Do not: swallow errors with empty `catch {}`; send `err.message` or stack traces to users in production; use `console.log` for production logging (use the logger).
- Check for missing records before reading fields (`if (!listing) ...`). Never assume `features[0]` exists.
- Validation errors: return 400 with generic field messages.
- Not found: 404 page. Forbidden: 403 page or 404 for other users' private records.

## 8. Comments
- Comments should explain:
  - Why something exists (e.g. "Mapbox temporary geocoding forbids storing results, so we use permanent=true").
  - Important tradeoffs (e.g. "Distances are computed in MongoDB to avoid loading all PGs").
  - Non-obvious behaviour (e.g. "Owner phone hidden for anonymous users to reduce scraping"). Avoid comments that simply repeat the code.

## 9. Logging
- Use: pino (added in migration) with redaction for password, token, secret, phone, email and message fields.
- Rules:
  - No `console.log` of database records or request bodies.
  - Log levels: info for important actions, warn for rate limits and failed logins, error for failures with request id.
  - Never log secrets (see `SECURITY.md` section 7).

## 10. Formatting
- Formatter: Prettier (2 spaces, double quotes, semicolons, trailing commas all, 80 columns).
- Linter: ESLint with `eslint:recommended` plus `plugin:security` (`eslint-plugin-security`) and `plugin:no-unsanitized` for EJS and browser code.
- Type Checking: Not used in MVP. Add JSDoc types for services if useful.

## 11. Do
- Reuse established patterns (`wrapAsync`, middleware guards, Joi schemas).
- Keep changes focused on the task.
- Follow project conventions in this file.
- Remove dead code and unused imports (e.g. the unused `required` import in `models/listing.js`).

## 12. Don't
- Create duplicate utilities.
- Introduce unnecessary dependencies. Check with `npm audit` and explain the reason.
- Ignore the existing architecture (`routes → controllers → services → models`).
- Change unrelated files.
- Put secrets, real phone numbers or real owner details in code, seeds or fixtures.
