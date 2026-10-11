# Product Requirements Document — WanderPG

## 1. Product Overview
- **Product Name**: WanderPG
- **One-Line Description**: Students choosing a college in a new city find verified PG accommodation nearby, sorted by real distance.
- **Product Type**: Marketplace (student demand, owner supply)
- **Primary Platform**: Web, responsive for mobile first. Server-rendered (Express + EJS).

## 2. Problem
- Freshers moving to a new city do not know the area, PG prices, or which owners are trustworthy.
- They visit many places in person or rely on relatives and seniors.
- Current alternatives: general rental sites (not built around colleges), WhatsApp groups (unverified), brokers (fees).

## 3. Goal
- **Primary Goal**: A student selects a college and, within one minute, sees verified PGs ordered by distance, with rent, room types, food, facilities and a way to contact the owner.
- **Secondary Goals**:
  - Give owners a simple way to list and manage PGs.
  - Reduce fake or stale listings through moderation and reporting.
  - Prepare the data model for more colleges and cities without a rewrite.

## 4. Target Users
### User Type 1 — Fresher student
- **Description**: 17–20, first time away from home, usually on a phone, budget-conscious, parents involved in the decision.
- **Needs**: nearby options, honest prices, safety, food, Wi-Fi, quick contact.
- **Pain Points**: no local knowledge, scams, cannot visit many places, unclear extra charges.

### User Type 2 — PG owner
- **Description**: Individual or small operator with 1–5 PG properties.
- **Needs**: more tenants, simple listing tool, control over availability, fewer unwanted enquiries.
- **Pain Points**: broker commissions, empty rooms, time spent answering the same calls.

### User Type 3 — Admin (you)
- **Description**: Moderator who approves listings and handles reports.
- **Needs**: a queue of pending listings and reports, with clear approve, reject and suspend actions.

## 5. User Stories
- As a student, I want to pick my college so that I see PGs near it.
- As a student, I want to sort by distance or rent so that I can compare quickly.
- As a student, I want to see distance groups (under 500 m, under 1 km, 1–5 km) so that I can judge the walk.
- As a student, I want to save favourites so that I can compare later.
- As a student, I want to report a wrong listing so that others are protected.
- As an owner, I want to list my PG with photos and rooms so that students find it.
- As an owner, I want to update availability so that students see current rooms.
- As an owner, I want to read enquiries in one place so that I answer faster.
- As an admin, I want to approve or reject new listings so that the site stays trustworthy.

## 6. Core Features

### Feature 1 — College search
- **Purpose**: Let a student find their college by name or city.
- **User Flow**: Home → type college or city → pick a college → college page.
- **Inputs**: search text (max 100 characters).
- **Outputs**: matching colleges with city.
- **Acceptance Criteria**:
  - Search is case-insensitive and matches partial names.
  - Results paginate at 20 per page.
  - Empty search shows a message and a link to browse all colleges.
- **Edge Cases**:
  - College has no coordinates → show it, but disable nearby search with a clear message.
  - Special characters in search are escaped, not treated as regex.

### Feature 2 — Nearby PG search
- **Purpose**: Show approved PGs near a college, ordered by distance.
- **User Flow**: College page → PG list (default sort: distance) → optional filters.
- **Inputs**: college id, optional maxDistance (500, 1000, 5000 m), rent min/max, room type, food, facilities, sort (distance, rent), page.
- **Outputs**: PG cards with distance in metres or km, distance group label, rent, room types, food, facilities, availability.
- **Acceptance Criteria**:
  - Only `status = 'approved'` and `isAvailable = true` PGs appear by default.
  - Distance is calculated by MongoDB `$geoNear`, never stored or hard-coded.
  - Groups: under 500 m, 500 m–1 km, 1–5 km. Labels match the group.
  - Default radius is 5 km. Larger radius is not allowed in MVP.
  - Results paginate at 12 per page.
- **Edge Cases**:
  - No PGs within 5 km → empty state with a suggestion to widen the search or request a listing.
  - PG has no coordinates → not returned by `$geoNear` (no crash).
  - Price filter with min greater than max → validation error.

### Feature 3 — PG detail page
- **Purpose**: Full information and contact options.
- **Acceptance Criteria**:
  - Shows photos, rent, room types, food, facilities, rules, address (area only for anonymous visitors), distance to the college.
  - Owner phone is visible only to logged-in students; anonymous visitors see "Log in to view contact".
  - Owner email is never shown.
