// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {
  getOccupancyReport,
  getRevenueReport,
  getWaitingListReport,
  addToWaitingList,
  getDoctorWorkloadReport,
  getDepartmentReport,
  getAdmissionTrends,
  getAuditLog,
  getDashboardSummary
} = require('../controllers/reportController');
const { protect, authorize } = require('../controllers/authController');

// All routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/occupancy', getOccupancyReport);
router.get('/revenue', authorize('admin', 'billing'), getRevenueReport);
router.get('/waiting-list', getWaitingListReport);
router.post('/waiting-list', addToWaitingList);
router.get('/doctor-workload', getDoctorWorkloadReport);
router.get('/departments', getDepartmentReport);
router.get('/admission-trends', getAdmissionTrends);
router.get('/audit-log', authorize('admin'), getAuditLog);

module.exports = router;
