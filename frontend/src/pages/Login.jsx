import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import toast, { Toaster } from 'react-hot-toast';
import { authAPI } from '../api/api';
import { FaHospital, FaUser, FaLock, FaEnvelope, FaIdCard, FaKey, FaUserMd, FaUserShield, FaUserNurse, FaMoneyBill } from 'react-icons/fa';
import Iridescence from '../components/Iridescence';

const Login = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'doctor',
    roleKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const glowRef = useRef(null);
  const cardRef = useRef(null);

  console.log('🔐 [Login] Component rendering');
  console.log('📊 [Login] Current state:', { isRegister, loading, hasError: !!error });
  
  // Check localStorage on every render
  const currentToken = localStorage.getItem('token');
  const currentUser = localStorage.getItem('user');
  console.log('🔑 [Login] LocalStorage status:', { 
    hasToken: !!currentToken, 
    hasUser: !!currentUser,
    tokenPreview: currentToken ? currentToken.substring(0, 30) + '...' : 'null',
    userPreview: currentUser ? JSON.parse(currentUser) : 'null'
  });

  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 [Login] Component mounted - useEffect triggered');
    console.log('⏰ [Login] Mount timestamp:', new Date().toISOString());
    console.log('🔍 [Login] Login page mounted, user should NOT be authenticated');
    console.log('📍 [Login] Current URL:', window.location.href);
    console.log('📍 [Login] Current path:', window.location.pathname);
    
    // Add global error handler to catch any errors
    const errorHandler = (event) => {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🚨 [GLOBAL ERROR] JavaScript error detected!');
      console.error('🚨 [ERROR] Message:', event.message);
      console.error('🚨 [ERROR] Source:', event.filename);
      console.error('🚨 [ERROR] Line:', event.lineno, 'Col:', event.colno);
      console.error('🚨 [ERROR] Error object:', event.error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    };
    window.addEventListener('error', errorHandler);
    
    // GSAP glow animation - more subtle (only for the glow effect, not entrance)
    if (glowRef.current) {
      console.log('✨ [Login] Starting GSAP glow animation');
      gsap.to(glowRef.current, {
        boxShadow: '0 20px 60px rgba(168, 85, 247, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    // NOTE: Card entrance animation is handled by Framer Motion, not GSAP
    console.log('✅ [Login] Animations setup complete (using Framer Motion for entrance)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return () => {
      window.removeEventListener('error', errorHandler);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🧹 [Login] Component unmounting - cleaning up animations');
      console.log('⏰ [Login] Unmount timestamp:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    };
  }, []);

  const handleSubmit = async (e) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 [SUBMIT] handleSubmit function called!');
    console.log('🎯 [SUBMIT] Event object:', e);
    console.log('🎯 [SUBMIT] Event type:', e?.type);
    console.log('🎯 [SUBMIT] isRegister:', isRegister);
    
    e.preventDefault();
    console.log('✅ [SUBMIT] preventDefault() called');
    
    setError('');
    setLoading(true);
    console.log('✅ [SUBMIT] State updated - loading set to true');

    const mode = isRegister ? 'REGISTER' : 'LOGIN';
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 [${mode}] Form submission started`);
    console.log(`⏰ [${mode}] Timestamp:`, new Date().toISOString());
    console.log(`📝 [${mode}] Form data:`, {
      username: formData.username,
      email: formData.email || 'N/A',
      full_name: formData.full_name || 'N/A',
      role: formData.role || 'N/A',
      hasPassword: !!formData.password,
      hasRoleKey: !!formData.roleKey
    });

    try {
      if (isRegister) {
        console.log('📤 [REGISTER] Preparing registration request...');
        const registrationData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          roleKey: formData.roleKey
        };
        console.log('📦 [REGISTER] Request payload:', registrationData);
        
        toast.loading('Creating your account...', { id: 'register' });
        
        const response = await authAPI.register(registrationData);

        console.log('✅ [REGISTER] Registration successful!');
        console.log('📊 [REGISTER] Response status:', response.status);
        console.log('📊 [REGISTER] Response data:', response.data);

        if (response.data?.data) {
          const { token, user } = response.data.data;
          
          console.log('🎟️ [REGISTER] Token received:', token ? `${token.substring(0, 20)}...` : 'NULL');
          console.log('👤 [REGISTER] User data:', user);
          
          if (!token || !user) {
            throw new Error('Registration response missing token or user data');
          }
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          console.log('💾 [REGISTER] Data stored in localStorage');
          console.log('✅ [REGISTER] Verification - Token in storage:', !!localStorage.getItem('token'));
          console.log('✅ [REGISTER] Verification - User in storage:', !!localStorage.getItem('user'));
          
          toast.success(`Welcome ${user.full_name || user.username}! Account created successfully.`, { id: 'register' });
          
          console.log('🚀 [REGISTER] Navigating to dashboard...');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        } else {
          throw new Error('Invalid response structure from server');
        }
      } else {
        console.log('📤 [LOGIN] Preparing login request...');
        const loginData = {
          username: formData.username,
          password: formData.password
        };
        console.log('📦 [LOGIN] Request payload:', { username: loginData.username, hasPassword: !!loginData.password });
        
        toast.loading('Logging you in...', { id: 'login' });
        
        const response = await authAPI.login(loginData);
        
        console.log('✅ [LOGIN] Login successful!');
        console.log('📊 [LOGIN] Response status:', response.status);
        console.log('📊 [LOGIN] Response data:', response.data);

        if (!response.data?.data) {
          console.error('❌ [LOGIN] Invalid response structure:', response.data);
          throw new Error('Invalid response from server');
        }

        const { token, user } = response.data.data;
        
        console.log('🎟️ [LOGIN] Token received:', token ? `${token.substring(0, 20)}...` : 'NULL');
        console.log('👤 [LOGIN] User data:', user);
        
        if (!token || !user) {
          console.error('❌ [LOGIN] Missing token or user:', { hasToken: !!token, hasUser: !!user });
          throw new Error('Authentication failed - incomplete data');
        }

        console.log('💾 [LOGIN] Storing data in localStorage...');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ [LOGIN] Verification - Token in storage:', !!localStorage.getItem('token'));
        console.log('✅ [LOGIN] Verification - User in storage:', !!localStorage.getItem('user'));
        console.log('✅ [LOGIN] Verification - Token value:', localStorage.getItem('token')?.substring(0, 20) + '...');
        console.log('✅ [LOGIN] Verification - User value:', JSON.parse(localStorage.getItem('user') || '{}'));
        
        toast.success(`Welcome back, ${user.full_name || user.username}!`, { id: 'login' });
        
        console.log('🚀 [LOGIN] Navigating to dashboard...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      }
    } catch (err) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error(`❌ [${mode}] Error occurred!`);
      console.error(`❌ [${mode}] Error type:`, err.constructor.name);
      console.error(`❌ [${mode}] Error message:`, err.message);
      console.error(`❌ [${mode}] Full error:`, err);
      
      if (err.response) {
        console.error(`📛 [${mode}] HTTP Status:`, err.response.status);
        console.error(`📛 [${mode}] Response data:`, err.response.data);
        console.error(`📛 [${mode}] Response headers:`, err.response.headers);
      } else if (err.request) {
        console.error(`📛 [${mode}] No response received`);
        console.error(`📛 [${mode}] Request:`, err.request);
      }
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || (isRegister ? 'Registration failed.' : 'Login failed. Please check your credentials.');
      
      console.error(`🔴 [${mode}] Displaying error to user:`, errorMessage);
      setError(errorMessage);
      
      toast.error(errorMessage, { id: isRegister ? 'register' : 'login' });
    } finally {
      setLoading(false);
      console.log(`✋ [${mode}] Form submission completed`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setFormData({
      username: '',
      password: '',
      email: '',
      full_name: '',
      role: 'doctor',
      roleKey: ''
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="text-xl" />;
      case 'doctor':
        return <FaUserMd className="text-xl" />;
      case 'staff':
        return <FaUserNurse className="text-xl" />;
      case 'billing':
        return <FaMoneyBill className="text-xl" />;
      default:
        return <FaUser className="text-xl" />;
    }
  };

  console.log('🎬 [Login] Rendering JSX...');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#a855f7',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Iridescence Background */}
      <div className="absolute inset-0">
        <Iridescence
          color={[1, 1, 1]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs - inspired by Stripe's mesh gradients */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 dark:opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-amber-400 dark:bg-amber-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 dark:opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 dark:opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500 dark:bg-violet-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 dark:opacity-25 animate-blob animation-delay-6000"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}></div>
        
        {/* Dark gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80"></div>
      </div>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div
          ref={glowRef}
          className="bg-white/90 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-purple-500/20 relative overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 dark:from-purple-500/10 via-transparent to-pink-500/5 dark:to-pink-500/10 rounded-3xl"></div>
          
          <div className="relative z-10">
          {/* Logo and Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg shadow-purple-500/50"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <FaHospital className="text-4xl text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Medicare</h1>
            <p className="text-purple-600 dark:text-purple-200">Hospital Management System</p>
          </motion.div>

          {/* Tab Switcher */}
          <div className="flex mb-6 bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-200 dark:border-purple-500/10">
            <motion.button
              type="button"
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isRegister
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => !isRegister || toggleMode()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
            <motion.button
              type="button"
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isRegister
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => isRegister || toggleMode()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Register
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Common Fields */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all group-hover:border-purple-500/50"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {isRegister && (
                <>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                        <FaIdCard />
                      </div>
                      <input
                        type="text"
                        className="w-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all group-hover:border-purple-500/50"
                        placeholder="Enter full name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                        <FaEnvelope />
                      </div>
                      <input
                        type="email"
                        className="w-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all group-hover:border-purple-500/50"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['admin', 'doctor', 'staff', 'billing'].map((role) => (
                        <motion.button
                          key={role}
                          type="button"
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                            formData.role === role
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'bg-slate-800/30 text-gray-300 hover:bg-slate-700/40 border border-purple-500/20'
                          }`}
                          onClick={() => setFormData({ ...formData, role })}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {getRoleIcon(role)}
                          <span className="capitalize">{role}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Role Key
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                        <FaKey />
                      </div>
                      <input
                        type="text"
                        className="w-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all group-hover:border-purple-500/50"
                        placeholder={`Enter ${formData.role} key`}
                        value={formData.roleKey}
                        onChange={(e) => setFormData({ ...formData, roleKey: e.target.value })}
                        required
                      />
                    </div>
                    <p className="text-xs text-purple-300 mt-1">
                      Contact administrator for role-specific key
                    </p>
                    {/* Development helper - show keys */}
                    {import.meta.env.DEV && (
                      <div className="mt-2 p-2 bg-purple-900/30 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-purple-200 font-semibold mb-1">🔑 Dev Mode - Role Keys:</p>
                        <div className="text-xs text-purple-300 space-y-0.5 font-mono">
                          <p>Admin: <span className="text-purple-400">adminkey</span></p>
                          <p>Doctor: <span className="text-purple-400">doctorkey</span></p>
                          <p>Staff: <span className="text-purple-400">staffkey</span></p>
                          <p>Billing: <span className="text-purple-400">billingkey</span></p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: isRegister ? 0.35 : 0.2 }}
            >
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                  <FaLock />
                </div>
                <input
                  type="password"
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all group-hover:border-purple-500/50"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={(e) => {
                console.log('🖱️ [BUTTON CLICK] Submit button clicked!');
                console.log('🖱️ [BUTTON CLICK] Event:', e);
                console.log('🖱️ [BUTTON CLICK] Button type:', e.currentTarget.type);
                console.log('🖱️ [BUTTON CLICK] Loading state:', loading);
                console.log('🖱️ [BUTTON CLICK] isRegister:', isRegister);
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: isRegister ? 0.4 : 0.3 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRegister ? 'Creating Account...' : 'Logging in...'}
                </span>
              ) : (
                isRegister ? 'Create Account' : 'Login'
              )}
            </motion.button>
          </form>

          {!isRegister && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 bg-slate-800/30 rounded-xl backdrop-blur-sm border border-purple-500/10"
            >
              <p className="text-xs text-purple-200 font-semibold mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-300">
                <p>Admin: <span className="font-mono text-purple-300">admin / admin123</span></p>
                <p>Doctor: <span className="font-mono text-purple-300">doctor1 / admin123</span></p>
                <p>Staff: <span className="font-mono text-purple-300">staff1 / admin123</span></p>
                <p>Billing: <span className="font-mono text-purple-300">billing1 / admin123</span></p>
              </div>
            </motion.div>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
