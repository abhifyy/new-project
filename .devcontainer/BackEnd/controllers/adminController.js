// controllers/adminController.js
const db = require('../config/db');

const adminController = {
    // Existing functions
    login: async (req, res) => {
        const { customerId, password } = req.body;
        try {
            // First check if this is an admin customer
            const [customer] = await db.query(
                'SELECT c.*, p.PasswordHash FROM Customers c ' +
                'JOIN Passwords p ON c.CustomerID = p.CustomerID ' +
                'WHERE c.CustomerID = ?',
                [customerId]
            );

            if (customer.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }

            // For now, direct comparison since we're using stored hash
            // In production, you should use proper password hashing comparison
            if (customer[0].PasswordHash === password) {
                // Set session data
                req.session.isAdmin = true;
                req.session.customerId = customer[0].CustomerID;
                req.session.lastActivity = Date.now();

                res.json({ 
                    success: true, 
                    message: 'Login successful'
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }
    },
    
    // Enhanced logout
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error during logout' 
                });
            }
            res.clearCookie(process.env.SESSION_NAME);
            res.json({ 
                success: true, 
                message: 'Logged out successfully' 
            });
        });
    },

    // Add missing functions
    getActiveJobs: async (req, res) => {
        try {
            const [jobs] = await db.query(`
                SELECT q.QuoteID, q.CustomerID, c.FirstName, c.LastName, 
                       q.QuoteDate, q.TotalAmount, q.Status,
                       q.MaterialType, q.FenceLength
                FROM Quotes q
                JOIN Customers c ON q.CustomerID = c.CustomerID
                WHERE q.Status = 'Active'
                ORDER BY q.QuoteDate DESC
            `);
            res.json(jobs);
        } catch (error) {
            console.error('Error fetching active jobs:', error);
            res.status(500).json({ success: false, message: 'Error fetching active jobs' });
        }
    },

    getCompletedJobs: async (req, res) => {
        try {
            const [jobs] = await db.query(`
                SELECT q.QuoteID, q.CustomerID, c.FirstName, c.LastName,
                       i.InvoiceID, i.TotalAmount, i.PaymentStatus,
                       q.MaterialType, q.FenceLength
                FROM Quotes q
                JOIN Customers c ON q.CustomerID = c.CustomerID
                JOIN Invoice i ON q.QuoteID = i.QuoteID
                WHERE q.Status = 'Completed'
                ORDER BY i.InvoiceDate DESC
            `);
            res.json(jobs);
        } catch (error) {
            console.error('Error fetching completed jobs:', error);
            res.status(500).json({ success: false, message: 'Error fetching completed jobs' });
        }
    },

    updateJobStatus: async (req, res) => {
        const { quoteId, status } = req.body;
        try {
            await db.query('UPDATE Quotes SET Status = ? WHERE QuoteID = ?', [status, quoteId]);
            res.json({ success: true, message: 'Job status updated successfully' });
        } catch (error) {
            console.error('Error updating job status:', error);
            res.status(500).json({ success: false, message: 'Error updating job status' });
        }
    },

    getDashboardSummary: async (req, res) => {
        try {
            const [summary] = await db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM Quotes WHERE Status = 'Active') as activeJobs,
                    (SELECT COUNT(*) FROM Quotes WHERE Status = 'Completed') as completedJobs,
                    (SELECT COUNT(*) FROM Invoice WHERE PaymentStatus = 'Pending') as pendingPayments,
                    (SELECT SUM(TotalAmount) FROM Invoice WHERE PaymentStatus = 'Paid') as totalRevenue
            `);
            res.json(summary[0]);
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            res.status(500).json({ success: false, message: 'Error fetching dashboard summary' });
        }
    }
};

module.exports = adminController;
