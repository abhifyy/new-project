const db = require('../config/db');

// GET all quotes
exports.getAllQuotes = (req, res) => {
  const sql = 'SELECT * FROM Quotes';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching quotes:', err);
      return res.status(500).send('Error fetching quotes');
    }
    res.json(results);
  });
};

// GET a specific quote by QuoteID
exports.getQuoteById = (req, res) => {
  const quoteId = req.params.id;
  const sql = 'SELECT * FROM Quotes WHERE QuoteID = ?';
  db.query(sql, [quoteId], (err, result) => {
    if (err) {
      console.error('Error fetching quote:', err);
      return res.status(500).send('Error fetching quote');
    }
    if (result.length === 0) {
      return res.status(404).send('Quote not found');
    }
    res.json(result[0]);
  });
};

// POST a new quote
exports.createQuote = async (req, res) => {
    try {
        // Handle both direct API calls and form submissions
        let formData, customerInfo, quoteInfo;
        if (req.body.data) {
            // Form submission case
            formData = JSON.parse(req.body.data);
            const {
                firstName, lastName, phone, email,
                address1, address2, city, state, zipcode,
                hoaApproval, cityApproval, material, fenceLength
            } = formData;
            customerInfo = { firstName, lastName, phone, email, address1, address2, city, state, zipcode };
            quoteInfo = { hoaApproval, cityApproval, material, fenceLength };
        } else {
            // Direct API call case
            const { CustomerID, QuoteDate, TotalAmount, Status, EmailSent, Completed } = req.body;
            // Validate required fields for direct API calls
            if (!CustomerID || !QuoteDate || !TotalAmount || !Status || EmailSent === undefined || Completed === undefined) {
                return res.status(400).send('Missing required fields');
            }
            quoteInfo = { CustomerID, QuoteDate, TotalAmount, Status, EmailSent, Completed };
        }
 
        // Handle customer creation/update for form submissions
        let customerId;
        if (customerInfo) {
            const checkCustomerSql = 'SELECT CustomerID FROM Customers WHERE Email = ?';
            const [customerResult] = await db.query(checkCustomerSql, [customerInfo.email]);
 
            if (customerResult.length > 0) {
                // Update existing customer
                customerId = customerResult[0].CustomerID;
                const updateCustomerSql = `
                    UPDATE Customers 
                    SET FirstName = ?, LastName = ?, PhoneNumber = ?, 
                        Address = ?, City = ?, State = ?, ZipCode = ?
                    WHERE CustomerID = ?`;
                await db.query(updateCustomerSql, [
                    customerInfo.firstName, 
                    customerInfo.lastName, 
                    customerInfo.phone,
                    customerInfo.address1 + (customerInfo.address2 ? ' ' + customerInfo.address2 : ''),
                    customerInfo.city, 
                    customerInfo.state, 
                    customerInfo.zipcode,
                    customerId
                ]);
            } else {
                // Create new customer
                const insertCustomerSql = `
                    INSERT INTO Customers (FirstName, LastName, PhoneNumber, Email, 
                                        Address, City, State, ZipCode)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const [newCustomer] = await db.query(insertCustomerSql, [
                    customerInfo.firstName, 
                    customerInfo.lastName, 
                    customerInfo.phone, 
                    customerInfo.email,
                    customerInfo.address1 + (customerInfo.address2 ? ' ' + customerInfo.address2 : ''),
                    customerInfo.city, 
                    customerInfo.state, 
                    customerInfo.zipcode
                ]);
                customerId = newCustomer.insertId;
            }
        } else {
            // Verify CustomerID exists for direct API calls
            const checkCustomerSql = 'SELECT * FROM Customer WHERE CustomerID = ?';
            const [customerResult] = await db.query(checkCustomerSql, [quoteInfo.CustomerID]);
            if (customerResult.length === 0) {
                return res.status(400).send('CustomerID does not exist');
            }
            customerId = quoteInfo.CustomerID;
        }
 
        // Process photos if present
        let photoPaths = [];
        if (req.files && req.files.length > 0) {
            photoPaths = req.files.map(file => file.filename);
        }
 
        // Create quote
        const insertQuoteSql = formData 
            ? `INSERT INTO Quotes (CustomerID, QuoteDate, Status, EmailSent,
                                MaterialType, FenceLength, HOAApproval, 
                                CityApproval, PhotoPaths)
               VALUES (?, CURDATE(), 'Pending', 0, ?, ?, ?, ?, ?)`
            : 'INSERT INTO Quotes SET ?';
 
        const quoteValues = formData 
            ? [
                customerId,
                quoteInfo.material,
                quoteInfo.fenceLength,
                quoteInfo.hoaApproval,
                quoteInfo.cityApproval,
                photoPaths.join(',')
            ]
            : { ...quoteInfo, CustomerID: customerId };
 
        const [quoteResult] = await db.query(insertQuoteSql, formData ? quoteValues : [quoteValues]);
        const quoteId = quoteResult.insertId;
 
        // Send emails only for form submissions
        if (formData) {
            try {
                const customerEmail = {
                    from: {
                        name: 'Blue Rhyno Fencing',
                        address: process.env.EMAIL_USER
                    },
                    to: customerInfo.email,
                    subject: 'Quote Request Confirmation - Blue Rhyno Fencing',
                    html: `
<h2>Thank you for your quote request!</h2>
<p>Dear ${customerInfo.firstName},</p>
<p>We have received your quote request for a ${quoteInfo.material} fence.</p>
<p>Your quote reference number is: ${quoteId}</p>
<p>We will review your request and get back to you within 2 business days.</p>
<h3>Details of your request:</h3>
<ul>
<li>Material: ${quoteInfo.material}</li>
<li>Fence Length: ${quoteInfo.fenceLength} meters</li>
<li>HOA Approval: ${quoteInfo.hoaApproval}</li>
<li>City Approval: ${quoteInfo.cityApproval}</li>
</ul>
<p>If you need to check the status of your quote, please visit our website and use your email and quote reference number.</p>
                    `
                };
 
                const businessEmail = {
                    from: {
                        name: 'Blue Rhyno Quote System',
                        address: process.env.EMAIL_USER
                    },
                    to: process.env.BUSINESS_EMAIL,
                    subject: `New Quote Request #${quoteId}`,
                    html: `
<h2>New Quote Request Received</h2>
<h3>Customer Information:</h3>
<ul>
<li>Name: ${customerInfo.firstName} ${customerInfo.lastName}</li>
<li>Email: ${customerInfo.email}</li>
<li>Phone: ${customerInfo.phone}</li>
<li>Address: ${customerInfo.address1} ${customerInfo.address2 || ''}</li>
<li>City: ${customerInfo.city}</li>
<li>State: ${customerInfo.state}</li>
<li>Zip: ${customerInfo.zipcode}</li>
</ul>
<h3>Project Details:</h3>
<ul>
<li>Material: ${quoteInfo.material}</li>
<li>Fence Length: ${quoteInfo.fenceLength} meters</li>
<li>HOA Approval: ${quoteInfo.hoaApproval}</li>
<li>City Approval: ${quoteInfo.cityApproval}</li>
</ul>
<p>Photos have been uploaded and saved.</p>
                    `
                };
 
                await Promise.all([
                    transporter.sendMail(customerEmail),
                    transporter.sendMail(businessEmail)
                ]);
 
                await db.query('UPDATE Quotes SET EmailSent = 1 WHERE QuoteID = ?', [quoteId]);
            } catch (emailError) {
                console.error('Error sending emails:', emailError);
            }
        }
 
        res.status(200).json({
            success: true,
            message: 'Quote request submitted successfully',
            quoteId: quoteId
        });
 
    } catch (error) {
        console.error('Error in createQuote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process quote request'
        });
    }
};

