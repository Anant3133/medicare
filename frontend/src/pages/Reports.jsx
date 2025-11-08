import { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { reportAPI } from '../api/api';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaChartLine, FaDollarSign, FaBed, FaUserMd, FaClipboardList, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('occupancy');
  const [loading, setLoading] = useState(true);
  const [occupancyData, setOccupancyData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [admissionTrendsData, setAdmissionTrendsData] = useState([]);
  const [doctorWorkloadData, setDoctorWorkloadData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dateRange, setDateRange] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd')
  });

  // Dark mode chart theme
  const chartTheme = {
    textColor: isDark ? '#f1f5f9' : '#1f2937',
    gridColor: isDark ? '#334155' : '#e5e7eb',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#475569' : '#d1d5db'
  };

  useEffect(() => {
    loadReportData();
  }, [activeTab, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'occupancy':
          const occupancyRes = await reportAPI.getOccupancy(dateRange);
          const occupancyResponseData = occupancyRes.data.data;
          console.log('Occupancy data received:', occupancyResponseData);
          // Extract by_room array from the response object
          const roomData = occupancyResponseData?.by_room || occupancyResponseData;
          setOccupancyData(Array.isArray(roomData) ? roomData : []);
          break;
        case 'revenue':
          const revenueRes = await reportAPI.getRevenue(dateRange);
          const revenueResponseData = revenueRes.data.data;
          console.log('Revenue data received:', revenueResponseData);
          // Extract daily_breakdown array from the response object
          const dailyData = revenueResponseData?.daily_breakdown || revenueResponseData;
          setRevenueData(Array.isArray(dailyData) ? dailyData : []);
          break;
        case 'admissions':
          const admissionRes = await reportAPI.getAdmissionTrends(dateRange);
          const admissionResponseData = admissionRes.data.data;
          console.log('Admission data received:', admissionResponseData);
          setAdmissionTrendsData(Array.isArray(admissionResponseData) ? admissionResponseData : []);
          break;
        case 'doctors':
          const doctorRes = await reportAPI.getDoctorWorkload();
          const doctorResponseData = doctorRes.data.data;
          console.log('Doctor workload data received:', doctorResponseData);
          // Extract doctors array from the response object
          const doctorsArray = doctorResponseData?.doctors || doctorResponseData;
          setDoctorWorkloadData(Array.isArray(doctorsArray) ? doctorsArray : []);
          break;
        case 'audit':
          const auditRes = await reportAPI.getAuditLog({ limit: 100 });
          setAuditLogs(auditRes.data.data);
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to load report data');
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Occupancy Chart
  const getOccupancyChart = () => {
    if (!occupancyData || occupancyData.length === 0) return null;

    const labels = occupancyData.map(d => `Room ${d.room_number || d.room_id}`);
    const data = {
      labels,
      datasets: [
        {
          label: 'Occupied Beds',
          data: occupancyData.map(d => d.occupied_beds || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Total Beds',
          data: occupancyData.map(d => d.total_beds || 0),
          borderColor: 'rgb(156, 163, 175)',
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          fill: false,
          tension: 0.4,
          borderDash: [5, 5]
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: chartTheme.textColor
          }
        },
        title: {
          display: true,
          text: 'Bed Occupancy Trends',
          font: { size: 16 },
          color: chartTheme.textColor
        },
        tooltip: {
          backgroundColor: chartTheme.tooltipBg,
          titleColor: chartTheme.textColor,
          bodyColor: chartTheme.textColor,
          borderColor: chartTheme.tooltipBorder,
          borderWidth: 1,
          callbacks: {
            afterLabel: function(context) {
              const index = context.dataIndex;
              const occupancy = occupancyData[index];
              return `Occupancy Rate: ${occupancy.occupancy_rate}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5,
            color: chartTheme.textColor
          },
          grid: {
            color: chartTheme.gridColor
          }
        },
        x: {
          ticks: {
            color: chartTheme.textColor
          },
          grid: {
            color: chartTheme.gridColor
          }
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  // Revenue Chart
  const getRevenueChart = () => {
    if (!revenueData || revenueData.length === 0) return null;

    const labels = revenueData.map(d => {
      try {
        const date = new Date(d.bill_date || d.date);
        return isNaN(date.getTime()) ? 'Invalid' : format(date, 'MMM dd');
      } catch {
        return 'Invalid';
      }
    });
    const data = {
      labels,
      datasets: [
        {
          label: 'Daily Revenue ($)',
          data: revenueData.map(d => parseFloat(d.revenue_collected || d.total_revenue || 0)),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Revenue Trends',
          font: { size: 16 },
          color: chartTheme.textColor
        },
        tooltip: {
          backgroundColor: chartTheme.tooltipBg,
          titleColor: chartTheme.textColor,
          bodyColor: chartTheme.textColor,
          borderColor: chartTheme.tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Revenue: $${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: chartTheme.textColor,
            callback: function(value) {
              return '$' + value;
            }
          },
          grid: {
            color: chartTheme.gridColor
          }
        },
        x: {
          ticks: {
            color: chartTheme.textColor
          },
          grid: {
            color: chartTheme.gridColor
          }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  // Admission Trends Chart
  const getAdmissionChart = () => {
    if (!admissionTrendsData || admissionTrendsData.length === 0) return null;

    const labels = admissionTrendsData.map(d => {
      try {
        const date = new Date(d.admission_date || d.date);
        return isNaN(date.getTime()) ? 'Invalid' : format(date, 'MMM dd');
      } catch {
        return 'Invalid';
      }
    });
    const data = {
      labels,
      datasets: [
        {
          label: 'Admissions',
          data: admissionTrendsData.map(d => d.total_admissions || d.admission_count || 0),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Discharges',
          data: admissionTrendsData.map(d => d.discharged || d.discharge_count || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: chartTheme.textColor
          }
        },
        title: {
          display: true,
          text: 'Admission & Discharge Trends',
          font: { size: 16 },
          color: chartTheme.textColor
        },
        tooltip: {
          backgroundColor: chartTheme.tooltipBg,
          titleColor: chartTheme.textColor,
          bodyColor: chartTheme.textColor,
          borderColor: chartTheme.tooltipBorder,
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: chartTheme.textColor
          },
          grid: {
            color: chartTheme.gridColor
          }
        },
        x: {
          ticks: {
            color: chartTheme.textColor
          },
          grid: {
            color: chartTheme.gridColor
          }
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  // Doctor Workload Chart
  const getDoctorWorkloadChart = () => {
    if (!doctorWorkloadData || doctorWorkloadData.length === 0) return null;

    const labels = doctorWorkloadData.map(d => d.doctor_name);
    const data = {
      labels,
      datasets: [
        {
          label: 'Active Patients',
          data: doctorWorkloadData.map(d => d.active_patients),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(251, 146, 60, 0.7)',
            'rgba(236, 72, 153, 0.7)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(168, 85, 247)',
            'rgb(251, 146, 60)',
            'rgb(236, 72, 153)',
          ],
          borderWidth: 2
        }
      ]
    };

    const options = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Doctor Workload Distribution',
          font: { size: 16 },
          color: chartTheme.textColor
        },
        tooltip: {
          backgroundColor: chartTheme.tooltipBg,
          titleColor: chartTheme.textColor,
          bodyColor: chartTheme.textColor,
          borderColor: chartTheme.tooltipBorder,
          borderWidth: 1,
          callbacks: {
            afterLabel: function(context) {
              const index = context.dataIndex;
              const doctor = doctorWorkloadData[index];
              return `Department: ${doctor.department_name || 'N/A'}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: chartTheme.textColor
          },
          grid: {
            color: chartTheme.gridColor
          }
        },
        y: {
          ticks: {
            color: chartTheme.textColor
          },
          grid: {
            color: chartTheme.gridColor
          }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  const tabs = [
    { id: 'occupancy', label: 'Occupancy', icon: FaBed },
    { id: 'revenue', label: 'Revenue', icon: FaDollarSign },
    { id: 'admissions', label: 'Admissions', icon: FaChartLine },
    { id: 'doctors', label: 'Doctor Workload', icon: FaUserMd },
    { id: 'audit', label: 'Audit Logs', icon: FaClipboardList }
  ];

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Analytics & Reports</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Comprehensive hospital performance insights</p>
          </div>
          {activeTab !== 'doctors' && activeTab !== 'audit' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 items-center"
            >
              <FaCalendarAlt className="text-gray-600 dark:text-slate-400" />
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                className="input"
              />
              <span className="text-gray-600 dark:text-slate-400">to</span>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                className="input"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-lg hover-glow-primary'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton type="card" count={1} />
        ) : (
          <div>
            {/* Occupancy Tab */}
            {activeTab === 'occupancy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card chart-container">
                  <div className="h-96">
                    {getOccupancyChart()}
                  </div>
                </div>
                {occupancyData && occupancyData.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover-glow-primary"
                    >
                      <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">Current Occupancy</h3>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                        {(() => {
                          const totalBeds = occupancyData.reduce((sum, d) => sum + parseInt(d.total_beds || 0), 0);
                          const occupiedBeds = occupancyData.reduce((sum, d) => sum + parseInt(d.occupied_beds || 0), 0);
                          return totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;
                        })()}%
                      </p>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover-glow-success"
                    >
                      <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">Occupied Beds</h3>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                        {occupancyData.reduce((sum, d) => sum + parseInt(d.occupied_beds || 0), 0)}
                      </p>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="card bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 hover-glow-primary"
                    >
                      <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">Available Beds</h3>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                        {occupancyData.reduce((sum, d) => sum + parseInt(d.available_beds || 0), 0)}
                      </p>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="card bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                    >
                      <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Beds</h3>
                      <p className="text-3xl font-bold text-gray-600 dark:text-slate-300 mt-2">
                        {occupancyData.reduce((sum, d) => sum + parseInt(d.total_beds || 0), 0)}
                      </p>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card chart-container">
                  <div className="h-96">
                    {getRevenueChart()}
                  </div>
                </div>
                {revenueData && revenueData.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-green-50">
                      <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        ${revenueData.reduce((sum, d) => sum + parseFloat(d.revenue_collected || d.total_revenue || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="card bg-blue-50">
                      <h3 className="text-sm font-medium text-gray-600">Average Daily Revenue</h3>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        ${(revenueData.reduce((sum, d) => sum + parseFloat(d.revenue_collected || d.total_revenue || 0), 0) / revenueData.length).toFixed(2)}
                      </p>
                    </div>
                    <div className="card bg-purple-50">
                      <h3 className="text-sm font-medium text-gray-600">Peak Day Revenue</h3>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                        ${Math.max(...revenueData.map(d => parseFloat(d.revenue_collected || d.total_revenue || 0))).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Admissions Tab */}
            {activeTab === 'admissions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card chart-container">
                  <div className="h-96">
                    {getAdmissionChart()}
                  </div>
                </div>
                {admissionTrendsData && admissionTrendsData.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card bg-purple-50">
                      <h3 className="text-sm font-medium text-gray-600">Total Admissions</h3>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {admissionTrendsData.reduce((sum, d) => sum + parseInt(d.total_admissions || d.admission_count || 0), 0)}
                      </p>
                    </div>
                    <div className="card bg-red-50">
                      <h3 className="text-sm font-medium text-gray-600">Total Discharges</h3>
                      <p className="text-3xl font-bold text-red-600 mt-2">
                        {admissionTrendsData.reduce((sum, d) => sum + parseInt(d.discharged || d.discharge_count || 0), 0)}
                      </p>
                    </div>
                    <div className="card bg-blue-50">
                      <h3 className="text-sm font-medium text-gray-600">Avg Daily Admissions</h3>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {(admissionTrendsData.reduce((sum, d) => sum + parseInt(d.total_admissions || d.admission_count || 0), 0) / admissionTrendsData.length).toFixed(1)}
                      </p>
                    </div>
                    <div className="card bg-green-50">
                      <h3 className="text-sm font-medium text-gray-600">Net Change</h3>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                        {admissionTrendsData.reduce((sum, d) => sum + parseInt(d.total_admissions || d.admission_count || 0) - parseInt(d.discharged || d.discharge_count || 0), 0)}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Doctor Workload Tab */}
            {activeTab === 'doctors' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card chart-container">
                  <div className="h-96">
                    {getDoctorWorkloadChart()}
                  </div>
                </div>
                {doctorWorkloadData && doctorWorkloadData.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Doctor Details</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="text-left p-3 text-gray-700 dark:text-slate-300">Doctor</th>
                            <th className="text-left p-3 text-gray-700 dark:text-slate-300">Department</th>
                            <th className="text-center p-3 text-gray-700 dark:text-slate-300">Active Patients</th>
                            <th className="text-center p-3 text-gray-700 dark:text-slate-300">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctorWorkloadData.map((doctor, idx) => (
                            <tr key={idx} className="border-t hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-700">
                              <td className="p-3 font-medium text-gray-800 dark:text-slate-300">{doctor.doctor_name}</td>
                              <td className="p-3 text-gray-800 dark:text-slate-300">{doctor.department || doctor.department_name || 'N/A'}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                  parseInt(doctor.active_patients) > 10 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  parseInt(doctor.active_patients) > 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                  {doctor.active_patients}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`badge ${
                                  parseInt(doctor.active_patients) > 10 ? 'badge-danger' :
                                  parseInt(doctor.active_patients) > 5 ? 'badge-warning' : 'badge-success'
                                }`}>
                                  {parseInt(doctor.active_patients) > 10 ? 'Overloaded' :
                                   parseInt(doctor.active_patients) > 5 ? 'Busy' : 'Available'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">System Audit Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        <th className="text-left p-3 text-gray-700 dark:text-slate-300">Timestamp</th>
                        <th className="text-left p-3 text-gray-700 dark:text-slate-300">User</th>
                        <th className="text-left p-3 text-gray-700 dark:text-slate-300">Action</th>
                        <th className="text-left p-3 text-gray-700 dark:text-slate-300">Table</th>
                        <th className="text-left p-3 text-gray-700 dark:text-slate-300">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center p-8 text-gray-500 dark:text-slate-400">
                            No audit logs available
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log, idx) => (
                          <tr key={idx} className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                            <td className="p-3 text-gray-800 dark:text-slate-300">
                              {log.changed_at || log.created_at ? 
                                new Date(log.changed_at || log.created_at).toLocaleString() : 
                                'N/A'}
                            </td>
                            <td className="p-3 text-gray-800 dark:text-slate-300">{log.changed_by || log.performed_by || 'System'}</td>
                            <td className="p-3">
                              <span className={`badge ${
                                log.operation === 'INSERT' || log.action === 'INSERT' ? 'badge-success' :
                                log.operation === 'UPDATE' || log.action === 'UPDATE' ? 'badge-warning' :
                                log.operation === 'DELETE' || log.action === 'DELETE' ? 'badge-danger' : 'badge-info'
                              }`}>
                                {log.operation || log.action || 'N/A'}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-xs text-gray-800 dark:text-slate-300">{log.table_name || 'N/A'}</td>
                            <td className="p-3 max-w-md truncate text-gray-800 dark:text-slate-300" title={JSON.stringify(log.old_data || log.new_data || log.old_values || log.new_values)}>
                              {log.old_data ? JSON.stringify(log.old_data).substring(0, 50) + '...' : 
                               log.new_data ? JSON.stringify(log.new_data).substring(0, 50) + '...' : 
                               log.old_values ? JSON.stringify(log.old_values).substring(0, 50) + '...' : 
                               log.new_values ? JSON.stringify(log.new_values).substring(0, 50) + '...' : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        )}
    </div>
  );
};

export default Reports;
