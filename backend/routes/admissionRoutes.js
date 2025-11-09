// backend/routes/admissionRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllAdmissions,
  getAdmissionById,
  createAdmission,
  createManualAdmission,
  assignBed,
  dischargePatient,
  updateAdmission
} = require('../controllers/admissionController');
const { protect, authorize } = require('../controllers/authController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAllAdmissions)
  .post(authorize('admin', 'staff', 'doctor'), createAdmission);

router.post('/manual', authorize('admin', 'staff'), createManualAdmission);

router.route('/:id')
  .get(getAdmissionById)
  .put(authorize('admin', 'staff', 'doctor'), updateAdmission);

router.put('/:id/assign-bed', authorize('admin', 'staff'), assignBed);
router.put('/:id/discharge', authorize('admin', 'staff', 'doctor'), dischargePatient);

module.exports = router;
