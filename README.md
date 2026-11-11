<<<<<<< HEAD
# 🏥 MediBook - Full-Stack Hospital Appointment Booking System

MediBook is a production-grade, enterprise healthcare web platform engineered for hospitals, medical clinics, and outpatient networks. It delivers end-to-end functionality across three distinct user roles: **Patients**, **Attending Doctors**, and **Hospital Administrators**, backed by a PostgreSQL database with Prisma ORM, JWT security, and Vercel serverless deployment compatibility.

---

## 🌟 Key Highlights & Engineering Features

- **Multi-Role Healthcare Dashboards**:
  - **Patient Portal**: Self-registration, real-time doctor search across 8 clinical departments, 4-step slot booking wizard, appointment cancellation with slot release, personal health profile, and booking history.
  - **Doctor Portal**: Daily clinic metrics, pending appointment acceptance/rejection, weekly visual calendar, weekly schedule configuration (Monday–Sunday hours), scheduled leave blackout dates, and patient medical directory.
  - **Admin Control Center**: Hospital-wide analytics, doctor credentialing & CRUD management, department management, master appointment ledger with administrative overrides, doctor schedule overview, and immutable audit event logging.
- **Concurrency-Safe Slot Engine**:
  - Prevents race conditions and double bookings using database constraints and transactional conflict detection.
  - Automatically factors in weekly recurring practice hours, 30-minute intervals, doctor leaves, past dates/times, and existing appointments.
- **Dual-Mode Persistence Architecture**:
  - **Production Mode**: Seamlessly connects to **Neon PostgreSQL** via **Prisma ORM**.
  - **Local Development / Offline Mode**: Built-in zero-friction fallback store ensuring all features, APIs, and dashboards run instantly out-of-the-box even before provisioning external cloud database credentials.
- **Design & Branding System**:
  - Healthcare palette: Indigo (`#4338CA`), Secondary Purple (`#7C3AED`), Dark Navy (`#0F172A`), Background (`#F8FAFC`).
  - Typography: **Plus Jakarta Sans** for headings and **Inter** for body text.
  - Accessible, fully responsive layouts across mobile, tablet, and widescreen desktop displays.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Axios, React Hook Form, Zod |
| **Backend** | Node.js (ES Modules), Express.js, REST API architecture, Helmet, CORS, Rate Limiting |
| **Authentication** | JWT (JSON Web Tokens) with HTTP-only cookies & Bearer fallback, Bcrypt password hashing |
| **Database & ORM** | PostgreSQL, Neon Cloud Database, Prisma ORM |
| **Deployment** | Vercel (Serverless Express handler + Static Frontend), GitHub |

---

## 📁 Repository Structure

```text
medibook/
├── backend/
│   ├── api/
│   │   └── index.js              # Vercel serverless entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma schema with 9 PostgreSQL models & enums
│   │   ├── seed.js               # PostgreSQL database seed script
│   │   └── seedData.js           # Validated realistic seed dataset
│   ├── src/
│   │   ├── config/               # Environment variables, DB initialization
│   │   ├── controllers/          # Auth, Doctors, Appointments, Patient, Admin
│   │   ├── middleware/           # JWT auth, role authorization, Zod validation, error handling
│   │   ├── routes/               # Modular REST API endpoints (/api/v1/...)
│   │   ├── services/             # Unified DataService, SlotService, LocalStore
│   │   ├── utils/                # Bcrypt, JWT tokens, cookie options
│   │   ├── validators/           # Zod request validation schemas
│   │   ├── app.js                # Express application configuration
│   │   └── index.js              # Server bootstrap listener
│   ├── test-suite.js             # Automated 16-point integration test suite
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, DashboardLayout, Modals, Badges, Alerts
│   │   ├── context/              # AuthContext (login, register, logout, profile state)
│   │   ├── hooks/                # useAuth custom hook
│   │   ├── pages/
│   │   │   ├── public/           # Home, Doctors directory, Doctor profile, Departments, Contact, About
│   │   │   ├── auth/             # Login, Register, Forgot Password, Reset Password
│   │   │   ├── patient/          # Dashboard, Book Wizard, Appointments, Details, Profile, Settings
│   │   │   ├── doctor/           # Dashboard, Appointments, Calendar, Availability, Patients, Profile
│   │   │   └── admin/            # Dashboard, Doctors, Patients, Departments, Appointments, Schedules, Settings
│   │   ├── routes/               # AppRoutes, ProtectedRoute with role guards
│   │   ├── services/             # Axios API service client modules
│   │   ├── utils/                # Date, time, currency, and badge formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind base and healthcare styling utilities
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json                  # Root monorepo workspace scripts
├── vercel.json                   # Vercel deployment rewrites
├── .gitignore
└── README.md
```

---

## 🗄️ Database Architecture (Prisma Models)

The PostgreSQL database schema is defined in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma):