// PUT to update a quote (e.g., status, payment info)
exports.updateQuote = (req, res) => {
  const quoteId = req.params.id;
  const { Status, TotalAmount } = req.body;

  // Ensure required fields are present
  if (!TotalAmount || !Status) {
    return res.status(400).send('Missing required fields');
  }

  const sql = 'UPDATE Quotes SET `Status` = ?, `TotalAmount` = ? WHERE QuoteID = ?';
  db.query(sql, [Status, TotalAmount, quoteId], (err, result) => {
    if (err) {
      console.error('Error updating quote:', err);
      return res.status(500).send('Error updating quote');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Quote not found');
    }
    res.send('Quote updated');
  });
};




// DELETE a quote by QuoteID (with invoice and payment deletion)
// DELETE a quote by QuoteID and associated projects, invoices, and payments
exports.deleteQuote = (req, res) => {
  const quoteId = req.params.id;

  // Promise wrapper for DB queries
  const queryDb = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  // Start by deleting any associated projects
  queryDb('DELETE FROM Projects WHERE QuoteID = ?', [quoteId])
    .then(() => {
      // Retrieve InvoiceID(s) associated with the QuoteID
      return queryDb('SELECT InvoiceID FROM Invoice WHERE QuoteID = ?', [quoteId]);
    })
    .then((invoiceResult) => {
      const invoiceIds = invoiceResult.map((row) => row.InvoiceID);

      // If no invoices are found, delete the quote directly
      if (invoiceIds.length === 0) {
        return queryDb('DELETE FROM Quotes WHERE QuoteID = ?', [quoteId]);
      } else {
        // Delete associated payments first
        return queryDb('DELETE FROM Payments WHERE InvoiceID IN (?)', [invoiceIds])
          .then(() => {
            // Delete invoices after payments
            return queryDb('DELETE FROM Invoice WHERE QuoteID = ?', [quoteId]);
          })
          .then(() => {
            // Finally, delete the quote
            return queryDb('DELETE FROM Quotes WHERE QuoteID = ?', [quoteId]);
          });
      }
    })
    .then((result) => {
      if (result.affectedRows === 0) {
        return res.status(404).send('Quote not found');
      }
      res.send('Quote, related projects, invoices, and payments deleted');
    })
    .catch((err) => {
      console.error('Error deleting quote:', err);
      res.status(500).send('Error deleting quote and related records');
    });
};



