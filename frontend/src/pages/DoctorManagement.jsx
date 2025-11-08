import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserMd, FaEdit, FaTrash, FaSearch, FaHospital, FaUsers, FaChartBar } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { doctorAPI } from '../api/api';
import toast from 'react-hot-toast';

const DoctorManagement = () => {
  const { isDark } = useTheme();
  const counterRefs = useRef([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, workload
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    department_id: '',
    phone: '',
    email: '',
    license_number: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // GSAP Counter Animation for stats
  useEffect(() => {
    if (!loading && viewMode === 'workload' && counterRefs.current.length > 0) {
      counterRefs.current.forEach((counter, index) => {
        if (counter) {
          const endValue = parseFloat(counter.getAttribute('data-value') || 0);
          gsap.to(counter, {
            innerText: endValue,
            duration: 1.5,
            delay: index * 0.1,
            snap: { innerText: endValue % 1 === 0 ? 1 : 0.1 },
            ease: 'power1.out'
          });
        }
      });
    }
  }, [loading, viewMode, doctors, workloads]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, deptRes, workloadRes] = await Promise.all([
        doctorAPI.getAll(),
        doctorAPI.getDepartments(),
        doctorAPI.getAllWorkloads()
      ]);
      setDoctors(doctorsRes.data.data);
      setDepartments(deptRes.data.data);
      setWorkloads(workloadRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await doctorAPI.update(editingDoctor.doctor_id, formData);
        toast.success('Doctor updated successfully!');
      } else {
        await doctorAPI.create(formData);
        toast.success('Doctor created successfully!');
      }
      setShowForm(false);
      setEditingDoctor(null);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
      console.error('Error saving doctor:', error);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      department_id: doctor.department_id || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      license_number: doctor.license_number || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (doctorId) => {
    try {
      await doctorAPI.delete(doctorId);
      toast.success('Doctor deleted successfully!');
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete doctor');
      console.error('Error deleting doctor:', error);
    }
  };

  const viewDoctorDetails = async (doctorId) => {
    try {
      const [detailRes, workloadRes] = await Promise.all([
        doctorAPI.getById(doctorId),
        doctorAPI.getWorkload(doctorId)
      ]);
      setSelectedDoctor({
        ...detailRes.data.data,
        workload: workloadRes.data.data
      });
    } catch (error) {
      toast.error('Failed to load doctor details');
      console.error('Error loading doctor details:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      department_id: '',
      phone: '',
      email: '',
      license_number: ''
    });
  };

  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWorkloadColor = (count) => {
    if (count === 0) return 'text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700';
    if (count < 5) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800';
    if (count < 10) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800';
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Doctor Management</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage medical staff and workloads</p>
        </div>
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setEditingDoctor(null);
              setShowForm(true);
            }}
            className="btn btn-primary flex items-center gap-2 hover-glow-primary"
          >
            <FaUserMd />
            Add Doctor
          </motion.button>
        </motion.div>

        {/* View Tabs */}
        <div className="mb-6 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 ${
              viewMode === 'list' 
                ? 'bg-primary-600 dark:bg-primary-700 text-white hover-glow-primary shadow-lg' 
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <FaUserMd /> Doctor List
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('workload')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 ${
              viewMode === 'workload' 
                ? 'bg-primary-600 dark:bg-primary-700 text-white hover-glow-primary shadow-lg' 
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <FaChartBar /> Workload Analysis
          </motion.button>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 card"
        >
          <div className="flex items-center gap-3">
            <FaSearch className="text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, specialization, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : viewMode === 'list' ? (
          /* Doctor List View */
          filteredDoctors.length === 0 ? (
            <EmptyState
              icon={FaUserMd}
              title="No doctors found"
              message={searchTerm ? "Try adjusting your search" : "Get started by adding your first doctor"}
              action={() => setShowForm(true)}
              actionText="Add Doctor"
            />
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {filteredDoctors.map((doctor, index) => {
                  const workload = workloads.find(w => w.doctor_id === doctor.doctor_id);
                  return (
                    <motion.div
                      key={doctor.doctor_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="card hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 cursor-pointer" onClick={() => viewDoctorDetails(doctor.doctor_id)}>
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 10 }}
                              className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"
                            >
                              <FaUserMd className="text-primary-600 dark:text-primary-400 text-xl" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{doctor.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-slate-400">{doctor.specialization}</p>
                            </div>
                            <span className="badge badge-info flex items-center gap-1">
                              <FaHospital /> {doctor.department_name}
                            </span>
                            {workload && (
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getWorkloadColor(workload.active_patients)}`}
                              >
                                <FaUsers className="inline mr-1" />
                                {workload.active_patients} patients
                              </motion.span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">Phone: </span>
                              <span className="text-gray-700 dark:text-slate-300">{doctor.phone || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">Email: </span>
                              <span className="text-gray-700 dark:text-slate-300">{doctor.email || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-slate-400">License: </span>
                              <span className="text-gray-700 dark:text-slate-300">{doctor.license_number || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(doctor)}
                            className="btn btn-secondary btn-sm flex items-center gap-1"
                          >
                            <FaEdit /> Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteConfirm(doctor)}
                            className="btn btn-danger btn-sm flex items-center gap-1"
                          >
                            <FaTrash /> Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )
        ) : (
          /* Workload Analysis View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="card bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white hover-glow-primary"
              >
                <p className="text-sm text-blue-100 dark:text-blue-200 mb-1">Total Doctors</p>
                <p
                  ref={el => counterRefs.current[0] = el}
                  data-value={doctors.length}
                  className="text-3xl font-bold"
                >
                  0
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5 }}
                className="card bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white hover-glow-primary"
              >
                <p className="text-sm text-primary-100 dark:text-primary-200 mb-1">Active Patients</p>
                <p
                  ref={el => counterRefs.current[1] = el}
                  data-value={workloads.reduce((sum, w) => sum + parseInt(w.active_patients || 0), 0)}
                  className="text-3xl font-bold"
                >
                  0
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
                className="card bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white hover-glow-primary"
              >
                <p className="text-sm text-purple-100 dark:text-purple-200 mb-1">Departments</p>
                <p
                  ref={el => counterRefs.current[2] = el}
                  data-value={departments.length}
                  className="text-3xl font-bold"
                >
                  0
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="card bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover-glow-success"
              >
                <p className="text-sm text-green-100 dark:text-green-200 mb-1">Avg Load</p>
                <p
                  ref={el => counterRefs.current[3] = el}
                  data-value={
                    workloads.length > 0 
                      ? (workloads.reduce((sum, w) => sum + parseInt(w.active_patients || 0), 0) / workloads.length)
                      : 0
                  }
                  className="text-3xl font-bold"
                >
                  0
                </p>
              </motion.div>
            </div>

            {/* Workload Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Doctor Workload</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Doctor</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Specialization</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Department</th>
                      <th className="text-center p-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Active Patients</th>
                      <th className="text-center p-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workloads
                      .sort((a, b) => b.active_patients - a.active_patients)
                      .map((workload, index) => {
                        const doctor = doctors.find(d => d.doctor_id === workload.doctor_id);
                        return (
                          <motion.tr
                            key={workload.doctor_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (index * 0.05) }}
                            className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <td className="p-3 font-medium text-gray-800 dark:text-white">{workload.doctor_name}</td>
                            <td className="p-3 text-gray-600 dark:text-slate-400">{doctor?.specialization || 'N/A'}</td>
                            <td className="p-3 text-gray-600 dark:text-slate-400">{workload.department_name}</td>
                            <td className="p-3 text-center">
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getWorkloadColor(workload.active_patients)}`}
                              >
                                {workload.active_patients}
                              </motion.span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`badge ${
                                workload.active_patients === 0 ? 'badge-success' :
                                workload.active_patients < 5 ? 'badge-info' :
                                workload.active_patients < 10 ? 'badge-warning' : 'badge-danger'
                              }`}>
                                {workload.active_patients === 0 ? 'Available' :
                                 workload.active_patients < 10 ? 'Normal' : 'Overloaded'}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Department Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Department Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                {departments.map((dept, index) => {
                  const deptDoctors = doctors.filter(d => d.dept_id === dept.dept_id);
                  const deptWorkload = workloads.filter(w => 
                    deptDoctors.some(d => d.doctor_id === w.doctor_id)
                  );
                  const totalPatients = deptWorkload.reduce((sum, w) => sum + parseInt(w.active_patients || 0), 0);
                  
                  return (
                    <motion.div
                      key={dept.dept_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + (index * 0.05) }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-all bg-white dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                          <FaHospital className="text-primary-600 dark:text-primary-400" />
                        </motion.div>
                        <h4 className="font-semibold text-gray-800 dark:text-white">{dept.name || dept.department_name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Doctors</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{deptDoctors.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Patients</p>
                          <p className="font-semibold text-primary-600 dark:text-primary-400">{totalPatients}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Doctor Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingDoctor(null);
            resetForm();
          }}
          title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Cardiology"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowForm(false);
                  setEditingDoctor(null);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary hover-glow-primary"
              >
                {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Doctor Details Modal */}
        {selectedDoctor && (
          <Modal
            isOpen={!!selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
            title="Doctor Details"
            size="lg"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Professional Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Full Name</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedDoctor.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Specialization</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedDoctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Department</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedDoctor.department_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">License Number</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedDoctor.license_number}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Contact & Workload</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Phone</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedDoctor.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Email</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedDoctor.email || 'N/A'}</p>
                    </div>
                    {selectedDoctor.workload && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Active Patients</p>
                          <p className="font-medium text-primary-600 dark:text-primary-400">{selectedDoctor.workload.active_patients}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Total Admissions</p>
                          <p className="font-medium text-gray-800 dark:text-white">{selectedDoctor.workload.total_admissions}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedDoctor(null);
                    handleEdit(selectedDoctor);
                  }}
                  className="btn btn-secondary"
                >
                  Edit Doctor
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDoctor(null)}
                  className="btn btn-primary hover-glow-primary"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.doctor_id)}
          title="Delete Doctor"
          message={`Are you sure you want to delete Dr. ${deleteConfirm?.name}? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="danger"
        />
    </div>
  );
};

export default DoctorManagement;
