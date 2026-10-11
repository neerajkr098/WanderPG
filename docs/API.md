# API Contracts — WanderPG

WanderPG is server-rendered with Express and EJS, using JSON endpoints for map data and dynamic updates.

## Conventions
- **Base URL**: `https://<render-domain>` (same origin in MVP)
- **Authentication**: Session cookie (`httpOnly`, `secure` in production, `sameSite: 'lax'`)
- **Error format (JSON routes)**:
  ```json
  { "error": { "code": "VALIDATION_FAILED", "message": "Rent must be a number", "fields": { "rentMax": "..." } } }
  ```
- **HTML routes**: Flash message plus redirect or 400/403/404/429 error page.
- **Pagination**: `?page=1` (1-based). 12 PGs per page, 20 colleges per page.
- **Rate limits**: 429 status with `Retry-After`.

## Key Endpoints Overview

### Public & Discovery
- `GET /colleges`: Search colleges by name/city (`?q=...&page=...`).
- `GET /colleges/:id`: College page with nearby PGs ordered by distance via `$geoNear`.
- `GET /pgs/:id`: PG detail view.

### Owner Operations
- `GET /owner/pgs`: List authenticated owner's listings.
- `POST /owner/pgs`: Create listing (uploads photos, geocodes with Mapbox `permanent=true`).
- `PUT /owner/pgs/:id`: Edit listing.
- `PATCH /owner/pgs/:id/availability`: Toggle listing availability.
- `DELETE /owner/pgs/:id`: Soft-delete listing (`isDeleted = true`).

### Enquiries & Reviews
- `POST /pgs/:id/enquiries`: Logged-in student sends enquiry (rate-limited).
- `POST /pgs/:id/reviews`: Student who enquired submits 1–5 star review and comment.
- `DELETE /reviews/:reviewId`: Author or admin deletes review.
- `POST /pgs/:id/reports`: Report listing for moderation.

### Admin Operations
- `GET /admin/pgs?status=pending`: Moderation queue.
- `POST /admin/pgs/:id/decision`: Approve, reject or suspend listing.

### Auth Operations
- `POST /signup`: Register with username, email, password, role, consent.
- `POST /login`: Session login with rate limiting.
- `POST /logout`: Destroy session with CSRF protection.
