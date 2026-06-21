const { supabase, supabaseAdmin } = require('../config/supabase');

const TicketController = {
  // Create ticket (and initiate payment flow)
  create: async (req, res) => {
    try {
      const userId = req.user.id;
      const { plan_id } = req.body;

      if (!plan_id) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      // First check if plan exists and is active
      const { data: plan, error: planError } = await supabase
        .from('ticket_plans')
        .select('*')
        .eq('id', plan_id)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        return res.status(404).json({ error: 'Plan not found or inactive' });
      }

      // Create the ticket with pending status
      const { data: ticket, error: ticketError } = await supabaseAdmin
        .from('tickets')
        .insert({
          user_id: userId,
          plan_id: plan_id,
          status: 'pending'
        })
        .select('*, ticket_plans(*)')
        .single();

      if (ticketError) {
        return res.status(400).json({ error: ticketError.message });
      }

      res.status(201).json({
        message: 'Ticket created successfully',
        ticket
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // List user's tickets
  list: async (req, res) => {
    try {
      const userId = req.user.id;

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*, ticket_plans(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({ tickets });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single ticket
  get: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*, ticket_plans(*)')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.status(200).json({ ticket });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Cancel a confirmed ticket
  cancel: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // First check if ticket exists
      const { data: existingTicket, error: fetchError } = await supabase
        .from('tickets')
        .select('*, ticket_plans(*)')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingTicket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Check if status is confirmed (only confirmed tickets can be cancelled)
      if (existingTicket.status !== 'confirmed') {
        return res.status(400).json({ error: 'Only confirmed tickets can be cancelled' });
      }

      // Update ticket to cancelled
      const { data: ticket, error: updateError } = await supabaseAdmin
        .from('tickets')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*, ticket_plans(*)')
        .single();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      res.status(200).json({
        message: 'Ticket cancelled successfully',
        ticket
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = TicketController;