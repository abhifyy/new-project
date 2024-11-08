// BackEnd/controllers/inventoryController.js
const db = require('../config/db');

// GET all inventory items
exports.getAllInventory = (req, res) => {
  const sql = 'SELECT * FROM Inventory';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).send('Error fetching inventory');
    }
    res.json(results);
  });
};

// GET a specific inventory item by InventoryID
exports.getInventoryById = (req, res) => {
  const inventoryId = req.params.id;
  const sql = 'SELECT * FROM Inventory WHERE InventoryID = ?';
  db.query(sql, [inventoryId], (err, result) => {
    if (err) {
      console.error('Error fetching inventory item:', err);
      return res.status(500).send('Error fetching inventory item');
    }
    res.json(result[0]);
  });
};

// POST a new inventory item
exports.createInventoryItem = (req, res) => {
  const { ItemName, Description, QuantityInStock, PricePerUnit, VendorID } = req.body;

  // First, check if the VendorID exists
  const checkVendorSql = 'SELECT * FROM Vendors WHERE VendorID = ?';
  db.query(checkVendorSql, [VendorID], (vendorErr, vendorResult) => {
    if (vendorErr) {
      console.error('Error checking VendorID:', vendorErr);
      return res.status(500).send('Error checking vendor');
    }
    if (vendorResult.length === 0) {
      return res.status(400).send('VendorID does not exist');
    }

    // Proceed to insert inventory item if VendorID exists
    const insertSql = 'INSERT INTO Inventory (ItemName, Description, QuantityInStock, PricePerUnit, VendorID) VALUES (?, ?, ?, ?, ?)';
    db.query(insertSql, [ItemName, Description, QuantityInStock, PricePerUnit, VendorID], (err, result) => {
      if (err) {
        console.error('Error adding inventory item:', err);
        return res.status(500).send('Error adding inventory item');
      }
      res.json({ message: 'Inventory item created', itemId: result.insertId });
    });
  });
};


// PUT to update an inventory item
exports.updateInventoryItem = (req, res) => {
  const inventoryId = req.params.id;
  const updatedItem = req.body;
  const sql = 'UPDATE Inventory SET ? WHERE InventoryID = ?';
  db.query(sql, [updatedItem, inventoryId], (err, result) => {
    if (err) {
      console.error('Error updating inventory item:', err);
      return res.status(500).send('Error updating inventory item');
    }
    res.send('Inventory item updated');
  });
};

// DELETE an inventory item by InventoryID
exports.deleteInventoryItem = (req, res) => {
  const inventoryId = req.params.id;
  const sql = 'DELETE FROM Inventory WHERE InventoryID = ?';
  db.query(sql, [inventoryId], (err, result) => {
    if (err) {
      console.error('Error deleting inventory item:', err);
      return res.status(500).send('Error deleting inventory item');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Inventory item not found');
    }
    res.send('Inventory item deleted');
  });
};
