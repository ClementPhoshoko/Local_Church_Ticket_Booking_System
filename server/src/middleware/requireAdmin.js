const requireAdmin = async (req, res, next) => {
  try {
    // Check 1: User has admin role in user_metadata
    const isRoleAdmin = req.user?.user_metadata?.role === 'admin';
    
    // Check 2: Email matches ADMIN_EMAIL from .env (for development only)
    const isEmailAdmin = process.env.ADMIN_EMAIL 
      && req.user?.email === process.env.ADMIN_EMAIL;

    if (!isRoleAdmin && !isEmailAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = requireAdmin;