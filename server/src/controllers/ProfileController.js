const { supabase } = require('../config/supabase');

const ProfileController = {
  me: async (req, res) => {
    try {
      const userId = req.user.id;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.status(200).json({
        user: req.user,
        profile,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const userId = req.user.id;
      const { first_name, last_name, contact_number } = req.body;

      const updates = {};
      if (first_name !== undefined) updates.first_name = first_name;
      if (last_name !== undefined) updates.last_name = last_name;
      if (contact_number !== undefined) updates.contact_number = contact_number;

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        console.error('ProfileController.update error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        profile,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = ProfileController;
