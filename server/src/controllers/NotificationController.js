const { supabase, supabaseAdmin } = require('../config/supabase');

const NotificationController = {
  // List current user's notifications
  list: async (req, res) => {
    try {
      const userId = req.user.id;

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({ notifications });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mark notification as read
  markRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // First check if notification exists and belongs to user
      const { data: existingNotif, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingNotif) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Update notification (we'll use the admin client to avoid RLS issues for now)
      const { data: notif, error: updateError } = await supabaseAdmin
        .from('notifications')
        .update({
          status: 'read'
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      res.status(200).json({ message: 'Notification marked as read', notification: notif });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin: Get all notifications
  all: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { data: notifications, error, count } = await supabaseAdmin
        .from('notifications')
        .select('*, profiles(*), tickets(*)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || notifications.length
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = NotificationController;
