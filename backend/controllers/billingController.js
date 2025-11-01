// backend/controllers/billingController.js
// Billing management controller
// Demonstrates: Stored procedures for billing, complex calculations

const { query, transaction } = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errorHandler');

/**
 * Get all bills
 * GET /api/billing
 */
exports.getAllBills = asyncHandler(async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  // Use the billing summary view
  let sql = `SELECT * FROM v_billing_summary WHERE 1=1`;
  const params = [];
  let paramCount = 0;
  
  if (status) {
    paramCount++;
    sql += ` AND bill_status = $${paramCount}`;
    params.push(status);
  }
  
  paramCount++;
  sql += ` LIMIT $${paramCount}`;
  params.push(limit);
  
  paramCount++;
  sql += ` OFFSET $${paramCount}`;
  params.push(offset);
  
  const result = await query(sql, params);
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

/**
 * Get bill by ID
 * GET /api/billing/:id
 */
exports.getBillById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const billResult = await query(
    `SELECT * FROM v_billing_summary WHERE bill_id = $1`,
    [id]
  );
  
  if (billResult.rows.length === 0) {
    throw new AppError('Bill not found', 404);
  }
  
  // Get bill items
  const itemsResult = await query(
    `SELECT bi.*, s.name as service_name, s.category
     FROM bill_items bi
     JOIN services s ON bi.service_id = s.service_id
     WHERE bi.bill_id = $1`,
    [id]
  );
  
  const bill = billResult.rows[0];
  bill.items = itemsResult.rows;
  
  res.json({
    success: true,
    data: bill
  });
});

/**
 * Get bill for admission
 * GET /api/billing/admission/:admissionId
 */
exports.getBillByAdmissionId = asyncHandler(async (req, res) => {
  const { admissionId } = req.params;
  
  const result = await query(
    `SELECT * FROM v_billing_summary WHERE admission_id = $1`,
    [admissionId]
  );
  
  if (result.rows.length === 0) {
    return res.json({
      success: true,
      data: null,
      message: 'No bill found for this admission'
    });
  }
  
  // Get bill items
  const itemsResult = await query(
    `SELECT bi.*, s.name as service_name, s.category
     FROM bill_items bi
     JOIN services s ON bi.service_id = s.service_id
     WHERE bi.bill_id = $1`,
    [result.rows[0].bill_id]
  );
  
  const bill = result.rows[0];
  bill.items = itemsResult.rows;
  
  res.json({
    success: true,
    data: bill
  });
});

/**
 * Generate bill for admission (uses stored procedure)
 * POST /api/billing
 */
exports.generateBill = asyncHandler(async (req, res) => {
  const { admission_id } = req.body;
  
  if (!admission_id) {
    throw new AppError('Please provide admission_id', 400);
  }
  
  // Check if admission exists
  const admissionCheck = await query(
    `SELECT admission_id, admission_status FROM admissions WHERE admission_id = $1`,
    [admission_id]
  );
  
  if (admissionCheck.rows.length === 0) {
    throw new AppError('Admission not found', 404);
  }
  
  // Check if bill already exists
  const existingBill = await query(
    `SELECT bill_id FROM bills WHERE admission_id = $1`,
    [admission_id]
  );
  
  if (existingBill.rows.length > 0) {
    throw new AppError('Bill already exists for this admission', 400);
  }
  
  // Call stored procedure to generate bill
  const result = await query(
    `SELECT generate_bill($1) as bill_id`,
    [admission_id]
  );
  
  const billId = result.rows[0].bill_id;
  
  // Get the generated bill
  const billResult = await query(
    `SELECT * FROM v_billing_summary WHERE bill_id = $1`,
    [billId]
  );
  
  // Get bill items
  const itemsResult = await query(
    `SELECT bi.*, s.name as service_name, s.category
     FROM bill_items bi
     JOIN services s ON bi.service_id = s.service_id
     WHERE bi.bill_id = $1`,
    [billId]
  );
  
  const bill = billResult.rows[0];
  bill.items = itemsResult.rows;
  
  res.status(201).json({
    success: true,
    message: 'Bill generated successfully',
    data: bill
  });
});

/**
 * Create manual bill with items
 * POST /api/billing/manual
 */
exports.createManualBill = asyncHandler(async (req, res) => {
  const { admission_id, items, discount } = req.body;
  
  if (!admission_id || !items || items.length === 0) {
    throw new AppError('Please provide admission_id and items', 400);
  }
  
  // Create bill in a transaction
  const result = await transaction(async (client) => {
    // Calculate total amount
    let amount = 0;
    for (const item of items) {
      amount += item.quantity * item.unit_price;
    }
    
    const tax = amount * 0.05; // 5% tax
    
    // Create bill
    const billResult = await client.query(
      `INSERT INTO bills (admission_id, amount, tax, discount, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING bill_id`,
      [admission_id, amount, tax, discount || 0]
    );
    
    const billId = billResult.rows[0].bill_id;
    
    // Insert bill items
    for (const item of items) {
      await client.query(
        `INSERT INTO bill_items (bill_id, service_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [billId, item.service_id, item.quantity, item.unit_price]
      );
    }
    
    // Get complete bill
    const fullBill = await client.query(
      `SELECT * FROM v_billing_summary WHERE bill_id = $1`,
      [billId]
    );
    
    return fullBill.rows[0];
  });
  
  res.status(201).json({
    success: true,
    message: 'Bill created successfully',
    data: result
  });
});

/**
 * Mark bill as paid
 * PUT /api/billing/:id/pay
 */
exports.markBillAsPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { payment_method, transaction_id } = req.body;
  
  const result = await query(
    `UPDATE bills
     SET status = 'paid',
         paid_at = now()
     WHERE bill_id = $1 AND status = 'pending'
     RETURNING *`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Bill not found or already paid', 404);
  }
  
  res.json({
    success: true,
    message: 'Bill marked as paid',
    data: result.rows[0]
  });
});

/**
 * Update bill
 * PUT /api/billing/:id
 */
exports.updateBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { discount, status } = req.body;
  
  const result = await query(
    `UPDATE bills
     SET discount = COALESCE($1, discount),
         status = COALESCE($2, status)
     WHERE bill_id = $3
     RETURNING *`,
    [discount, status, id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Bill not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Bill updated successfully',
    data: result.rows[0]
  });
});

/**
 * Delete bill
 * DELETE /api/billing/:id
 */
exports.deleteBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Only allow deletion of pending bills
  const result = await query(
    `DELETE FROM bills WHERE bill_id = $1 AND status = 'pending' RETURNING bill_id`,
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Bill not found or cannot be deleted (only pending bills can be deleted)', 404);
  }
  
  res.json({
    success: true,
    message: 'Bill deleted successfully'
  });
});

/**
 * Get all services
 * GET /api/billing/services/all
 */
exports.getAllServices = asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  let sql = `SELECT * FROM services WHERE 1=1`;
  const params = [];
  
  if (category) {
    sql += ` AND category = $1`;
    params.push(category);
  }
  
  sql += ` ORDER BY category, name`;
  
  const result = await query(sql, params);
  
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});
