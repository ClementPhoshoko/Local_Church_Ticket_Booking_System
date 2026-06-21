const { supabaseAdmin } = require('../config/supabase');

const AdminBookingController = {
  // List all bookings using admin_booking_view
  list: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // First get all tickets with joins
      const { data: tickets, error } = await supabaseAdmin
        .from('tickets')
        .select(`
          *,
          ticket_plans(*),
          profiles(*),
          transactions(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({
        bookings: tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AdminBookingController;
