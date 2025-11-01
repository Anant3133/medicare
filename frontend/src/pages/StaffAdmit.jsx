import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AdmissionForm from '../components/AdmissionForm';
import { admissionAPI } from '../api/api';
import { FaPlus, FaUserInjured, FaBed, FaCalendar } from 'react-icons/fa';

const StaffAdmit = () => {
  const [admissions, setAdmissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

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
      alert('Admission created successfully!');
      setShowForm(false);
      loadAdmissions();
    } catch (error) {
      throw error;
    }
  };

  const handleDischarge = async (admissionId) => {
    if (!confirm('Are you sure you want to discharge this patient?')) return;
    
    try {
      await admissionAPI.discharge(admissionId);
      alert('Patient discharged successfully!');
      loadAdmissions();
    } catch (error) {
      alert('Error discharging patient: ' + (error.response?.data?.error || error.message));
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
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admissions</h1>
            <p className="text-gray-600 mt-1">Manage patient admissions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FaPlus />
            New Admission
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {['active', 'discharged', 'waiting'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Admission Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">New Admission</h2>
              <AdmissionForm
                onSubmit={handleCreateAdmission}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {/* Admissions List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : admissions.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No admissions found
          </div>
        ) : (
          <div className="grid gap-4">
            {admissions.map((admission) => (
              <div key={admission.admission_id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FaUserInjured className="text-primary-600 text-xl" />
                      <h3 className="text-lg font-semibold">{admission.patient_name}</h3>
                      <span className={`badge ${getPriorityBadge(admission.priority)}`}>
                        Priority {admission.priority}
                      </span>
                      <span className="badge badge-info capitalize">{admission.admission_status}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-600">Doctor</p>
                        <p className="font-medium">{admission.doctor_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 flex items-center gap-1">
                          <FaBed /> Bed
                        </p>
                        <p className="font-medium">
                          {admission.bed_number ? `${admission.room_number}-${admission.bed_number}` : 'Not Assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 flex items-center gap-1">
                          <FaCalendar /> Admitted
                        </p>
                        <p className="font-medium">
                          {new Date(admission.admitted_on).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Diagnosis</p>
                        <p className="font-medium truncate">{admission.diagnosis || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {admission.admission_status === 'active' && (
                    <button
                      onClick={() => handleDischarge(admission.admission_id)}
                      className="btn btn-danger ml-4"
                    >
                      Discharge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAdmit;
