// db.js
const mysql = require('mysql2/promise'); // Use the promise-based version

const pool = mysql.createPool({
  host: 'bluerynodb-restored.cj02o08agyaa.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'admin123',
  database: 'BlueRynoProjectDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; // Export the promise-based pool directly
