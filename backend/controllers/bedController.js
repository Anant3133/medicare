// backend/controllers/bedController.js
// Bed management controller
// Demonstrates: Concurrency control, status management

const { query } = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errorHandler');

/**
 * Get all beds with room information
 * GET /api/beds
 */
exports.getAllBeds = asyncHandler(async (req, res) => {
  const { status, type, floor } = req.query;
  
  // Use the view for occupancy information
  let sql = `SELECT * FROM v_bed_occupancy WHERE 1=1`;
  const params = [];
  let paramCount = 0;
  
  if (status) {
    paramCount++;
    sql += ` AND status = $${paramCount}`;
    params.push(status);
  }
  
  if (type) {
    paramCount++;
    sql += ` AND bed_type = $${paramCount}`;
    params.push(type);
  }
  
  if (floor) {
    paramCount++;
    sql += ` AND floor = $${paramCount}`;
    params.push(parseInt(floor));
  }
  
  sql += ` ORDER BY floor, room_number, bed_number`;
  
  const result = await query(sql, params);
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Get available beds (using stored function)
 * GET /api/beds/available
 */
exports.getAvailableBeds = asyncHandler(async (req, res) => {
  const { type } = req.query;
  
  // Call the stored function we created
  const result = await query(
    `SELECT * FROM get_available_beds($1)`,
    [type || null]
  );
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Get bed occupancy statistics
 * GET /api/beds/stats
 */
exports.getBedStats = asyncHandler(async (req, res) => {
  // Call the stored function for statistics
  const result = await query(`SELECT * FROM get_bed_occupancy_stats()`);
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Get bed by ID
 * GET /api/beds/:id
 */
exports.getBedById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await query(
    `SELECT * FROM v_bed_occupancy WHERE bed_id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Bed not found', 404);
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Create new bed
 * POST /api/beds
 */
exports.createBed = asyncHandler(async (req, res) => {
  const { bed_number, room_id, bed_type, status } = req.body;
  
  if (!bed_number || !room_id || !bed_type) {
    throw new AppError('Please provide bed_number, room_id, and bed_type', 400);
  }
  
  const result = await query(
    `INSERT INTO beds (bed_number, room_id, bed_type, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [bed_number, room_id, bed_type, status || 'available']
  );
  
  res.status(201).json({
    success: true,
    message: 'Bed created successfully',
    data: result.rows[0]
  });
});

/**
 * Update bed status
 * PUT /api/beds/:id/status
 */
exports.updateBedStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    throw new AppError('Please provide status', 400);
  }
  
  // Validate status
  const validStatuses = ['available', 'occupied', 'maintenance', 'reserved'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status value', 400);
  }
  
  // Check if bed is currently occupied by an active admission
  if (status !== 'occupied') {
    const occupiedCheck = await query(
      `SELECT a.admission_id 
       FROM admissions a
       WHERE a.bed_id = $1 AND a.admission_status = 'active'`,
      [id]
    );
    
    if (occupiedCheck.rows.length > 0) {
      throw new AppError('Cannot change status: bed is occupied by an active admission', 400);
    }
  }
  
  const result = await query(
    `UPDATE beds
     SET status = $1,
         last_maintenance = CASE WHEN $1 = 'maintenance' THEN now() ELSE last_maintenance END
     WHERE bed_id = $2
     RETURNING *`,
    [status, id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Bed not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Bed status updated successfully',
    data: result.rows[0]
  });
});

/**
 * Update bed details
 * PUT /api/beds/:id
 */
exports.updateBed = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { bed_number, bed_type, room_id } = req.body;
  
  const result = await query(
    `UPDATE beds
     SET bed_number = COALESCE($1, bed_number),
         bed_type = COALESCE($2, bed_type),
         room_id = COALESCE($3, room_id)
     WHERE bed_id = $4
     RETURNING *`,
    [bed_number, bed_type, room_id, id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Bed not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Bed updated successfully',
    data: result.rows[0]
  });
});

/**
 * Delete bed
 * DELETE /api/beds/:id
 */
exports.deleteBed = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if bed is currently occupied
  const occupiedCheck = await query(
    `SELECT admission_id FROM admissions 
     WHERE bed_id = $1 AND admission_status = 'active'`,
    [id]
  );
  
  if (occupiedCheck.rows.length > 0) {
    throw new AppError('Cannot delete bed that is currently occupied', 400);
  }
  
  const result = await query(
    `DELETE FROM beds WHERE bed_id = $1 RETURNING bed_id`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Bed not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Bed deleted successfully'
  });
});
