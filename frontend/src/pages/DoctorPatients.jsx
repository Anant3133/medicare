import { useState, useEffect, useRef } from 'react';

import { doctorAPI } from '../api/api';
import { FaUserInjured, FaBed, FaCalendar, FaUsers, FaClock, FaChartLine, FaStethoscope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const statsRefs = useRef([]);
  const counterRefs = useRef([]);

  useEffect(() => {
    loadData();
  }, []);

  // Animate stats when loaded
  useEffect(() => {
    if (stats && statsRefs.current.length > 0) {
      statsRefs.current.forEach((stat, index) => {
        if (stat) {
          gsap.fromTo(stat,
            {
              scale: 0.8,
              opacity: 0,
              y: 30
            },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'back.out(1.7)'
            }
          );
        }
      });

      // Animate counters
      counterRefs.current.forEach((counter, index) => {
        if (counter) {
          const endValue = parseInt(counter.getAttribute('data-value') || 0);
          gsap.to(counter, {
            innerText: endValue,
            duration: 1.5,
            delay: index * 0.1,
            snap: { innerText: 1 },
            ease: 'power1.out'
          });
        }
      });
    }
  }, [stats]);

  const loadData = async () => {
    try {
      // In a real app, you'd get the doctor_id from the authenticated user
      // For demo, we'll use doctor1's ID (1)
      const [patientsRes, workloadRes] = await Promise.all([
        doctorAPI.getPatients(1),
        doctorAPI.getWorkload().catch(() => ({ data: { data: [] } }))
      ]);
      
      setPatients(patientsRes.data.data);
      
      // Find current doctor's stats
      const myStats = workloadRes.data.data.find(d => d.doctor_id === 1);
      if (myStats) {
        setStats({
          totalPatients: myStats.active_patients,
          avgStay: Math.floor(Math.random() * 7) + 3, // Mock data
          todayAdmissions: patients.filter(p => {
            const admitDate = new Date(p.admitted_on);
            const today = new Date();
            return admitDate.toDateString() === today.toDateString();
          }).length
        });
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
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
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Patients</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Active patients under your care</p>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              ref={el => statsRefs.current[0] = el}
              whileHover={{ y: -5 }}
              className="card stat-card bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white hover-glow-primary overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <FaUsers className="text-2xl" />
                </motion.div>
                <div>
                  <p className="text-blue-100 dark:text-blue-200 text-sm">Total Patients</p>
                  <p
                    ref={el => counterRefs.current[0] = el}
                    data-value={stats.totalPatients}
                    className="text-3xl font-bold"
                  >
                    {stats.totalPatients}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              ref={el => statsRefs.current[1] = el}
              whileHover={{ y: -5 }}
              className="card stat-card bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover-glow-success overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <FaStethoscope className="text-2xl" />
                </motion.div>
                <div>
                  <p className="text-green-100 dark:text-green-200 text-sm">Today's Admissions</p>
                  <p
                    ref={el => counterRefs.current[1] = el}
                    data-value={stats.todayAdmissions}
                    className="text-3xl font-bold"
                  >
                    {stats.todayAdmissions}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              ref={el => statsRefs.current[2] = el}
              whileHover={{ y: -5 }}
              className="card stat-card bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white hover-glow-primary overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <FaClock className="text-2xl" />
                </motion.div>
                <div>
                  <p className="text-purple-100 dark:text-purple-200 text-sm">Avg Stay Duration</p>
                  <p className="text-3xl font-bold">
                    <span
                      ref={el => counterRefs.current[2] = el}
                      data-value={stats.avgStay}
                    >
                      {stats.avgStay}
                    </span> days
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              ref={el => statsRefs.current[3] = el}
              whileHover={{ y: -5 }}
              className="card stat-card bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white hover-glow-warning overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <FaChartLine className="text-2xl" />
                </motion.div>
                <div>
                  <p className="text-orange-100 dark:text-orange-200 text-sm">Workload Status</p>
                  <p className="text-2xl font-bold">
                    {stats.totalPatients > 10 ? 'High' : stats.totalPatients > 5 ? 'Moderate' : 'Light'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-12 text-gray-500 dark:text-slate-400"
          >
            <FaUserInjured className="text-6xl mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p className="text-lg">No active patients</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {patients.map((patient, index) => (
              <motion.div
                key={patient.admission_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="card hover-lift"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"
                      >
                        <FaUserInjured className="text-primary-600 dark:text-primary-400 text-xl" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{patient.patient_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{patient.phone}</p>
                      </div>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`badge ${getPriorityBadge(patient.priority)}`}
                      >
                        Priority {patient.priority}
                      </motion.span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg"
                      >
                        <p className="text-gray-600 dark:text-slate-400 text-sm flex items-center gap-1 mb-1">
                          <FaBed /> Location
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          Floor {patient.floor}, Room {patient.room_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Bed {patient.bed_number}</p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg"
                      >
                        <p className="text-gray-600 dark:text-slate-400 text-sm flex items-center gap-1 mb-1">
                          <FaCalendar /> Admitted
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {new Date(patient.admitted_on).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {Math.floor((new Date() - new Date(patient.admitted_on)) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg"
                      >
                        <p className="text-gray-600 dark:text-slate-400 text-sm mb-1">Gender / Age</p>
                        <p className="font-semibold text-gray-800 dark:text-white capitalize">
                          {patient.gender} / {patient.age || 'N/A'}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg"
                      >
                        <p className="text-gray-600 dark:text-slate-400 text-sm mb-1">Diagnosis</p>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate" title={patient.diagnosis}>
                          {patient.diagnosis || 'Not specified'}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
};

export default DoctorPatients;
