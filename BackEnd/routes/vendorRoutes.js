const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

// POST route to create a new vendor (no ID in the URL)
router.post('/', vendorController.createVendor);

// PUT route to update an existing vendor (ID included in the URL)
router.put('/:id', vendorController.updateVendor);

// GET route to fetch vendor details by ID
router.get('/:id', vendorController.getVendorById);

// DELETE route to remove vendor by ID
router.delete('/:id', vendorController.deleteVendor);

module.exports = router;
