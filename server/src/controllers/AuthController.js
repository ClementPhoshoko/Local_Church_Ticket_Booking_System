const supabase = require('../config/supabase');

const AuthController = {
  signUp: async (req, res) => {
    try {
      const { email, password, first_name, last_name, contact_number } = req.body;

      if (!email || !password || !first_name || !last_name || !contact_number) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            last_name,
            contact_number,
          },
        },
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({
        message: 'User registered successfully',
        user: data.user,
        session: data.session,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({
        message: 'Login successful',
        user: data.user,
        session: data.session,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  logout: async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = AuthController;
