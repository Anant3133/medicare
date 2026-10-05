# How Medicare Was Made

## Simple Overview

Medicare is a full-stack hospital management application. It was built to help hospital staff manage patients, doctors, admissions, beds, waiting lists, billing, and reports in one system.

The project is divided into three main parts:

1. **Frontend** – the screens and dashboards users interact with.
2. **Backend** – the server that receives requests and applies application rules.
3. **Database** – the place where hospital information is stored and managed safely.

## Technology Used

- **Frontend:** React with Vite, React Router, Tailwind CSS, and Axios
- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL using SQL and PL/pgSQL
- **Authentication:** JWT tokens and bcrypt password hashing
- **Deployment:** The project includes configuration for services such as Render and Vercel

## How the Project Is Organized

```text
medicare/
├── frontend/   User interface, pages, dashboards, and reusable components
├── backend/    REST API, routes, controllers, services, and authentication
├── db/         Database tables, functions, triggers, indexes, views, and sample data
└── documentation files and deployment configuration
```

## How It Works

A user starts by opening the React frontend and signing in. The frontend sends requests to the Express backend through API endpoints.

The backend receives those requests, checks authentication and permissions, validates the input, and communicates with PostgreSQL. The database then stores or retrieves information about patients, doctors, beds, admissions, bills, and users.

The result is sent back to the frontend, which updates the dashboard or page shown to the user.

```text
User interacts with the frontend
        ↓
React sends an API request
        ↓
Express backend checks and processes it
        ↓
PostgreSQL stores or retrieves the data
        ↓
The backend sends a response
        ↓
The frontend displays the updated information
```

## Main Features

- Patient registration and management
- Doctor and department management
- Hospital bed availability tracking
- Patient admission and discharge workflows
- Priority-based waiting lists
- Automatic billing calculations
- Reports for occupancy, revenue, and waiting lists
- Login and role-based access for different hospital users
- Audit logs that record important database changes

## Important Database Design

The database was designed with separate tables for major hospital entities, such as patients, doctors, rooms, beds, admissions, bills, services, users, and audit logs.

Relationships between these tables are managed with primary keys and foreign keys. Rules such as valid bed statuses, positive billing amounts, and valid admission dates are enforced directly in the database.

The project also uses:

- **Transactions** so multi-step operations either complete fully or roll back safely
- **Stored functions** for tasks such as bed allocation, admission processing, discharge, and billing
- **Triggers** for automatic audit logging and bed-status updates
- **Indexes and views** to make common queries and reports easier and faster
- **Row-level locking** to prevent two users from assigning the same bed at the same time

## Example: Admitting a Patient

When staff admit a patient, the system broadly follows this process:

1. The frontend submits the admission form.
2. The backend validates the request and user permissions.
3. The database searches for a suitable available bed.
4. The bed is locked while it is being assigned to prevent double-booking.
5. The admission and bed status are updated together.
6. If no bed is available, the patient is added to the waiting list.
7. Database triggers create audit records for important changes.
8. The updated information is returned to the frontend.

## Development and Deployment Approach

The project can be run locally with separate frontend and backend development servers. PostgreSQL is initialized using SQL migration files in the `db` directory, followed by sample seed data.

For deployment, the repository includes a `render.yaml` blueprint that describes the PostgreSQL database, backend service, and frontend static site. This allows the application to be deployed as a connected full-stack system.

## In Broad Terms

Medicare was made by combining a React user interface, an Express REST API, and a PostgreSQL database. The frontend focuses on user interaction, the backend coordinates requests and security, and the database handles structured hospital data and important business rules.

The project is also designed as an educational DBMS project, so many advanced PostgreSQL features are used to demonstrate data integrity, transactions, concurrency control, auditing, query performance, and database-driven business logic.
