# Medicare - Smart Hospital Bed & Patient Allocation System

A full-stack hospital management system demonstrating advanced DBMS concepts including transactions, triggers, stored procedures, views, indexes, and concurrency control.

## 🏗️ Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React + React Router DOM + Tailwind CSS + PostCSS
- **Database**: PostgreSQL (pure SQL, no ORM)
- **API Client**: Axios
- **Database Driver**: node-postgres (`pg`)

## 📋 Features

- **Patient Management**: Register and track patient information
- **Smart Bed Allocation**: Real-time bed availability with concurrency-safe assignment
- **Admission System**: Transaction-based admission process with automatic bed allocation
- **Waiting List**: Priority-based queue for bed assignment
- **Doctor Assignment**: Manage doctor-patient relationships
- **Billing System**: Automated billing with tax calculation
- **Audit Logs**: Track all database changes with triggers
- **Role-Based Access**: Admin, Doctor, Staff, and Billing roles

## 🎯 DBMS Concepts Demonstrated

1. **Transactions**: Multi-step admission process with ACID properties
2. **Triggers**: Automatic audit logging on INSERT/UPDATE/DELETE
3. **Stored Procedures/Functions**: Complex business logic in database
4. **Views**: Materialized queries for reporting
5. **Indexes**: Performance optimization on frequently queried columns
6. **Constraints**: Data integrity with CHECK, FOREIGN KEY, UNIQUE constraints
7. **Row-Level Locking**: `SELECT FOR UPDATE` to prevent race conditions
8. **Parameterized Queries**: SQL injection prevention

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Step 1: Database Setup

1. Install PostgreSQL and create a new database:
```bash
psql -U postgres
CREATE DATABASE medicare;
\q
```

2. Copy environment files:
```bash
# Root level
cp .env.example .env

# Backend level
cp backend/.env.example backend/.env
```

3. Edit `.env` files with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medicare
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### Step 2: Run Database Migrations

On Windows (PowerShell):
```powershell
cd db
# Run each SQL file in order
Get-Content schema.sql | psql -U postgres -d medicare
Get-Content functions.sql | psql -U postgres -d medicare
Get-Content triggers.sql | psql -U postgres -d medicare
Get-Content indexes_and_views.sql | psql -U postgres -d medicare
Get-Content seed.sql | psql -U postgres -d medicare
```

On Linux/Mac:
```bash
cd db
chmod +x run_migrations.sh
./run_migrations.sh
```

Or manually:
```bash
psql -U postgres -d medicare -f db/schema.sql
psql -U postgres -d medicare -f db/functions.sql
psql -U postgres -d medicare -f db/triggers.sql
psql -U postgres -d medicare -f db/indexes_and_views.sql
psql -U postgres -d medicare -f db/seed.sql
```

### Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### Step 4: Run the Application

**Development Mode (Both servers concurrently):**
```bash
npm run dev
```

This will start:
- Backend API: http://localhost:5000
- Frontend: http://localhost:5173

**Or run individually:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 5: Test with Postman

Import the `postman_collection_medicare.json` file into Postman to test all API endpoints.

## 📁 Project Structure

```
medicare/
├── README.md
├── package.json
├── .env.example
├── db/
│   ├── schema.sql              # Database schema with constraints
│   ├── functions.sql            # Stored procedures and functions
│   ├── triggers.sql             # Audit triggers
│   ├── indexes_and_views.sql    # Performance optimizations
│   ├── seed.sql                 # Sample data
│   └── run_migrations.sh        # Migration script
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── config/
│   │   └── db.js               # PostgreSQL connection pool
│   ├── controllers/            # Request handlers
│   ├── routes/                 # API routes
│   ├── services/               # Business logic with transactions
│   └── utils/                  # Helper functions
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/                # Axios configuration
    │   ├── pages/              # React page components
    │   └── components/         # Reusable UI components
    └── public/
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Register new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Admissions
- `POST /api/admissions` - Create admission (with transaction)
- `GET /api/admissions` - List admissions
- `GET /api/admissions/:id` - Get admission details
- `PUT /api/admissions/:id/discharge` - Discharge patient

### Beds
- `GET /api/beds` - List all beds with availability
- `GET /api/beds/available` - Get available beds
- `PUT /api/beds/:id/status` - Update bed status

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id/patients` - Get doctor's patients

### Billing
- `POST /api/billing` - Generate bill
- `GET /api/billing/:admissionId` - Get bill for admission
- `PUT /api/billing/:id/pay` - Mark bill as paid

### Reports
- `GET /api/reports/occupancy` - Bed occupancy report
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/waiting-list` - Waiting list report

## 👥 Default Users (from seed data)

- **Admin**: username: `admin`, password: `admin123`
- **Doctor**: username: `doctor1`, password: `doctor123`
- **Staff**: username: `staff1`, password: `staff123`
- **Billing**: username: `billing1`, password: `billing123`

## 🧪 Testing

1. Start the application
2. Import Postman collection
3. Use the login endpoint to get a JWT token
4. Test various endpoints with the token

## 📝 Sample Workflows

### Admitting a Patient

1. Create/Select a patient
2. Check available beds: `GET /api/beds/available`
3. Create admission: `POST /api/admissions` (uses transaction)
4. System automatically:
   - Assigns bed
   - Updates bed status
   - Creates audit log entry
   - Triggers any relevant stored procedures

### Discharging a Patient

1. Discharge: `PUT /api/admissions/:id/discharge`
2. Generate bill: `POST /api/billing`
3. Mark payment: `PUT /api/billing/:id/pay`

## 🔒 Security Features

- Parameterized queries (prevents SQL injection)
- Password hashing with bcrypt
- JWT authentication
- Input validation
- Transaction rollback on errors

## 📊 Database Features

- **Normalization**: 3NF normalized schema
- **Referential Integrity**: Foreign key constraints
- **Data Validation**: CHECK constraints
- **Audit Trail**: Automatic logging via triggers
- **Concurrency Control**: Row-level locking for bed allocation
- **Performance**: Strategic indexes on foreign keys and query columns

## 🤝 Contributing

This is an educational project demonstrating DBMS concepts. Feel free to extend it with additional features.

## 📄 License

MIT License
