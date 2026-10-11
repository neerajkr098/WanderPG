# UX Flows — WanderPG

## Flow 1 — Student finds a PG near their college
1. Student opens the home page (mobile or desktop).
2. Types college or city in search box.
3. Selects college from search results.
4. College page loads with map and list toggle, sorted by real walking distance.
5. Student filters by distance group (<500 m, 500 m–1 km, 1–5 km), rent min/max, room type, food, amenities.
6. Opens PG card to view details (photos, rent, amenities, rules, general area).
7. If anonymous: sees "Log in to contact owner". If logged in: sees contact options and can send an enquiry.

## Flow 2 — Owner registers and lists a PG
1. Owner signs up with role "I have a PG to list".
2. Accepts DPDP notice & consent terms.
3. Accesses Owner Dashboard.
4. Fills listing form (title, description, area, address, rent range, room types, amenities, rules).
5. Uploads up to 8 images with alt descriptions.
6. Submits for review; listing set to `status: 'pending'`.
7. Admin approves listing; listing becomes visible in nearby search.

## Flow 3 — Admin moderates
1. Admin logs into moderation dashboard.
2. Reviews pending listings and flagged reports.
3. Inspects property images, address legitimacy, and report details.
4. Approves, rejects with reasons, or suspends listings.

## Flow 4 — Owner manages availability
1. Owner opens listing.
2. Toggles availability (`isAvailable: true/false`).
3. Updates reflect immediately without needing re-approval.

## Flow 5 — Student reports a listing
1. Student clicks "Report" on a listing.
2. Chooses reason (fake, wrong_price, not_available, inappropriate, other).
3. System logs report; 3 distinct user reports automatically hide listing pending admin review.
