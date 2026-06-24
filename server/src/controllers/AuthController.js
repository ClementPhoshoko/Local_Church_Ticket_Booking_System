const { supabase, hasRealSupabase, mockUsers, mockProfiles } = require('../config/supabase');

const AuthController = {
  signUp: async (req, res) => {
    try {
      const { email, password, first_name, last_name, contact_number } = req.body;

      if (!email || !password || !first_name || !last_name || !contact_number) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (!hasRealSupabase) {
        // Mock mode: create user and profile
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
        }
        
        const { data } = await supabase.auth.signUp({ email, password });
        
        // Update profile with first/last name/phone
        const profile = mockProfiles.find(p => p.id === data.user.id);
        if (profile) {
          Object.assign(profile, { first_name, last_name, phone: contact_number });
        }
        
        res.status(201).json({
          message: 'User registered successfully',
          user: data.user,
          session: { access_token: `mock-token-${data.user.id}` }
        });
      } else {
        // Real Supabase mode
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
      }
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

      if (!hasRealSupabase) {
        // Mock mode: check mock users
        const existingUser = mockUsers.find(u => u.email === email);
        if (!existingUser) {
          // Create new user for testing
          const { data } = await supabase.auth.signUp({ email, password });
          const session = { access_token: `mock-token-${data.user.id}` };
          res.status(200).json({
            message: 'Login successful',
            user: data.user,
            session
          });
        } else {
          const session = { access_token: `mock-token-${existingUser.id}` };
          res.status(200).json({
            message: 'Login successful',
            user: existingUser,
            session
          });
        }
      } else {
        // Real Supabase mode
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
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  logout: async (req, res) => {
    try {
      await supabase.auth.signOut();
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = AuthController;
