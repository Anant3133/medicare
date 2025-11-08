// generate_password_hashes.js
// Script to generate bcrypt hashes for mock user passwords
// Run this to get properly hashed passwords for insert_mock_data.sql

const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 Generating Password Hashes for Mock Data');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`Password: "${password}"`);
console.log(`Salt Rounds: ${saltRounds}\n`);

// Generate multiple hashes (bcrypt generates unique hash each time)
const hashCount = 13; // Number of users in mock data

console.log('Generating hashes...\n');

async function generateHashes() {
  const hashes = [];
  
  for (let i = 0; i < hashCount; i++) {
    const hash = await bcrypt.hash(password, saltRounds);
    hashes.push(hash);
    console.log(`Hash ${i + 1}: ${hash}`);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Hash Generation Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📝 SQL INSERT Statements:\n');
  
  const users = [
    { username: 'admin', role: 'admin', email: 'admin@medicare.com', name: 'System Administrator' },
    { username: 'admin2', role: 'admin', email: 'admin2@medicare.com', name: 'Sarah Johnson' },
    { username: 'doctor1', role: 'doctor', email: 'dr.smith@medicare.com', name: 'Dr. John Smith' },
    { username: 'doctor2', role: 'doctor', email: 'dr.patel@medicare.com', name: 'Dr. Priya Patel' },
    { username: 'doctor3', role: 'doctor', email: 'dr.chen@medicare.com', name: 'Dr. Wei Chen' },
    { username: 'doctor4', role: 'doctor', email: 'dr.garcia@medicare.com', name: 'Dr. Maria Garcia' },
    { username: 'doctor5', role: 'doctor', email: 'dr.kumar@medicare.com', name: 'Dr. Raj Kumar' },
    { username: 'staff1', role: 'staff', email: 'staff1@medicare.com', name: 'Emily Davis' },
    { username: 'staff2', role: 'staff', email: 'staff2@medicare.com', name: 'Michael Brown' },
    { username: 'staff3', role: 'staff', email: 'staff3@medicare.com', name: 'Lisa Anderson' },
    { username: 'billing1', role: 'billing', email: 'billing1@medicare.com', name: 'Robert Wilson' },
    { username: 'billing2', role: 'billing', email: 'billing2@medicare.com', name: 'Jennifer Martinez' },
  ];
  
  console.log("INSERT INTO users (username, password_hash, role, email, full_name, is_active) VALUES");
  
  users.forEach((user, index) => {
    const comma = index < users.length - 1 ? ',' : ';';
    console.log(`('${user.username}', '${hashes[index]}', '${user.role}', '${user.email}', '${user.name}', true)${comma}`);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Copy the SQL statements above and update');
  console.log('insert_mock_data.sql file in the USERS section');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

generateHashes().catch(console.error);
