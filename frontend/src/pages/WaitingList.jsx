import { useState, useEffect } from 'react';
import { reportAPI } from '../api/api';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const WaitingList = () => {
  const [waitingList, setWaitingList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaitingList();
  }, []);

  const loadWaitingList = async () => {
    try {
      console.log('[WAITING LIST] Loading waiting list from admissions...');
      const response = await reportAPI.getWaitingList();
      console.log('[WAITING LIST] Data received:', response.data.data);
      console.log('[WAITING LIST] Total waiting:', response.data.data.total_waiting);
      setWaitingList(response.data.data);
    } catch (error) {
      console.error('[WAITING LIST] Error loading waiting list:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority <= 2) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800';
    if (priority === 3) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800';
    return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800';
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading waiting list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Waiting List</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Patients waiting for bed allocation</p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -5 }}
          className="card mb-6 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white hover-glow-primary overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary-100 dark:text-primary-200">Total Waiting</h2>
              <p className="text-4xl font-bold mt-2">
                {waitingList?.total_waiting || 0}
              </p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <FaClock className="text-6xl text-primary-200 dark:text-primary-300 opacity-50" />
            </motion.div>
          </div>
        </motion.div>

        {/* By Department */}
        <div className="space-y-6">
          {waitingList && Object.entries(waitingList.by_department).map(([department, patients], deptIndex) => (
            <motion.div
              key={department}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: deptIndex * 0.1 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {department} ({patients.length} patients)
              </h3>
              
              <div className="space-y-3">
                {patients.map((patient, index) => (
                  <motion.div
                    key={patient.wait_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (deptIndex * 0.1) + (index * 0.05) }}
                    whileHover={{ x: 5, scale: 1.01 }}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-800 dark:text-white">{patient.patient_name}</h4>
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}
                          >
                            Priority {patient.priority}
                          </motion.span>
                          {patient.priority <= 2 && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <FaExclamationTriangle className="text-red-500 dark:text-red-400" />
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-gray-600 dark:text-slate-400">Doctor</p>
                            <p className="font-medium text-gray-800 dark:text-white">{patient.doctor_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-slate-400">Diagnosis</p>
                            <p className="font-medium text-gray-800 dark:text-white truncate">{patient.diagnosis || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-slate-400">Phone</p>
                            <p className="font-medium text-gray-800 dark:text-white">{patient.patient_phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-slate-400">Waiting Time</p>
                            <p className="font-medium text-gray-800 dark:text-white">{patient.hours_waiting} hours</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {waitingList?.total_waiting === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-12 text-gray-500 dark:text-slate-400"
          >
            <FaClock className="text-6xl mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p className="text-lg">No patients in waiting list</p>
          </motion.div>
        )}
    </div>
  );
};

export default WaitingList;
