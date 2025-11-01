import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { FaHospital, FaUser, FaLock } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Login attempt started...');
    console.log('📝 Form data:', formData);

    try {
      console.log('📡 Sending login request to backend...');
      const response = await authAPI.login(formData);
      
      console.log('✅ Login response received:', response);
      console.log('📦 Response data:', response.data);
      
      // Check response structure
      if (!response.data || !response.data.data) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }

      const { token, user } = response.data.data;
      
      console.log('🎟️ Token received:', token ? 'Yes' : 'No');
      console.log('👤 User data:', user);
      
      if (!token || !user) {
        console.error('❌ Missing token or user data');
        throw new Error('Authentication failed - incomplete data');
      }

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('💾 Stored in localStorage');
      console.log('🔑 Token in storage:', localStorage.getItem('token') ? 'Yes' : 'No');
      console.log('👤 User in storage:', localStorage.getItem('user') ? 'Yes' : 'No');
      
      console.log('🚀 Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('📛 Error response:', err.response);
      console.error('📛 Error message:', err.message);
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Login failed. Please check your credentials.';
      
      console.error('🔴 Displaying error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('✋ Login process completed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FaHospital className="text-3xl text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Medicare</h1>
          <p className="text-gray-600 mt-2">Hospital Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                className="input pl-10"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Admin: <span className="font-mono">admin / admin123</span></p>
            <p>Doctor: <span className="font-mono">doctor1 / admin123</span></p>
            <p>Doctor 2: <span className="font-mono">doctor2 / admin123</span></p>
            <p>Staff: <span className="font-mono">staff1 / admin123</span></p>
            <p>Billing: <span className="font-mono">billing1 / admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
