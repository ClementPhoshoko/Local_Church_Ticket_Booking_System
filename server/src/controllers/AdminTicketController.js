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
        console.error('AdminTicketController.setStatus update error:', updateError);
        return res.status(400).json({ error: getUserFriendlyError(updateError) });
      }

      res.status(200).json({
        message: 'Ticket status updated',
        ticket
      });
    } catch (err) {
      console.error('AdminTicketController.setStatus unexpected error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AdminTicketController;
