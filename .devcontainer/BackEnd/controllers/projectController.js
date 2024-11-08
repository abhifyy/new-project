const db = require('../config/db');

// GET all projects
exports.getAllProjects = (req, res) => {
  const sql = 'SELECT * FROM Projects';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).send('Error fetching projects');
    }
    res.json(results);
  });
};

// GET a specific project by ProjectID
exports.getProjectById = (req, res) => {
  const projectId = req.params.id;
  const sql = 'SELECT * FROM Projects WHERE ProjectID = ?';
  db.query(sql, [projectId], (err, result) => {
    if (err) {
      console.error('Error fetching project:', err);
      return res.status(500).send('Error fetching project');
    }
    if (result.length === 0) {
      return res.status(404).send('Project not found');
    }
    res.json(result[0]);
  });
};

// POST a new project
exports.createProject = (req, res) => {
  const newProject = req.body;
  const sql = 'INSERT INTO Projects SET ?';
  db.query(sql, newProject, (err, result) => {
    if (err) {
      console.error('Error adding project:', err);
      return res.status(500).send('Error adding project');
    }
    res.json({ message: 'Project created', projectId: result.insertId });
  });
};

// PUT to update a project
exports.updateProject = (req, res) => {
  const projectId = req.params.id;
  const updatedProject = req.body;
  const sql = 'UPDATE Projects SET ? WHERE ProjectID = ?';
  db.query(sql, [updatedProject, projectId], (err, result) => {
    if (err) {
      console.error('Error updating project:', err);
      return res.status(500).send('Error updating project');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Project not found');
    }
    res.send('Project updated');
  });
};

// DELETE a project by ProjectID
exports.deleteProject = (req, res) => {
  const projectId = req.params.id;
  const sql = 'DELETE FROM Projects WHERE ProjectID = ?';
  db.query(sql, [projectId], (err, result) => {
    if (err) {
      console.error('Error deleting project:', err);
      return res.status(500).send('Error deleting project');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Project not found');
    }
    res.send('Project deleted');
  });
};
