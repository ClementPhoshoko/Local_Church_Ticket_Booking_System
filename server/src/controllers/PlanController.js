const { supabase, supabaseAdmin } = require('../config/supabase');

const PlanController = {
  // List all active plans
  list: async (req, res) => {
    try {
      const { data: plans, error } = await supabase
        .from('ticket_plans')
        .select('*')
        .eq('is_active', true);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({ plans });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single plan
  get: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data: plan, error } = await supabase
        .from('ticket_plans')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      res.status(200).json({ plan });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin: Create plan
  create: async (req, res) => {
    try {
      const { name, description, price, currency = 'ZAR', is_active = true } = req.body;

      if (!name || price === undefined || price === null) {
        return res.status(400).json({ error: 'Name and price are required' });
      }

      const { data: plan, error } = await supabaseAdmin
        .from('ticket_plans')
        .insert({
          name,
          description,
          price,
          currency,
          is_active
        })
        .select('*')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ message: 'Plan created successfully', plan });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin: Update plan
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, currency, is_active } = req.body;

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = price;
      if (currency !== undefined) updates.currency = currency;
      if (is_active !== undefined) updates.is_active = is_active;

      const { data: plan, error } = await supabaseAdmin
        .from('ticket_plans')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({ message: 'Plan updated successfully', plan });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = PlanController;