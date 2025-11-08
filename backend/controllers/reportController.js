// backend/controllers/reportController.js
// Reporting and analytics controller
// Demonstrates: Views, aggregate queries, analytics

const { query } = require('../config/db');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * Get bed occupancy report
 * GET /api/reports/occupancy
 */
exports.getOccupancyReport = asyncHandler(async (req, res) => {
  const { floor } = req.query;
  
  let sql = `SELECT * FROM v_room_statistics WHERE 1=1`;
  const params = [];
  
  if (floor) {
    sql += ` AND floor = $1`;
    params.push(parseInt(floor));
  }
  
  sql += ` ORDER BY floor, room_number`;
  
  const result = await query(sql, params);
  
  // Get overall statistics
  const statsResult = await query(`SELECT * FROM get_bed_occupancy_stats()`);
  
  res.json({
    success: true,
    data: {
      overall: statsResult.rows[0],
      by_room: result.rows
    }
  });
});

/**
 * Get revenue report
 * GET /api/reports/revenue
 */
exports.getRevenueReport = asyncHandler(async (req, res) => {
  const { start_date, end_date, limit = 30 } = req.query;
  
  let sql = `SELECT * FROM v_revenue_report WHERE 1=1`;
  const params = [];
  let paramCount = 0;
  
  if (start_date) {
    paramCount++;
    sql += ` AND bill_date >= $${paramCount}`;
    params.push(start_date);
  }
  
  if (end_date) {
    paramCount++;
    sql += ` AND bill_date <= $${paramCount}`;
    params.push(end_date);
  }
  
  paramCount++;
  sql += ` ORDER BY bill_date DESC LIMIT $${paramCount}`;
  params.push(limit);
  
  const result = await query(sql, params);
  
  // Calculate summary
  const summary = result.rows.reduce((acc, row) => {
    acc.total_bills += parseInt(row.total_bills);
    acc.total_amount += parseFloat(row.total_amount);
    acc.revenue_collected += parseFloat(row.revenue_collected);
    acc.revenue_pending += parseFloat(row.revenue_pending);
    return acc;
  }, {
    total_bills: 0,
    total_amount: 0,
    revenue_collected: 0,
    revenue_pending: 0
  });
  
  res.json({
    success: true,
    data: {
      summary,
      daily_breakdown: result.rows
    }
  });
});

/**
 * Get waiting list report
 * GET /api/reports/waiting-list
 */
exports.getWaitingListReport = asyncHandler(async (req, res) => {
  const result = await query(`SELECT * FROM v_waiting_list`);
  
  // Group by department
  const byDepartment = {};
  result.rows.forEach(row => {
    if (!byDepartment[row.department]) {
      byDepartment[row.department] = [];
    }
    byDepartment[row.department].push(row);
  });
  
  res.json({
    success: true,
    data: {
      total_waiting: result.rows.length,
      by_department: byDepartment,
      all_patients: result.rows
    }
  });
});

/**
 * Get doctor workload report
 * GET /api/reports/doctor-workload
 */
exports.getDoctorWorkloadReport = asyncHandler(async (req, res) => {
  const result = await query(`SELECT * FROM v_doctor_workload`);
  
  // Calculate summary
  const summary = {
    total_doctors: result.rows.length,
    total_active_patients: result.rows.reduce((sum, row) => sum + parseInt(row.active_patients), 0),
    avg_patients_per_doctor: 0
  };
  
  summary.avg_patients_per_doctor = summary.total_doctors > 0 
    ? (summary.total_active_patients / summary.total_doctors).toFixed(2) 
    : 0;
  
  res.json({
    success: true,
    data: {
      summary,
      doctors: result.rows
    }
  });
});

/**
 * Get department statistics
 * GET /api/reports/departments
 */
