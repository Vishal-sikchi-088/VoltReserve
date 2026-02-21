# Battery Swap Slot Booking System (Energy in Motion)

> **Primary goal:** Capacity-aware, 24-hour rolling booking system for electric truck battery swap stations with automated no-show handling and role-based dashboards.

---

## 1. Quick Start (Main Section)

### 1.1 Prerequisites

- Node.js (version 18+ recommended)
- npm

### 1.2 Clone and install

```bash
git clone <repo-url>
cd VoltReserve

# Backend
cd backend
npm install

# Frontend (separate terminal)
cd ../frontend
npm install
```

### 1.3 Seed demo data

From the `backend` directory:

- Seed stations, managers, operators and example bookings:

```bash
npm run seed:demo
```

This is safe to run multiple times; it clears and recreates demo data.

### 1.4 Run the app (development)

Backend (from `backend`):

```bash
npm run dev
```

Frontend (from `frontend`):

```bash
npm start
```

The app runs at `http://localhost:3000` and proxies API calls to `http://localhost:4000`.

### 1.5 Demo users

**Admin (auto-created if no admin exists):**
- Email: `admin@voltreserve.local`
- Password: `Admin123!`

**Station Manager:**
- Email: `manager@voltreserve.local`
- Password: `Manager123!`

**Regional Manager:**
- Email: `regional.manager@voltreserve.local`
- Password: `Manager123!`

**Fleet Operators:**
- Email: `operator@voltreserve.local`
- Email: `operator.beta@voltreserve.local`
- Email: `operator.gamma@voltreserve.local`
- Password (all operators): `Operator123!`

---

## 2. Project Overview

This project implements a battery swap slot booking system for electric truck battery swapping stations.

The system supports:
- User and role management:
  - Admin
  - Swap Station Manager
  - Truck Operator
- Swap station management:
  - Name
  - Location
  - Fractional hourly capacity (for example 2.5 swaps per hour)
- Time slot booking:
  - 15 minute slots within a rolling 24 hour window
- Automated no show handling:
  - 15 minute slot plus 15 minute arrival buffer
- Capacity aware booking:
  - Fractional hourly capacity distributed deterministically across slots
- Admin metrics:
  - Bookings and no shows per station
  - Last 7 days daily booking summary

The goal is to deliver a production grade, interview ready implementation using the mandatory stack:
- Frontend: React
- Backend: Node.js with Express
- Database: SQLite

---

## 3. Screenshots

> Replace the placeholders below with real screenshots from the running app.

### 3.1 Admin dashboard

Space for image:

```text
![Admin dashboard](frontend/public/admin/admin-panel-overview.png)
```

Optional additional admin views:

```text
![Admin stations](frontend/public/admin/admin-panel-stationMat.png)
![Admin managers](frontend/public/admin/admin-panel-managerCard.png)
![Admin users](frontend/public/admin/admin-panel-user.png)
```

### 3.2 Manager view

Space for image:

```text
![Manager view](frontend/public/screenshots/manager-view.png)
```

### 3.3 Booking flow (operator)

Space for image:

```text
![Booking flow](frontend/public/screenshots/booking-flow.png)
```

---

## 4. High Level Architecture

### 2.1 System Architecture

The system follows a simple three tier architecture:
- Presentation layer: React single page application created with Create React App
- API layer: Node.js and Express REST API
- Data layer: SQLite database accessed through a dedicated SQL queries module

Responsibilities are split by feature to keep the design modular and maintainable.

#### Backend Modules

- API gateway
  - Express app, routing and middleware
  - Security headers, CORS, rate limiting
- Authentication and session
  - Login and logout endpoints
  - bcrypt password hashing
  - Session based authentication using HTTP only cookies
  - Role based authorization middleware
- Users module
  - Management of admins, managers and operators
  - Role assignment and validation
- Stations module
  - CRUD for swap stations
  - Station manager assignment
  - Capacity configuration per hour
