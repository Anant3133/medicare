// backend/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  getPatientHistory,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');
const { protect, authorize } = require('../controllers/authController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAllPatients)
  .post(authorize('admin', 'staff'), createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(authorize('admin', 'staff'), updatePatient)
  .delete(authorize('admin'), deletePatient);

router.get('/:id/history', getPatientHistory);

module.exports = router;
