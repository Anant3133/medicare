import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUserInjured, FaBed, FaClock, FaStethoscope, FaFileInvoiceDollar, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', roles: ['admin', 'staff', 'doctor', 'billing'] },
    { path: '/admissions', icon: FaUserInjured, label: 'Admissions', roles: ['admin', 'staff', 'doctor'] },
    { path: '/waiting-list', icon: FaClock, label: 'Waiting List', roles: ['admin', 'staff'] },
    { path: '/doctor/patients', icon: FaStethoscope, label: 'My Patients', roles: ['doctor'] },
    { path: '/billing', icon: FaFileInvoiceDollar, label: 'Billing', roles: ['admin', 'billing', 'staff'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="bg-primary-800 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaBed />
          Medicare
        </h1>
        <p className="text-primary-200 text-sm mt-1">Hospital Management</p>
      </div>

      <div className="mb-6">
        <div className="bg-primary-700 rounded-lg p-3 mb-4">
          <p className="text-sm text-primary-200">Logged in as</p>
          <p className="font-semibold">{user.username}</p>
          <p className="text-xs text-primary-300 capitalize">{user.role}</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-100 hover:bg-primary-700'
              }`}
            >
              <Icon className="text-lg" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-100 hover:bg-red-600 hover:text-white transition-colors mt-4"
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
