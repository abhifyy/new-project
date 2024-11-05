// BackEnd/controllers/feedbackController.js
const db = require('../config/db');

// GET all feedback
exports.getAllFeedback = (req, res) => {
  const sql = 'SELECT * FROM Feedback';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).send('Error fetching feedback');
    }
    res.json(results);
  });
};

// GET specific feedback by FeedbackID
exports.getFeedbackById = (req, res) => {
  const feedbackId = req.params.id;
  const sql = 'SELECT * FROM Feedback WHERE FeedbackID = ?';
  db.query(sql, [feedbackId], (err, result) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).send('Error fetching feedback');
    }
    if (result.length === 0) {
      return res.status(404).send('Feedback not found');
    }
    res.json(result[0]);
  });
};

// POST new feedback
exports.createFeedback = (req, res) => {
  const { CustomerID, QuoteID, Rating, Comments } = req.body; // Use QuoteID instead of ProjectID
  const FeedbackDate = req.body.FeedbackDate || new Date().toISOString().split('T')[0]; // Use today's date if not provided

  // Ensure required fields are present
  if (!CustomerID || !QuoteID || !Rating) {
    return res.status(400).send('Missing required fields');
  }

  const newFeedback = { CustomerID, QuoteID, FeedbackDate, Rating, Comments };
  const sql = 'INSERT INTO Feedback SET ?';

  db.query(sql, newFeedback, (err, result) => {
    if (err) {
      console.error('Error adding feedback:', err);
      return res.status(500).send('Error adding feedback');
    }
    res.json({ message: 'Feedback added', feedbackId: result.insertId });
  });
};



// PUT to update feedback (e.g., modify rating or comments)
exports.updateFeedback = (req, res) => {
  const feedbackId = req.params.id;
  const { Rating, Comments } = req.body;

  if (!Rating && !Comments) {
    return res.status(400).send('No fields to update');
  }

  const updatedFeedback = {};
  if (Rating) updatedFeedback.Rating = Rating;
  if (Comments) updatedFeedback.Comments = Comments;

  const sql = 'UPDATE Feedback SET ? WHERE FeedbackID = ?';
  
  db.query(sql, [updatedFeedback, feedbackId], (err, result) => {
    if (err) {
      console.error('Error updating feedback:', err);
      return res.status(500).send('Error updating feedback');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Feedback not found');
    }
    res.json({ message: 'Feedback updated' });
  });
};

// DELETE feedback by FeedbackID
exports.deleteFeedback = (req, res) => {
  const feedbackId = req.params.id;
  const sql = 'DELETE FROM Feedback WHERE FeedbackID = ?';

  db.query(sql, [feedbackId], (err, result) => {
    if (err) {
      console.error('Error deleting feedback:', err);
      return res.status(500).send('Error deleting feedback');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Feedback not found');
    }
    res.send('Feedback deleted');
  });
};

