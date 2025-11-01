# Quick Testing Guide - Medicare

## 🚀 Start the Application

### Terminal 1 - Backend:
```bash
cd C:\Users\Anant\OneDrive\Desktop\medicare\backend
npm run dev
```
**Expected:** Server running on http://localhost:5000

### Terminal 2 - Frontend:
```bash
cd C:\Users\Anant\OneDrive\Desktop\medicare\frontend
npm run dev
```
**Expected:** Vite dev server on http://localhost:5173

---

## ✅ Test Flow

### 1. Test Login
1. Open browser: `http://localhost:5173`
2. Should auto-redirect to `/login`
3. Use credentials: `admin` / `admin123`
4. Click "Login"
5. **Expected:** Redirect to `/dashboard` with sidebar visible

### 2. Test Dashboard (Admin)
- ✅ Should see 4 stat cards (bed occupancy, admissions, waiting list, bills)
- ✅ Should see bed grid visualization
- ✅ Should see today's activity summary
- ✅ Sidebar shows: Dashboard, Admissions, Waiting List, Billing

### 3. Test Navigation
Click each menu item in sidebar:
- `/dashboard` - Dashboard loads ✅
- `/admissions` - Admissions page loads ✅
- `/waiting-list` - Waiting list loads ✅
- `/billing` - Billing page loads ✅

### 4. Test Admissions Page
- ✅ Should see admission cards
- ✅ Click "New Admission" → Modal opens
- ✅ Filter tabs work (Active/Discharged/Waiting)
- ✅ Discharge button visible on active admissions

### 5. Test Waiting List
- ✅ Shows patients grouped by department
- ✅ Priority badges visible (red=urgent, yellow=medium, blue=low)
- ✅ Shows wait time and emergency contacts

### 6. Test Billing
- ✅ Shows bill cards with status badges
- ✅ Filter tabs work (Pending/Paid/Cancelled)
- ✅ Click bill card → Detail modal opens
- ✅ "Mark as Paid" button for pending bills

### 7. Test Role-Based Access
**Logout and login as `doctor1` / `admin123`:**
- ✅ Sidebar should show: Dashboard, Admissions, My Patients
- ✅ Should NOT show: Waiting List, Billing
- ✅ Navigate to `/doctor/patients` → Shows doctor's patients only

**Logout and login as `billing1` / `admin123`:**
- ✅ Sidebar should show: Dashboard, Billing
- ✅ Should NOT show: Admissions, Waiting List, My Patients

### 8. Test Logout
- Click "Logout" button in sidebar
- ✅ Redirects to `/login`
- ✅ Token cleared from localStorage
- ✅ Cannot access protected routes (auto-redirect to login)

---

## 🧪 API Testing with Postman

### 1. Import Collection
- Open Postman
- Import: `postman_collection_medicare.json`

### 2. Test Authentication
- Run: `Authentication > Login`
- Body: `{"username": "admin", "password": "admin123"}`
- **Expected:** Returns token (auto-saved to collection variable)

### 3. Test Protected Endpoints
All subsequent requests will use the saved token automatically:
- `Patients > Get All Patients`
- `Beds > Get Available Beds`
- `Admissions > Create Admission`
- `Billing > Generate Bill`

---

## 🔍 Verify Database

### Check Tables:
```bash
psql -U project_admin -d medicare
\dt
```
**Expected:** 12 tables listed

### Check Sample Data:
```sql
SELECT COUNT(*) FROM patients;      -- Should return 12
SELECT COUNT(*) FROM doctors;       -- Should return 8
SELECT COUNT(*) FROM beds;          -- Should return 18
SELECT COUNT(*) FROM departments;   -- Should return 7
SELECT COUNT(*) FROM users;         -- Should return 5
```

### Check Users:
```sql
SELECT username, role, full_name FROM users;
```
**Expected:**
```
 username  |  role   |      full_name
-----------+---------+---------------------
 admin     | admin   | System Administrator
 doctor1   | doctor  | Dr. Sarah Johnson
 doctor2   | doctor  | Dr. Michael Chen
 staff1    | staff   | Alice Staff
 billing1  | billing | Bob Billing
```

---

## 🐛 Troubleshooting

### Frontend Not Loading?
```bash
# Check if Vite is running
# Should see: "Local: http://localhost:5173"
```

### Backend API Errors?
```bash
# Check backend console for errors
# Verify database connection in backend/.env
```

### Login Failed?
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check database credentials are correct
4. Verify users exist: `SELECT * FROM users;`

### 401 Unauthorized?
1. Token might be expired or invalid
2. Clear localStorage: `localStorage.clear()`
3. Login again

### Database Connection Failed?
1. Verify PostgreSQL is running
2. Check `backend/.env` credentials
3. Test connection: `psql -U project_admin -d medicare`

---

## ✨ Expected Features Working

### Real-Time Updates:
- ✅ Add admission → Bed status updates automatically
- ✅ Discharge patient → Bed becomes available
- ✅ Generate bill → Shows in billing list immediately

### Data Validation:
- ✅ Cannot admit to occupied bed (trigger validation)
- ✅ Cannot discharge already-discharged patient
- ✅ Cannot create bill for non-existent admission

### Audit Logging:
- ✅ All changes logged in `audit_log` table
- ✅ Check: `SELECT * FROM audit_log ORDER BY changed_at DESC LIMIT 10;`

### Triggers in Action:
- ✅ Update patient → audit_log updated
- ✅ Discharge patient → bed status auto-updates
- ✅ Delete admission → related records handled by CASCADE

---

## 📊 Sample Test Scenarios

### Scenario 1: Admit New Patient
1. Go to `/admissions`
2. Click "New Admission"
3. Fill form:
   - Patient: Select existing patient
   - Doctor: Select doctor
   - Bed Type: Normal
   - Priority: 3
   - Diagnosis: "Routine checkup"
4. Submit
5. **Verify:** New admission card appears, bed allocated

### Scenario 2: Check Waiting List
1. Try to admit when no beds available
2. **Verify:** Patient added to waiting list
3. Go to `/waiting-list`
4. **Verify:** Patient shown with priority badge

### Scenario 3: Generate Bill
1. Go to `/billing`
2. Click "Generate Bill" on an active admission
3. **Verify:** Bill created with line items
4. **Verify:** Total calculated correctly (days * rate + services)

### Scenario 4: Mark Bill as Paid
1. Go to `/billing`
2. Filter: "Pending"
3. Click bill card → Modal opens
4. Click "Mark as Paid"
5. **Verify:** Status changes to "Paid", badge turns green

---

## 🎯 Success Criteria

✅ **All 6 pages load without errors**
✅ **Login works with database credentials**
✅ **Role-based menu filtering works**
✅ **All CRUD operations functional**
✅ **Real-time data updates visible**
✅ **Database triggers working**
✅ **API endpoints responding correctly**
✅ **Postman collection tests pass**

---

**Everything is ready to test! Start both servers and begin! 🚀**
