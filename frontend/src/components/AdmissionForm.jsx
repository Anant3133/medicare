import { useState, useEffect } from 'react';
import { patientAPI, doctorAPI } from '../api/api';

const AdmissionForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    bed_type: 'normal',
    priority: 5,
    diagnosis: '',
    notes: ''
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (searchPatient) {
      loadPatients();
    }
  }, [searchPatient]);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.getAll({ search: searchPatient, limit: 10 });
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await doctorAPI.getAll();
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      alert('Error creating admission: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Patient
        </label>
        <input
          type="text"
          className="input"
          placeholder="Search by name or phone..."
          value={searchPatient}
          onChange={(e) => setSearchPatient(e.target.value)}
        />
        {patients.length > 0 && (
          <select
            className="input mt-2"
            value={formData.patient_id}
            onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
            required
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.patient_id} value={p.patient_id}>
                {p.full_name} - {p.phone}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Doctor
        </label>
        <select
          className="input"
          value={formData.doctor_id}
          onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d.doctor_id} value={d.doctor_id}>
              {d.name} - {d.specialization}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bed Type
        </label>
        <select
          className="input"
          value={formData.bed_type}
          onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
        >
          <option value="normal">Normal</option>
          <option value="icu">ICU</option>
          <option value="pediatric">Pediatric</option>
          <option value="maternity">Maternity</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority (1 = Highest)
        </label>
        <select
          className="input"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
        >
          {[1, 2, 3, 4, 5].map((p) => (
            <option key={p} value={p}>Priority {p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diagnosis
        </label>
        <textarea
          className="input"
          rows="3"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          className="input"
          rows="2"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Admission'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdmissionForm;
