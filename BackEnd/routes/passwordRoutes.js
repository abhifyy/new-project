const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

// Admin login route
router.post('/admin', passwordController.adminLogin);
// Other routes
router.get('/', passwordController.getAllPasswords);
router.get('/:id', passwordController.getPasswordByCustomerId);
router.post('/', passwordController.createPassword);
router.put('/:id', passwordController.updatePassword);
router.delete('/:id', passwordController.deletePassword);
router.post('/admin', passwordController.adminLogin);

module.exports = router;
