const { supabaseAdmin } = require('../config/supabase');

function getUserFriendlyError(error) {
  if (error && error.message) {
    if (error.message.toLowerCase().includes('invalid api key') || 
        error.message.toLowerCase().includes('api key') ||
        error.code === 'invalid_grant' ||
        error.code === 'PGRST301') {
      return 'Server configuration error. Please check with your administrator.';
    }
    if (error.message.toLowerCase().includes('not found') || error.code === 'PGRST116') {
      return 'Requested resource not found.';
    }
  }
  return error ? error.message : 'Something went wrong';
}

const AdminUserController = {
  // List all users with profiles and emails
  list: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Get profiles first
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('AdminUserController.list error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      // Enrich profiles with email from auth.users
      const usersWithEmails = [];
      if (profiles) {
        for (const profile of profiles) {
          try {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
            usersWithEmails.push({
              ...profile,
              email: userData?.user?.email || ''
            });
          } catch (err) {
            console.error('Error getting user email for', profile.id, err);
            usersWithEmails.push({
              ...profile,
              email: ''
            });
          }
        }
      }

      res.status(200).json({
        users: usersWithEmails || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (err) {
      console.error('AdminUserController.list unexpected error:', err);
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

      // Get email from auth.users
      let email = '';
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(id);
        email = userData?.user?.email || '';
      } catch (err) {
        console.error('Error getting user email for', id, err);
      }

      // Then get their tickets
      const { data: tickets, error: ticketsError } = await supabaseAdmin
        .from('tickets')
        .select('*, ticket_plans(*)')
        .eq('user_id', id);

      if (ticketsError) {
        console.error('AdminUserController.get tickets error:', ticketsError);
        return res.status(400).json({ error: getUserFriendlyError(ticketsError) });
      }

      res.status(200).json({
        user: { ...profile, email },
        tickets: tickets || []
      });
    } catch (err) {
      console.error('AdminUserController.get unexpected error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AdminUserController;
