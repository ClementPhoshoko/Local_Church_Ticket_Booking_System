const { supabase, supabaseAdmin, hasRealSupabase, mockTickets, mockTransactions, mockPlans } = require('../config/supabase');
const emailjs = require('../services/emailjs');

const PaymentController = {
  // Initiate payment
  initiate: async (req, res) => {
    try {
      const userId = req.user.id;
      const { ticket_id, gateway = 'mock' } = req.body;

      if (!ticket_id) {
        return res.status(400).json({ error: 'Ticket ID is required' });
      }

      if (!hasRealSupabase) {
        // Mock mode: handle payment initiation
        const ticket = mockTickets.find(t => t.id === ticket_id && t.user_id === userId);
        if (!ticket) {
          return res.status(404).json({ error: 'Ticket not found' });
        }
        if (ticket.status !== 'pending') {
          return res.status(400).json({ error: 'Ticket is not in pending status' });
        }
        const plan = mockPlans.find(p => p.id === ticket.plan_id);
        
        const transaction = {
          id: mockTransactions.length + 1,
          ticket_id,
          user_id: userId,
          gateway,
          amount: plan ? plan.price : 0,
          currency: plan ? plan.currency : 'ZAR',
          status: 'pending',
          created_at: new Date().toISOString()
        };
        mockTransactions.push(transaction);
        
        const gatewayRedirectUrl = `${req.protocol}://${req.get('host')}/payments/webhook?txId=${transaction.id}&status=success`;
        
        return res.status(200).json({
          message: 'Payment initiated successfully',
          transaction,
          gateway_redirect_url: gatewayRedirectUrl
        });
      }

      // Real Supabase mode
      // Fetch ticket and plan details
      const { data: ticket, error: ticketError } = await supabaseAdmin
        .from('tickets')
        .select('*, ticket_plans(*)')
        .eq('id', ticket_id)
        .eq('user_id', userId)
        .single();

      if (ticketError || !ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (ticket.status !== 'pending') {
        return res.status(400).json({ error: 'Ticket is not in pending status' });
      }

      // Create transaction record
      const { data: transaction, error: txError } = await supabaseAdmin
        .from('transactions')
        .insert({
          ticket_id,
          user_id: userId,
          gateway,
          amount: ticket.ticket_plans.price,
          currency: ticket.ticket_plans.currency,
          status: 'pending'
        })
        .select('*')
        .single();

      if (txError) {
        return res.status(400).json({ error: txError.message });
      }

      // For mock gateway: auto-complete payment for testing
      let gatewayRedirectUrl = null;
      if (gateway === 'mock') {
        // Mock gateway: return webhook URL for "redirect"
        gatewayRedirectUrl = `${req.protocol}://${req.get('host')}/payments/webhook?txId=${transaction.id}&status=success`;
      }

      res.status(200).json({
        message: 'Payment initiated successfully',
        transaction,
        gateway_redirect_url: gatewayRedirectUrl
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Payment webhook endpoint
  webhook: async (req, res) => {
    try {
      const { txId, status } = req.query; // For mock, use query params. Real gateways use request body
      
      if (!hasRealSupabase) {
        // Mock mode: handle webhook
        const transaction = mockTransactions.find(t => t.id === parseInt(txId));
        if (!transaction) {
          return res.status(404).json({ error: 'Transaction not found' });
        }
        if (transaction.status !== 'pending') {
          return res.status(200).json({ message: 'Transaction already processed' });
        }
        
        let updatedTicket = null;
        
        if (status === 'success') {
          transaction.status = 'success';
          transaction.completed_at = new Date().toISOString();
          
          const ticket = mockTickets.find(t => t.id === transaction.ticket_id);
          if (ticket) {
            ticket.status = 'confirmed';
            ticket.confirmed_at = new Date().toISOString();
            updatedTicket = ticket;
          }
        } else {
          transaction.status = 'failed';
        }
        
        return res.status(200).json({
          message: 'Payment processed successfully',
          transaction,
          ticket: updatedTicket
        });
      }

      // Real Supabase mode
      // In real scenario, verify signature here

      // Fetch transaction
      const { data: transaction, error: txError } = await supabaseAdmin
        .from('transactions')
        .select('*, tickets(*, ticket_plans(*))')
        .eq('id', txId)
        .single();

      if (txError || !transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.status !== 'pending') {
        return res.status(200).json({ message: 'Transaction already processed' });
      }

      let updatedTicket = null;
      
      if (status === 'success') {
        // Update transaction
        const { data: updatedTx, error: updateTxError } = await supabaseAdmin
          .from('transactions')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
            gateway_payload: req.body || { status: 'success' }
          })
          .eq('id', txId)
          .select('*')
          .single();

        if (updateTxError) throw updateTxError;

        // Update ticket status to confirmed
        const { data: ticket, error: ticketError } = await supabaseAdmin
          .from('tickets')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
          })
          .eq('id', transaction.ticket_id)
          .select('*, ticket_plans(*)')
          .single();

        if (ticketError) throw ticketError;
        
        updatedTicket = ticket;

        // Fetch user profile/email for email
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', ticket.user_id)
          .single();

        if (!profileError && profile) {
          try {
            await emailjs.sendTicketConfirmation(
              {
                unique_code: ticket.unique_code,
                plan_name: ticket.ticket_plans.name,
                price: `${ticket.ticket_plans.currency} ${ticket.ticket_plans.price}`,
                purchased_at: ticket.booked_at
              },
              {
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: req.query.email || 'test@example.com' // For now, use test email
              }
            );
          } catch (emailErr) {
            console.error('Failed to send confirmation email:', emailErr);
          }
        }
      } else {
        // Mark transaction as failed
        await supabaseAdmin
          .from('transactions')
          .update({
            status: 'failed',
            gateway_payload: req.body || { status: 'failed' }
          })
          .eq('id', txId);
      }

      res.status(200).json({
        message: 'Payment processed successfully',
        transaction,
        ticket: updatedTicket
      });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get transaction for ticket
  get: async (req, res) => {
    try {
      const userId = req.user.id;
      const { ticketId } = req.params;

      if (!hasRealSupabase) {
        // Mock mode: get transactions
        const transactions = mockTransactions
          .filter(t => t.ticket_id === parseInt(ticketId) && t.user_id === userId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        return res.status(200).json({ transactions });
      }

      // Real Supabase mode
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({ transactions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = PaymentController;