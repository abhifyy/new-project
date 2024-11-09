// Import required modules
const db = require('./config/db');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const sessionTimeout = require('./middleware/sessionTimeout');
const adminRoutes = require('./routes/adminRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const quotesRoutes = require('./routes/quotesRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const projectRoutes = require('./routes/projectRoutes');  // New Projects routes
const paymentRoutes = require('./routes/paymentRoutes');  // New Payments routes
const invoiceRoutes = require('./routes/invoiceRoutes');  // New Invoices routes
const passwordRoutes = require('./routes/passwordRoutes'); // New Password routes
const multer = require('multer');
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads/quotes');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Create an Express app
const app = express();
const port = 3001;  // Define the port

// Middleware setup
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../FrontEnd')));
app.use('/assets', express.static(path.join(__dirname, '../FrontEnd/assets')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(session({
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESSION_LIFETIME),
    httpOnly: true,
    sameSite: 'strict',
  }
}));

// Add session check middleware for admin routes
const checkAdminSession = (req, res, next) => {
  if (!req.session || !req.session.isAdmin) {
    return res.redirect('/login');
  }
  next();
};


//Instead of individual admin routes, use the router
app.use('/admin', sessionTimeout, checkAdminSession, adminRoutes);

//Basic route
app.get('/', (req, res) => {
  res.send('API is working');
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../uploads/quotes');
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)){
          fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Update body parser to handle larger payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/vendors', vendorRoutes);         // Vendor Routes
app.use('/api/customers', customerRoutes);     // Customers routes
app.use('/api/inventory', inventoryRoutes);    // Inventory routes
app.use('/api/quotes', upload.array('photos', 5), quotesRoutes);   // Quotes routes
app.use('/api/feedback', feedbackRoutes);      // Feedback routes
app.use('/api/projects', projectRoutes);       // New Projects routes
app.use('/api/payments', paymentRoutes);       // New Payments routes
app.use('/api/invoices', invoiceRoutes);       // New Invoices routes
app.use('/api/passwords', passwordRoutes);     // New Password routes

// FrontEnd Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/index.html'));
});

app.get('/getquote', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/getquote.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/login.html'));
});

app.get('/job-status', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/jobStatus.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/services.html'));
});

app.get('/faq', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/faq.html'));
});

app.get('/invoice', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/invoice.html'));
});

app.get('/reviews', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/reviews.html'));
});

app.get('/left-sidebar', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/left-sidebar.html'));
});

app.get('/right-sidebar', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/right-sidebar.html'));
});

app.get('/no-sidebar', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/no-sidebar.html'));
});


// Handle 404s
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
      // Send JSON response for API 404s
      res.status(404).json({ error: 'API endpoint not found' });
  } else {
      // Send HTML response for FrontEnd 404s
      res.status(404).sendFile(path.join(__dirname, '../FrontEnd/404.html'));
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.path.startsWith('/api/')) {
      res.status(500).json({ error: 'Internal server error' });
  } else {
      res.status(500).send('Something broke!');
  }
});

// Start the server

//app.listen(port, '0.0.0.0', () => {
  //console.log(`Server is running on http://54.225.115.8:${port}`);
//});
 app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
 });
