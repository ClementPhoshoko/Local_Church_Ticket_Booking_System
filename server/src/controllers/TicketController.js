const { supabase, supabaseAdmin, hasRealSupabase, mockPlans, mockTickets, mockTransactions, mockProfiles, mockUsers } = require('../config/supabase');

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

const TicketController = {
  // Create ticket (and initiate payment flow)
  create: async (req, res) => {
    try {
      const userId = req.user.id;
      const { plan_id } = req.body;

      if (!plan_id) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      if (!hasRealSupabase) {
        // Mock mode: create ticket
        const plan = mockPlans.find(p => p.id === plan_id && p.is_active);
        if (!plan) {
          return res.status(404).json({ error: 'Plan not found or inactive' });
        }

        const ticket = {
          id: mockTickets.length + 1,
          user_id: userId,
          plan_id: plan_id,
          status: 'pending',
          unique_code: `CKT-${Date.now().toString(36).toUpperCase()}`,
          booked_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          ticket_plans: plan
        };
        mockTickets.push(ticket);

        return res.status(201).json({
          message: 'Ticket created successfully',
          ticket
        });
      }

      // Real Supabase mode
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

      if (!hasRealSupabase) {
        // Mock mode: list tickets
        const tickets = mockTickets
          .filter(t => t.user_id === userId)
          .map(t => ({
            ...t,
            ticket_plans: mockPlans.find(p => p.id === t.plan_id)
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return res.status(200).json({ tickets });
      }

      // Real Supabase mode
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*, ticket_plans(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('TicketController.list error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
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

      if (!hasRealSupabase) {
        // Mock mode: get ticket
        const ticket = mockTickets.find(t => t.id === parseInt(id) && t.user_id === userId);
        if (!ticket) {
          return res.status(404).json({ error: 'Ticket not found' });
        }

        return res.status(200).json({
          ticket: {
            ...ticket,
            ticket_plans: mockPlans.find(p => p.id === ticket.plan_id)
          }
        });
      }

      // Real Supabase mode
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

      if (!hasRealSupabase) {
        // Mock mode: cancel ticket
        const existingTicket = mockTickets.find(t => t.id === parseInt(id) && t.user_id === userId);
        if (!existingTicket) {
          return res.status(404).json({ error: 'Ticket not found' });
        }

        if (existingTicket.status !== 'confirmed') {
          return res.status(400).json({ error: 'Only confirmed tickets can be cancelled' });
        }

        existingTicket.status = 'cancelled';
        existingTicket.cancelled_at = new Date().toISOString();

        return res.status(200).json({
          message: 'Ticket cancelled successfully',
          ticket: {
            ...existingTicket,
            ticket_plans: mockPlans.find(p => p.id === existingTicket.plan_id)
          }
        });
      }

      // Real Supabase mode
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
        console.error('TicketController.cancel error:', updateError);
        return res.status(400).json({ error: getUserFriendlyError(updateError) });
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