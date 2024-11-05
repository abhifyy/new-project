const db = require('../config/db');

// GET all vendors
exports.getAllVendors = (req, res) => {
  const sql = 'SELECT * FROM Vendors';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching vendors:', err);
      return res.status(500).send('Error fetching vendors');
    }
    res.json(results);
  });
};

// GET a specific vendor by VendorID
exports.getVendorById = (req, res) => {
  const vendorId = req.params.id;
  const sql = 'SELECT * FROM Vendors WHERE VendorID = ?';
  db.query(sql, [vendorId], (err, result) => {
    if (err) {
      console.error('Error fetching vendor:', err);
      return res.status(500).send('Error fetching vendor');
    }
    if (result.length === 0) {
      return res.status(404).send('Vendor not found');
    }
    res.json(result[0]);
  });
};

// POST a new vendor
exports.createVendor = (req, res) => {
  const { VendorName } = req.body;
  if (!VendorName) {
    return res.status(400).send('Vendor name is required');
  }

  const sql = 'INSERT INTO Vendors (VendorName) VALUES (?)';
  db.query(sql, [VendorName], (err, result) => {
    if (err) {
      console.error('Error creating vendor:', err);
      return res.status(500).send('Error creating vendor');
    }
    res.json({ message: 'Vendor created', vendorId: result.insertId });
  });
};

// PUT to update a vendor's information
exports.updateVendor = (req, res) => {
  const vendorId = req.params.id;
  const updatedVendor = req.body;
  const sql = 'UPDATE Vendors SET ? WHERE VendorID = ?';
  db.query(sql, [updatedVendor, vendorId], (err, result) => {
    if (err) {
      console.error('Error updating vendor:', err);
      return res.status(500).send('Error updating vendor');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Vendor not found');
    }
    res.send('Vendor updated');
  });
};

// DELETE a vendor by VendorID
exports.deleteVendor = (req, res) => {
    const vendorId = req.params.id;
  
    // Step 1: Delete inventory records associated with the vendor
    const deleteInventory = 'DELETE FROM Inventory WHERE VendorID = ?';
    db.query(deleteInventory, [vendorId], (err) => {
      if (err) {
        console.error('Error deleting inventory records:', err);
        return res.status(500).send('Error deleting inventory records');
      }
  
      // Step 2: Delete the vendor
      const deleteVendor = 'DELETE FROM Vendors WHERE VendorID = ?';
      db.query(deleteVendor, [vendorId], (err, result) => {
        if (err) {
          console.error('Error deleting vendor:', err);
          return res.status(500).send('Error deleting vendor');
        }
        if (result.affectedRows === 0) {
          return res.status(404).send('Vendor not found');
        }
        res.send('Vendor and associated inventory records deleted');
      });
    });
  };
  