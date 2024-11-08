// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const path = require('path');
const checkAdmin = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');


// Admin routes - all protected by checkAdmin middleware
router.get('/dashboard', checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/admin_dashboard.html'));
});

router.get('/active-jobs', checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/active_jobs.html'));
});

router.get('/completed-jobs', checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/completed_jobs.html'));
});

router.get('/update_invoice', checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/update_invoice.html'));
});


// API routes
router.post('/login', adminController.login);
router.post('/logout', checkAdmin, adminController.logout);
router.get('/jobs/active', checkAdmin, adminController.getActiveJobs);
router.get('/jobs/completed', checkAdmin, adminController.getCompletedJobs);
router.put('/jobs/status', checkAdmin, adminController.updateJobStatus);
router.get('/dashboard/summary', checkAdmin, adminController.getDashboardSummary);

module.exports = router;