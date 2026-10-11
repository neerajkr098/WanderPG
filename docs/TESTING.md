# Testing Strategy — WanderPG

## 1. Testing Goals
- **Critical functionality**:
  - Nearby PG search returns correct order, distance groups and filters.
  - Owners can only change their own listings.
  - Unapproved listings are never visible to students.
  - Enquiries and reviews follow their rules (login, rate limit, one per listing).
  - Uploads accept only allowed image types and sizes.
  - Anonymous visitors never see owner contact or exact address.

## 2. Test Types
### Unit Testing
Test utility functions, the distance group labeller, Joi schemas, the rent and filter validators, and the phone masking helper. Tool: Jest or `node:test` (decision: `node:test` for zero extra dependency; Jest if the team prefers).

### Integration Testing
Test routes with a real MongoDB (use `mongodb-memory-server` in tests, never Atlas). Cover:
- `$geoNear` search with and without filters, sorting and pagination
- `2dsphere` index exists (`listIndexes`)
- Ownership middleware with another user's id → 404
- Login lockout after 5 failures
- Rate limits return 429
- CSRF missing token → 403
- Upload with wrong magic bytes → 400
Tool: Supertest with `node:test` or Jest.

### End-to-End Testing
Test critical journeys in a real browser at 360 px and 1280 px widths.
- Sign up as student → log in → select college → see PGs sorted by distance → open a PG → send enquiry
- Sign up as owner → create PG → see "pending" → admin approves → PG appears in search
- Report a listing → three reports auto-hide it
- Anonymous visitor: no phone, no email, exact address hidden
Tool: Playwright (Chromium is pre-installed in the cloud sandbox; locally run `npx playwright install` once).

## 3. Testing Tools
- Unit: `node:test` (or Jest)
- Integration: Supertest + `mongodb-memory-server`
- E2E: Playwright
- Security checks: `npm audit`, `eslint-plugin-security`, OWASP ZAP baseline scan before launch (manual, optional)
- Accessibility: axe-core via Playwright (automated pass on 5 key pages)

## 4. Test File Structure
```
tests/
├── unit/
│   ├── distanceLabel.test.js
│   ├── geoSearch.pipeline.test.js
│   ├── joiSchemas.test.js
│   └── phoneMask.test.js
├── integration/
│   ├── pgSearch.test.js
│   ├── ownership.test.js
│   ├── auth.test.js
│   ├── enquiries.test.js
│   └── uploads.test.js
└── e2e/
    ├── student-search.spec.js
    ├── owner-listing.spec.js
    └── admin-moderation.spec.js
```

## 5. Critical User Flows

### Flow: Student finds a PG near college
1. Open the home page
2. Search "Asansol Engineering" and select it
3. Set filter "under 1 km", rent max 8000
4. Open the first PG card
**Expected result**: PGs listed nearest first, all within 1 km, all at or under 8000, first card matches the closest approved PG in the seed data, detail page shows distance, owner phone hidden until log in.

### Flow: Owner lists a PG
1. Log in as owner
2. Open "Add PG"
3. Fill title, description, address, rent, room types, facilities, upload 2 photos
4. Submit
**Expected result**: Listing saved as pending, not visible in search. Admin approves → visible within the next request.

### Flow: Owner tries to edit another owner's PG
1. Log in as owner B
2. Send PUT to owner A's listing id
**Expected result**: 404. No change in database.

### Flow: Enquiry rate limit
1. Log in as student
2. Send 6 enquiries in one day, each for a different PG
**Expected result**: The sixth returns a friendly "daily limit reached" message.

## 6. Coverage
- Target: 70% line coverage on `services/` and `middleware.js`; 100% of the security checklist items covered by at least one test.
- Prioritize:
  - Critical business logic (geo search, distance labels, visibility rules)
  - Authentication (login, lockout, session)
  - Authorization (ownership, roles)
  - Data mutations (create, update, delete, soft delete)
  - Important user journeys (E2E)

## 7. Commands
- Test: `npm test`
- Lint: `npm run lint`
- Build: none needed for EJS; `npm start` must boot without errors.
- Type Check: not used in MVP.
- Audit: `npm audit --omit=dev`

Add these scripts to `package.json` in Phase 0:
```json
"start": "node app.js",
"test": "node --test tests/",
"lint": "eslint .",
"audit": "npm audit --omit=dev"
```

## 8. Definition of Done
- [ ] Tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] App starts (`npm start`) and home page returns 200
- [ ] Critical flow verified (E2E or manual, recorded in the PR)
- [ ] No high or critical npm audit issues
- [ ] No blocking errors in logs during the flow
