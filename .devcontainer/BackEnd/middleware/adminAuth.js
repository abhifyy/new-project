// middleware/adminAuth.js

const checkAdmin = (req, res, next) => {
    if (!req.session || !req.session.isAdmin) {
        // If not logged in, redirect to login page
        return res.redirect('/login');
    }
    next();
};

module.exports = checkAdmin;