- Bookings module
  - Slot generation for the rolling 24 hour window
  - Fractional hourly capacity distribution per slot
  - Booking creation with concurrency safe capacity checks
  - Cancellation and rescheduling with cutoff rules
  - No show detection and status transitions
- Metrics module
  - Aggregated booking metrics per station
  - No show counts and last 7 days daily bookings

#### Frontend Modules

- Auth pages
  - Login form
  - Session based user loading
- Admin area
  - Manage users and roles
  - Manage stations and capacity
  - View system metrics
- Manager area
  - View assigned stations
  - View and manage upcoming bookings
  - Mark bookings as completed or cancelled
- Operator area
  - Select station and view available slots
  - Create bookings
  - View upcoming and historical bookings
  - Cancel or reschedule bookings before cutoff

State management can be implemented with React Query for server state and a simple context or store for user session and role information.

### 2.2 Key Data Flows

#### Authentication Flow

1. User submits email and password to the login endpoint.
2. Backend validates input and finds the user by email.
3. bcrypt verifies the password against the stored hash.
4. On success a session is created, and the user id and role are stored in the session.
5. The session id is sent back in a HTTP only cookie.
6. Subsequent requests use a middleware that loads the user from the session and enforces role based access.

#### Booking Creation Flow

1. Operator selects a station in the UI.
2. The frontend calls a slots endpoint to fetch 15 minute slots for the next 24 hours and their available capacities.
3. Operator selects a slot and submits a booking creation request.
4. The backend validates that:
   - The slot is within the rolling 24 hour window.
   - The slot is not in the past.
   - Cancellation and rescheduling rules are respected, if applicable.
5. Within a transaction the backend:
   - Computes the maximum capacity for the slot using the fractional capacity algorithm.
   - Counts existing non cancelled bookings for that station and slot.
   - Rejects the request if capacity is already reached.
   - Otherwise inserts the new booking as confirmed.
6. The API returns the created booking, and the UI updates the operator view.

#### No Show Handling Flow

Each booking has:
- Slot start time in UTC
- Slot end time at start plus 15 minutes
- Arrival deadline at end plus 15 minutes

A booking is a no show if it remains in confirmed status after the arrival deadline passes.

Implementation approach:
- Lazy evaluation:
  - When bookings are read for any user, the backend first finds all confirmed bookings with an arrival deadline earlier than the current time.
  - Those bookings are updated to no show status.
  - Normal queries then run on fully up to date statuses.

This approach avoids background infrastructure while still matching the specified behaviour.

---

## 5. Technology Stack and Justification

### 5.1 Frontend

- React with JavaScript
  - Matches the assignment requirement while keeping the setup simple.
  - Familiar ecosystem and patterns.
- Create React App
  - Standard React tooling with minimal configuration.
- React Router
  - Declarative routing and easy role based route protection.
- React Query
  - Declarative data fetching and caching.
  - Built in loading and error states.
- UI library (for example Material UI or Chakra UI)
  - Speeds up building dashboards, tables and forms.

### 5.2 Backend

- Node.js with Express
  - Required by the assignment and industry standard for REST APIs.
- TypeScript
- JavaScript
  - Simple runtime setup and fast iteration with no compilation step.
  - Robust payload validation and clear error messages.
- express session
  - Simple session based login flow without tokens.
- bcrypt
- bcrypt
  - Secure password hashing.
- Logging library (Winston or Pino)
  - Structured logging for troubleshooting and observability.

### 5.3 Database and Data Access

- SQLite
  - Required by the assignment and easy for local replication.
- Native SQLite driver
  - Direct control over SQL and database behaviour.
- Dedicated queries file
  - A single module that contains all SQL queries used by the project.
  - The backend imports and uses these queries for all database operations.

---

## 6. Coding Standards and Best Practices

### 6.1 Project Structure

- Root
  - backend
  - frontend
  - docs
