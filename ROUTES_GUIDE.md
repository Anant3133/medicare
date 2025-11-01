# Medicare - Routes & Navigation Guide

## 🔐 Authentication

### Login Credentials (Database)
All users share the same password: `admin123`

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin` | `admin123` | Admin | Full system access |
| `doctor1` | `admin123` | Doctor | Patient management, view own patients |
| `doctor2` | `admin123` | Doctor | Patient management, view own patients |
| `staff1` | `admin123` | Staff | Admissions, waiting list, billing |
| `billing1` | `admin123` | Billing | Billing and invoicing |

---

## 🗺️ Application Routes

### Public Routes
- `/login` → **Login Page** (no authentication required)

### Protected Routes (requires login)

| Route | Component | Access Roles | Description |
|-------|-----------|--------------|-------------|
| `/` | Redirect to `/dashboard` | All | Root redirect |
| `/dashboard` | **AdminDashboard** | Admin, Staff, Doctor, Billing | Main dashboard with stats, bed grid, activity |
| `/admissions` | **StaffAdmit** | Admin, Staff, Doctor | Manage patient admissions, discharge patients |
| `/waiting-list` | **WaitingList** | Admin, Staff | View priority-based waiting queue |
| `/doctor/patients` | **DoctorPatients** | Doctor | View doctor's assigned patients |
| `/billing` | **Billing** | Admin, Billing, Staff | Manage bills, generate invoices, mark paid |

---

## 🧭 Navigation Flow

### After Login:
1. **User logs in** → Token saved to localStorage
2. **Redirects to** `/dashboard`
3. **Sidebar shows menu** based on user role

### Role-Based Menu Items:

#### Admin (`admin`) sees:
- ✅ Dashboard
- ✅ Admissions
- ✅ Waiting List
- ✅ Billing

#### Doctor (`doctor1`, `doctor2`) sees:
- ✅ Dashboard
- ✅ Admissions
- ✅ My Patients

#### Staff (`staff1`) sees:
- ✅ Dashboard
- ✅ Admissions
- ✅ Waiting List
- ✅ Billing

#### Billing (`billing1`) sees:
- ✅ Dashboard
- ✅ Billing

---

## 🔒 Route Protection

All routes except `/login` are protected by the `ProtectedRoute` component:

```jsx
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};
```

**Authentication Check:**
- Looks for JWT token in `localStorage.getItem('token')`
- If token exists → Allow access
- If no token → Redirect to `/login`

---

## 📱 Page Components Overview

### 1. **Login.jsx** (`/login`)
- Username & password fields
- Shows demo credentials
- JWT authentication
- Auto-redirect to dashboard on success

### 2. **AdminDashboard.jsx** (`/dashboard`)
- Stats cards (bed occupancy, admissions, waiting list, bills)
- Bed grid visualization (grouped by floor/room)
- Today's activity summary
- Bed status breakdown

### 3. **StaffAdmit.jsx** (`/admissions`)
- View all admissions (active/discharged/waiting)
- Create new admission (modal form)
- Discharge patients
- Filter by status

### 4. **WaitingList.jsx** (`/waiting-list`)
- Priority-based queue
- Grouped by department
- Shows wait time, priority, emergency contact
- Color-coded priority badges

### 5. **DoctorPatients.jsx** (`/doctor/patients`)
- View doctor's active patients only
- Patient cards with location (floor/room/bed)
- Admission date, diagnosis
- Priority indicators

### 6. **Billing.jsx** (`/billing`)
- View all bills (pending/paid/cancelled)
- Generate bills for admissions
- Mark bills as paid
- Detailed bill modal (line items, tax, total)

---

## 🎨 Sidebar Component

**Location:** `frontend/src/components/Sidebar.jsx`

**Features:**
- Logo & branding
- User info display (username, role)
- Role-based menu filtering
- Active route highlighting
- Logout button (clears token & redirects to login)

**Menu Item Configuration:**
```javascript
const menuItems = [
  { path: '/dashboard', icon: FaHome, label: 'Dashboard', 
    roles: ['admin', 'staff', 'doctor', 'billing'] },
  { path: '/admissions', icon: FaUserInjured, label: 'Admissions', 
    roles: ['admin', 'staff', 'doctor'] },
  { path: '/waiting-list', icon: FaClock, label: 'Waiting List', 
    roles: ['admin', 'staff'] },
  { path: '/doctor/patients', icon: FaStethoscope, label: 'My Patients', 
    roles: ['doctor'] },
  { path: '/billing', icon: FaFileInvoiceDollar, label: 'Billing', 
    roles: ['admin', 'billing', 'staff'] },
];
```

---

## 🚀 Testing Routes

### Test Login:
1. Go to `http://localhost:5173/login`
2. Use: `admin` / `admin123`
3. Should redirect to `/dashboard`

### Test Protected Routes:
1. Without login, try: `http://localhost:5173/dashboard`
2. Should redirect to `/login`

### Test Role-Based Access:
1. Login as `doctor1` / `admin123`
2. Sidebar should show: Dashboard, Admissions, My Patients
3. Should NOT show: Waiting List, Billing (admin only)

### Test Navigation:
1. Click sidebar menu items
2. URL should update (check address bar)
3. Active item should be highlighted (blue background)

### Test Logout:
1. Click "Logout" in sidebar
2. Should clear token from localStorage
3. Should redirect to `/login`

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot access route after login"
**Solution:** Check if token is stored:
```javascript
// Open browser console
console.log(localStorage.getItem('token'));
```

### Issue: "Redirects to login immediately"
**Solution:** Token might be invalid or expired. Clear localStorage:
```javascript
localStorage.clear();
```

### Issue: "Menu items not showing"
**Solution:** Check user role in localStorage:
```javascript
console.log(JSON.parse(localStorage.getItem('user')));
```

### Issue: "404 on route"
**Solution:** Ensure route exists in `App.jsx` and component is imported.

---

## 📂 Related Files

- **Routes:** `frontend/src/App.jsx`
- **Login:** `frontend/src/pages/Login.jsx`
- **Sidebar:** `frontend/src/components/Sidebar.jsx`
- **All Pages:** `frontend/src/pages/`
- **Database Users:** `db/seed.sql` (lines 168-173)

---

## ✅ Verification Checklist

- [x] All routes defined in App.jsx
- [x] All page components exist
- [x] Protected routes implemented
- [x] Role-based sidebar filtering
- [x] Login credentials match database
- [x] JWT token authentication working
- [x] Logout functionality working
- [x] Active route highlighting in sidebar

**All routes are correctly configured and ready to use!** 🎉
