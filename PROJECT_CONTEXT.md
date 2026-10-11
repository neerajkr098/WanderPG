# PROJECT_CONTEXT.md — WanderPG

> Last updated: 2026-10-11

---

## 1. Project Name, Purpose, and Tech Stack

### Name
**WanderPG** — evolved from the WanderNest codebase.

### Purpose
A server-rendered marketplace where students find PG (Paying Guest) accommodation near their college, sorted by real distance using MongoDB `$geoNear`. Owners list and manage PGs; an admin approves/rejects listings and handles reports.

### Tech Stack (verified from `package.json` and source)
| Layer | Technology | Version (from `package.json`) |
|---|---|---|
| Runtime | Node.js | `24.21.0` (pinned in `engines`) |
| Framework | Express | `^5.2.1` |
| Database | MongoDB via Mongoose | `^9.10.2` |
| Templates | EJS + `ejs-mate` | `^6.0.1` / `^4.0.0` |
| Auth | `passport` + `passport-local` + `passport-local-mongoose` | `^0.7.0` / `^1.0.0` / `^9.2.0` |
| Sessions | `express-session` + `connect-mongo` | `^1.19.0` / `^6.0.0` |
| Validation | `joi` | `^18.2.9` |
| Geocoding & Maps | `@mapbox/mapbox-sdk` + Mapbox GL JS (CDN v3.32.0) | `^0.16.2` |
| Image uploads | `cloudinary` + `multer` + `multer-storage-cloudinary` | `^1.41.3` / `^2.4.0` / `^4.0.0` |
| Security | `helmet`, `csrf-sync`, `express-mongo-sanitize`, `express-rate-limit` | `^8.3.0` / `^4.2.1` / `^2.2.0` / `^8.7.1` |
| Styling | Bootstrap 5.3.8 (CDN), Font Awesome 7.3.1 (CDN), Plus Jakarta Sans (Google Fonts), custom CSS |  |
| Flash messages | `connect-flash` | `^0.1.1` |
| HTTP method override | `method-override` | `^3.0.0` |

### External Services (from `.env` keys and code)
- **MongoDB Atlas** (`ATLASDB_URL`)
- **Cloudinary** (`CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`)
- **Mapbox** (`MAP_TOKEN` — public token exposed to browser for map display)

---

## 2. Features Already Implemented and Verified

The following is verified by reading the actual source code (models, routes, controllers, middleware, views):

