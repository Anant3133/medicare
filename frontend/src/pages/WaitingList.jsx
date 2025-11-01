import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { reportAPI } from '../api/api';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';

const WaitingList = () => {
  const [waitingList, setWaitingList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaitingList();
  }, []);

  const loadWaitingList = async () => {
    try {
      const response = await reportAPI.getWaitingList();
      setWaitingList(response.data.data);
    } catch (error) {
      console.error('Error loading waiting list:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority <= 2) return 'text-red-600 bg-red-100';
    if (priority === 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Waiting List</h1>
          <p className="text-gray-600 mt-1">Patients waiting for bed allocation</p>
        </div>

        {/* Summary Card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Total Waiting</h2>
              <p className="text-4xl font-bold text-primary-600 mt-2">
                {waitingList?.total_waiting || 0}
              </p>
            </div>
            <FaClock className="text-6xl text-primary-200" />
          </div>
        </div>

        {/* By Department */}
        <div className="space-y-6">
          {waitingList && Object.entries(waitingList.by_department).map(([department, patients]) => (
            <div key={department} className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {department} ({patients.length} patients)
              </h3>
              
              <div className="space-y-3">
                {patients.map((patient) => (
                  <div
                    key={patient.wait_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-800">{patient.patient_name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                            Priority {patient.priority}
                          </span>
                          {patient.priority <= 2 && (
                            <FaExclamationTriangle className="text-red-500" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-gray-600">Phone</p>
                            <p className="font-medium">{patient.patient_phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Emergency Contact</p>
                            <p className="font-medium">{patient.emergency_contact || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Waiting Time</p>
                            <p className="font-medium">{patient.hours_waiting} hours</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {waitingList?.total_waiting === 0 && (
          <div className="card text-center py-12 text-gray-500">
            <FaClock className="text-6xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No patients in waiting list</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingList;
