const db = require('../config/db');

// GET all passwords
exports.getAllPasswords = (req, res) => {
  const sql = 'SELECT * FROM Passwords';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching passwords:', err);
      return res.status(500).send('Error fetching passwords');
    }
    res.json(results);
  });
};

// GET a specific password by CustomerID
exports.getPasswordByCustomerId = (req, res) => {
  const customerId = req.params.id;
  const sql = 'SELECT * FROM Passwords WHERE CustomerID = ?';
  db.query(sql, [customerId], (err, result) => {
    if (err) {
      console.error('Error fetching password:', err);
      return res.status(500).send('Error fetching password');
    }
    if (result.length === 0) {
      return res.status(404).send('Password not found');
    }
    res.json(result[0]);
  });
};

// POST a new password
exports.createPassword = (req, res) => {
  const newPassword = req.body;
  const sql = 'INSERT INTO Passwords SET ?';
  db.query(sql, newPassword, (err, result) => {
    if (err) {
      console.error('Error adding password:', err);
      return res.status(500).send('Error adding password');
    }
    res.json({ message: 'Password created' });
  });
};

// PUT to update a password
exports.updatePassword = (req, res) => {
  const customerId = req.params.id;
  const updatedPassword = req.body;
  const sql = 'UPDATE Passwords SET ? WHERE CustomerID = ?';
  db.query(sql, [updatedPassword, customerId], (err, result) => {
    if (err) {
      console.error('Error updating password:', err);
      return res.status(500).send('Error updating password');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Password not found');
    }
    res.send('Password updated');
  });
};

// DELETE a password by CustomerID
exports.deletePassword = (req, res) => {
  const customerId = req.params.id;
  const sql = 'DELETE FROM Passwords WHERE CustomerID = ?';
  db.query(sql, [customerId], (err, result) => {
    if (err) {
      console.error('Error deleting password:', err);
      return res.status(500).send('Error deleting password');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Password not found');
    }
    res.send('Password deleted');
  });
};


exports.adminLogin = (req, res) => {
  const { username, password } = req.body; // Extract username and password from the request body

  // SQL query to find an admin user by username (email)
  const sql = 'SELECT * FROM Employee WHERE role = "admin" AND email = ?';

  console.log('Executing SQL:', sql, 'with username:', username); // Debugging log

  // Query the database using the provided username (email)
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Error querying database');
    }

    console.log('Query results:', results); // Log the results from the database

    const user = results[0]; // Get the first user from results
    if (!user) {
      return res.json({ success: false, message: "Invalid username." });
    }

    // Construct the expected password using the retrieved user data
    const expectedPassword = `${user.name}@${user.phone_number.slice(-4)}`;
    console.log('Expected password:', expectedPassword); // Log the expected password for debugging

    // Validate the provided password against the expected password
    if (password === expectedPassword) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Invalid password." });
    }
  });
};
