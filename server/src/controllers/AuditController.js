const { supabaseAdmin } = require('../config/supabase');

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
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      });
    } catch (err) {
      console.error(err);
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
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      });
    } catch (err) {
      console.error(err);
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
        return res.status(400).json({ error: error.message });
      }

      res.status(200).json({
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = AuditController;