- Backend source
  - src/app.js for Express app initialisation
  - src/config for configuration and environment handling
  - src/modules for feature modules:
    - auth
    - users
    - stations
    - bookings
    - metrics
  - src/common for shared code:
    - middleware
    - error types
    - utilities
  - src/db for database access helpers and the central queries module
- Frontend source
  - src/pages for role specific pages
  - src/components for reusable components
  - src/api for API clients
  - src/hooks for shared React hooks

### 6.2 Naming Conventions

- Files
  - Backend JavaScript files in kebab case.
  - Frontend components in PascalCase.
- Code
  - Classes and React components in PascalCase.
  - Variables and functions in camelCase.
  - Constants in upper snake case.
- Database
  - Tables in snake case plural.
  - Columns in snake case.

### 6.3 Error Handling

- Use a central error handling middleware in Express.
- Define a small hierarchy of application errors with clear codes.
- Map known errors to standard HTTP status codes:
  - 400 for validation errors
  - 401 for authentication errors
  - 403 for authorization errors
  - 404 for not found
  - 409 for capacity conflicts
  - 500 for unexpected failures
- Standardised error response format:
  - error.code
  - error.message
  - error.details

### 6.4 Logging

- Request logging middleware:
  - Method, path, status, duration and user id when available.
- Application logs:
  - Log key business events such as login failures, booking creation, no show transitions and station updates.
- Use structured JSON logs in production to integrate with log aggregation tools.

### 6.5 Security

- Authentication
  - Hash passwords with bcrypt before storing.
  - Never log passwords or hashes.
- Authorization
  - Role based middleware for every protected route.
  - Admin only routes for user and station management and metrics.
  - Manager routes only for assigned stations.
  - Operator routes only for own bookings and profile.
- Input validation
  - Validate all request bodies and parameters.
  - Reject invalid data early with clear messages.
- HTTP security
  - Use Helmet to set secure headers.
  - Configure CORS to allow only the known frontend origin.
  - Consider rate limiting on authentication and booking endpoints.

---

## 7. Database Schema and Capacity Model

### 7.1 Tables

- users
  - id primary key
  - name
  - email unique
  - password hash
  - role enum admin manager operator
  - created at
  - updated at
- swap stations
  - id primary key
  - name
  - location
  - hourly capacity real
  - created at
  - updated at
- station manager assignments
  - id primary key
  - station id foreign key
  - manager id foreign key
  - unique constraint on station and manager pair
- bookings
  - id primary key
  - station id foreign key
  - operator id foreign key
  - slot start utc datetime
  - slot end utc datetime
  - arrival deadline utc datetime
  - status enum confirmed completed cancelled no show
  - cancellation reason optional
  - rescheduled from booking id optional foreign key
  - created at
  - updated at

### 7.2 Indexes and Relationships

- users
  - unique index on email
- bookings
  - index on station id and slot start time
  - index on operator id and slot start time
- station manager assignments
  - index on manager id

Relationships:
- Station to bookings is one to many.
- Operator to bookings is one to many.
- Manager to station is many to many through station manager assignments.

### 7.3 Fractional Hourly Capacity Algorithm

Each station has a fractional hourly capacity such as 2.5 swaps per hour. Slots are 15 minutes long which means four slots per hour.

The algorithm:
- Maintain a remainder per station and hour.
- For each hour:
  - desired equals hourly capacity plus remainder.
  - hour capacity equals floor of desired.
  - remainder equals desired minus hour capacity.
- Within the hour:
  - base equals floor of hour capacity divided by four.
  - extra equals hour capacity modulo four.
  - First extra slots get base plus one capacity.
  - Remaining slots get base capacity.

This produces a deterministic pattern that approximates the configured fractional capacity over time. For example a capacity of 2.5 per hour can yield a repeating pattern of hours with capacities 2 and 3.

For a given slot, the backend:
- Computes the slot capacity from the deterministic algorithm.
- Counts non cancelled bookings for that slot.
- Allows a new booking only when the count is less than the slot capacity.