### ✅ Fully Implemented (from code inspection)
| Feature | Evidence |
|---|---|
| **User auth (signup, login, logout)** | `passport-local-mongoose` on User model; routes in `routes/user.js`; controllers in `controllers/users.js`; views `signup.ejs`, `login.ejs`; session-based auth with `connect-mongo` store |
| **Session management** | `express-session` with MongoStore; `saveUninitialized: false` ✅ (fixed); cookie: `httpOnly`, `secure` in production, `sameSite: 'lax'`, `expires` as Date object ✅ (fixed) |
| **Listing CRUD (create, read, update, delete)** | Full MVC: model `models/listing.js`, routes `routes/listing.js`, controller `controllers/listings.js`; views: `index.ejs`, `new.ejs`, `edit.ejs`, `show.ejs` |
| **Image upload to Cloudinary** | `cloudConfig.js` with `multer-storage-cloudinary`; `allowed_formats: ["png", "jpg", "jpeg"]` ✅ (typo fixed from original `allowdFormat`); folder per env (`WanderPG_DEV` / `WanderPG_PROD`) ✅ |
| **Geocoding on listing create** | `controllers/listings.js` calls Mapbox `forwardGeocode` on create; stores result in `listing.geometry`; checks `features.length` before reading ✅ (fixed) |
| **Map display on show page** | `views/listings/show.ejs` includes `#map` div with data attributes; `public/js/map.js` renders Mapbox GL map with marker and popup using `textContent` ✅ (XSS fixed — uses `setDOMContent` with `createElement`) |
| **Review CRUD (create, delete)** | Model `models/review.js`; routes `routes/review.js`; controller `controllers/reviews.js`; review form and display in `show.ejs`; star rating UI via `starability` CSS |
| **Review `createdAt` default** | `default: Date.now` ✅ (function reference, not invocation — fixed) |
| **Auth middleware (`isLoggedIn`)** | `middleware.js` — redirects unauthenticated users with flash message; saves redirect URL in session |
| **Ownership middleware (`isOwner`)** | `middleware.js` — validates ObjectId, fetches listing from DB, compares `owner._id` to `currUser._id`; returns 404 on mismatch ✅ (no information leak) |
| **Review author check (`isReviewAuthor`)** | `middleware.js` — validates both ObjectIds, fetches review, checks author; returns 404 on mismatch ✅ |
| **Joi server-side validation** | `schema.js` validates listing fields (title, description, location, country, price, image) and review fields (rating, comment); enforced by `validateListing` / `validateReview` middleware |
| **CSRF protection** | `csrf-sync` in `app.js`; token generated per request via `generateToken(req)` and passed to all views as `csrfToken`; hidden `_csrf` field in every form ✅ |
| **Helmet security headers** | Configured with Content-Security-Policy allowing Bootstrap, Font Awesome, Mapbox, Google Fonts, Cloudinary, Unsplash CDNs |
| **MongoDB injection prevention** | `express-mongo-sanitize` applied globally |
| **Rate limiting (login & signup)** | `routes/user.js`: login 10/15min, signup 5/1hr per IP |
| **Central error handler** | `app.js` catches all errors; generic messages in production; stack traces only in development ✅ |
| **404 catch-all** | `app.all("/{*splat}", ...)` with Express 5 syntax ✅ |
| **Edit/Delete buttons hidden from non-owners** | `show.ejs` checks `currUser && listing.owner._id.equals(currUser._id)` ✅ |
| **Review delete button hidden from non-authors** | `show.ejs` checks `currUser && review.author._id.equals(currUser._id)` ✅ |
| **Flash messages** | `connect-flash` for success/error; rendered in `includes/flash.ejs` |
| **Logout as POST** | Navbar uses a form with `POST /logout` and CSRF token ✅ (not a GET link) |
| **Duplicate email check on signup** | `controllers/users.js` checks `User.findOne({ email })` before registering; generic error message (no user enumeration) ✅ |

### ⚠️ Partially Implemented or Pending Verification
| Item | Status |
|---|---|
| **User roles** | User model has only `email` — **no `role` field yet** (student/owner/admin). All users have equal permissions for listing CRUD. |
| **Geocoding with `permanent=true`** | `controllers/listings.js` calls `forwardGeocode` without `permanent: true`. Storing coordinates may violate Mapbox terms. |
| **Re-geocoding on listing update** | `updateListing` controller does NOT re-geocode when the location text changes. |
| **Search (navbar)** | Navbar has a search input and button, but the form has no `action` attribute and no backend handler — **non-functional**. |
| **Filters on index page** | Category filter icons (Trending, Rooms, Mountains, etc.) are decorative only — no click handlers or backend filtering. |
| **Tax toggle** | Index page has a "Display total after taxes" switch that shows/hides "+18% GST" labels — **cosmetic only**, no real tax calculation. |

---

## 3. Current Development Phase and Task in Progress

### Phase: **Phase 0 — Fix and Secure the Base**
Per `docs/MIGRATION_PLAN.md`, Phase 0 must be completed before any new features.

### Phase 0 Completion Status

| Task | Status |
|---|---|
| Move secrets to `.env`; confirm `.env` not committed | ✅ `.gitignore` has `.env`; no git repo initialized yet so no history risk |
| Add npm scripts: start, test, lint, audit | ✅ All four present in `package.json` |
| Use `process.env.PORT \|\| 8080` | ✅ `app.js` line 186 |
| Fix session error handler (`err` undefined) | ✅ `store.on("error", (err) =>` correctly references `err` |
| Fix `saveUninitialized: false` | ✅ `app.js` line 114 |
| Fix cookie `expires` as Date | ✅ `new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)` |
| Fix `secure` cookie in production | ✅ `secure: isProduction` |
| Fix Cloudinary `allowdFormat` → `allowed_formats` | ✅ `cloudConfig.js` line 17 |
| Fix Cloudinary folder per environment | ✅ `WanderPG_DEV` / `WanderPG_PROD` |
| Fix XSS in show.ejs (JSON in `<script>`) | ✅ Map data now uses `data-coordinates` and `data-title` attributes instead of inline JSON |
| Fix map.js popup XSS (setHTML with title) | ✅ Uses `createElement` + `textContent` + `setDOMContent` |
| Fix owner email exposure in page JSON | ✅ No JSON payload with owner data in the page; owner populated only in controller |
| Fix review `createdAt` default | ✅ `default: Date.now` (function ref) |
| Fix `isOwner` handle missing records | ✅ Returns 404 on null listing |
| Fix `isReviewAuthor` handle missing records | ✅ Returns 404 on null review |
| Fix `features.length` check before reading geometry | ✅ `createListing` checks `!response.body.features \|\| response.body.features.length === 0` |
| Fix delete/review buttons visibility | ✅ Conditional rendering checks owner/author identity |
| Fix signup controller `next` undefined | ✅ `signup` function signature is `(req, res, next)` |
| Fix unique email check on signup | ✅ Checks `User.findOne({ email })` with generic error |
| Remove `console.log(savedListing)` | ✅ Not present in current code |
| Add helmet | ✅ With full CSP config |
| Add CSRF protection | ✅ `csrf-sync` on all state-changing methods |
| Add rate limits on login and signup | ✅ In `routes/user.js` |
| Add `express-mongo-sanitize` | ✅ Applied globally |

