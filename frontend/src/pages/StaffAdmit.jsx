import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdmissionForm from '../components/AdmissionForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { admissionAPI, patientAPI, doctorAPI } from '../api/api';
import { FaPlus, FaUserInjured, FaBed, FaCalendar, FaEdit, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StaffAdmit = () => {
  const [admissions, setAdmissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [editFormData, setEditFormData] = useState({
    diagnosis: '',
    doctor_id: ''
  });

  useEffect(() => {
    loadAdmissions();
  }, [filter]);

  const loadAdmissions = async () => {
    try {
      const response = await admissionAPI.getAll({ status: filter });
      setAdmissions(response.data.data);
    } catch (error) {
      console.error('Error loading admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmission = async (data) => {
    try {
      await admissionAPI.create(data);
      toast.success('Admission created successfully!');
      setShowForm(false);
      loadAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create admission');
      throw error;
    }
  };

  const viewAdmissionDetails = async (admissionId) => {
    try {
      const response = await admissionAPI.getById(admissionId);
      setSelectedAdmission(response.data.data);
    } catch (error) {
      toast.error('Failed to load admission details');
      console.error('Error loading admission details:', error);
    }
  };

  const handleEditAdmission = (admission) => {
    setEditingAdmission(admission);
    setEditFormData({
      diagnosis: admission.diagnosis || '',
      doctor_id: admission.doctor_id || ''
    });
  };

  const handleUpdateAdmission = async (e) => {
    e.preventDefault();
    try {
      await admissionAPI.update(editingAdmission.admission_id, editFormData);
      toast.success('Admission updated successfully!');
      setEditingAdmission(null);
      setSelectedAdmission(null);
      loadAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update admission');
      console.error('Error updating admission:', error);
    }
  };

  const handleDischarge = async (admissionId) => {
    try {
      await admissionAPI.discharge(admissionId);
      toast.success('Patient discharged successfully!');
      loadAdmissions();
    } catch (error) {
      toast.error('Error discharging patient: ' + (error.response?.data?.error || error.message));
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      1: 'badge-danger',
      2: 'badge-warning',
      3: 'badge-info',
      4: 'badge-info',
      5: 'badge-success'
    };
    return colors[priority] || 'badge-info';
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admissions</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage patient admissions</p>
        </div>
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2 hover-glow-primary"
          >
            <FaPlus />
            New Admission
          </motion.button>
        </motion.div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {['active', 'discharged', 'waiting'].map((status, index) => (
            <motion.button
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-300 ${
                filter === status
                  ? 'bg-primary-600 dark:bg-primary-700 text-white hover-glow-primary shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>

        {/* Admission Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">New Admission</h2>
              <AdmissionForm
                onSubmit={handleCreateAdmission}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </div>
        )}

        {/* Admissions List */}
        {loading ? (
          <div className="text-center py-8 text-gray-600 dark:text-slate-400">Loading...</div>
        ) : admissions.length === 0 ? (
          <div className="card text-center py-8 text-gray-500 dark:text-slate-400">
            No admissions found
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {admissions.map((admission, index) => (
                <motion.div
                  key={admission.admission_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="card hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                          <FaUserInjured className="text-primary-600 dark:text-primary-400 text-xl" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{admission.patient_name}</h3>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className={`badge ${getPriorityBadge(admission.priority)}`}
                        >
                          Priority {admission.priority}
                        </motion.span>
                        <span className="badge badge-info capitalize">{admission.admission_status}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Doctor</p>
                          <p className="font-medium text-gray-800 dark:text-white">{admission.doctor_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-slate-400 flex items-center gap-1">
                            <FaBed /> Bed
                          </p>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {admission.bed_number ? `${admission.room_number}-${admission.bed_number}` : 'Not Assigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-slate-400 flex items-center gap-1">
                            <FaCalendar /> Admitted
                          </p>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {new Date(admission.admitted_on).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Diagnosis</p>
                          <p className="font-medium truncate text-gray-800 dark:text-white">{admission.diagnosis || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => viewAdmissionDetails(admission.admission_id)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                      >
                        <FaEye /> View
                      </motion.button>
                      {admission.admission_status === 'active' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditAdmission(admission)}
                            className="btn btn-secondary btn-sm flex items-center gap-1"
                          >
                            <FaEdit /> Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDischarge(admission.admission_id)}
                            className="btn btn-danger btn-sm"
                          >
                            Discharge
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Admission Details Modal */}
        {selectedAdmission && (
          <Modal
            isOpen={!!selectedAdmission}
            onClose={() => setSelectedAdmission(null)}
            title="Admission Details"
            size="lg"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Patient Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Patient Name</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedAdmission.patient_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Priority</p>
                      <p className="font-medium text-gray-800 dark:text-white">Priority {selectedAdmission.priority}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Status</p>
                      <p className="font-medium capitalize text-gray-800 dark:text-white">{selectedAdmission.admission_status}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Medical Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Doctor</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedAdmission.doctor_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Diagnosis</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedAdmission.diagnosis || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Bed Assignment</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {selectedAdmission.bed_number 
                          ? `Room ${selectedAdmission.room_number} - Bed ${selectedAdmission.bed_number}` 
                          : 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Timeline</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Admitted On</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {new Date(selectedAdmission.admitted_on).toLocaleString()}
                    </p>
                  </div>
                  {selectedAdmission.discharged_on && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Discharged On</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {new Date(selectedAdmission.discharged_on).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                {selectedAdmission.admission_status === 'active' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedAdmission(null);
                      handleEditAdmission(selectedAdmission);
                    }}
                    className="btn btn-secondary"
                  >
                    Edit Admission
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAdmission(null)}
                  className="btn btn-primary hover-glow-primary"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Admission Modal */}
        {editingAdmission && (
          <Modal
            isOpen={!!editingAdmission}
            onClose={() => setEditingAdmission(null)}
            title="Edit Admission"
            size="md"
          >
            <form onSubmit={handleUpdateAdmission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Diagnosis
                </label>
                <textarea
                  value={editFormData.diagnosis}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows="3"
                  className="input"
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                  Patient: <span className="font-semibold text-gray-800 dark:text-white">{editingAdmission.patient_name}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Current Doctor: <span className="font-semibold text-gray-800 dark:text-white">{editingAdmission.doctor_name}</span>
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingAdmission(null)}
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
                  Update Admission
                </motion.button>
              </div>
            </form>
          </Modal>
        )}
    </div>
  );
};

export default StaffAdmit;
