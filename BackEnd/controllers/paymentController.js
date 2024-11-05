const db = require('../config/db');

// GET all payments
exports.getAllPayments = (req, res) => {
  const sql = 'SELECT * FROM Payments';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching payments:', err);
      return res.status(500).send('Error fetching payments');
    }
    res.json(results);
  });
};

// GET a specific payment by PaymentID
exports.getPaymentById = (req, res) => {
  const paymentId = req.params.id;
  const sql = 'SELECT * FROM Payments WHERE PaymentID = ?';
  db.query(sql, [paymentId], (err, result) => {
    if (err) {
      console.error('Error fetching payment:', err);
      return res.status(500).send('Error fetching payment');
    }
    if (result.length === 0) {
      return res.status(404).send('Payment not found');
    }
    res.json(result[0]);
  });
};

// POST a new payment
exports.createPayment = (req, res) => {
  const newPayment = req.body;
  const sql = 'INSERT INTO Payments SET ?';
  db.query(sql, newPayment, (err, result) => {
    if (err) {
      console.error('Error adding payment:', err);
      return res.status(500).send('Error adding payment');
    }
    res.json({ message: 'Payment created', paymentId: result.insertId });
  });
};

// PUT to update a payment
exports.updatePayment = (req, res) => {
  const paymentId = req.params.id;
  const updatedPayment = req.body;
  const sql = 'UPDATE Payments SET ? WHERE PaymentID = ?';
  db.query(sql, [updatedPayment, paymentId], (err, result) => {
    if (err) {
      console.error('Error updating payment:', err);
      return res.status(500).send('Error updating payment');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Payment not found');
    }
    res.send('Payment updated');
  });
};

// DELETE a payment by PaymentID
exports.deletePayment = (req, res) => {
  const paymentId = req.params.id;
  const sql = 'DELETE FROM Payments WHERE PaymentID = ?';
  db.query(sql, [paymentId], (err, result) => {
    if (err) {
      console.error('Error deleting payment:', err);
      return res.status(500).send('Error deleting payment');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Payment not found');
    }
    res.send('Payment deleted');
  });
};
