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

const AdminBookingController = {
  // List all bookings using admin_booking_view
  list: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Use admin_booking_view which already has all joins
      const { data: bookings, error } = await supabaseAdmin
        .from('admin_booking_view')
        .select('*')
        .order('booked_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('AdminBookingController.list error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({
        bookings: bookings || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (err) {
      console.error('AdminBookingController.list unexpected error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AdminBookingController;
