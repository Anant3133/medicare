// backend/routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  getDoctorPatients,
  getDoctorWorkload,
  getAllDoctorWorkloads,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllDepartments
} = require('../controllers/doctorController');
const { protect, authorize } = require('../controllers/authController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAllDoctors)
  .post(authorize('admin'), createDoctor);

router.get('/workload/all', getAllDoctorWorkloads);
router.get('/departments/all', getAllDepartments);

router.route('/:id')
  .get(getDoctorById)
  .put(authorize('admin'), updateDoctor)
  .delete(authorize('admin'), deleteDoctor);

router.get('/:id/patients', getDoctorPatients);
router.get('/:id/workload', getDoctorWorkload);

module.exports = router;