---

## 8. API Design

### 8.1 Authentication

- POST api auth login
  - Body includes email and password.
  - On success returns the user and sets a session cookie.
- POST api auth logout
  - Destroys the session and clears the cookie.
- GET api auth me
  - Returns the currently authenticated user or an error if unauthenticated.

### 8.2 Admin Endpoints

- POST api admin users
  - Create a user with a role of admin manager or operator.
- GET api admin users
  - List users optionally filtered by role.
- POST api admin stations
  - Create a swap station with name location and hourly capacity.
- GET api admin stations
  - List all stations.
- PATCH api admin stations id
  - Update station properties including capacity.
- POST api admin stations id managers
  - Assign a manager to a station.
- GET api admin metrics summary
  - Returns bookings and no shows per station and last seven days metrics.

### 8.3 Manager Endpoints

- GET api manager stations
  - List stations assigned to the manager.
- GET api manager stations id bookings
  - List bookings for a station within a requested time range.
- PATCH api manager bookings id status
  - Update status to completed or cancelled.

### 8.4 Operator Endpoints

- GET api operator stations
  - List stations available for booking.
- GET api operator stations id slots
  - Returns 15 minute slots for the next 24 hours with available capacity.
- POST api operator bookings
  - Create a booking for a station and slot start time.
- GET api operator bookings upcoming
  - List upcoming bookings for the operator.
- GET api operator bookings history
  - List past bookings for the operator.
- POST api operator bookings id cancel
  - Cancel a booking if at least one hour remains before slot start.
- POST api operator bookings id reschedule
  - Cancel the original booking and create a new one within the allowed window.

All endpoints enforce session based authentication and role based authorization.

---

## 9. Time and Timezone Handling

- All timestamps are stored in UTC in the database.
- The API exposes ISO 8601 UTC timestamps.
- The frontend converts UTC timestamps to the browser local timezone for display.
- Slot generation:
  - Starts at the next quarter hour after the current time.
  - Extends to the same minute of the following day.

---

## 10. Monitoring and Observability

- Logging
  - Use structured logging for all requests and key domain events.
  - Include timestamps, log level, message, request id and user id when available.
- Metrics
  - At minimum expose a health endpoint for liveness checks.
  - Optionally export Prometheus compatible metrics for request counts and durations and booking counters.
- Alerting
  - In production hook metrics into alerting for:
    - Elevated error rates
    - Sharp drops in bookings
    - Unusual spikes in no shows

---

## 11. Setup and Deployment Overview

### 11.1 Local Setup (development)

Backend:
- From the backend directory:
  - Install dependencies:
    - `cd backend`
    - `npm install`
  - (Optional) Configure environment variables in a `.env` file:
    - `PORT` (default `4000`)
    - `SESSION_SECRET` (required for production, a random string)
    - `DB_FILE` (SQLite file path, defaults to `backend/data/database.sqlite`)
    - `DEFAULT_ADMIN_EMAIL` (default `admin@voltreserve.local`)
    - `DEFAULT_ADMIN_PASSWORD` (default `Admin123!`)
  - Run demo seed data (stations, managers, operators, example bookings):
    - `npm run seed:demo`

Frontend:
- From the frontend directory:
  - Install dependencies:
    - `cd frontend`
    - `npm install`
  - The Create React App dev server is configured with a proxy to `http://localhost:4000`, so no additional API base URL configuration is required for local development.

### 11.2 Run instructions (development)

Start the backend API:
- In `backend`:
  - Development mode with auto-reload:
    - `npm run dev`
  - Or plain Node:
    - `npm start`

Start the frontend:
- In `frontend`:
  - `npm start`
  - This serves the React app on `http://localhost:3000` and proxies API requests to `http://localhost:4000`.

Demo users and roles:
- Default admin (created automatically on first run if no admin exists):
  - Email: `admin@voltreserve.local`
  - Password: `Admin123!`
