const db = require('../config/db');

// GET all invoices
exports.getAllInvoices = (req, res) => {
  const sql = 'SELECT * FROM Invoice';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).send('Error fetching invoices');
    }
    res.json(results);
  });
};

// GET all new (completed) invoices
exports.getAllOldInvoices = (req, res) => {
  const sql = `
  SELECT  
      i.InvoiceID, 
      i.QuoteID, 
      CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName, 
      CONCAT(c.Address, ', ', c.City, ', ', c.State, ', ', c.ZipCode) AS Address,
      i.InvoiceDate, 
      i.DueDate, 
      i.TotalAmount, 
      i.PaidAmount, 
      i.PaymentStatus, 
      i.PaymentMethod
  FROM Invoice i
  JOIN Quotes q ON i.QuoteID = q.QuoteID
  JOIN Customer c ON q.CustomerID = c.CustomerID 
  WHERE q.Status IN ("Completed");
`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).send('Error fetching invoices');
    }

    if (results.length === 0) {
      // If no invoices are found
      return res.status(404).send('No completed invoices found');
    }

    // If invoices are found, return them as JSON
    res.json(results);
  });
};
// GET all new (completed) invoices
exports.getAllNewInvoices = (req, res) => {
  const sql = `
  SELECT  
      i.InvoiceID, 
      i.QuoteID, 
      CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName, 
      CONCAT(c.Address, ', ', c.City, ', ', c.State, ', ', c.ZipCode) AS Address,
      i.InvoiceDate, 
      i.DueDate, 
      i.TotalAmount, 
      i.PaidAmount, 
      i.PaymentStatus, 
      i.PaymentMethod
  FROM Invoice i
  JOIN Quotes q ON i.QuoteID = q.QuoteID
  JOIN Customer c ON q.CustomerID = c.CustomerID 
  WHERE q.Status NOT IN ("Completed");
`;

  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).send('Error fetching invoices');
    }

    if (results.length === 0) {
      // If no invoices are found
      return res.status(404).send('No completed invoices found');
    }

    // If invoices are found, return them as JSON
    res.json(results);
  });
};
// GET a specific invoice by InvoiceID
exports.getInvoiceById = (req, res) => {
  const invoiceId = req.params.id;
  const sql = 'SELECT * FROM Invoice WHERE InvoiceID = ?';
  db.query(sql, [invoiceId], (err, result) => {
    if (err) {
      console.error('Error fetching invoice:', err);
      return res.status(500).send('Error fetching invoice');
    }
    if (result.length === 0) {
      return res.status(404).send('Invoice not found');
    }
    res.json(result[0]);
  });
};

// POST a new invoice
exports.createInvoice = (req, res) => {
  const newInvoice = req.body;
  const sql = 'INSERT INTO Invoice SET ?';
  db.query(sql, newInvoice, (err, result) => {
    if (err) {
      console.error('Error adding invoice:', err);
      return res.status(500).send('Error adding invoice');
    }
    res.json({ message: 'Invoice created', invoiceId: result.insertId });
  });
};

// PUT to update an invoice
exports.updateInvoice = (req, res) => {
  const invoiceId = req.params.id;
  const { DueDate, PaidAmount, PaymentStatus, PaymentMethod } = req.body;

  // Construct the SQL query to update specific fields
  const sql = 'UPDATE Invoice SET DueDate = ?, PaidAmount = ?, PaymentStatus = ?, PaymentMethod = ? WHERE InvoiceID = ?';

  db.query(sql, [DueDate, PaidAmount, PaymentStatus,PaymentMethod, invoiceId], (err, result) => {
    if (err) {
      console.error('Error updating invoice:', err);
      return res.status(500).send('Error updating invoice');
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send('Invoice not found');
    }
    
    res.send('Invoice updated');
  });
};


// Soft-delete an invoice by setting IsDeleted to true
exports.deleteInvoice = (req, res) => {
  const invoiceId = req.params.id;
  const sql = 'UPDATE Invoice SET IsDeleted = 1 WHERE InvoiceID = ?';
  
  db.query(sql, [invoiceId], (err, result) => {
    if (err) {
      console.error('Error soft-deleting invoice:', err);
      return res.status(500).send('Error soft-deleting invoice');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Invoice not found');
    }
    res.send('Invoice soft-deleted');
  });
};
