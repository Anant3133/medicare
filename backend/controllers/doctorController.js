// backend/controllers/doctorController.js
// Doctor management controller

const { query } = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errorHandler');

/**
 * Get all doctors
 * GET /api/doctors
 */
exports.getAllDoctors = asyncHandler(async (req, res) => {
  const { dept_id, specialization } = req.query;
  
  let sql = `
    SELECT d.*, dept.name as department_name
    FROM doctors d
    LEFT JOIN departments dept ON d.dept_id = dept.dept_id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;
  
  if (dept_id) {
    paramCount++;
    sql += ` AND d.dept_id = $${paramCount}`;
    params.push(dept_id);
  }
  
  if (specialization) {
    paramCount++;
    sql += ` AND d.specialization ILIKE $${paramCount}`;
    params.push(`%${specialization}%`);
  }
  
  sql += ` ORDER BY d.name`;
  
  const result = await query(sql, params);
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Get doctor by ID
 * GET /api/doctors/:id
 */
exports.getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await query(
    `SELECT d.*, dept.name as department_name, dept.description as department_description
     FROM doctors d
     LEFT JOIN departments dept ON d.dept_id = dept.dept_id
     WHERE d.doctor_id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Doctor not found', 404);
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Get doctor's patients (active admissions)
 * GET /api/doctors/:id/patients
 */
exports.getDoctorPatients = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await query(
    `SELECT a.admission_id, a.admitted_on, a.priority, a.diagnosis,
            p.patient_id, p.full_name as patient_name, p.phone, p.gender, p.age,
            b.bed_number, r.room_number, r.floor
     FROM admissions a
     JOIN patients p ON a.patient_id = p.patient_id
     LEFT JOIN beds b ON a.bed_id = b.bed_id
     LEFT JOIN rooms r ON b.room_id = r.room_id
     WHERE a.doctor_id = $1 AND a.admission_status = 'active'
     ORDER BY a.priority ASC, a.admitted_on ASC`,
    [id]
  );
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Get doctor workload
 * GET /api/doctors/:id/workload
 */
exports.getDoctorWorkload = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await query(
    `SELECT * FROM v_doctor_workload WHERE doctor_id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Doctor not found', 404);
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Get all doctor workloads
 * GET /api/doctors/workload/all
 */
exports.getAllDoctorWorkloads = asyncHandler(async (req, res) => {
  const result = await query(`SELECT * FROM v_doctor_workload`);
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Create new doctor
 * POST /api/doctors
 */
exports.createDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, dept_id, phone, email } = req.body;
  
  if (!name || !specialization || !dept_id) {
    throw new AppError('Please provide name, specialization, and dept_id', 400);
  }
  
  const result = await query(
    `INSERT INTO doctors (name, specialization, dept_id, phone, email)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, specialization, dept_id, phone, email]
  );
  
  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: result.rows[0]
  });
});

/**
 * Update doctor
 * PUT /api/doctors/:id
 */
exports.updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, specialization, dept_id, phone, email } = req.body;
  
  const result = await query(
    `UPDATE doctors
     SET name = COALESCE($1, name),
         specialization = COALESCE($2, specialization),
         dept_id = COALESCE($3, dept_id),
         phone = COALESCE($4, phone),
         email = COALESCE($5, email)
     WHERE doctor_id = $6
     RETURNING *`,
    [name, specialization, dept_id, phone, email, id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Doctor not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Doctor updated successfully',
    data: result.rows[0]
  });
});

/**
 * Delete doctor
 * DELETE /api/doctors/:id
 */
exports.deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if doctor has active admissions
  const activeAdmissions = await query(
    `SELECT admission_id FROM admissions 
     WHERE doctor_id = $1 AND admission_status = 'active'`,
    [id]
  );
  
  if (activeAdmissions.rows.length > 0) {
    throw new AppError('Cannot delete doctor with active admissions', 400);
  }
  
  const result = await query(
    `DELETE FROM doctors WHERE doctor_id = $1 RETURNING doctor_id`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Doctor not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Doctor deleted successfully'
  });
});

/**
 * Get all departments
 * GET /api/doctors/departments/all
 */
exports.getAllDepartments = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT * FROM departments ORDER BY name`
  );
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});
