import { useState, useEffect, useRef } from 'react';
import BedGrid from '../components/BedGrid';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { reportAPI, bedAPI } from '../api/api';
import { FaBed, FaUserInjured, FaClock, FaMoneyBillWave, FaChartLine, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBedForm, setShowBedForm] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bedFormData, setBedFormData] = useState({
    room_id: '',
    bed_number: '',
    bed_type: 'standard',
    status: 'available'
  });
  
  // Refs for GSAP animations
  const statsRefs = useRef([]);
  const counterRefs = useRef([]);

  useEffect(() => {
    loadData();
  }, []);

  // Animate stats when data loads
  useEffect(() => {
    if (dashboardData && statsRefs.current.length > 0) {
      statsRefs.current.forEach((stat, index) => {
        if (stat) {
          gsap.from(stat, {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'back.out(1.7)'
          });
        }
      });

      // Animate counter numbers
      counterRefs.current.forEach((counter, index) => {
        if (counter) {
          const endValue = parseFloat(counter.getAttribute('data-value') || 0);
          gsap.to(counter, {
            innerText: endValue,
            duration: 1.5,
            delay: index * 0.1,
            snap: { innerText: 1 },
            ease: 'power1.out',
            onUpdate: function() {
              if (counter.getAttribute('data-prefix')) {
                counter.innerText = counter.getAttribute('data-prefix') + Math.floor(this.targets()[0].innerText);
              }
              if (counter.getAttribute('data-suffix')) {
                counter.innerText = Math.floor(this.targets()[0].innerText) + counter.getAttribute('data-suffix');
              }
            }
          });
        }
      });
    }
  }, [dashboardData]);

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

  const onBedClick = (bed) => {
    setSelectedBed(bed);
  };

  const handleBedInputChange = (e) => {
    const { name, value } = e.target;
    setBedFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBedSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBed) {
        await bedAPI.update(editingBed.bed_id, bedFormData);
        toast.success('Bed updated successfully!');
      } else {
        await bedAPI.create(bedFormData);
        toast.success('Bed created successfully!');
      }
      setShowBedForm(false);
      setEditingBed(null);
      resetBedForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
      console.error('Error saving bed:', error);
    }
  };

  const handleEditBed = (bed) => {
    setEditingBed(bed);
    setBedFormData({
      room_id: bed.room_id || '',
      bed_number: bed.bed_number || '',
      bed_type: bed.bed_type || 'standard',
      status: bed.status || 'available'
    });
    setSelectedBed(null);
    setShowBedForm(true);
  };

  const handleDeleteBed = async (bedId) => {
    try {
      await bedAPI.delete(bedId);
      toast.success('Bed deleted successfully!');
      setDeleteConfirm(null);
      setSelectedBed(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete bed');
      console.error('Error deleting bed:', error);
    }
  };

  const handleStatusChange = async (bedId, newStatus) => {
    try {
      await bedAPI.updateStatus(bedId, { status: newStatus });
      toast.success('Bed status updated!');
      setSelectedBed(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
      console.error('Error updating bed status:', error);
    }
  };

  const resetBedForm = () => {
    setBedFormData({
      room_id: '',
      bed_number: '',
      bed_type: 'standard',
      status: 'available'
    });
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Bed Occupancy',
      value: `${dashboardData?.beds?.occupancy_rate || 0}%`,
      rawValue: dashboardData?.beds?.occupancy_rate || 0,
      subtitle: `${dashboardData?.beds?.occupied_beds || 0}/${dashboardData?.beds?.total_beds || 0} occupied`,
      icon: FaBed,
      color: 'bg-gradient-blue',
      iconBg: 'bg-blue-500 dark:bg-blue-600',
      glow: 'hover-glow-primary'
    },
    {
      title: 'Active Admissions',
      value: dashboardData?.active_admissions || 0,
      rawValue: dashboardData?.active_admissions || 0,
      subtitle: `${dashboardData?.today?.admissions || 0} admitted today`,
      icon: FaUserInjured,
      color: 'bg-gradient-success',
      iconBg: 'bg-green-500 dark:bg-green-600',
      glow: 'hover-glow-success'
    },
    {
      title: 'Waiting List',
      value: dashboardData?.waiting_list || 0,
      rawValue: dashboardData?.waiting_list || 0,
      subtitle: 'Patients waiting',
      icon: FaClock,
      color: 'bg-gradient-warning',
      iconBg: 'bg-yellow-500 dark:bg-yellow-600',
      glow: 'hover-glow-warning'
    },
    {
      title: 'Pending Bills',
      value: `$${(dashboardData?.pending_bills?.amount || 0).toFixed(2)}`,
      rawValue: (dashboardData?.pending_bills?.amount || 0).toFixed(2),
      subtitle: `${dashboardData?.pending_bills?.count || 0} bills`,
      icon: FaMoneyBillWave,
      color: 'bg-gradient-danger',
      iconBg: 'bg-red-500 dark:bg-red-600',
      glow: 'hover-glow-danger',
      prefix: '$'
    }
  ];

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Hospital Overview & Statistics</p>
      </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              ref={el => statsRefs.current[index] = el}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`card stat-card ${stat.glow} overflow-hidden relative`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.title}</h3>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`${stat.iconBg} p-3 rounded-lg shadow-lg`}
                >
                  <stat.icon className="text-white text-xl" />
                </motion.div>
              </div>
              <div
                ref={el => counterRefs.current[index] = el}
                data-value={stat.rawValue}
                data-suffix={stat.title === 'Bed Occupancy' ? '%' : ''}
                data-prefix={stat.prefix || ''}
                className="text-3xl font-bold text-gray-800 dark:text-white mb-1"
              >
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{stat.subtitle}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 font-medium relative ${
                activeTab === 'overview'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
              {activeTab === 'overview' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 font-medium relative ${
                activeTab === 'beds'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setActiveTab('beds')}
            >
              Bed Status
              {activeTab === 'beds' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card hover-lift"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                  <FaChartLine className="text-primary-600 dark:text-primary-400" />
                  Today's Activity
                </h3>
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span className="text-gray-700 dark:text-slate-300">New Admissions</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{dashboardData?.today?.admissions || 0}</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span className="text-gray-700 dark:text-slate-300">Discharges</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{dashboardData?.today?.discharges || 0}</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span className="text-gray-700 dark:text-slate-300">Available Beds</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">{dashboardData?.beds?.available_beds || 0}</span>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card hover-lift"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Bed Status Summary</h3>
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded shadow-lg"></div>
                      <span className="text-gray-700 dark:text-slate-300">Available</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">{dashboardData?.beds?.available_beds || 0}</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 dark:bg-red-400 rounded shadow-lg"></div>
                      <span className="text-gray-700 dark:text-slate-300">Occupied</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">{dashboardData?.beds?.occupied_beds || 0}</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 dark:bg-yellow-400 rounded shadow-lg"></div>
                      <span className="text-gray-700 dark:text-slate-300">Maintenance</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">{dashboardData?.beds?.maintenance_beds || 0}</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'beds' && (
            <motion.div
              key="beds"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Bed Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    resetBedForm();
                    setEditingBed(null);
                    setShowBedForm(true);
                  }}
                  className="btn btn-primary flex items-center gap-2 hover-glow-primary"
                >
                  <FaPlus /> Add Bed
                </motion.button>
              </div>
              <BedGrid beds={beds} onBedClick={onBedClick} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bed Details Modal */}
        {selectedBed && (
          <Modal
            isOpen={!!selectedBed}
            onClose={() => setSelectedBed(null)}
            title={`Bed ${selectedBed.bed_number} - Room ${selectedBed.room_number}`}
            size="md"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Bed Type</p>
                  <p className="font-semibold text-gray-800 dark:text-white capitalize">{selectedBed.bed_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Current Status</p>
                  <p className="font-semibold text-gray-800 dark:text-white capitalize">{selectedBed.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Floor</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{selectedBed.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Room Type</p>
                  <p className="font-semibold text-gray-800 dark:text-white capitalize">{selectedBed.room_type}</p>
                </div>
              </div>

              {selectedBed.patient_name && (
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <p className="text-sm text-gray-600 dark:text-slate-400">Current Patient</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{selectedBed.patient_name}</p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Change Status
                </label>
                <select
                  value={selectedBed.status}
                  onChange={(e) => handleStatusChange(selectedBed.bed_id, e.target.value)}
                  className="input w-full"
                  disabled={selectedBed.status === 'occupied'}
                >
                  <option value="available">Available</option>
                  <option value="occupied" disabled>Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
                {selectedBed.status === 'occupied' && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Cannot change status while bed is occupied
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedBed(null);
                    handleEditBed(selectedBed);
                  }}
                  className="btn btn-secondary flex items-center gap-1"
                >
                  <FaEdit /> Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDeleteConfirm(selectedBed);
                    setSelectedBed(null);
                  }}
                  className="btn btn-danger flex items-center gap-1 hover-glow-danger"
                  disabled={selectedBed.status === 'occupied'}
                >
                  <FaTrash /> Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBed(null)}
                  className="btn btn-primary"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </Modal>
        )}

        {/* Bed Form Modal */}
        <Modal
          isOpen={showBedForm}
          onClose={() => {
            setShowBedForm(false);
            setEditingBed(null);
            resetBedForm();
          }}
          title={editingBed ? 'Edit Bed' : 'Add New Bed'}
          size="md"
        >
          <form onSubmit={handleBedSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Room ID <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="room_id"
                value={bedFormData.room_id}
                onChange={handleBedInputChange}
                required
                className="input w-full"
                placeholder="Enter room ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Bed Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bed_number"
                value={bedFormData.bed_number}
                onChange={handleBedInputChange}
                required
                className="input w-full"
                placeholder="e.g., A, B, 1, 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Bed Type <span className="text-red-500">*</span>
              </label>
              <select
                name="bed_type"
                value={bedFormData.bed_type}
                onChange={handleBedInputChange}
                required
                className="input w-full"
              >
                <option value="standard">Standard</option>
                <option value="icu">ICU</option>
                <option value="private">Private</option>
                <option value="pediatric">Pediatric</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={bedFormData.status}
                onChange={handleBedInputChange}
                required
                className="input w-full"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setShowBedForm(false);
                  setEditingBed(null);
                  resetBedForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="btn btn-primary hover-glow-primary"
              >
                {editingBed ? 'Update Bed' : 'Create Bed'}
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Delete Bed Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteBed(deleteConfirm.bed_id)}
          title="Delete Bed"
          message={`Are you sure you want to delete Bed ${deleteConfirm?.bed_number} in Room ${deleteConfirm?.room_number}? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="danger"
        />
    </div>
  );
};

export default AdminDashboard;
