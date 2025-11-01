import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { billingAPI } from '../api/api';
import { FaFileInvoiceDollar, FaCheckCircle, FaClock } from 'react-icons/fa';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    loadBills();
  }, [filter]);

  const loadBills = async () => {
    try {
      const response = await billingAPI.getAll({ status: filter });
      setBills(response.data.data);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBillDetails = async (billId) => {
    try {
      const response = await billingAPI.getById(billId);
      setSelectedBill(response.data.data);
    } catch (error) {
      console.error('Error loading bill details:', error);
    }
  };

  const handleMarkPaid = async (billId) => {
    if (!confirm('Mark this bill as paid?')) return;

    try {
      await billingAPI.markPaid(billId, { payment_method: 'cash' });
      alert('Bill marked as paid!');
      setSelectedBill(null);
      loadBills();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Billing</h1>
          <p className="text-gray-600 mt-1">Manage patient bills and payments</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {['pending', 'paid', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Bills List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <FaFileInvoiceDollar className="text-6xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No {filter} bills found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bills.map((bill) => (
              <div key={bill.bill_id} className="card hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => loadBillDetails(bill.bill_id)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FaFileInvoiceDollar className="text-primary-600 text-xl" />
                      <h3 className="text-lg font-semibold">Bill #{bill.bill_id}</h3>
                      <span className={`badge ${
                        bill.bill_status === 'paid' ? 'badge-success' :
                        bill.bill_status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {bill.bill_status === 'paid' && <FaCheckCircle className="inline mr-1" />}
                        {bill.bill_status === 'pending' && <FaClock className="inline mr-1" />}
                        {bill.bill_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-600">Patient</p>
                        <p className="font-medium">{bill.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium">${parseFloat(bill.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tax</p>
                        <p className="font-medium">${parseFloat(bill.tax).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-bold text-primary-600">${parseFloat(bill.total).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-medium">
                          {new Date(bill.bill_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {bill.days_stayed && (
                      <div className="mt-3 text-sm text-gray-600">
                        Stay Duration: {bill.days_stayed} days
                      </div>
                    )}
                  </div>

                  {bill.bill_status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkPaid(bill.bill_id);
                      }}
                      className="btn btn-success ml-4"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bill Details Modal */}
        {selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={() => setSelectedBill(null)}>
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                 onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-4">Bill Details #{selectedBill.bill_id}</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Patient</p>
                    <p className="font-semibold">{selectedBill.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    <span className={`badge ${
                      selectedBill.bill_status === 'paid' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {selectedBill.bill_status}
                    </span>
                  </div>
                </div>

                {selectedBill.items && selectedBill.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Line Items</h3>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Service</th>
                          <th className="text-center p-2">Qty</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.items.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{item.service_name}</td>
                            <td className="text-center p-2">{item.quantity}</td>
                            <td className="text-right p-2">${parseFloat(item.unit_price).toFixed(2)}</td>
                            <td className="text-right p-2">${parseFloat(item.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${parseFloat(selectedBill.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax (5%):</span>
                    <span className="font-semibold">${parseFloat(selectedBill.tax).toFixed(2)}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-${parseFloat(selectedBill.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary-600">${parseFloat(selectedBill.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {selectedBill.bill_status === 'pending' && (
                  <button
                    onClick={() => handleMarkPaid(selectedBill.bill_id)}
                    className="btn btn-success flex-1"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setSelectedBill(null)}
                  className="btn btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