### Current Development Phase: **Phase 2 — Nearby Search**

| Task | Status | Notes |
|---|---|---|
| **Phase 0: Base Security & Tooling** | ✅ Completed & Committed | Git initialized, 0 audit vulnerabilities, 0 lint warnings |
| **Phase 1: Data Model** | ✅ Completed & Committed | User roles, College model, PG fields, migration script, 19 tests |
| **Launch College Seeding** | ✅ Completed | `init/colleges.js` & `init/seedColleges.js` |
| **Distance Grouping Utility** | ✅ Completed | `utils/distanceLabel.js` (<500m, 500m-1km, 1-5km) |
| **Nearby Search Service** | ✅ Completed | `services/geoSearch.js` with `$geoNear` aggregation & filters |
| **College Routes & Controller** | ✅ Completed | `routes/college.js`, `controllers/colleges.js` |
| **College Directory & Map Views** | ✅ Completed | `views/colleges/index.ejs`, `views/colleges/show.ejs`, `public/js/collegeMap.js` |
| **Navbar College Search** | ✅ Completed | Integrated with `GET /colleges` in `views/includes/navbar.ejs` |
| **Test Suite** | ✅ Passing | 26 unit tests across 8 test suites |

---

## 4. Files and Implementation Decisions

### Project Structure (actual)
```
WanderPG/
├── app.js                     # Entry point: middleware stack, routes, error handling
├── middleware.js               # isLoggedIn, saveRedirectUrl, isOwner, isReviewAuthor, validate*
├── schema.js                   # Joi schemas for listing and review
├── cloudConfig.js              # Cloudinary + multer-storage-cloudinary config
├── package.json                # Dependencies, scripts, engine pin
├── .env                        # Secrets (gitignored)
├── .gitignore                  # .env, node_modules/
├── README.md                   # Setup instructions
├── AGENTS.md                   # Agent behavioral rules
├── models/
│   ├── listing.js              # Listing schema (title, desc, image, price, location, country, geometry, owner, reviews)
│   ├── review.js               # Review schema (comment, rating, createdAt, author)
│   └── user.js                 # User schema (email + passport-local-mongoose plugin)
├── routes/
│   ├── listing.js              # /listings CRUD routes
│   ├── review.js               # /listings/:id/reviews routes
│   └── user.js                 # /signup, /login, /logout routes + rate limiters
├── controllers/
│   ├── listings.js             # index, show, create, edit, update, delete
│   ├── reviews.js              # create, delete
│   └── users.js                # signup, login, logout
├── utils/
│   ├── ExpressError.js         # Custom error class (statusCode + message)
│   └── wrapAsync.js            # Async error wrapper for Express
├── views/
│   ├── layouts/boilerplate.ejs # HTML shell with CDN links
│   ├── includes/
│   │   ├── navbar.ejs          # Navigation bar with search, auth links, CSRF logout
│   │   ├── flash.ejs           # Success/error flash alerts
│   │   └── footer.ejs          # Footer with social links (still says "WanderNest Private Limited")
│   ├── listings/
│   │   ├── index.ejs           # All listings grid with decorative filters and tax toggle
│   │   ├── new.ejs             # Create listing form
│   │   ├── edit.ejs            # Edit listing form
│   │   └── show.ejs            # Listing detail with map, reviews, edit/delete buttons
│   ├── users/
│   │   ├── signup.ejs          # Signup form
│   │   └── login.ejs           # Login form
│   └── error.ejs               # Generic error page
├── public/
│   ├── css/
│   │   ├── style.css           # Main stylesheet (Plus Jakarta Sans, WanderPG branding)
│   │   └── rating.css          # Starability star rating CSS
│   └── js/
│       ├── map.js              # Mapbox GL map init with safe popup rendering
│       └── script.js           # Bootstrap form validation
├── init/
│   ├── index.js                # Seed script (geocodes sample data, hard-coded owner ID + local Mongo URL)
│   └── data.js                 # Sample listing data (14 KB)
└── docs/                       # 10 documentation files (PRD, SECURITY, ARCHITECTURE, etc.)
```

