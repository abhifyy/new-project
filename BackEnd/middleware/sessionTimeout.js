// middleware/sessionTimeout.js
const sessionTimeout = (req, res, next) => {
    if (req.session && req.session.lastActivity) {
        const currentTime = Date.now();
        const timeoutDuration = parseInt(process.env.SESSION_LIFETIME);
        
        if (currentTime - req.session.lastActivity > timeoutDuration) {
            req.session.destroy((err) => {
                if (err) console.error('Session destruction error:', err);
                return res.redirect('/login');
            });
            return;
        }
        
        // Update last activity time
        req.session.lastActivity = currentTime;
    }
    next();
};

module.exports = sessionTimeout;