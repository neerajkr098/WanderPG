# Migration Plan — WanderNest → WanderPG

**Goal**: Evolve the working WanderNest app into WanderPG without losing features or data. The original repo is in GitHub (`neerajkr098/WanderNest`); work on a new branch `wanderpg/phase-0`.

## Phase 0 — Fix and secure the base (about 1 week)
Do before any new feature.
- Rotate all credentials that were pasted in chat (Atlas user, Cloudinary secret, session secret, check Mapbox token).
- Move secrets to `.env` only; confirm `.env` has never been committed (`git log --all -- .env`). If it has, rewrite history or treat it as leaked.
- Add scripts: start (`node app.js`), test, lint, audit.
- Use `process.env.PORT || 8080`.
- Fix: session error handler (`err` undefined), `saveUninitialized: false`, cookie expires as Date, secure cookie in production.
- Fix: Cloudinary `allowdFormat` → `allowed_formats`; use folder per environment.
- Fix: XSS in `views/listings/show.ejs` (JSON in `<script>`) and `public/js/map.js` (`setHTML` with title).
- Fix: owner email exposed in page JSON (remove from payload).
- Fix: review `createdAt` default (`default: Date.now`).
- Fix: `isOwner` and `isReviewAuthor` handle missing records (404).
- Fix: check `features.length` before reading geometry; re-geocode on address change.
- Fix: delete and review buttons only shown when allowed; enforce on server (already done).
- Fix: signup controller `next` undefined; check unique email.
- Remove `console.log(savedListing)`.
- Add helmet, CSRF protection, rate limits on login and signup, `express-mongo-sanitize`.
- Add Mapbox `permanent=true` for stored geocodes (after confirming plan).
- Update README to match what the app actually does (remove "role-based" and "sanitized" claims until true).

**Acceptance**: `npm audit` clean (high/critical), app starts with `npm start`, existing flows still work (signup, login, create, edit, delete listing, review).

## Phase 1 — Data model (about 1 week)
- Add role to users. Existing users default to student. Owners are set manually for now.
- Add College model with GeoJSON location and 2dsphere index. Seed launch college with geocoded coordinates.
- Rename Listing → PG collection? Decision: keep the collection name listings for now to avoid data churn. Add new fields (area, rentMin, rentMax, roomTypes, foodOptions, facilities, rules, status, isAvailable, isDeleted, ownerId).
- Rename geometry → location (migration script updates documents; keep geometry readable for one release).
- Migration script `init/migrations/001-pg-fields.js`: set `status = 'approved'` for existing listings (they were already public), `isAvailable = true`, `rentMin = rentMax = price`, `roomTypes = ['double']` (ask owner; placeholder), `ownerId = owner`.
- Add 2dsphere index on `listings.location`.
- Test on a copy of the database first. Back up with `mongodump` before running.

**Acceptance**: Existing listings still show; new fields have defaults; index exists; migration is re-runnable (idempotent).

## Phase 2 — Nearby search (about 1–2 weeks)
- Build `services/geoSearch.js` with `$geoNear`: near (college), distanceField, maxDistance (5000 default), spherical: true, query (approved, available, not deleted, filters), `$skip`, `$limit`.
- College search `GET /colleges`, college page `GET /colleges/:id`.
- Distance group labels in `utils/distanceLabel.js`.
- Filters and sorting; pagination.
- Replace navbar search with college search; remove decorative category icons from index page (keep them only if useful).

**Acceptance**: For the launch college, results match a manual check of 5 PGs (distance within 50 m of Google Maps walking distance is not required; straight-line is fine, state it on the page).

## Phase 3 — Map and list (about 1 week)
- Map on college page: college marker, PG markers (max 100), popup with a link (text content only).
- List and map share the same filtered data.
- Anonymous visitors see approximate location circles.

## Phase 4 — Owner tools (about 2 weeks)
- Owner dashboard, create/edit/delete with status workflow, availability toggle.
- Multi-image upload (8 max) with alt text and validation.
- Enquiry inbox for owners.

## Phase 5 — Trust and moderation (about 1–2 weeks)
- Admin queue for pending listings and reports.
- Reports and auto-hide at 3 open reports.
- Reviews limited to students with enquiries.
- Audit log.

## Phase 6 — Students (about 1 week)
- Favourites, profile page, mobile polish, accessibility pass.

## Phase 7 — Launch (about 1 week)
- Seed 3 colleges (one real launch college) and 20 real PGs after owner outreach (no fake listings in production).
- Privacy notice, terms, contact page, grievance email (DPDP — see `FEATURES_RESEARCH.md`).
- Monitoring (uptime check, error logs), backups (Atlas snapshots).
- Soft launch with 1 college.

## Rollback
- Each phase on its own branch and tag (`wanderpg-phase-0`, etc.).
- Before any migration: `mongodump` backup, documented restore steps.
- Feature flags via environment variables for new search and owner dashboard.

## Risks
- Owners do not list → run outreach before launch.
- Mapbox cost or terms → confirm permanent geocoding pricing before Phase 1 ships.
- Fake listings → admin review, reports, and owner phone verification later (OTP).
- Scope creep → use PRD non-goals; reject new features until MVP is live.