### Key Implementation Decisions (from code)
1. **Extend WanderNest, don't rewrite**: The codebase is the original WanderNest with Phase 0 security fixes applied. Collection is still `listings`, field is still `geometry`.
2. **Express 5**: Using Express 5 syntax (e.g., `/{*splat}` catch-all, native async error forwarding via `wrapAsync`).
3. **CSRF via `csrf-sync`**: Replaced deprecated `csurf`; token injected in every response via `res.locals.csrfToken`.
4. **Map data via data attributes**: Show page passes coordinates and title via `data-coordinates` and `data-title` on the `#map` div instead of inline `<script>` JSON (XSS fix).
5. **MAP_TOKEN still in inline `<script>`**: `show.ejs` line 3 renders `process.env.MAP_TOKEN` in a `<script>` tag. This is the public Mapbox token (designed for browser use per SECURITY.md), but it bypasses CSP `'unsafe-inline'`.
6. **MongoStore import with fallback**: `app.js` lines 16–19 use a multi-fallback import pattern for `connect-mongo` to handle different export styles.
7. **No services layer yet**: Controllers call models directly. `services/` directory does not exist.

---

## 5. Pending Tasks, Known Bugs, and Errors

### Known Bugs (verified in code)
| # | Bug | File | Line(s) | Status |
|---|---|---|---|---|
| 1 | **Flash messages say "WanderNest"** | `controllers/users.js` | L20, L34 | Fixed ✅ |
| 2 | **Footer says "WanderNest Private Limited"** | `views/includes/footer.ejs` | L8 | Fixed ✅ |
| 3 | **No re-geocoding on listing update** | `controllers/listings.js` | `updateListing` | Pending |
| 4 | **Old Cloudinary image not deleted on update or listing delete** | `controllers/listings.js` | `updateListing` and `destroyListing` | Pending |
| 5 | **Seed script uses hard-coded owner ID and local Mongo URL** | `init/index.js` | L36, L10 | Pending (update in Phase 1 seed) |
| 6 | **No multer file size or count limit** | `routes/listing.js` | `upload` middleware | Fixed ✅ (5MB limit set) |
| 7 | **Navbar search is non-functional** | `views/includes/navbar.ejs` | Form has no action/method | Pending (Phase 2 feature) |
| 8 | **Index filter icons are decorative only** | `views/listings/index.ejs` | No click handlers | Pending (Phase 2 feature) |
| 9 | **Footer privacy/terms links lead to 404** | `views/includes/footer.ejs` | No routes | Pending (Phase 7) |
| 10 | **Mapbox GL JS loaded on every page** | `views/layouts/boilerplate.ejs` | L26–29 | Pending |
| 11 | **Joi schema allows unknown fields** | `schema.js` | Schema definitions | Fixed ✅ (`.unknown(false)` added) |
| 12 | **`listing.owner` populated with all fields** | `controllers/listings.js` | `.populate("owner", "username")` | Fixed ✅ (only username returned) |
| 13 | **`review.save(newReview)` passes unnecessary argument** | `controllers/reviews.js` | L9 | Fixed ✅ |
| 14 | **No `webp` in allowed upload formats** | `cloudConfig.js` | Allowed formats | Fixed ✅ (webp added) |
| 15 | **CSS typo: `border-radius: 1 rem`** | `public/css/style.css` | L68 | Fixed ✅ |

