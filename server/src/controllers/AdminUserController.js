const { supabaseAdmin } = require('../config/supabase');

const AdminUserController = {
  // List all users with profiles
  list: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Get profiles first (since auth.users is limited)
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({
        users: profiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single user with all their tickets
  get: async (req, res) => {
    try {
      const { id } = req.params;

      // First get the user's profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Then get their tickets
      const { data: tickets, error: ticketsError } = await supabaseAdmin
        .from('tickets')
        .select('*, ticket_plans(*)')
        .eq('user_id', id);

      if (ticketsError) {
        return res.status(400).json({ error: ticketsError.message });
      }

      res.status(200).json({
        user: profile,
        tickets
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AdminUserController;
