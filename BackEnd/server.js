// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const quotesRoutes = require('./routes/quotesRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const projectRoutes = require('./routes/projectRoutes');  // New Projects routes
const paymentRoutes = require('./routes/paymentRoutes');  // New Payments routes
const invoiceRoutes = require('./routes/invoiceRoutes');  // New Invoices routes
const passwordRoutes = require('./routes/passwordRoutes'); // New Password routes

// Create an Express app
const app = express();
const port = process.env.PORT || 3001;  // Define the port

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/vendors', vendorRoutes);         // Vendor Routes
app.use('/customers', customerRoutes);     // Customers routes
app.use('/inventory', inventoryRoutes);    // Inventory routes
app.use('/quotes', quotesRoutes);          // Quotes routes
app.use('/feedback', feedbackRoutes);      // Feedback routes
app.use('/projects', projectRoutes);       // New Projects routes
app.use('/payments', paymentRoutes);       // New Payments routes
app.use('/invoices', invoiceRoutes);       // New Invoices routes
app.use('/passwords', passwordRoutes);     // New Password routes
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