- Demo accounts created by `npm run seed:demo`:
  - Station Manager:
    - Email: `manager@voltreserve.local`
    - Password: `Manager123!`
  - Regional Manager:
    - Email: `regional.manager@voltreserve.local`
    - Password: `Manager123!`
  - Fleet Operators:
    - Email: `operator@voltreserve.local`
    - Email: `operator.beta@voltreserve.local`
    - Email: `operator.gamma@voltreserve.local`
    - Password (all operators): `Operator123!`

### 11.3 Deployment overview

- Build backend and frontend for production.
- Serve backend through a Node.js process manager or service manager.
- Serve frontend as static assets behind a reverse proxy.
- Store secrets and configuration in environment variables rather than source control.

---

## 12. Contribution Guidelines

- Use feature branches for changes.
- Follow the coding standards described in this document.
- Keep changes small and focused on a single feature or bug.
- Add or update tests where possible.
- Ensure linting and tests pass before merging changes.

---

## 13. Implementation Assumptions and Behaviour

### 13.1 General assumptions

- Time:
  - All times are stored in UTC in the database.
  - The frontend converts UTC timestamps to the browser local timezone for display.
- Slot model:
  - Slots are fixed at 15 minutes.
  - The available booking window is a rolling 24 hours starting from the next quarter hour.
- Capacity:
  - Each station has a single `hourly_capacity` value used for every hour in the 24 hour window.
  - Capacity is expressed as an average swaps per hour and may be fractional (for example `2.5`).
- No background jobs:
  - No shows are evaluated lazily when booking lists are read instead of via a scheduled job.

### 13.2 Capacity distribution explanation

The fractional capacity model is implemented in the backend utility
[capacity.js](file:///Users/vishalsikchi/Desktop/Projects/VoltReserve/backend/src/utils/capacity.js).

- For each hour in the 24 hour window:
  - A running remainder is maintained so that fractional parts of `hourly_capacity` are carried forward.
  - `desired = hourly_capacity + remainder`.
  - `hourCapacity = floor(desired)`.
  - `remainder = desired - hourCapacity`.
- Within a single hour:
  - There are four 15 minute slots.
  - `base = floor(hourCapacity / 4)`.
  - `extra = hourCapacity % 4`.
  - The first `extra` slots get `base + 1` capacity.
  - Remaining slots get `base` capacity.
- When exposing slots to the frontend:
  - Each slot’s `maxCapacity` comes from this deterministic pattern.
  - The backend counts existing non cancelled bookings for each slot.
  - `availableCapacity = max(maxCapacity - used, 0)` is returned and a new booking is rejected once `used >= maxCapacity`.

This ensures the configured fractional hourly capacity is respected over time while distributing whole booking slots evenly across the day.

### 11.3 No-show handling explanation

No-show behaviour is implemented in the bookings model and controller
([bookingController.js](file:///Users/vishalsikchi/Desktop/Projects/VoltReserve/backend/src/controllers/bookingController.js))
and matches the flow described in the “No Show Handling Flow” section.

- For each booking:
  - `slot_start_utc` and `slot_end_utc` mark the 15 minute slot.
  - `arrival_deadline_utc` is 15 minutes after `slot_end_utc`.
- A booking becomes a no show when:
  - The current time is later than `arrival_deadline_utc`.
  - The booking status is still `CONFIRMED`.
- Lazy evaluation:
  - Before returning upcoming or historical bookings, the backend runs a routine that:
    - Finds all `CONFIRMED` bookings whose `arrival_deadline_utc` has passed.
    - Updates them to `NO_SHOW`.
  - Clients always see up to date statuses without needing a background scheduler.
- Metrics:
  - Admin and manager metrics treat completed and no show bookings as capacity used when computing utilization.

These rules ensure that operators have a 15 minute grace period after their slot, and that capacity and reports remain accurate even without background jobs.
