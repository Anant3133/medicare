import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { billingAPI, admissionAPI } from '../api/api';
import { FaFileInvoiceDollar, FaCheckCircle, FaClock, FaPlus, FaEdit, FaTrash, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [generateFormData, setGenerateFormData] = useState({
    admission_id: '',
    discount: 0,
    notes: ''
  });
  const [manualFormData, setManualFormData] = useState({
    patient_id: '',
    amount: '',
    tax: '',
    discount: 0,
    payment_status: 'pending',
    notes: ''
  });
  const [editFormData, setEditFormData] = useState({
    amount: '',
    tax: '',
    discount: 0,
    notes: ''
  });
  const [paymentData, setPaymentData] = useState({
    payment_method: 'cash',
    transaction_id: ''
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [billsRes, admissionsRes, servicesRes] = await Promise.all([
        billingAPI.getAll({ status: filter }),
        admissionAPI.getAll({ status: 'active' }),
        billingAPI.getServices().catch(() => ({ data: { data: [] } }))
      ]);
      setBills(billsRes.data.data);
      setAdmissions(admissionsRes.data.data);
      setServices(servicesRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBillDetails = async (billId) => {
    try {
      const response = await billingAPI.getById(billId);
      setSelectedBill(response.data.data);
    } catch (error) {
      toast.error('Failed to load bill details');
      console.error('Error loading bill details:', error);
    }
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    try {
      await billingAPI.generate(generateFormData);
      toast.success('Bill generated successfully!');
      setShowGenerateForm(false);
      setGenerateFormData({ admission_id: '', discount: 0, notes: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate bill');
      console.error('Error generating bill:', error);
    }
  };

  const handleCreateManualBill = async (e) => {
    e.preventDefault();
    try {
      await billingAPI.createManual(manualFormData);
      toast.success('Manual bill created successfully!');
      setShowManualForm(false);
      setManualFormData({
        patient_id: '',
        amount: '',
        tax: '',
        discount: 0,
        payment_status: 'pending',
        notes: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create bill');
      console.error('Error creating manual bill:', error);
    }
  };

  const handleEditBill = (bill) => {
    setEditFormData({
      amount: bill.amount || '',
      tax: bill.tax || '',
      discount: bill.discount || 0,
      notes: bill.notes || ''
    });
    setSelectedBill(bill);
    setShowEditForm(true);
  };

  const handleUpdateBill = async (e) => {
    e.preventDefault();
    try {
      await billingAPI.update(selectedBill.bill_id, editFormData);
      toast.success('Bill updated successfully!');
      setShowEditForm(false);
      setSelectedBill(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update bill');
      console.error('Error updating bill:', error);
    }
  };

  const handleDeleteBill = async (billId) => {
    try {
      await billingAPI.delete(billId);
      toast.success('Bill deleted successfully!');
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete bill');
      console.error('Error deleting bill:', error);
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    try {
      await billingAPI.markPaid(selectedBill.bill_id, paymentData);
      toast.success('Bill marked as paid!');
      setShowPaymentModal(false);
      setSelectedBill(null);
      setPaymentData({ payment_method: 'cash', transaction_id: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark bill as paid');
      console.error('Error marking bill as paid:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Billing Management</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage bills and payments</p>
        </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerateForm(true)}
              className="btn btn-primary flex items-center gap-2 hover-glow-primary"
            >
              <FaReceipt />
              Generate Bill
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowManualForm(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FaPlus />
              Manual Bill
            </motion.button>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {['pending', 'paid', 'cancelled'].map((status, index) => (
            <motion.button
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-300 ${
                filter === status
                  ? 'bg-primary-600 dark:bg-primary-700 text-white hover-glow-primary shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>

        {/* Bills List */}
        {loading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : bills.length === 0 ? (
          <EmptyState
            icon={FaFileInvoiceDollar}
            title={`No ${filter} bills found`}
            message="Bills will appear here as they are generated"
          />
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {bills.map((bill, index) => (
                <motion.div
                  key={bill.bill_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="card hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => loadBillDetails(bill.bill_id)}>
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                          <FaFileInvoiceDollar className="text-primary-600 dark:text-primary-400 text-xl" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Bill #{bill.bill_id}</h3>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className={`badge ${
                            bill.bill_status === 'paid' ? 'badge-success' :
                            bill.bill_status === 'pending' ? 'badge-warning' : 'badge-danger'
                          }`}
                        >
                          {bill.bill_status === 'paid' && <FaCheckCircle className="inline mr-1" />}
                          {bill.bill_status === 'pending' && <FaClock className="inline mr-1" />}
                          {bill.bill_status}
                        </motion.span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Patient</p>
                          <p className="font-medium text-gray-800 dark:text-white">{bill.patient_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Amount</p>
                          <p className="font-medium text-gray-800 dark:text-white">${parseFloat(bill.amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Tax</p>
                          <p className="font-medium text-gray-800 dark:text-white">${parseFloat(bill.tax).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Total</p>
                          <p className="font-bold text-primary-600 dark:text-primary-400">${parseFloat(bill.total).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-slate-400">Date</p>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {new Date(bill.bill_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {bill.days_stayed && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-slate-400">
                          Stay Duration: {bill.days_stayed} days
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {bill.bill_status === 'pending' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBill(bill);
                            }}
                            className="btn btn-secondary btn-sm flex items-center gap-1"
                          >
                            <FaEdit /> Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBill(bill);
                              setShowPaymentModal(true);
                            }}
                            className="btn btn-success btn-sm flex items-center gap-1 hover-glow-success"
                          >
                            <FaMoneyBillWave /> Pay
                          </motion.button>
                        </>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(bill);
                        }}
                        className="btn btn-danger btn-sm flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Generate Bill Modal */}
        <Modal
          isOpen={showGenerateForm}
          onClose={() => setShowGenerateForm(false)}
          title="Generate Bill from Admission"
          size="md"
        >
          <form onSubmit={handleGenerateBill} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Select Admission <span className="text-red-500">*</span>
              </label>
              <select
                value={generateFormData.admission_id}
                onChange={(e) => setGenerateFormData(prev => ({ ...prev, admission_id: e.target.value }))}
                required
                className="input"
              >
                <option value="">Select an admission</option>
                {admissions.map(adm => (
                  <option key={adm.admission_id} value={adm.admission_id}>
                    #{adm.admission_id} - {adm.patient_name} ({new Date(adm.admitted_on).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Bill will be automatically calculated based on room charges and services
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={generateFormData.discount}
                onChange={(e) => setGenerateFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                value={generateFormData.notes}
                onChange={(e) => setGenerateFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
                className="input"
                placeholder="Additional notes or instructions..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGenerateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary hover-glow-primary"
              >
                Generate Bill
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Manual Bill Modal */}
        <Modal
          isOpen={showManualForm}
          onClose={() => setShowManualForm(false)}
          title="Create Manual Bill"
          size="md"
        >
          <form onSubmit={handleCreateManualBill} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Patient ID <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={manualFormData.patient_id}
                onChange={(e) => setManualFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                required
                className="input"
                placeholder="Enter patient ID"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualFormData.amount}
                  onChange={(e) => setManualFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Tax <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualFormData.tax}
                  onChange={(e) => setManualFormData(prev => ({ ...prev, tax: e.target.value }))}
                  required
                  className="input"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Discount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={manualFormData.discount}
                onChange={(e) => setManualFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={manualFormData.payment_status}
                onChange={(e) => setManualFormData(prev => ({ ...prev, payment_status: e.target.value }))}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                value={manualFormData.notes}
                onChange={(e) => setManualFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
                className="input"
                placeholder="Service description, reason for charge, etc."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Bill
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Bill Modal */}
        <Modal
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedBill(null);
          }}
          title={`Edit Bill #${selectedBill?.bill_id}`}
          size="md"
        >
          <form onSubmit={handleUpdateBill} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Tax <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.tax}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, tax: e.target.value }))}
                  required
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Discount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editFormData.discount}
                onChange={(e) => setEditFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
                className="input"
              />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Patient: <span className="font-semibold text-gray-800 dark:text-white">{selectedBill?.patient_name}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Original Total: <span className="font-semibold text-gray-800 dark:text-white">${parseFloat(selectedBill?.total || 0).toFixed(2)}</span>
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedBill(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary hover-glow-primary"
              >
                Update Bill
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBill(null);
            setPaymentData({ payment_method: 'cash', transaction_id: '' });
          }}
          title={`Process Payment - Bill #${selectedBill?.bill_id}`}
          size="md"
        >
          <form onSubmit={handleMarkPaid} className="space-y-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800"
            >
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Patient</p>
              <p className="font-semibold text-lg text-gray-800 dark:text-white">{selectedBill?.patient_name}</p>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">Amount Due</p>
              <p className="font-bold text-2xl text-primary-600 dark:text-primary-400">
                ${parseFloat(selectedBill?.total || 0).toFixed(2)}
              </p>
            </motion.div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                required
                className="input"
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="insurance">Insurance</option>
                <option value="check">Check</option>
                <option value="online">Online Transfer</option>
              </select>
            </div>

            {paymentData.payment_method !== 'cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Transaction ID / Reference Number
                </label>
                <input
                  type="text"
                  value={paymentData.transaction_id}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, transaction_id: e.target.value }))}
                  className="input"
                  placeholder="Enter transaction reference"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBill(null);
                  setPaymentData({ payment_method: 'cash', transaction_id: '' });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-success hover-glow-success"
              >
                <FaMoneyBillWave className="inline mr-2" />
                Confirm Payment
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Bill Details Modal */}
        {selectedBill && !showEditForm && !showPaymentModal && (
          <Modal
            isOpen={!!selectedBill}
            onClose={() => setSelectedBill(null)}
            title={`Bill Details #${selectedBill.bill_id}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Patient</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{selectedBill.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Status</p>
                  <span className={`badge ${
                    selectedBill.bill_status === 'paid' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {selectedBill.bill_status}
                  </span>
                </div>
              </div>

              {selectedBill.items && selectedBill.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Line Items</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr>
                        <th className="text-left p-2 text-gray-700 dark:text-slate-300">Service</th>
                        <th className="text-center p-2 text-gray-700 dark:text-slate-300">Qty</th>
                        <th className="text-right p-2 text-gray-700 dark:text-slate-300">Price</th>
                        <th className="text-right p-2 text-gray-700 dark:text-slate-300">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-200 dark:border-slate-700">
                          <td className="p-2 text-gray-800 dark:text-white">{item.service_name}</td>
                          <td className="text-center p-2 text-gray-800 dark:text-white">{item.quantity}</td>
                          <td className="text-right p-2 text-gray-800 dark:text-white">${parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="text-right p-2 text-gray-800 dark:text-white">${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between mb-2 text-gray-700 dark:text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${parseFloat(selectedBill.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-700 dark:text-slate-300">
                  <span>Tax (5%):</span>
                  <span className="font-semibold">${parseFloat(selectedBill.tax).toFixed(2)}</span>
                </div>
                {selectedBill.discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600 dark:text-green-400">
                    <span>Discount:</span>
                    <span className="font-semibold">-${parseFloat(selectedBill.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-slate-700 pt-2 text-gray-800 dark:text-white">
                  <span>Total:</span>
                  <span className="text-primary-600 dark:text-primary-400">${parseFloat(selectedBill.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {selectedBill.bill_status === 'pending' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleEditBill(selectedBill);
                      }}
                      className="btn btn-secondary flex-1"
                    >
                      <FaEdit className="inline mr-2" />
                      Edit Bill
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPaymentModal(true)}
                      className="btn btn-success flex-1 hover-glow-success"
                    >
                      <FaMoneyBillWave className="inline mr-2" />
                      Mark as Paid
                    </motion.button>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBill(null)}
                  className="btn btn-secondary flex-1"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteBill(deleteConfirm.bill_id)}
          title="Delete Bill"
          message={`Are you sure you want to delete Bill #${deleteConfirm?.bill_id} for ${deleteConfirm?.patient_name}? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="danger"
        />
    </div>
  );
};

export default Billing;
