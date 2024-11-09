const db = require('../config/db');

// Existing password management functions
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

// Enhanced admin login that checks both Employee and Passwords tables
exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // First try Employee table login
        const [employees] = await db.query(
            'SELECT * FROM Employee WHERE role = "admin" AND email = ?',
            [username]
        );

        if (employees.length > 0) {
            const employee = employees[0];
            const expectedPassword = `${employee.name}@${employee.phone_number.slice(-4)}`;

            if (password === expectedPassword) {
                // Set session data for employee admin
                req.session.isAdmin = true;
                req.session.adminType = 'employee';
                req.session.adminId = employee.id;
                req.session.lastActivity = Date.now();

                return res.json({ 
                    success: true,
                    message: 'Login successful',
                    adminType: 'employee'
                });
            }
        }

        // If employee login fails, try Passwords table
        const [customers] = await db.query(
            'SELECT c.*, p.PasswordHash FROM Customers c ' +
            'JOIN Passwords p ON c.CustomerID = p.CustomerID ' +
            'WHERE c.CustomerID = ? AND p.PasswordHash = ?',
            [username, password]
        );

        if (customers.length > 0) {
            // Set session data for customer admin
            req.session.isAdmin = true;
            req.session.adminType = 'customer';
            req.session.customerId = customers[0].CustomerID;
            req.session.lastActivity = Date.now();

            return res.json({ 
                success: true,
                message: 'Login successful',
                adminType: 'customer'
            });
        }

        // If both login attempts fail
        res.json({
            success: false,
            message: "Invalid credentials."
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Add logout functionality
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error during logout' 
            });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
};