# Security — WanderPG

## 1. Authentication
- **Authentication Provider**: Local (`passport-local` + `passport-local-mongoose`). Existing in WanderNest.
- **Methods**:
  - Email/password (MVP)
  - OAuth (Google sign-in, MVP+1)
  - Magic link (not planned)
- **Password rules**: minimum 8 characters, at least one letter and one number, checked against a common-password list. Lockout after 5 failed attempts for 15 minutes per account and per IP.
- **Sessions**: 7-day cookie for students, 24 hours for admins. Regenerate session on login and logout.

## 2. Authorization
- **Roles**: student, owner, admin.
- **Permissions**:
  - **Student**:
    - Search and view approved listings
    - Save favourites
    - Send enquiries (rate limited)
    - Write one review per listing after an enquiry
    - Report listings
  - **Owner**:
    - Create, edit and soft-delete own listings
    - Toggle availability on own listings
    - Read enquiries for own listings
  - **Admin**:
    - Approve, reject, suspend listings
    - Act on reports
    - Suspend users
- Authorization must be enforced server-side. Ownership checks read the record from the database every time (never trust IDs in the form).
- Ownership failure returns 404 for another user's listing (no confirmation that it exists).

## 3. Secrets
- Never hard-code credentials, including in seed scripts.
- Never commit production secrets. `.env` is in `.gitignore`.
- Never expose private secrets to the client. Only `MAP_TOKEN` is public (Mapbox public tokens are designed for the browser). Restrict it by URL in the Mapbox dashboard.
- Use environment variables on the host (Render) for all secrets.
- Rotate compromised credentials immediately. Known incident: credentials from the original WanderNest `.env` were shared in chat. Rotate Atlas user, Cloudinary secret, `SECRET`, and review the Mapbox token before launch.

## 4. Environment Variables
- **Public**: `MAP_TOKEN` (restricted to your domains in Mapbox)
- **Private**: `SECRET`, `ATLASDB_URL`, `CLOUD_API_SECRET`, `CLOUD_API_KEY`, `CLOUD_NAME` (not secret but keep server-side), `GITHUB_MCP_TOKEN` (dev only), `MONGODB_DEV_URI` (dev only)

## 5. API Security
- **Input validation**: Joi on every body and query. Reject unknown fields (`joi.unknown(false)`). Max lengths on all strings. ObjectId checks before any query.
- **Rate limiting**:
  - Login: 10 attempts per 15 minutes per IP and per account
  - Signup: 5 per hour per IP
  - Enquiries: 5 per student per day
  - Search: 120 requests per minute per IP
  - Uploads: 20 per hour per user
- **CORS**: Not needed in MVP (same origin). If an API is added, allow only the production origin. Never use `*` with credentials.
- **Authentication**: Required for owner, admin, enquiry, review, report, favourite routes.
- **Authorization**: Role and ownership checked in middleware, and again in the service for writes.
- **Headers**: helmet with a Content-Security-Policy that allows only Bootstrap, Font Awesome, Mapbox and Google Fonts domains already used. Set Strict-Transport-Security (via Render HTTPS).
- **CSRF**: All state-changing forms need a CSRF token (use `csrf-sync` or `csrf-csrf`; `csurf` is deprecated). Method override for `DELETE`/`PUT` still needs the token.
- **Query safety**: `express-mongo-sanitize` plus Joi. Never pass raw `req.query` into Mongo queries. Escape regex input for college search.
- **Errors**: generic messages to users. Stack traces only in development.
- **Cookies**: `httpOnly: true`, `secure: true` in production, `sameSite: 'lax'`, expires as a Date object (fix existing bug).
- `saveUninitialized: false` (fix existing setting) to stop storing empty sessions.

## 6. Data Protection
- **Sensitive data**: passwords (hashed), phone numbers, exact addresses, enquiry messages, email addresses.
- **Encryption**: TLS everywhere (Render, Atlas). Atlas encryption at rest. Hashing via PBKDF2 (`passport-local-mongoose`).
- **Retention**:
  - Accounts: kept while active; deleted on user request within 30 days.
  - Enquiries: 2 years.
  - Audit logs: 1 year.
  - Deleted listings: 90 days.
