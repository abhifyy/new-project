// BackEnd/routes/quotesRoutes.js
const express = require('express');
const router = express.Router();
const quotesController = require('../controllers/quotesController');
const multer = require('multer');
const path = require('path');

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Files will be saved in the 'uploads/quotes' directory
        cb(null, 'uploads/quotes')
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'quote-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Set up multer with file restrictions
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow jpeg, jpg, and png files
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Error: Only JPEG, JPG, and PNG images are allowed'));
        }
    }
});


// Define Quotes Routes
router.get('/', quotesController.getAllQuotes);
router.get('/:id', quotesController.getQuoteById);
router.post('/', quotesController.createQuote);
router.put('/:id', quotesController.updateQuote);
router.delete('/:id', quotesController.deleteQuote);

module.exports = router;
