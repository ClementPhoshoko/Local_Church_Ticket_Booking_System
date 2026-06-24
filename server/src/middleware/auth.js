const { supabase, hasRealSupabase, mockUsers } = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    let user;
    
    if (!hasRealSupabase) {
      // Mock mode: parse mock token
      if (token.startsWith('mock-token-')) {
        const userId = parseInt(token.split('mock-token-')[1]);
        user = mockUsers.find(u => u.id === userId);
      }
    } else {
      // Real Supabase: verify token
      const { data: { user: realUser }, error } = await supabase.auth.getUser(token);
      if (error || !realUser) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      user = realUser;
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authMiddleware;