1. **`User`**: System identity, unique email, bcrypt hash, role enum (`PATIENT`, `DOCTOR`, `ADMIN`), active status.
2. **`Patient`**: Full name, contact phone, date of birth, gender, blood group, address, emergency contact.
3. **`Doctor`**: Department relation, qualifications, specialization, years of experience, consultation fee, biography, room number, direct phone, photo URL, approval status.
4. **`Department`**: Unique department name, medical description, icon, cover image, active status.
5. **`DoctorSchedule`**: Doctor weekly recurring visiting hours by day of week (`dayOfWeek` 0–6, `startTime`, `endTime`, `slotDurationMinutes`).
6. **`DoctorLeave`**: Doctor blackout leave dates preventing slot generation on scheduled time off.
7. **`Appointment`**: Unique booking code (`MED-YYYYMM-XXXX`), patient relation, doctor relation, calendar date, slot start/end times, status enum (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `COMPLETED`), symptoms/reason, doctor diagnosis notes, cancellation reason.
   - **Unique Constraint**: `@@unique([doctorId, date, startTime])` guaranteeing that two active appointments cannot share the same physician slot.
8. **`PasswordReset`**: Cryptographic reset tokens, expiration timestamps, single-use validation flag.
9. **`AuditLog`**: Immutable activity trail recording user ID, action code, target entity, details JSON, client IP, and timestamps.

---

## 🔐 Pre-Seeded Default Test Accounts

For one-click testing, the login screen includes interactive quick-fill credentials:

| Role | Email Address | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| **Hospital Admin** | `admin@medibook.com` | `Admin@123` | Full administrative control (`/admin/dashboard`) |
| **Attending Doctor** | `dr.jenkins@medibook.com` | `Doctor@123` | Cardiology appointments & schedule (`/doctor/dashboard`) |
| **Attending Doctor** | `dr.hayes@medibook.com` | `Doctor@123` | Neurology clinic & calendar (`/doctor/dashboard`) |
| **Attending Doctor** | `dr.rostova@medibook.com` | `Doctor@123` | Dermatology appointments (`/doctor/dashboard`) |
| **Attending Doctor** | `dr.vance@medibook.com` | `Doctor@123` | Orthopedics consultations (`/doctor/dashboard`) |
| **Registered Patient** | `john.doe@example.com` | `Patient@123` | Patient appointments & booking (`/patient/dashboard`) |
| **Registered Patient** | `jane.smith@example.com` | `Patient@123` | Patient appointments & booking (`/patient/dashboard`) |

*Note: Any new patient can also register directly through the public registration form (`/register`).*

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js version 18.0 or higher
- npm (v9+) or pnpm

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/medibook.git
cd medibook

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
In `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/medibook?sslmode=require"
JWT_SECRET=medibook_super_secret_jwt_access_token_key_2026_xyz
JWT_REFRESH_SECRET=medibook_super_secret_refresh_token_key_2026_abc
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Initialize Database & Prisma (Neon PostgreSQL)
When connected to a Neon PostgreSQL instance:
```bash
cd backend

# Push Prisma schema to create tables, enums, and constraints
npm run prisma:push

# Generate the typed Prisma Client
npm run prisma:generate

# Seed departments, doctors, patients, and initial appointments
npm run seed
```

### 4. Run Development Servers
From the root directory:
```bash
# In terminal 1: Start backend Express server (port 5000)
cd backend && npm run dev

# In terminal 2: Start frontend Vite server (port 5173)
cd frontend && npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Automated Integration Test Suite

MediBook includes an automated end-to-end integration test runner validating all critical operations across auth, scheduling, booking, race-condition double-booking prevention, and role access:

```bash
cd backend
node test-suite.js
```

### Verified Test Assertions:
1. `GET /api/v1/health` responds with HTTP 200 OK
2. `GET /api/v1/departments` returns 8 clinical departments
3. `GET /api/v1/doctors` returns verified active doctors
4. `GET /api/v1/doctors/:id` retrieves single physician credentials
5. `GET /api/v1/doctors/:id/slots` calculates 30-minute intervals
6. `POST /api/v1/auth/register` creates patient and signs JWT
7. `POST /api/v1/auth/login` validates ADMIN credentials
8. `POST /api/v1/auth/login` validates DOCTOR credentials
9. `POST /api/v1/appointments` reserves consultation slot
10. **Race Condition Check**: Attempting to reserve the same slot returns **HTTP 409 Conflict**
11. `GET /api/v1/appointments/my` retrieves authenticated patient bookings
12. `PATCH /api/v1/doctor/appointments/:id/status` confirms appointment
13. `PATCH /api/v1/appointments/:id/cancel` releases reserved slot
14. `GET /api/v1/admin/dashboard` returns system analytics & revenue
15. `GET /api/v1/admin/audit-logs` validates recorded audit trails

---

## ☁️ Deployment Guide (Vercel & Neon)

### 1. Provision Neon PostgreSQL
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech).
2. Copy the pooled connection string:
   ```text
   postgresql://[user]:[password]@[neon-subdomain].neon.tech/neondb?sslmode=require
   ```

### 2. Deploy to Vercel
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the `medibook` repository.
3. Configure the Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `frontend/dist`
4. Set Environment Variables in Vercel:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `JWT_SECRET`: Random secure string (32+ characters)
   - `JWT_REFRESH_SECRET`: Random secure string
   - `NODE_ENV`: `production`
5. Click **Deploy**. Vercel will build the frontend assets and deploy the backend Express API via `backend/api/index.js` as defined in `vercel.json`.

---

## 📄 License
This project is licensed under the MIT License. Developed for healthcare innovation by the MediBook Engineering Team.
=======
# MediBook
>>>>>>> 9f59e0079e218df9c627c3b16fcb67ef1e6ede42
