const { supabase, supabaseAdmin } = require('../config/supabase');

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

const PlanController = {
  // List all active plans (for regular users)
  list: async (req, res) => {
    try {
      const { data: plans, error } = await supabase
        .from('ticket_plans')
        .select('*')
        .eq('is_active', true);

      if (error) {
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({ plans: plans || [] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single plan (for regular users, only active)
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

  // Admin: List all plans (including inactive)
  listAll: async (req, res) => {
    try {
      const { data: plans, error } = await supabaseAdmin
        .from('ticket_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('PlanController.listAll error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({ plans: plans || [] });
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
        console.error('PlanController.create error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
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
        console.error('PlanController.update error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({ message: 'Plan updated successfully', plan });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin: Delete plan (soft delete via is_active = false)
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: plan, error } = await supabaseAdmin
        .from('ticket_plans')
        .update({ is_active: false })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('PlanController.delete error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({ message: 'Plan deactivated successfully', plan });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = PlanController;