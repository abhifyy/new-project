const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

router.get('/', passwordController.getAllPasswords);
router.get('/:id', passwordController.getPasswordByCustomerId);
router.post('/', passwordController.createPassword);
router.put('/:id', passwordController.updatePassword);
router.delete('/:id', passwordController.deletePassword);
router.post('/admin', passwordController.adminLogin);

module.exports = router;
