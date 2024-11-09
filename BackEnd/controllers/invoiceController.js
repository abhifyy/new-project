require('dotenv').config({path: '../.env'});
const db = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

// Add error handling for missing stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Warning: Stripe secret key is missing in environment variables.');
}


// Helper function to create Stripe Checkout session
async function createStripeCheckoutSession(invoice, customer) {
  try {
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          customer_email: customer.Email,
          line_items: [{
              price_data: {
                  currency: 'usd',
                  product_data: {
                      name: `Blue Rhyno Fencing Invoice #${invoice.InvoiceID}`,
                      description: 'Fencing Services',
                      metadata: {
                          invoice_id: invoice.InvoiceID,
                          quote_id: invoice.QuoteID
                      }
                  },
                  unit_amount: Math.round(invoice.TotalAmount * 100), // Convert to cents
              },
              quantity: 1
          }],
          metadata: {
              invoice_id: invoice.InvoiceID,
              quote_id: invoice.QuoteID
          },
          success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      });

      return session.url;
  } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
  }
}


/// GET all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM Invoice');
    res.json(results);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).send('Error fetching invoices');
  }
};


/// GET all old (completed) invoices
exports.getAllOldInvoices = async (req, res) => {
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
  WHERE i.DueDate <= CURRENT_DATE();
`;

  
  try {
    const [results] = await db.query(sql);  // Use async/await for promise-based query

    if (results.length === 0) {
      return res.status(404).send('No old invoices found');
    }

    res.json(results);  // Return results as JSON
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).send('Error fetching invoices');
  }
};

// GET all new (not completed) invoices
exports.getAllNewInvoices = async (req, res) => {
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
    WHERE i.DueDate > CURRENT_DATE();
`;

  
  try {
    const [results] = await db.query(sql);  // Use async/await for promise-based query

    if (results.length === 0) {
      return res.status(404).send('No new invoices found');
    }

    res.json(results);  // Return results as JSON
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).send('Error fetching invoices');
  }
};

/// GET a specific invoice by InvoiceID
exports.getInvoiceById = async (req, res) => {
  const invoiceId = req.params.id;
  const sql = 'SELECT * FROM Invoice WHERE InvoiceID = ?';

  try {
    const [result] = await db.query(sql, [invoiceId]); // Using async/await for promise-based query

    if (result.length === 0) {
      return res.status(404).send('Invoice not found');
    }

    res.json(result[0]); // Return the first result as JSON
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).send('Error fetching invoice');
  }
};
// Modified createInvoice to use Stripe Checkout
exports.createInvoice = async (req, res) => {
  const connection = await db.promise().getConnection();
  try {
      await connection.beginTransaction();

      const newInvoice = req.body;

      // Get customer information
      const [customerResult] = await connection.query(`
          SELECT c.* 
          FROM Customers c
          JOIN Quotes q ON q.CustomerID = c.CustomerID
          WHERE q.QuoteID = ?
      `, [newInvoice.QuoteID]);

      if (customerResult.length === 0) {
          throw new Error('Customer not found');
      }

      // Create invoice in database
      const [result] = await connection.query(
          'INSERT INTO Invoice (QuoteID, InvoiceDate, DueDate, TotalAmount, PaymentStatus) VALUES (?, ?, ?, ?, ?)',
          [newInvoice.QuoteID, newInvoice.InvoiceDate, newInvoice.DueDate, newInvoice.TotalAmount, 'pending']
      );

      const invoiceId = result.insertId;

      // Create Stripe Checkout session
      const paymentLink = await createStripeCheckoutSession(
          { ...newInvoice, InvoiceID: invoiceId },
          customerResult[0]
      );

      // Update invoice with payment link
      await connection.query(
          'UPDATE Invoice SET PaymentLink = ? WHERE InvoiceID = ?',
          [paymentLink, invoiceId]
      );

      await connection.commit();

      res.status(200).json({
          success: true,
          message: 'Invoice created successfully',
          invoiceId: invoiceId,
          paymentLink: paymentLink
      });

  } catch (error) {
      await connection.rollback();
      console.error('Error in createInvoice:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to create invoice',
          error: error.message
      });
  } finally {
      connection.release();
  }
};



// PUT: Update Invoice
exports.updateInvoice = async (req, res) => {
  const invoiceId = req.params.id;
  const { DueDate, TotalAmount } = req.body;

  // Log the input data
  console.log('Invoice ID:', invoiceId);
  console.log('Request Body:', req.body);

  // Validate input
  if (!invoiceId || !DueDate || !TotalAmount) {
    console.error('Missing required fields.');
    return res.status(400).send('Missing required fields.');
  }

  // Construct the SQL query
  const sql = `
    UPDATE Invoice 
    SET DueDate = ?, TotalAmount = ?
    WHERE InvoiceID = ?
  `;

  try {
    // Execute the query
    const [result] = await db.query(sql, [DueDate, TotalAmount, invoiceId]);

    // Log the result of the query
    console.log('Update Result:', result);

    // Check if the update affected any rows
    if (result.affectedRows === 0) {
      console.error('Invoice not found.');
      return res.status(404).send('Invoice not found.');
    }

    res.status(200).send('Invoice updated successfully.');
  } catch (error) {
    console.error('Detailed Error:', error.message);
    res.status(500).send(`Error updating invoice: ${error.message}`);
  }
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

// Handle Stripe webhook for payment status updates
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            // Update invoice payment status
            await db.query(
                `UPDATE Invoice 
                 SET PaymentStatus = ?, 
                     PaidAmount = ?, 
                     PaymentDate = NOW() 
                 WHERE InvoiceID = ?`,
                ['paid', session.amount_total / 100, session.metadata.invoice_id]
            );
        }

        res.json({received: true});
    } catch (err) {
        console.error('Error processing webhook:', err);
        res.status(500).send(`Webhook processing failed: ${err.message}`);
    }
};

// Method to create a new invoice
exports.makeInvoice = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { QuoteID, InvoiceDate, DueDate, TotalAmount } = req.body;

    // Insert the invoice into the Invoice table
    const [invoiceResult] = await connection.query(`
      INSERT INTO Invoice (QuoteID, InvoiceDate, DueDate, TotalAmount, PaymentStatus)
      VALUES (?, ?, ?, ?, ?)
    `, [QuoteID, InvoiceDate, DueDate, TotalAmount, 'pending']);

    const invoiceId = invoiceResult.insertId;

    // Commit the transaction
    await connection.commit();

    // Respond with the invoice details
    res.status(200).json({
      success: true,
      message: 'Invoice created successfully',
      invoiceId: invoiceId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in makeInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  } finally {
    connection.release();
  }
};