- **Edge Cases**: Listing deleted or rejected → 404 page with links back to search.

### Feature 4 — Map and list view
- **Purpose**: See where PGs are relative to the college.
- **Acceptance Criteria**:
  - Map shows the college marker and PG markers. Clicking a marker opens a short card linking to the detail page.
  - Toggle between map and list keeps the same filters.
  - Map shows approximate location (rounded coordinates or area circle) for anonymous visitors. Exact location is shown only to logged-in students.

### Feature 5 — Owner listings
- **Purpose**: Owners create and manage their own PGs.
- **Acceptance Criteria**:
  - Only users with role `owner` can create listings.
  - Owners can edit or delete only their own listings (server-checked).
  - New or edited listings return to `pending` until approved.
  - Up to 8 photos per listing, each 5 MB or less, JPG/PNG/WebP only.
  - Address is geocoded on save; if geocoding fails, the listing stays pending with a visible error.

### Feature 6 — Enquiries
- **Purpose**: Students send a message to an owner through the platform.
- **Acceptance Criteria**:
  - Logged-in student only. Rate limit: 5 enquiries per student per day, 1 per listing per 24 hours.
  - Owner sees enquiries for their listings only.
  - Message 10–500 characters.

### Feature 7 — Reviews
- **Purpose**: Trust signal for PGs.
- **Acceptance Criteria**:
  - Only students who sent an enquiry on that listing can review it (one review per student per listing).
  - Rating 1–5 and comment 10–1000 characters. Reviews are shown only after admin approval in MVP+1; in MVP they are visible immediately but can be reported.

### Feature 8 — Reports and moderation
- **Purpose**: Students report wrong or fake listings; admin acts.
- **Acceptance Criteria**:
  - Any logged-in user can report a listing with a reason from a fixed list.
  - Admin sees open reports and can approve, reject, or suspend a listing.
  - Three distinct reports auto-hide a listing pending admin review.

### Feature 9 — Favourites
- **Purpose**: Save PGs to compare later.
- **Acceptance Criteria**: Logged-in users can add and remove favourites; list page shows saved PGs in order saved.

## 7. Non-Goals (this version)
- Online booking, deposits and payments.
- Owner subscriptions and featured listings.
- Verified KYC of owners (documented for later; MVP uses manual admin review).
- Native mobile apps.
- Colleges outside the launch city.
- Real-time chat.

## 8. MVP Scope
- **Must Have**: Auth with roles, college search, nearby PG search with `$geoNear`, distance groups, filters, sort, PG detail, map and list, owner create/edit/delete, admin approval, enquiries, reporting, rate limits, security baseline.
- **Nice to Have**: favourites, reviews, owner dashboard counts.
- **Future**: verified badge, booking, payments, more cities, WhatsApp integration, owner subscriptions.

## 9. Success Metrics
- **Primary Metrics**:
  - Median time from college selection to first PG contact under 3 minutes (measured in testing).
  - At least 20 approved PGs within 5 km of the launch college before public launch.
- **Secondary Metrics**:
  - Enquiries per approved listing per week.
  - Reports per 100 listings (target under 2).
  - Owner listings that are updated at least monthly.

## 10. Constraints
- **Technical**: Node.js 22 LTS or the version pinned in package.json, MongoDB Atlas, Express 5, EJS. Must run on a single small host in MVP.
- **Business**: Solo-built; no paid APIs beyond Mapbox, Cloudinary and hosting in MVP.
- **Design**: Mobile-first; no horizontal scroll at 360 px width.
- **Timeline**: Launch around one college first (Asansol Engineering College is the working assumption; confirm).

## 11. Assumptions
- Students search on phones more than desktops.
- Owners will list if the process takes under 15 minutes.
- The launch college has at least 20 PGs within 5 km.

## 12. Open Questions
- Which legal entity will run the platform, and does it need a privacy notice and terms before launch? (Needed for DPDP compliance — see `FEATURES_RESEARCH.md`.)
- Is Mapbox permanent geocoding enabled on your account? (Required to store coordinates. See `SECURITY.md` section 9.)
- Will owners pay in the future? If yes, when?
- Which colleges are in the first launch set?

## 13. Definition of Done
- Requirements in sections 6 and 8 implemented
- Critical flows in `TESTING.md` pass
- Tests pass, lint passes, build starts with `npm start`
- Security checklist in `SECURITY.md` complete for the change
- Docs updated