### Phase 0 Tasks Status
- [x] Initialize git repository on branch `wanderpg/phase-0`
- [x] Configure remote origin (`https://github.com/neerajkr098/WanderPG.git`)
- [x] Add ESLint configuration (`eslint.config.js`) and pass `npm run lint` (0 errors, 0 warnings)
- [x] Create `tests/` directory and test suite passing (`npm test` - 11/11 tests pass)
- [x] Fix brand names in flash messages and footer
- [x] Add WebP support and EXIF stripping in Cloudinary config
- [x] Add multer 5 MB file size limit
- [x] Harden Joi validation schemas with `.unknown(false)` and max constraints
- [x] Secure `owner` population to only select `username`
- [x] Upgrade `cloudinary` to `^2.11.0` resolving GHSA-g4mf-96x5-5m2c
- [x] Pass `npm audit` with 0 vulnerabilities
- [ ] Phase 1 — Data model (roles, College model, PG fields migration)

---

## 6. The Exact Next Step to Continue Development
 
**Next step: Seed the launch college and implement Phase 2 (Nearby search with `$geoNear`).**

1. Create launch college seed script with real geocoded coordinates (e.g. Delhi University North Campus or user's target campus).
2. Build `services/geoSearch.js` using MongoDB aggregation `$geoNear`:
   - `near`: college GeoJSON point
   - `distanceField`: distance in meters
   - `maxDistance`: 5000 (5 km default per PRD)
   - `spherical`: true
   - `query`: `{ status: 'approved', isAvailable: true, isDeleted: false }`
3. Add College routes (`GET /colleges`, `GET /colleges/:slug`) and college-centric search UI.

---

## 7. Important Instructions and Constraints

### From `AGENTS.md` (non-negotiable)
1. **Read docs first**: `PRD.md`, `SECURITY.md`, `ARCHITECTURE.md`, `DATABASE.md`, `MIGRATION_PLAN.md` — every session.
2. **Inspect before changing**: Reuse `middleware.js`, `utils/`, `cloudConfig.js`, and the EJS layout.
3. **One scoped change at a time**: Do not change unrelated files.
4. **Never hard-code**: credentials, colleges, PG results, distances, or coordinates. Distances come from `$geoNear`.
5. **Never expose secrets**: Don't print, log, or commit `.env` values.
6. **Don't invent business rules**: If a requirement conflicts with a doc, stop and ask.
7. **Don't add dependencies** without stating why and checking `npm audit`.
8. **Update docs** when behaviour, schema, routes, or security rules change.
9. **Done means**: requirements met, acceptance criteria satisfied, `npm test` and `npm run lint` pass, `npm audit` clean for high/critical, docs updated.

### From `SECURITY.md` (key constraints)
- Server-side validation is authoritative; client-side is hints only.
- Ownership checks read the record from DB every time (never trust form IDs).
- Ownership failure returns 404 (no confirmation that a resource exists).
- `MAP_TOKEN` is the only secret allowed in the browser.
- Generic error messages in production; no stack traces.
- File uploads: check type by magic bytes, max 5 MB, max 8 images, no SVG, strip EXIF.
- Rate limits required on login, signup, enquiries, search, uploads.
- CSRF on all state-changing forms.
- Never log passwords, secrets, full phone numbers, or full emails.

### From `ARCHITECTURE.md` (dependency rules)
- Controllers call services; services call models. Routes never call models directly for writes.
- Views never query the database.
- Only `services/geoSearch.js` builds `$geoNear` pipelines.
- Only `services/geocode.js` calls Mapbox.
- Browser code never receives secrets.

### From `MIGRATION_PLAN.md` (process)
- Each phase on its own branch and tag.
- Before any migration: `mongodump` backup.
- Feature flags via environment variables for new features.
- Phase 0 must be complete before Phase 1.

---

## Summary

| Dimension | Status |
|---|---|
| **Phase** | Phase 0 — Fix and Secure the Base |
| **Core security fixes** | ✅ Mostly complete (CSRF, helmet, session, XSS, sanitize, rate limits) |
| **Remaining Phase 0 work** | Git init, ESLint, tests, multer limits, magic bytes validation, EXIF strip, re-geocode on update, Cloudinary cleanup, text fixes |
| **Blocking issues** | None — all remaining items are incremental |
| **Git initialized** | ❌ No |
| **Tests passing** | ❌ No tests directory exists |
| **Lint passing** | ❌ No ESLint config exists |
| **`npm audit` status** | Unknown — needs to be run |
