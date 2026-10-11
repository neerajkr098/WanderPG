# Database — WanderPG

## 1. Database Engine
- **Database**: MongoDB (Mongoose 9)
- **Hosting**: MongoDB Atlas (existing cluster; use a separate DEV database name).

## 2. Naming Conventions
- **Collections**: singular Mongoose model names, stored as plural (`users`, `colleges`, `pgs`, `enquiries`, `reviews`, `reports`, `favourites`).
- **Fields**: camelCase (`isAvailable`, `createdAt`).
- **Primary keys**: `_id` (ObjectId).
- **Foreign keys**: `<thing>Id` ref to `_id` (`ownerId`, `collegeId`), stored as ObjectId with ref.
- **Timestamps**: `createdAt`, `updatedAt` via Mongoose `timestamps: true`.
- **Status values**: lowercase strings (`pending`, `approved`, `rejected`, `suspended`).

## 3. Collections

### users
Accounts for students, owners and admins.
- **Fields**: `_id`, `username`, `email` (unique, lowercase), `role` (`student | owner | admin`), `phone` (optional, E.164, private), `hash`, `salt` (managed by passport-local-mongoose), `createdAt`, `updatedAt`, `lastLoginAt`, `isSuspended` (boolean).
- **Notes**: `hash`, `salt`, `phone`, `email` never returned to other users.

### colleges
Colleges that students select.
- **Fields**: `_id`, `name`, `city`, `state`, `country`, `slug` (unique), `location` (GeoJSON Point), `createdAt`, `updatedAt`.
- **Notes**: `location` required for nearby search. `slug` for clean URLs.

### pgs (listings)
PG accommodation listed by owners.
- **Fields**: `_id`, `ownerId`, `title`, `description` (max 2000), `address` (text, private until approved and contact allowed), `area` (public short name), `location` (GeoJSON Point), `rentMin`, `rentMax` (integers, rupees per month), `roomTypes` (array of: `single`, `double`, `triple`, `quad`), `foodOptions` (array: `none`, `veg`, `nonveg`, `both`), `facilities` (array of allow-listed strings: `wifi`, `laundry`, `parking`, `furnished`, `ac`, `power_backup`, `cctv`, `housekeeping`), `rules` (text), `images` (array of `{ url, publicId, alt }`), `isAvailable` (boolean), `status` (`pending | approved | rejected | suspended`), `reviewNote`, `reportCount` (integer), `isDeleted` (boolean), `deletedAt`, `createdAt`, `updatedAt`.
- **Notes**: Replaces the existing Listing model in migration. `geometry` renamed to `location`. Keep `owner → ownerId` in migration.

### rooms (optional in MVP, recommended)
Room-level availability and price.
- **Fields**: `_id`, `pgId`, `type`, `rent`, `availableCount`, `totalCount`, `updatedAt`.

### enquiries
Student message to an owner about a listing.
- **Fields**: `_id`, `pgId`, `studentId`, `ownerId` (denormalised for queries), `message` (10–500 chars), `status` (`new | read | closed`), `createdAt`.
- **Indexes**: `{ ownerId: 1, createdAt: -1 }`.
- Enforce one enquiry per student per listing per 24 hours in service code.

### reviews
Ratings and comments from students who enquired.
- **Fields**: `_id`, `pgId`, `authorId`, `rating` (1–5), `comment` (10–1000 chars), `isHidden` (boolean), `createdAt`.
- **Indexes**: unique `{ pgId: 1, authorId: 1 }` (one review per student per listing).
- **Notes**: Replaces the existing Review model. Fix `createdAt` default to `Date.now` (function reference).

### reports
User reports on listings.
- **Fields**: `_id`, `pgId`, `reporterId`, `reason` (`fake`, `wrong_price`, `not_available`, `inappropriate`, `other`), `details` (max 500), `status` (`open | actioned | dismissed`), `createdAt`.
- **Indexes**: `{ pgId: 1, status: 1 }`, unique `{ pgId: 1, reporterId: 1 }`.

### favourites
Saved PGs per student.
- **Fields**: `_id`, `studentId`, `pgId`, `createdAt`.
- **Indexes**: unique `{ studentId: 1, pgId: 1 }`, `{ studentId: 1, createdAt: -1 }`.

### sessions (managed by connect-mongo)
Login sessions. TTL index managed by the store.

## 4. Indexes
- `pgs.location` (2dsphere): `$geoNear` nearby search.
- `colleges.location` (2dsphere): college distance and nearest-college lookup.
- `pgs { status: 1, isAvailable: 1, isDeleted: 1 }`: default filter for public search.
- `pgs { ownerId: 1 }`: owner dashboard.
- `pgs { status: 1, reportCount: -1 }`: admin moderation queue.
- `colleges { name: "text", city: "text" }` or regex prefix on `searchName`: college search.
- `enquiries { ownerId: 1, createdAt: -1 }`: owner inbox.
- unique `reviews { pgId: 1, authorId: 1 }`: one review per student.
- unique `favourites { studentId: 1, pgId: 1 }`: no duplicates.

## 5. Migration Rules
1. Schema changes documented here.
2. Migration script in `init/migrations/` with version number.
3. Test on a copy of DEV database first.
4. Avoid breaking existing production data.
