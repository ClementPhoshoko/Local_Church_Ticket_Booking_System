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

const AuditController = {
  // List all audit logs with pagination
  list: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { data: logs, error, count } = await supabaseAdmin
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('changed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('AuditController.list error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({
        logs: logs || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      });
    } catch (err) {
      console.error('AuditController.list unexpected error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Filter audit logs by table name
  byTable: async (req, res) => {
    try {
      const { table } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { data: logs, error, count } = await supabaseAdmin
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('table_name', table)
        .order('changed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('AuditController.byTable error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({
        logs: logs || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      });
    } catch (err) {
      console.error('AuditController.byTable unexpected error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Filter audit logs by user ID
  byUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { data: logs, error, count } = await supabaseAdmin
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('changed_by', userId)
        .order('changed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('AuditController.byUser error:', error);
        return res.status(400).json({ error: getUserFriendlyError(error) });
      }

      res.status(200).json({
        logs: logs || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      });
    } catch (err) {
      console.error('AuditController.byUser unexpected error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AuditController;
