// backend/routes/bedRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllBeds,
  getAvailableBeds,
  getBedStats,
  getBedById,
  createBed,
  updateBedStatus,
  updateBed,
  deleteBed
} = require('../controllers/bedController');
const { protect, authorize } = require('../controllers/authController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAllBeds)
  .post(authorize('admin'), createBed);

router.get('/available', getAvailableBeds);
router.get('/stats', getBedStats);

router.route('/:id')
  .get(getBedById)
  .put(authorize('admin', 'staff'), updateBed)
  .delete(authorize('admin'), deleteBed);

router.put('/:id/status', authorize('admin', 'staff'), updateBedStatus);

module.exports = router;
