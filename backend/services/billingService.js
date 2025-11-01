// backend/services/billingService.js
// Business logic for billing operations
// Demonstrates: Complex calculations, service layer pattern

const { transaction, query } = require('../config/db');

/**
 * Calculate bill for admission with all services
 */
const calculateCompleteBill = async (admissionId) => {
  const result = await query(
    `SELECT 
      a.admission_id,
      a.admitted_on,
      a.discharged_on,
      COALESCE(EXTRACT(DAY FROM (COALESCE(a.discharged_on, now()) - a.admitted_on)), 1) as days,
      b.bed_type,
      p.patient_id,
      p.full_name
     FROM admissions a
     JOIN patients p ON a.patient_id = p.patient_id
     LEFT JOIN beds b ON a.bed_id = b.bed_id
     WHERE a.admission_id = $1`,
    [admissionId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Admission not found');
  }
  
  const admission = result.rows[0];
  const days = Math.ceil(admission.days);
  
  // Calculate room charges based on bed type
  const roomChargePerDay = {
    'icu': 3000,
    'normal': 1000,
    'pediatric': 1200,
    'maternity': 1500
  };
  
  const dailyCharge = roomChargePerDay[admission.bed_type] || 1000;
  const roomCharges = dailyCharge * days;
  
  return {
    admissionId,
    days,
    roomCharges,
    bedType: admission.bed_type,
    patientName: admission.full_name
  };
};

/**
 * Generate complete bill with all line items
 */
const generateCompleteBill = async (admissionId, additionalServices = []) => {
  return transaction(async (client) => {
    // Calculate base charges
    const billCalc = await calculateCompleteBill(admissionId);
    
    // Get room service
    const roomService = await client.query(
      `SELECT service_id FROM services WHERE name = 'Room Charges' LIMIT 1`
    );
    
    let amount = billCalc.roomCharges;
    
    // Create bill
    const tax = amount * 0.05; // 5% tax
    const billResult = await client.query(
      `INSERT INTO bills (admission_id, amount, tax, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING bill_id`,
      [admissionId, amount, tax]
    );
    
    const billId = billResult.rows[0].bill_id;
    
    // Add room charges as line item
    if (roomService.rows.length > 0) {
      await client.query(
        `INSERT INTO bill_items (bill_id, service_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [billId, roomService.rows[0].service_id, billCalc.days, billCalc.roomCharges / billCalc.days]
      );
    }
    
    // Add additional services
    for (const service of additionalServices) {
      await client.query(
        `INSERT INTO bill_items (bill_id, service_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [billId, service.service_id, service.quantity, service.unit_price]
      );
      
      amount += service.quantity * service.unit_price;
    }
    
    // Update bill amount if services were added
    if (additionalServices.length > 0) {
      const newTax = amount * 0.05;
      await client.query(
        `UPDATE bills SET amount = $1, tax = $2 WHERE bill_id = $3`,
        [amount, newTax, billId]
      );
    }
    
    return billId;
  });
};

module.exports = {
  calculateCompleteBill,
  generateCompleteBill
};
