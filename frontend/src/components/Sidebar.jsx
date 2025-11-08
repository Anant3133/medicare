import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUserInjured, FaBed, FaClock, FaStethoscope, FaFileInvoiceDollar, FaSignOutAlt, FaUser, FaUserMd, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

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
    { path: '/patients', icon: FaUser, label: 'Patients', roles: ['admin', 'staff'] },
    { path: '/doctors', icon: FaUserMd, label: 'Doctors', roles: ['admin'] },
    { path: '/admissions', icon: FaUserInjured, label: 'Admissions', roles: ['admin', 'staff', 'doctor'] },
    { path: '/waiting-list', icon: FaClock, label: 'Waiting List', roles: ['admin', 'staff'] },
    { path: '/doctor/patients', icon: FaStethoscope, label: 'My Patients', roles: ['doctor'] },
    { path: '/billing', icon: FaFileInvoiceDollar, label: 'Billing', roles: ['admin', 'billing', 'staff'] },
    { path: '/reports', icon: FaChartBar, label: 'Reports', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="bg-gradient-to-b from-primary-800 to-primary-900 dark:from-slate-900 dark:to-slate-950 text-white w-64 p-4 flex flex-col shadow-2xl border-r border-primary-700 dark:border-slate-800"
    >
      {/* Logo Section with Glow */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
          >
            <FaBed className="text-2xl" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
              Medicare
            </h1>
            <p className="text-primary-200 dark:text-slate-400 text-xs">Hospital Management</p>
          </div>
        </div>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm text-primary-200 dark:text-slate-400">Theme</span>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* User Info Card with Gradient */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="glass rounded-xl p-4 mb-4 border border-white/10 hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center font-bold text-lg">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-primary-200 dark:text-slate-400">Logged in as</p>
              <p className="font-semibold text-white">{user.username}</p>
              <p className="text-xs text-primary-300 dark:text-slate-500 capitalize flex items-center gap-1">
                <span className="status-indicator status-online"></span>
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Menu with Animations */}
      <nav className="space-y-2">
        {filteredMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg hover-glow-primary'
                    : 'text-primary-100 dark:text-slate-300 hover:bg-primary-700/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`text-lg ${isActive ? 'animate-pulse-slow' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-white"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout Button with Hover Effect */}
      <motion.button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary-100 dark:text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-300 mt-4 border border-red-500/20 hover:border-red-500 hover-glow-danger w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <FaSignOutAlt className="text-lg" />
        <span className="font-medium">Logout</span>
      </motion.button>

      {/* Bottom Decoration */}
      <motion.div 
        className="mt-4 pt-4 border-t border-primary-700/50 dark:border-slate-800 text-xs text-primary-300 dark:text-slate-500 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>© 2025 Medicare</p>
        <p className="mt-1">v1.0.0</p>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
