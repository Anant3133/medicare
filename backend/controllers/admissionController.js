// backend/controllers/admissionController.js
// Admission management controller
// Demonstrates: Transactions, stored procedures, complex business logic

const { query, transaction } = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errorHandler');

/**
 * Get all admissions
 * GET /api/admissions
 */
exports.getAllAdmissions = asyncHandler(async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  // Use the view we created for active admissions
  let sql = `SELECT * FROM v_active_admissions`;
  const params = [];
  
  if (status && status !== 'active') {
    sql = `
      SELECT a.*, p.full_name as patient_name, d.name as doctor_name,
             b.bed_number, r.room_number
      FROM admissions a
      JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN beds b ON a.bed_id = b.bed_id
      LEFT JOIN rooms r ON b.room_id = r.room_id
      WHERE a.admission_status = $1
      ORDER BY a.admitted_on DESC
      LIMIT $2 OFFSET $3
    `;
    params.push(status, limit, offset);
  } else if (!status) {
    sql = `
      SELECT a.*, p.full_name as patient_name, d.name as doctor_name,
             b.bed_number, r.room_number
      FROM admissions a
      JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN beds b ON a.bed_id = b.bed_id
      LEFT JOIN rooms r ON b.room_id = r.room_id
      ORDER BY a.admitted_on DESC
      LIMIT $1 OFFSET $2
    `;
    params.push(limit, offset);
  }
  
  const result = await query(sql, params);
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Get admission by ID
 * GET /api/admissions/:id
 */
exports.getAdmissionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await query(
    `SELECT a.*, 
            p.full_name as patient_name, p.phone as patient_phone,
            p.dob, p.gender, p.blood_group,
            d.name as doctor_name, d.specialization,
            b.bed_number, b.bed_type,
            r.room_number, r.floor, r.room_type
     FROM admissions a
     JOIN patients p ON a.patient_id = p.patient_id
     LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
     LEFT JOIN beds b ON a.bed_id = b.bed_id
     LEFT JOIN rooms r ON b.room_id = r.room_id
     WHERE a.admission_id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Admission not found', 404);
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Create new admission (uses stored procedure)
 * POST /api/admissions
 * Demonstrates: Calling stored procedures, transactions
 */
exports.createAdmission = asyncHandler(async (req, res) => {
  const {
    patient_id,
    doctor_id,
    bed_type,
    priority,
    diagnosis,
    notes
  } = req.body;
  
  // Validation
  if (!patient_id || !doctor_id || !bed_type) {
    throw new AppError('Please provide patient_id, doctor_id, and bed_type', 400);
  }
  
  // Call the stored procedure we created
  // Demonstrates: Using stored procedures for complex business logic
  const result = await query(
    `SELECT process_admission($1, $2, $3, $4, $5, $6) as admission_id`,
    [patient_id, doctor_id, bed_type, priority || 5, diagnosis, notes]
  );
  
  const admissionId = result.rows[0].admission_id;
  
  // Get the created admission details
  const admissionResult = await query(
    `SELECT a.*, 
            p.full_name as patient_name,
            d.name as doctor_name,
            b.bed_number, r.room_number
     FROM admissions a
     JOIN patients p ON a.patient_id = p.patient_id
     LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
     LEFT JOIN beds b ON a.bed_id = b.bed_id
     LEFT JOIN rooms r ON b.room_id = r.room_id
     WHERE a.admission_id = $1`,
    [admissionId]
  );
  
  res.status(201).json({
    success: true,
    message: 'Admission created successfully',
    data: admissionResult.rows[0]
  });
});

/**
 * Manual admission with bed assignment (demonstrates transaction)
 * POST /api/admissions/manual
 */
exports.createManualAdmission = asyncHandler(async (req, res) => {
  const {
    patient_id,
    bed_id,
    doctor_id,
    priority,
    diagnosis,
    notes
  } = req.body;
  
  // Validation
  if (!patient_id || !bed_id || !doctor_id) {
    throw new AppError('Please provide patient_id, bed_id, and doctor_id', 400);
  }
  
  // Demonstrates: Manual transaction handling with row-level locking
  const result = await transaction(async (client) => {
    // Lock the bed row to prevent concurrent allocation (SELECT FOR UPDATE)
    const bedCheck = await client.query(
      `SELECT bed_id, status FROM beds WHERE bed_id = $1 FOR UPDATE`,
      [bed_id]
    );
    
    if (bedCheck.rows.length === 0) {
      throw new AppError('Bed not found', 404);
    }
    
    if (bedCheck.rows[0].status !== 'available') {
      throw new AppError('Bed is not available', 400);
    }
    
    // Create admission
    const admissionResult = await client.query(
      `INSERT INTO admissions (patient_id, bed_id, doctor_id, priority, diagnosis, notes, admission_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING admission_id`,
      [patient_id, bed_id, doctor_id, priority || 5, diagnosis, notes]
    );
    
    const admissionId = admissionResult.rows[0].admission_id;
    
    // Update bed status
    await client.query(
      `UPDATE beds SET status = 'occupied' WHERE bed_id = $1`,
      [bed_id]
    );
    
    // Get full admission details
    const fullResult = await client.query(
      `SELECT a.*, 
              p.full_name as patient_name,
              d.name as doctor_name,
              b.bed_number, r.room_number
       FROM admissions a
       JOIN patients p ON a.patient_id = p.patient_id
       LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
       LEFT JOIN beds b ON a.bed_id = b.bed_id
       LEFT JOIN rooms r ON b.room_id = r.room_id
       WHERE a.admission_id = $1`,
      [admissionId]
    );
    
    return fullResult.rows[0];
  });
  
  res.status(201).json({
    success: true,
    message: 'Admission created successfully',
    data: result
  });
});

/**
 * Discharge patient
 * PUT /api/admissions/:id/discharge
 * Demonstrates: Calling stored procedures
 */
exports.dischargePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if admission exists and is active
  const checkResult = await query(
    `SELECT admission_id, admission_status FROM admissions WHERE admission_id = $1`,
    [id]
  );
  
  if (checkResult.rows.length === 0) {
    throw new AppError('Admission not found', 404);
  }
  
  if (checkResult.rows[0].admission_status === 'discharged') {
    throw new AppError('Patient already discharged', 400);
  }
  
  // Call stored procedure to discharge
  await query(`SELECT discharge_patient($1)`, [id]);
  
  // Get updated admission
  const result = await query(
    `SELECT a.*, 
            p.full_name as patient_name,
            d.name as doctor_name
     FROM admissions a
     JOIN patients p ON a.patient_id = p.patient_id
     LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
     WHERE a.admission_id = $1`,
    [id]
  );
  
  res.json({
    success: true,
    message: 'Patient discharged successfully',
    data: result.rows[0]
  });
});

/**
 * Update admission
 * PUT /api/admissions/:id
 */
exports.updateAdmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { doctor_id, priority, diagnosis, notes } = req.body;
  
  const result = await query(
    `UPDATE admissions
     SET doctor_id = COALESCE($1, doctor_id),
         priority = COALESCE($2, priority),
         diagnosis = COALESCE($3, diagnosis),
         notes = COALESCE($4, notes)
     WHERE admission_id = $5
     RETURNING *`,
    [doctor_id, priority, diagnosis, notes, id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Admission not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Admission updated successfully',
    data: result.rows[0]
  });
});
