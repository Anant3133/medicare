import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import BedGrid from '../components/BedGrid';
import { reportAPI, bedAPI } from '../api/api';
import { FaBed, FaUserInjured, FaClock, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashResponse, bedResponse] = await Promise.all([
        reportAPI.getDashboard(),
        bedAPI.getAll()
      ]);
      setDashboardData(dashResponse.data.data);
      setBeds(bedResponse.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Bed Occupancy',
      value: `${dashboardData?.beds?.occupancy_rate || 0}%`,
      subtitle: `${dashboardData?.beds?.occupied_beds || 0}/${dashboardData?.beds?.total_beds || 0} occupied`,
      icon: FaBed,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Admissions',
      value: dashboardData?.active_admissions || 0,
      subtitle: `${dashboardData?.today?.admissions || 0} admitted today`,
      icon: FaUserInjured,
      color: 'bg-green-500'
    },
    {
      title: 'Waiting List',
      value: dashboardData?.waiting_list || 0,
      subtitle: 'Patients waiting',
      icon: FaClock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Pending Bills',
      value: `$${(dashboardData?.pending_bills?.amount || 0).toFixed(2)}`,
      subtitle: `${dashboardData?.pending_bills?.count || 0} bills`,
      icon: FaMoneyBillWave,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Hospital Overview & Statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white text-xl" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'beds'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('beds')}
            >
              Bed Status
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaChartLine className="text-primary-600" />
                Today's Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">New Admissions</span>
                  <span className="font-bold text-green-600">{dashboardData?.today?.admissions || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Discharges</span>
                  <span className="font-bold text-blue-600">{dashboardData?.today?.discharges || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Available Beds</span>
                  <span className="font-bold text-primary-600">{dashboardData?.beds?.available_beds || 0}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Bed Status Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Available</span>
                  </div>
                  <span className="font-semibold">{dashboardData?.beds?.available_beds || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-700">Occupied</span>
                  </div>
                  <span className="font-semibold">{dashboardData?.beds?.occupied_beds || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">Maintenance</span>
                  </div>
                  <span className="font-semibold">{dashboardData?.beds?.maintenance_beds || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'beds' && (
          <BedGrid beds={beds} onBedClick={(bed) => console.log('Bed clicked:', bed)} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
