import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { doctorAPI } from '../api/api';
import { FaUserInjured, FaBed, FaCalendar } from 'react-icons/fa';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      // In a real app, you'd get the doctor_id from the authenticated user
      // For demo, we'll use doctor1's ID (1)
      const response = await doctorAPI.getPatients(1);
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority <= 2) return 'badge-danger';
    if (priority === 3) return 'badge-warning';
    return 'badge-info';
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
          <p className="text-gray-600 mt-1">Active patients under your care</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : patients.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <FaUserInjured className="text-6xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No active patients</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {patients.map((patient) => (
              <div key={patient.admission_id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaUserInjured className="text-primary-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{patient.patient_name}</h3>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                      </div>
                      <span className={`badge ${getPriorityBadge(patient.priority)}`}>
                        Priority {patient.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-sm flex items-center gap-1 mb-1">
                          <FaBed /> Location
                        </p>
                        <p className="font-semibold">
                          Floor {patient.floor}, Room {patient.room_number}
                        </p>
                        <p className="text-sm text-gray-600">Bed {patient.bed_number}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-sm flex items-center gap-1 mb-1">
                          <FaCalendar /> Admitted
                        </p>
                        <p className="font-semibold">
                          {new Date(patient.admitted_on).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Math.floor((new Date() - new Date(patient.admitted_on)) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Gender / Age</p>
                        <p className="font-semibold capitalize">
                          {patient.gender} / {patient.age || 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Diagnosis</p>
                        <p className="font-semibold text-sm truncate" title={patient.diagnosis}>
                          {patient.diagnosis || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