exports.getDepartmentReport = asyncHandler(async (req, res) => {
  // Refresh materialized view first
  await query(`REFRESH MATERIALIZED VIEW mv_department_statistics`);
  
  const result = await query(
    `SELECT * FROM mv_department_statistics ORDER BY total_admissions DESC`
  );
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Get admission trends
 * GET /api/reports/admission-trends
 */
exports.getAdmissionTrends = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const result = await query(
    `SELECT 
      DATE(admitted_on) as admission_date,
      COUNT(*) as total_admissions,
      COUNT(CASE WHEN priority <= 2 THEN 1 END) as high_priority,
      COUNT(CASE WHEN admission_status = 'discharged' THEN 1 END) as discharged
     FROM admissions
     WHERE admitted_on >= now() - INTERVAL '${parseInt(days)} days'
     GROUP BY DATE(admitted_on)
     ORDER BY admission_date DESC`
  );
  
  res.json({
    success: true,
    data: result.rows
  });
});

/**
 * Get audit log (recent changes)
 * GET /api/reports/audit-log
 */
exports.getAuditLog = asyncHandler(async (req, res) => {
  const { table_name, operation, limit = 100 } = req.query;
  
  let sql = `
    SELECT audit_id, table_name, record_id, operation, 
           changed_by, changed_at, old_data, new_data
    FROM audit_log
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;
  
  if (table_name) {
    paramCount++;
    sql += ` AND table_name = $${paramCount}`;
    params.push(table_name);
  }
  
  if (operation) {
    paramCount++;
    sql += ` AND operation = $${paramCount}`;
    params.push(operation);
  }
  
  paramCount++;
  sql += ` ORDER BY changed_at DESC LIMIT $${paramCount}`;
  params.push(limit);
  
  const result = await query(sql, params);
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Get dashboard summary
 * GET /api/reports/dashboard
 */
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  // Get bed stats
  const bedStats = await query(`SELECT * FROM get_bed_occupancy_stats()`);
  
  // Get active admissions count
  const activeAdmissions = await query(
    `SELECT COUNT(*) as count FROM admissions WHERE admission_status = 'active'`
  );
  
  // Get waiting list count
  const waitingList = await query(
    `SELECT COUNT(*) as count FROM waiting_list WHERE status = 'waiting'`
  );
  
  // Get pending bills
  const pendingBills = await query(
    `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as amount 
     FROM bills WHERE status = 'pending'`
  );
  
  // Get today's admissions
  const todayAdmissions = await query(
    `SELECT COUNT(*) as count FROM admissions 
     WHERE DATE(admitted_on) = CURRENT_DATE`
  );
  
  // Get today's discharges
  const todayDischarges = await query(
    `SELECT COUNT(*) as count FROM admissions 
     WHERE DATE(discharged_on) = CURRENT_DATE`
  );
  
  res.json({
    success: true,
    data: {
      beds: bedStats.rows[0],
      active_admissions: parseInt(activeAdmissions.rows[0].count),
      waiting_list: parseInt(waitingList.rows[0].count),
      pending_bills: {
        count: parseInt(pendingBills.rows[0].count),
        amount: parseFloat(pendingBills.rows[0].amount)
      },
      today: {
        admissions: parseInt(todayAdmissions.rows[0].count),
        discharges: parseInt(todayDischarges.rows[0].count)
      }
    }
  });
});

/**
 * Add patient to waiting list
 * POST /api/reports/waiting-list
 */
exports.addToWaitingList = asyncHandler(async (req, res) => {
  const { patient_id, dept_id, priority, notes } = req.body;
  
  // Validate required fields
  if (!patient_id || !dept_id) {
    return res.status(400).json({
      success: false,
      message: 'Patient ID and Department ID are required'
    });
  }
  
  // Insert into waiting_list
  const result = await query(
    `INSERT INTO waiting_list (patient_id, dept_id, priority, notes, status)
     VALUES ($1, $2, $3, $4, 'waiting')
     RETURNING wait_id, patient_id, dept_id, requested_on, priority, status, notes`,
    [patient_id, dept_id, priority || 3, notes || null]
  );
  
  res.status(201).json({
    success: true,
    message: 'Patient added to waiting list successfully',
    data: result.rows[0]
  });
});

