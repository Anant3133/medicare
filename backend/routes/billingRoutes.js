// backend/routes/billingRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllBills,
  getBillById,
  getBillByAdmissionId,
  generateBill,
  createManualBill,
  markBillAsPaid,
  updateBill,
  deleteBill,
  getAllServices
} = require('../controllers/billingController');
const { protect, authorize } = require('../controllers/authController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(authorize('admin', 'billing', 'staff'), getAllBills)
  .post(authorize('admin', 'billing', 'staff'), generateBill);

router.post('/manual', authorize('admin', 'billing'), createManualBill);
router.get('/services/all', getAllServices);
router.get('/admission/:admissionId', getBillByAdmissionId);

router.route('/:id')
  .get(authorize('admin', 'billing', 'staff', 'doctor'), getBillById)
  .put(authorize('admin', 'billing'), updateBill)
  .delete(authorize('admin', 'billing'), deleteBill);

router.put('/:id/pay', authorize('admin', 'billing'), markBillAsPaid);

module.exports = router;