- **Deletion**: Account deletion removes personal fields, keeps anonymised reviews (author shown as "Former user").
- **Privacy**: Show a privacy notice at signup and a consent checkbox (DPDP Act 2023 requires notice and consent for personal data; see `FEATURES_RESEARCH.md`).
- **Data minimisation**: Ask for name, email, role and phone only. No date of birth or government ID in MVP.

## 7. Logging
- **Never log**:
  - Passwords or hashes
  - Session secrets, API keys, tokens, Cloudinary secrets
  - Full phone numbers or email addresses (mask them: `r***@gmail.com`)
  - Full enquiry messages
  - Full request bodies on auth routes
- **Log**:
  - Authentication events (login success, failure, lockout) with user id and IP hash
  - Important actions (listing created, approved, rejected, suspended)
  - Errors with request id
  - Security events (CSRF failure, rate limit hit, unauthorized access attempt)
- Use a logger (pino) with redaction rules for these fields.
- Remove the existing `console.log(savedListing)` in production code (it prints full records).

## 8. File Uploads
- Allowed file types: JPEG, PNG, WebP. Check the real type by magic bytes (`file-type` package), not just the extension or MIME header.
- Maximum size: 5 MB per image, 8 images per listing.
- **Validation**:
  - Check type and size before upload (multer limits and fileFilter).
  - Reject SVG (can contain scripts).
  - Strip EXIF location data (Cloudinary transformation or sharp).
  - Use Cloudinary `allowed_formats` (fix the existing `allowdFormat` typo).
  - Store under `WanderPG/<env>/` folders, with the environment name from config.
- **Storage**: Cloudinary only. The app stores `url`, `publicId` and `alt`; never the original upload on disk.
- **Orphans**: If a listing save fails after upload, delete the uploaded image using `publicId`.
- **Replacement**: Deleting or replacing an image removes the old Cloudinary asset.

## 9. Maps and Geocoding
- Use Mapbox geocoding with `permanent=true` when storing coordinates. Default temporary geocoding does not allow storage (confirmed on Mapbox docs). Check the plan and cost before launch.
- Store coordinates, not full geocoding responses.
- Show exact pins only to logged-in students (anonymous visitors see an area circle of about 300 m).
- Do not expose the owner's address to anonymous visitors; show area only.

## 10. Dependencies
- Run `npm audit` before each release. Fix high and critical issues or document why not.
- Use `npm ci` in production builds with the lock file committed.
- Review new packages: last publish date, weekly downloads, maintainer count, open security issues.
- Enable GitHub Dependabot alerts.
- Keep Node on an active LTS version.

## 11. Security Checklist
- [ ] Authentication implemented (login, signup, lockout, session regeneration)
- [ ] Authorization implemented on every write route (role and ownership)
- [ ] Server-side validation on every route (Joi, unknown fields rejected)
- [ ] Secrets protected (env only, rotated after the earlier exposure)
- [ ] Sensitive data protected (phone, address, email, messages)
- [ ] Rate limiting on login, signup, enquiries, search and uploads
- [ ] CSRF tokens on all state-changing forms
- [ ] XSS checked: EJS escaping, no unsafe script embedding, CSP set
- [ ] File uploads validated (type by bytes, size, EXIF stripped, no SVG)
- [ ] Errors do not expose sensitive details
- [ ] Logs redact secrets and personal data
- [ ] Dependencies reviewed (`npm audit` clean for high/critical)
- [ ] Mapbox token restricted by URL; permanent geocoding plan confirmed
- [ ] Privacy notice and consent in place

## 12. Known Issues in the Current WanderNest Code (fix in Phase 0)
1. Listing page embeds full JSON in a script tag (XSS and email exposure). Fix with a safe data attribute or a sanitised JSON helper.
2. Map popup inserts the title as HTML. Use textContent or escape.
3. Cloudinary `allowdFormat` typo (no format restriction).
4. Session error handler references undefined `err`.
5. Cookie expires set as a number and `saveUninitialized: true`.
6. Review `createdAt` uses `Date.now()` at startup, so all reviews share one timestamp.
7. `isOwner` and `isReviewAuthor` crash on missing records.
8. Geocode result not checked before `features[0]`.
9. Delete buttons shown to users who cannot delete.
10. Signup controller calls `next` without declaring it.
