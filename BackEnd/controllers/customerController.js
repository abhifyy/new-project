const db = require('../config/db');

exports.getAllCustomers = async (req, res) => {
  try {
      const [customers] = await db.query(
          'SELECT CustomerID, FirstName, LastName FROM Customer'
      );
      res.json(customers);
  } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

// GET a specific customer by CustomerID
exports.getCustomerById = (req, res) => {
  const customerId = req.params.id;
  const sql = 'SELECT * FROM Customer WHERE CustomerID = ?';
  db.query(sql, [customerId], (err, result) => {
    if (err) {
      console.error('Error fetching customer:', err);
      return res.status(500).send('Error fetching customer');
    }
    if (result.length === 0) {
      return res.status(404).send('Customer not found');
    }
    res.json(result[0]);
  });
};

// POST a new customer
exports.createCustomer = (req, res) => {
  const { Email, ...newCustomer } = req.body;

  // Check if the email already exists
  const checkEmail = 'SELECT * FROM Customer WHERE Email = ?';
  db.query(checkEmail, [Email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).send('Error checking email');
    }
    if (results.length > 0) {
      return res.status(409).send('Email already exists');
    }

    // Insert the customer if the email is unique
    const sql = 'INSERT INTO Customer SET ?';
    db.query(sql, { Email, ...newCustomer }, (err, result) => {
      if (err) {
        console.error('Error adding customer:', err);
        return res.status(500).send('Error adding customer');
      }
      res.json({ message: 'Customer created', customerId: result.insertId });
    });
  });
};

// PUT to update a customer's information
exports.updateCustomer = (req, res) => {
  const customerId = req.params.id;
  const updatedCustomer = req.body;
  const sql = 'UPDATE Customer SET ? WHERE CustomerID = ?';
  db.query(sql, [updatedCustomer, customerId], (err, result) => {
    if (err) {
      console.error('Error updating customer:', err);
      return res.status(500).send('Error updating customer');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Customer not found');
    }
    res.send('Customer updated');
  });
};

// DELETE a customer by CustomerID
exports.deleteCustomer = (req, res) => {
  const customerId = req.params.id;

  // Step 1: Delete related feedback records
  const deleteFeedback = 'DELETE FROM Feedback WHERE CustomerID = ?';
  db.query(deleteFeedback, [customerId], (err) => {
    if (err) {
      console.error('Error deleting feedback records:', err);
      return res.status(500).send('Error deleting feedback records');
    }

    // Step 2: Delete related payment records
    const deletePayments = 'DELETE FROM Payments WHERE InvoiceID IN (SELECT InvoiceID FROM Invoice WHERE QuoteID IN (SELECT QuoteID FROM Quotes WHERE CustomerID = ?))';
    db.query(deletePayments, [customerId], (err) => {
      if (err) {
        console.error('Error deleting payments:', err);
        return res.status(500).send('Error deleting payments');
      }

      // Step 3: Delete related project records
      const deleteProjects = 'DELETE FROM Projects WHERE QuoteID IN (SELECT QuoteID FROM Quotes WHERE CustomerID = ?)';
      db.query(deleteProjects, [customerId], (err) => {
        if (err) {
          console.error('Error deleting projects:', err);
          return res.status(500).send('Error deleting projects');
        }

        // Step 4: Delete related invoice records
        const deleteInvoices = 'DELETE FROM Invoice WHERE QuoteID IN (SELECT QuoteID FROM Quotes WHERE CustomerID = ?)';
        db.query(deleteInvoices, [customerId], (err) => {
          if (err) {
            console.error('Error deleting invoices:', err);
            return res.status(500).send('Error deleting invoices');
          }

          // Step 5: Delete related quote records
          const deleteQuotes = 'DELETE FROM Quotes WHERE CustomerID = ?';
          db.query(deleteQuotes, [customerId], (err) => {
            if (err) {
              console.error('Error deleting quotes:', err);
              return res.status(500).send('Error deleting quotes');
            }

            // Step 6: Delete related password records (added this step)
            const deletePasswords = 'DELETE FROM Passwords WHERE CustomerID = ?';
            db.query(deletePasswords, [customerId], (err) => {
              if (err) {
                console.error('Error deleting passwords:', err);
                return res.status(500).send('Error deleting passwords');
              }

              // Step 7: Finally, delete the customer
              const deleteCustomer = 'DELETE FROM Customer WHERE CustomerID = ?';
              db.query(deleteCustomer, [customerId], (err, result) => {
                if (err) {
                  console.error('Error deleting customer:', err);
                  return res.status(500).send('Error deleting customer');
                }
                if (result.affectedRows === 0) {
                  return res.status(404).send('Customer not found');
                }
                res.send('Customer and associated feedback, payments, projects, invoices, quotes, and passwords deleted');
              });
            });
          });
        });
      });
    });
  });
};
