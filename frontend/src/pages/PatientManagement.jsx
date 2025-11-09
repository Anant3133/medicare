import { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUser, FaPhone, FaEnvelope, FaTint, FaListAlt } from 'react-icons/fa';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { patientAPI, reportAPI } from '../api/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistPatient, setWaitlistPatient] = useState(null);
  const [waitlistData, setWaitlistData] = useState({
    priority: '3',
    dept_id: '',
    notes: ''
  });
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    gender: '',
    blood_group: '',
    phone: '',
    address: '',
    emergency_contact: ''
  });

  useEffect(() => {
    loadPatients();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await reportAPI.getDepartments();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getAll();
      setPatients(response.data.data);
    } catch (error) {
      toast.error('Failed to load patients');
      console.error('Error loading patients:', error);
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
      if (editingPatient) {
        await patientAPI.update(editingPatient.patient_id, formData);
        toast.success('Patient updated successfully!');
      } else {
        await patientAPI.create(formData);
        toast.success('Patient created successfully!');
      }
      setShowForm(false);
      setEditingPatient(null);
      resetForm();
      loadPatients();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
      console.error('Error saving patient:', error);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.full_name || '',
      dob: patient.dob ? patient.dob.split('T')[0] : '',
      gender: patient.gender || '',
      blood_group: patient.blood_group || '',
      phone: patient.phone || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (patientId) => {
    try {
      await patientAPI.delete(patientId);
      toast.success('Patient deleted successfully!');
      setDeleteConfirm(null);
      loadPatients();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete patient');
      console.error('Error deleting patient:', error);
    }
  };

  const viewPatientDetails = async (patientId) => {
    try {
      const response = await patientAPI.getById(patientId);
      setSelectedPatient(response.data.data);
    } catch (error) {
      toast.error('Failed to load patient details');
      console.error('Error loading patient details:', error);
    }
  };

  const handleAddToWaitlist = (patient) => {
    setWaitlistPatient(patient);
    setShowWaitlistModal(true);
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    try {
      const waitlistPayload = {
        patient_id: waitlistPatient.patient_id,
        dept_id: parseInt(waitlistData.dept_id),
        priority: parseInt(waitlistData.priority),
        notes: waitlistData.notes || null
      };
      
      await reportAPI.addToWaitingList(waitlistPayload);
      toast.success(`${waitlistPatient.full_name} added to waiting list!`);
      setShowWaitlistModal(false);
      setWaitlistPatient(null);
      setWaitlistData({ priority: '3', dept_id: '', notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to waitlist');
      console.error('Error adding to waitlist:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      dob: '',
      gender: '',
      blood_group: '',
      phone: '',
      address: '',
      emergency_contact: ''
    });
  };

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm) ||
    p.patient_id?.toString().includes(searchTerm)
  );

  const getBloodTypeColor = (type) => {
    const colors = {
      'A+': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
      'A-': 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700',
      'B+': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      'B-': 'bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700',
      'O+': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
      'O-': 'bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700',
      'AB+': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
      'AB-': 'bg-purple-200 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700'
    };
    return colors[type] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700';
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Patient Management</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Manage patient records and information</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setEditingPatient(null);
              setShowForm(true);
            }}
            className="btn btn-primary flex items-center gap-2 hover-glow-primary"
          >
            <FaUserPlus />
            Add Patient
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 card"
        >
          <div className="flex items-center gap-3">
            <FaSearch className="text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>
        </motion.div>

        {/* Patient List */}
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            icon={FaUser}
            title="No patients found"
            message={searchTerm ? "Try adjusting your search" : "Get started by adding your first patient"}
            action={() => setShowForm(true)}
            actionText="Add Patient"
          />
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.patient_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="card hover-lift"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => viewPatientDetails(patient.patient_id)}>
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"
                        >
                          <FaUser className="text-primary-600 dark:text-primary-400 text-xl" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{patient.full_name}</h3>
                          <p className="text-sm text-gray-600 dark:text-slate-400">ID: {patient.patient_id}</p>
                        </div>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getBloodTypeColor(patient.blood_group)}`}
                        >
                          <FaTint className="inline mr-1" />
                          {patient.blood_group}
                        </motion.span>
                        <span className="badge badge-info capitalize">{patient.gender}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <FaPhone className="text-gray-400 dark:text-slate-500" />
                          <span className="text-gray-700 dark:text-slate-300">{patient.phone}</span>
                        </motion.div>
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-slate-400">DOB: </span>
                          <span className="text-gray-700 dark:text-slate-300">
                            {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToWaitlist(patient)}
                        className="btn btn-primary btn-sm flex items-center gap-1 hover-glow-primary"
                        title="Add to Waiting List"
                      >
                        <FaListAlt /> Waitlist
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(patient)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteConfirm(patient)}
                        className="btn btn-danger btn-sm flex items-center gap-1 hover-glow-danger"
                      >
                        <FaTrash /> Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Patient Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingPatient(null);
            resetForm();
          }}
          title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
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
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
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
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Emergency Contact</label>
              <input
                type="text"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                placeholder="Name and phone number"
                className="input w-full"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPatient(null);
                  resetForm();
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
                {editingPatient ? 'Update Patient' : 'Create Patient'}
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <Modal
            isOpen={!!selectedPatient}
            onClose={() => setSelectedPatient(null)}
            title="Patient Details"
            size="lg"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Full Name</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedPatient.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Date of Birth</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {selectedPatient.dob ? new Date(selectedPatient.dob).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Gender</p>
                      <p className="font-medium text-gray-800 dark:text-white capitalize">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Blood Group</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedPatient.blood_group}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Phone</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Address</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedPatient.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Emergency Contact</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedPatient.emergency_contact || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedPatient(null);
                    handleEdit(selectedPatient);
                  }}
                  className="btn btn-secondary"
                >
                  Edit Patient
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPatient(null)}
                  className="btn btn-primary"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </Modal>
        )}

        {/* Waitlist Modal */}
        {showWaitlistModal && waitlistPatient && (
          <Modal
            isOpen={showWaitlistModal}
            onClose={() => {
              setShowWaitlistModal(false);
              setWaitlistPatient(null);
              setWaitlistData({ priority: '3', dept_id: '', notes: '' });
            }}
            title={`Add ${waitlistPatient.full_name} to Waiting List`}
          >
            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Priority Level
                </label>
                <select
                  value={waitlistData.priority}
                  onChange={(e) => setWaitlistData({...waitlistData, priority: e.target.value})}
                  className="input w-full"
                  required
                >
                  <option value="1">1 - Critical (Immediate Attention)</option>
                  <option value="2">2 - High (Urgent)</option>
                  <option value="3">3 - Medium (Standard)</option>
                  <option value="4">4 - Low (Non-Urgent)</option>
                  <option value="5">5 - Routine (Scheduled)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Department
                </label>
                <select
                  value={waitlistData.dept_id}
                  onChange={(e) => setWaitlistData({...waitlistData, dept_id: e.target.value})}
                  className="input w-full"
                  required
                >
                  <option value="">Select Department...</option>
                  {departments.map(dept => (
                    <option key={dept.dept_id} value={dept.dept_id}>
                      {dept.name || dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Notes/Reason
                </label>
                <textarea
                  value={waitlistData.notes}
                  onChange={(e) => setWaitlistData({...waitlistData, notes: e.target.value})}
                  className="input w-full"
                  rows="4"
                  placeholder="Enter reason for admission, preliminary diagnosis, or any notes..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowWaitlistModal(false);
                    setWaitlistPatient(null);
                    setWaitlistData({ priority: '3', dept_id: '', notes: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary flex items-center gap-2 hover-glow-primary"
                >
                  <FaListAlt /> Add to Waitlist
                </motion.button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.patient_id)}
          title="Delete Patient"
          message={`Are you sure you want to delete ${deleteConfirm?.full_name}? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="danger"
        />
    </div>
  );
};

export default PatientManagement;
