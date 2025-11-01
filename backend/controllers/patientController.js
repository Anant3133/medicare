// backend/controllers/patientController.js
// Patient management controller
// Demonstrates: CRUD operations with parameterized queries

const { query } = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errorHandler');

/**
 * Get all patients
 * GET /api/patients
 */
exports.getAllPatients = asyncHandler(async (req, res) => {
  const { search, limit = 50, offset = 0 } = req.query;
  
  let sql = `
    SELECT patient_id, full_name, dob, gender, phone, address, 
           emergency_contact, blood_group, created_at
    FROM patients
  `;
  const params = [];
  
  // Add search filter if provided
  if (search) {
    sql += ` WHERE full_name ILIKE $1 OR phone ILIKE $1`;
    params.push(`%${search}%`);
    sql += ` ORDER BY full_name LIMIT $2 OFFSET $3`;
    params.push(limit, offset);
  } else {
    sql += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
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
 * Get patient by ID
 * GET /api/patients/:id
 */
exports.getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await query(
    `SELECT * FROM patients WHERE patient_id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Patient not found', 404);
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Get patient with admission history
 * GET /api/patients/:id/history
 */
exports.getPatientHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Use the view we created
  const result = await query(
    `SELECT * FROM v_patient_history WHERE patient_id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Patient not found', 404);
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Create new patient
 * POST /api/patients
 */
exports.createPatient = asyncHandler(async (req, res) => {
  const {
    full_name,
    dob,
    gender,
    phone,
    address,
    emergency_contact,
    blood_group
  } = req.body;
  
  // Validation
  if (!full_name || !phone) {
    throw new AppError('Please provide full name and phone number', 400);
  }
  
  // Demonstrates parameterized INSERT query
  const result = await query(
    `INSERT INTO patients (full_name, dob, gender, phone, address, emergency_contact, blood_group)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [full_name, dob, gender, phone, address, emergency_contact, blood_group]
  );
  
  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: result.rows[0]
  });
});

/**
 * Update patient
 * PUT /api/patients/:id
 */
exports.updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    dob,
    gender,
    phone,
    address,
    emergency_contact,
    blood_group
  } = req.body;
  
  // Check if patient exists
  const checkResult = await query(
    `SELECT patient_id FROM patients WHERE patient_id = $1`,
    [id]
  );
  
  if (checkResult.rows.length === 0) {
    throw new AppError('Patient not found', 404);
  }
  
  // Demonstrates parameterized UPDATE query
  const result = await query(
    `UPDATE patients
     SET full_name = COALESCE($1, full_name),
         dob = COALESCE($2, dob),
         gender = COALESCE($3, gender),
         phone = COALESCE($4, phone),
         address = COALESCE($5, address),
         emergency_contact = COALESCE($6, emergency_contact),
         blood_group = COALESCE($7, blood_group)
     WHERE patient_id = $8
     RETURNING *`,
    [full_name, dob, gender, phone, address, emergency_contact, blood_group, id]
  );
  
  res.json({
    success: true,
    message: 'Patient updated successfully',
    data: result.rows[0]
  });
});

/**
 * Delete patient
 * DELETE /api/patients/:id
 */
exports.deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if patient has active admissions
  const activeAdmissions = await query(
    `SELECT admission_id FROM admissions 
     WHERE patient_id = $1 AND admission_status = 'active'`,
    [id]
  );
  
  if (activeAdmissions.rows.length > 0) {
    throw new AppError('Cannot delete patient with active admissions', 400);
  }
  
  // Demonstrates parameterized DELETE query
  const result = await query(
    `DELETE FROM patients WHERE patient_id = $1 RETURNING patient_id`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Patient not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Patient deleted successfully'
  });
});
