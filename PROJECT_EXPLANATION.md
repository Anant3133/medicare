# How Medicare Was Made

## Project Overview

Medicare is a full-stack hospital management system built around patient admission, hospital bed allocation, doctor assignments, billing, and reporting.

The application uses a three-tier architecture:

1. **React frontend** – provides the user interface and dashboards.
2. **Node.js/Express backend** – exposes REST API endpoints and coordinates application logic.
3. **PostgreSQL database** – stores hospital data and enforces important business rules.

The project is also an educational DBMS application. It demonstrates how database features such as transactions, triggers, stored functions, constraints, indexes, views, and row-level locking can be used in a realistic system.

## Technology Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js, `pg` for PostgreSQL access
- **Database:** PostgreSQL with SQL and PL/pgSQL
- **Authentication:** JSON Web Tokens, bcrypt password hashing, and role-based access control
- **Security and middleware:** Helmet, CORS, request logging, compression, and input validation
- **Deployment:** Render Blueprint configuration and Vercel-compatible frontend configuration

## Major Project Components

### 1. Frontend

The frontend is a React single-page application located in the `frontend/` directory. The entry point is `frontend/src/main.jsx`, which loads the application and wraps it with the theme provider.

`frontend/src/App.jsx` defines the main client-side routing structure using React Router. It includes pages for:

- Login
- Admin dashboard
- Patient management
- Doctor management
- Admissions
- Waiting lists
- Billing
- Reports

The frontend also uses protected routes. A user must have an authentication token stored in the browser before accessing the main application pages. Reusable components provide shared layouts, navigation, forms, tables, dashboards, and other interface elements.

The frontend communicates with the backend through Axios API calls. It does not connect directly to PostgreSQL; all database access goes through the backend API.

### 2. Backend API

The backend is an Express.js REST API located in `backend/`. Its entry point is `backend/server.js`.

The server configures common middleware for:

- Parsing JSON request bodies
- Handling cross-origin requests
- Adding security headers
- Compressing responses
- Logging requests
- Handling errors and missing routes

The backend organizes API functionality into separate route and controller modules:

```text
backend/
├── server.js       Express application and route registration
├── config/         Database connection pool and transaction helpers
├── routes/         REST endpoint definitions
├── controllers/   Request handling and response logic
├── services/      More complex business workflows
├── utils/          Shared helper and error-handling functions
└── scripts/       Database migration utilities
```

The API is divided into resource areas such as authentication, patients, admissions, beds, doctors, billing, and reports. Each route forwards requests to a controller, while services contain reusable workflows such as admission processing and billing operations.

### 3. Database Layer

The database is defined in the `db/` directory and uses PostgreSQL without an ORM. The backend sends parameterized SQL queries through the `pg` driver.

The database is split into related tables for:

- Departments
- Doctors
- Patients
- Rooms
- Beds
- Admissions
- Services
- Bills and bill items
- Waiting-list entries
- Users
- Audit records

The schema uses primary keys, foreign keys, unique constraints, check constraints, default values, and generated columns to protect data integrity.

The main database files are:

```text
db/
├── schema.sql              Table definitions and constraints
├── functions.sql           Stored functions for business workflows
├── triggers.sql            Automatic validation and audit behavior
├── indexes_and_views.sql   Query optimization and reporting views
├── seed.sql                 Initial sample data and users
└── migration scripts        Automated database setup
```

### 4. Authentication and Authorization

Users authenticate through the backend login endpoint. Passwords are stored as bcrypt hashes rather than plain text. After a successful login, the backend issues a JWT token.

The frontend stores the token and uses it when making protected API requests. Backend middleware verifies the token and can restrict operations based on the user role, such as admin, doctor, staff, billing, or patient.

This separates authentication from authorization:

- **Authentication** verifies who the user is.
- **Authorization** determines what that user is allowed to do.

### 5. Admission and Bed Allocation

Admission processing is one of the central workflows in the system.

At a high level:

1. Staff submit an admission request from the frontend.
2. The backend validates the request and user permissions.
3. The database looks for a compatible available bed.
4. A transaction groups the admission and bed updates together.
5. PostgreSQL row-level locking helps prevent two users from assigning the same bed.
6. If no bed is available, the patient can be placed on a priority-based waiting list.
7. The updated admission and bed information is returned to the frontend.

The database function `process_admission` coordinates the workflow, while `allocate_bed_to_admission` uses `FOR UPDATE SKIP LOCKED` to improve concurrency safety.

### 6. Billing

Billing is connected to the admission workflow. The database calculates charges based on factors such as the length of stay and bed type. Additional billable services can be represented through the services and bill-items tables.

The database includes functions for calculating and generating bills. Generated columns are used for values such as bill totals and line-item subtotals, allowing PostgreSQL to calculate them consistently.

The backend exposes billing endpoints for creating bills, viewing bills, and marking bills as paid.

### 7. Database Automation and Auditing

Several actions are handled automatically inside PostgreSQL through triggers and PL/pgSQL functions.

Examples include:

- Recording inserts, updates, and deletes in the audit log
- Rejecting assignments to unavailable beds
- Releasing a bed when an admission is discharged
- Validating admission dates
- Maintaining consistent payment timestamps

This design keeps important data rules close to the data itself instead of depending only on frontend or backend code.

### 8. Reporting and Performance

The reporting features use SQL queries, views, materialized views, and indexes to provide information such as:

- Bed occupancy
- Revenue
- Waiting-list status
- Doctor and admission statistics

Indexes improve frequently used lookups and filters. Views provide reusable query definitions, while materialized views can store the results of more expensive reporting queries for faster access.

## Example Request Flow

A typical request moves through the system like this:

```text
User submits a form in React
        ↓
React sends an HTTP request with Axios
        ↓
Express route receives the request
        ↓
Authentication and validation middleware run
        ↓
Controller or service processes the operation
        ↓
Parameterized SQL is sent to PostgreSQL
        ↓
Constraints, functions, triggers, and transactions apply
        ↓
Backend returns a JSON response
        ↓
React updates the page or dashboard
```

## Example: Admitting a Patient

For an admission request, the major components work together as follows:

1. `StaffAdmit` collects the admission information in the frontend.
2. Axios sends the request to an admission API route.
3. The admission controller validates the request and identifies the patient, doctor, and requested bed type.
4. The service or database function starts the admission workflow.
5. PostgreSQL searches for an available bed and locks the selected row.
6. The admission record and bed status are updated consistently.
7. If no bed is available, a waiting-list record is created.
8. Audit triggers record the relevant database changes.
9. The backend returns the result, and the React interface refreshes the displayed data.

## Development and Deployment

For local development, the repository uses separate npm projects for the backend and frontend. The root `package.json` provides scripts that install dependencies and run both development servers concurrently.

The PostgreSQL database is initialized by running the SQL files in the required order:

1. `schema.sql`
2. `functions.sql`
3. `triggers.sql`
4. `indexes_and_views.sql`
5. `seed.sql`

Environment variables are used for database credentials, server configuration, JWT settings, and frontend API URLs.

For deployment, `render.yaml` describes three connected services:

- A PostgreSQL database
- A Node.js backend web service
- A React frontend static site

## Summary

Medicare was built by combining a React client, an Express REST API, and a PostgreSQL database. The frontend handles presentation and user interaction, the backend manages HTTP requests and security, and the database stores the core hospital data.

The main technical design is based on clear separation of responsibilities. React manages the interface, Express organizes API routes and controllers, service modules handle larger workflows, and PostgreSQL enforces relationships and business rules through SQL features such as transactions, stored functions, triggers, indexes, and views.
