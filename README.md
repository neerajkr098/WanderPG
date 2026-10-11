# WanderPG

Find PG (Paying Guest) accommodation near your college, sorted by real distance.

WanderPG is an Express 5 + MongoDB (Mongoose 9) + EJS server-rendered marketplace designed for students to discover verified accommodation and for owners to list and manage properties.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose 9
- **Templates**: EJS with `ejs-mate` layouts
- **Authentication**: Passport.js (`passport-local`, `passport-local-mongoose`)
- **Session Management**: `express-session` with `connect-mongo`
- **Mapping & Geocoding**: Mapbox GL JS & Mapbox Geocoding SDK
- **Media Storage**: Cloudinary via `multer-storage-cloudinary`

## Getting Started

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:
```
PORT=8080
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
MAP_TOKEN=your_mapbox_public_token
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Run the Application
```bash
npm start
```
Open `http://localhost:8080` in your browser.

## Documentation
Comprehensive architecture, security, database models, and migration planning are documented in `docs/`:
- [`docs/PRD.md`](docs/PRD.md): Product requirements and acceptance criteria
- [`docs/SECURITY.md`](docs/SECURITY.md): Security architecture, policies, and audit checklist
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): System architecture and data flow
- [`docs/DATABASE.md`](docs/DATABASE.md): Data models, schemas, and indexing strategies
- [`docs/MIGRATION_PLAN.md`](docs/MIGRATION_PLAN.md): Step-by-step roadmap from WanderNest to WanderPG
- [`docs/CODE_STYLE.md`](docs/CODE_STYLE.md): Project conventions and coding guidelines
- [`docs/TESTING.md`](docs/TESTING.md): Testing strategies, test types, and test suites
- [`docs/API.md`](docs/API.md): API endpoint contracts and specifications
- [`docs/FEATURES_RESEARCH.md`](docs/FEATURES_RESEARCH.md): Market research, regulatory requirements, and competitor analysis
- [`docs/UX_FLOWS.md`](docs/UX_FLOWS.md): Detailed user and admin flows
