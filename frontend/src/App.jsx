import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffAdmit from './pages/StaffAdmit';
import WaitingList from './pages/WaitingList';
import DoctorPatients from './pages/DoctorPatients';
import Billing from './pages/Billing';
import PatientManagement from './pages/PatientManagement';
import DoctorManagement from './pages/DoctorManagement';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const hasToken = token !== null;
    console.log('🔍 [App] isAuthenticated check:', { 
      token: token ? token.substring(0, 30) + '...' : 'null', 
      hasToken,
      timestamp: new Date().toISOString()
    });
    return hasToken;
  };

  const ProtectedRoute = ({ children }) => {
    const authenticated = isAuthenticated();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛡️ [App] ProtectedRoute check');
    console.log('⏰ [App] Timestamp:', new Date().toISOString());
    console.log('🔍 [App] Authenticated:', authenticated);
    console.log('📍 [App] Current path:', window.location.pathname);
    console.log('🔑 [App] Token exists:', !!localStorage.getItem('token'));
    console.log('👤 [App] User data:', localStorage.getItem('user'));
    
    if (!authenticated) {
      console.log('❌ [App] Not authenticated, redirecting to /login');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return <Navigate to="/login" replace />;
    }
    console.log('✅ [App] Authenticated, allowing access to protected route');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return children;
  };

  const PublicRoute = ({ children }) => {
    const authenticated = isAuthenticated();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 [App] PublicRoute check (login page)');
    console.log('⏰ [App] Timestamp:', new Date().toISOString());
    console.log('🔍 [App] Authenticated:', authenticated);
    console.log('📍 [App] Current path:', window.location.pathname);
    
    if (authenticated) {
      console.log('✅ [App] User is authenticated, redirecting to /dashboard');
      console.log('🔑 [App] Token exists:', !!localStorage.getItem('token'));
      console.log('👤 [App] User data:', localStorage.getItem('user'));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return <Navigate to="/dashboard" replace />;
    }
    console.log('❌ [App] Not authenticated, showing login page');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return children;
  };

  console.log('🚀 [App] Rendering App component');
  console.log('📍 [App] Current path:', window.location.pathname);

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public Route - Login */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes with Persistent Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/admissions" element={<StaffAdmit />} />
            <Route path="/waiting-list" element={<WaitingList />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/patients" element={<PatientManagement />} />
            <Route path="/doctors" element={<DoctorManagement />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Root redirect */}
          <Route 
            path="/" 
            element={(() => {
              const authenticated = isAuthenticated();
              console.log('🏠 [App] Root path ("/") accessed, authenticated:', authenticated);
              if (authenticated) {
                console.log('✅ [App] Redirecting to /dashboard');
                return <Navigate to="/dashboard" />;
              } else {
                console.log('❌ [App] Redirecting to /login');
                return <Navigate to="/login" />;
              }
            })()} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
