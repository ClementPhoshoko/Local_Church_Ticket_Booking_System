const { supabaseAdmin } = require('../config/supabase');

const AdminTicketController = {
  // Set a ticket's status
  setStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid ticket status' });
      }

      // Find the ticket first
      const { data: existingTicket, error: fetchError } = await supabaseAdmin
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existingTicket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Update the ticket
      const { data: ticket, error: updateError } = await supabaseAdmin
        .from('tickets')
        .update({
          status,
          confirmed_at: status === 'confirmed' ? new Date().toISOString() : existingTicket.confirmed_at,
          cancelled_at: status === 'cancelled' ? new Date().toISOString() : existingTicket.cancelled_at
        })
        .eq('id', id)
        .select('*, ticket_plans(*)')
        .single();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      res.status(200).json({
        message: 'Ticket status updated',
        ticket
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AdminTicketController;
