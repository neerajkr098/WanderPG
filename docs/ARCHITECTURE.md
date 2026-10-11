# Architecture — WanderPG

## 1. System Overview
A server-rendered web app. Express handles routes and business rules, EJS renders pages, MongoDB stores data, and third-party services handle images (Cloudinary) and geocoding and map display (Mapbox). The app is a modular monolith: one deployable with clear module folders.

## 2. Architecture Pattern
- **Pattern**: Modular Monolith (MVC-style, existing WanderNest layout).
- **Reason**: Solo developer, one team, fast to ship. Clear module boundaries allow splitting later if needed.

## 3. Technology Stack
- **Frontend**: EJS templates with ejs-mate layouts, Bootstrap 5, vanilla JavaScript, Mapbox GL JS for maps.
- **Backend**: Node.js (version in package.json engines), Express 5.
- **Database**: MongoDB Atlas via Mongoose 9.
- **Authentication**: Passport (passport-local) with passport-local-mongoose (PBKDF2 hashing).
- **Sessions**: express-session stored in MongoDB via connect-mongo.
- **Validation**: Joi (existing schemas in schema.js).
- **Storage**: Cloudinary (images) via multer-storage-cloudinary.
- **Hosting**: Render (existing deployment). Confirm the start command is `node app.js` or `npm start`.
- **Payments**: None in MVP.
- **Email**: None in MVP. Admin reviews happen in-app. Add Brevo or similar later for owner notifications.
- **Analytics**: Plausible or Umami (privacy-friendly) once live. Decision pending.
- **Other Services**: Mapbox (geocoding with permanent storage enabled, map tiles), GitHub (source), MongoDB Atlas (database).

## 4. System Components

### Frontend
- Render college search, PG cards, detail page, map and list toggle, owner forms, admin queue.
- Client-side form hints only. Server validation is authoritative.
- Load map scripts only on pages that show a map.

### Backend
- Routes → controllers → services (for geo queries and geocoding) → models.
- Authentication, role checks, ownership checks in middleware.
- Joi validation before any write.
- Rate limiting, security headers, CSRF protection on forms.
- Central error handler; generic messages to users.

### Database
- Store users, colleges, PG listings, rooms, enquiries, reviews, reports, favourites and sessions.
- Enforce indexes, including 2dsphere on PG locations and colleges.
- Soft-delete listings (keep for audit); hard-delete only sessions and expired data.

## 5. Architecture Diagram
```
Student / Owner / Admin browser
       │ HTTPS (Render)
       ▼
Express app (app.js)
├─ middleware: helmet, rate limit, sessions, passport, csrf, validate, ownership
├─ routes: /colleges, /pgs, /owner, /enquiries, /reviews, /reports, /admin, /auth
├─ controllers + services (geo search, geocoding, uploads)
│  ├─ MongoDB Atlas (Mongoose) ── $geoNear, indexes
│  ├─ Cloudinary (images)
│  └─ Mapbox (geocoding with permanent=true, map tiles in browser)
└─ EJS views (layouts/boilerplate.ejs)
```

## 6. Data Flow — nearby PG search
1. Student opens `/colleges/:id`.
2. Route validates id, maxDistance, filters and page with Joi.
3. Service builds a `$geoNear` aggregation: `near = college coordinates`, `distanceField`, `maxDistance`, `spherical: true`, `query = approved and available plus filters`.
4. Results are paginated with `$skip` and `$limit`; distance group labels added in code.
5. Controller renders cards and map data (rounded coordinates for anonymous users).
6. Browser shows results. Map and list read the same data.

## 7. Project Structure (target)
```
WanderPG/
├── app.js                 # entry: config, middleware, routes
├── middleware.js          # auth, roles, ownership, validation, rate limits
├── schema.js              # Joi schemas
├── cloudConfig.js         # Cloudinary + multer (limits and file types here)
├── models/                # user, college, pg, room, enquiry, review, report, favourite
├── routes/                # colleges, pgs, owner, enquiries, reviews, reports, admin, auth
├── controllers/           # thin: request in, response out
├── services/              # geoSearch.js, geocode.js, uploads.js, moderation.js
├── utils/                 # wrapAsync, ExpressError, distanceLabel, sanitize
├── views/                 # layouts, includes, colleges, pgs, owner, admin, users, errors
├── public/                # css, js, images
├── init/                  # seed scripts (dev only)
├── tests/                 # unit, integration, e2e
└── docs/                  # this documentation set
```

## 8. Dependency Rules
- Controllers call services; services call models. Routes never call models directly for writes.
- Views never query the database.
- Only `services/geoSearch.js` builds `$geoNear` pipelines.
- Only `services/geocode.js` calls Mapbox.
- Browser code never receives secrets (`MAP_TOKEN` is public-scope only; see `SECURITY.md`).

## 9. Key Technical Decisions
- **Extend WanderNest instead of rewriting**: Reuses tested auth, CRUD, uploads, maps.
- **MongoDB `$geoNear` with 2dsphere indexes for distance**: Scales to thousands of listings.
- **Geocode on save, store coordinates with permanent geocoding enabled**: Fast, compliant with Mapbox terms.
- **Server-rendered EJS instead of SPA**: Better SEO, simpler security surface, mobile friendly on lower end devices.

## 10. Failure Scenarios
- **Database unavailable**: Friendly error page with retry link; health check 503.
- **Mapbox times out**: Listing save fails safely; stays pending with retry message.
- **Cloudinary fails**: Upload rejected cleanly; form retains inputs.
- **Authentication fails**: Redirect with generic flash; no user enumeration.
- **Geocode returns nothing**: Save blocked; owner asked to correct address.
- **Session store error**: Generic error, keep user logged out safely.
