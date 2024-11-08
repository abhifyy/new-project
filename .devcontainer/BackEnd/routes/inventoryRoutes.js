// BackEnd/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Define Inventory Routes
router.get('/', inventoryController.getAllInventory);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', inventoryController.createInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;
