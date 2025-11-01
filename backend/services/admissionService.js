// backend/services/admissionService.js
// Business logic for admission process
// Demonstrates: Service layer pattern, transaction management

const { transaction, query } = require('../config/db');

/**
 * Process complete admission workflow
 * Demonstrates: Multi-step transaction with rollback on failure
 */
const processCompleteAdmission = async (admissionData) => {
  const {
    patient_id,
    doctor_id,
    bed_type,
    priority,
    diagnosis,
    notes
  } = admissionData;
  
  return transaction(async (client) => {
    // Step 1: Find available bed with row-level locking
    const bedResult = await client.query(
      `SELECT bed_id FROM beds 
       WHERE status = 'available' AND bed_type = $1
       ORDER BY bed_id
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      [bed_type]
    );
    
    let bedId = null;
    let admissionStatus = 'waiting';
    
    if (bedResult.rows.length > 0) {
      bedId = bedResult.rows[0].bed_id;
      admissionStatus = 'active';
      
      // Step 2: Update bed status
      await client.query(
        `UPDATE beds SET status = 'occupied' WHERE bed_id = $1`,
        [bedId]
      );
    }
    
    // Step 3: Create admission record
    const admissionResult = await client.query(
      `INSERT INTO admissions 
       (patient_id, bed_id, doctor_id, admission_status, priority, diagnosis, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING admission_id`,
      [patient_id, bedId, doctor_id, admissionStatus, priority, diagnosis, notes]
    );
    
    const admissionId = admissionResult.rows[0].admission_id;
    
    // Step 4: If no bed available, add to waiting list
    if (!bedId) {
      const deptResult = await client.query(
        `SELECT dept_id FROM doctors WHERE doctor_id = $1`,
        [doctor_id]
      );
      
      if (deptResult.rows.length > 0) {
        await client.query(
          `INSERT INTO waiting_list (patient_id, dept_id, priority, notes)
           VALUES ($1, $2, $3, $4)`,
          [patient_id, deptResult.rows[0].dept_id, priority, 'Auto-added from admission']
        );
      }
    }
    
    return {
      admissionId,
      bedId,
      status: admissionStatus
    };
  });
};

/**
 * Assign bed from waiting list
 * Demonstrates: Priority queue processing
 */
const assignBedFromWaitingList = async (bedId, bedType) => {
  return transaction(async (client) => {
    // Lock the bed
    const bedCheck = await client.query(
      `SELECT bed_id, status FROM beds WHERE bed_id = $1 FOR UPDATE`,
      [bedId]
    );
    
    if (bedCheck.rows.length === 0 || bedCheck.rows[0].status !== 'available') {
      throw new Error('Bed is not available');
    }
    
    // Find highest priority waiting patient
    const waitingResult = await client.query(
      `SELECT w.wait_id, w.patient_id, w.dept_id, w.priority
       FROM waiting_list w
       WHERE w.status = 'waiting'
       ORDER BY w.priority ASC, w.requested_on ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`
    );
    
    if (waitingResult.rows.length === 0) {
      return null; // No waiting patients
    }
    
    const waiting = waitingResult.rows[0];
    
    // Create admission
    const admissionResult = await client.query(
      `INSERT INTO admissions (patient_id, bed_id, admission_status, priority)
       VALUES ($1, $2, 'active', $3)
       RETURNING admission_id`,
      [waiting.patient_id, bedId, waiting.priority]
    );
    
    // Update bed status
    await client.query(
      `UPDATE beds SET status = 'occupied' WHERE bed_id = $1`,
      [bedId]
    );
    
    // Update waiting list
    await client.query(
      `UPDATE waiting_list 
       SET status = 'assigned', assigned_on = now()
       WHERE wait_id = $1`,
      [waiting.wait_id]
    );
    
    return {
      admissionId: admissionResult.rows[0].admission_id,
      patientId: waiting.patient_id,
      bedId
    };
  });
};

module.exports = {
  processCompleteAdmission,
  assignBedFromWaitingList
};
