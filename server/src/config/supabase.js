const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;

// Check if we have valid Supabase credentials (if not, use mock mode)
const hasRealSupabase = supabaseUrl && 
  supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
  process.env.SUPABASE_PUBLISHABLE_KEY && 
  process.env.SUPABASE_PUBLISHABLE_KEY !== 'your-anon-key' && 
  process.env.SUPABASE_SECRET_KEY && 
  process.env.SUPABASE_SECRET_KEY !== 'your-service-role-key';

// Mock data for testing
const mockUsers = [];
const mockProfiles = [];
const mockPlans = [
  {
    id: 1,
    name: 'Sunday Service - General Admission',
    description: 'Join us for our weekly Sunday morning service with worship and a powerful message from our pastor.',
    price: 0.00,
    currency: 'ZAR',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Special Guest Event',
    description: 'An evening with a special guest speaker featuring worship, teaching, and a time of ministry.',
    price: 75.00,
    currency: 'ZAR',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
const mockTickets = [];
const mockTransactions = [];
let mockNextId = {
  user: 1,
  profile: 1,
  ticket: 1,
  transaction: 1
};

let supabase;
let supabaseAdmin;

if (hasRealSupabase) {
  // Publishable key: used for regular user operations (auth, etc.)
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  supabase = createClient(supabaseUrl, supabasePublishableKey);

  // Service role key: used for admin/server-side operations that need to bypass RLS
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  // Mock Supabase client with proper method chaining
  const mockClient = {
    auth: {
      signUp: async ({ email, password }) => {
        const user = {
          id: mockNextId.user++,
          email,
          created_at: new Date().toISOString()
        };
        mockUsers.push(user);
        
        const profile = {
          id: user.id,
          first_name: '',
          last_name: '',
          phone: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockProfiles.push(profile);
        
        return { 
          data: { user },
          error: null
        };
      },
      signInWithPassword: async ({ email, password }) => {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
          return {
            data: { user, session: { access_token: `mock-token-${user.id}` } },
            error: null
          };
        }
        return { data: null, error: { message: 'Invalid credentials' } };
      },
      signOut: async () => {
        return { error: null };
      },
      getUser: async () => {
        // For mock, we'll get user from request auth
        return { data: null, error: null };
      }
    },
    from: (table) => {
      const state = {
        table,
        columns: '*',
        filters: [],
        orderBy: null,
        orderAscending: true
      };

      const queryBuilder = {
        select: (columns = '*') => {
          state.columns = columns;
          return queryBuilder;
        },
        eq: (column, value) => {
          state.filters.push({ type: 'eq', column, value });
          return queryBuilder;
        },
        order: (orderBy, options = {}) => {
          state.orderBy = orderBy;
          state.orderAscending = options.ascending !== false;
          return queryBuilder;
        },
        single: () => {
          let data = null;
          if (table === 'profiles') {
            data = mockProfiles.find(p => matchFilters(p, state.filters));
          } else if (table === 'ticket_plans') {
            data = mockPlans.find(p => matchFilters(p, state.filters) && p.is_active);
          } else if (table === 'tickets') {
            data = mockTickets.find(t => matchFilters(t, state.filters));
            if (data && state.columns.includes('ticket_plans')) {
              data.ticket_plans = mockPlans.find(p => p.id === data.plan_id);
            }
          } else if (table === 'transactions') {
            data = mockTransactions.find(t => matchFilters(t, state.filters));
          }
          return { data, error: null };
        }
      };

      // For backwards compatibility with queries that don't call single()
      Object.defineProperty(queryBuilder, 'data', {
        get: () => {
          let data = [];
          if (table === 'ticket_plans') {
            data = mockPlans.filter(p => matchFilters(p, state.filters) && p.is_active);
          } else if (table === 'tickets') {
            data = mockTickets.filter(t => matchFilters(t, state.filters));
            if (state.columns.includes('ticket_plans')) {
              data = data.map(t => ({ ...t, ticket_plans: mockPlans.find(p => p.id === t.plan_id) }));
            }
          } else if (table === 'transactions') {
            data = mockTransactions.filter(t => matchFilters(t, state.filters));
          } else if (table === 'profiles') {
            data = mockProfiles.filter(p => matchFilters(p, state.filters));
          }
          if (state.orderBy) {
            data = data.sort((a, b) => {
              const dateA = new Date(a[state.orderBy]);
              const dateB = new Date(b[state.orderBy]);
              return state.orderAscending ? dateA - dateB : dateB - dateA;
            });
          }
          return data;
        },
        enumerable: true
      });
      Object.defineProperty(queryBuilder, 'error', {
        get: () => null,
        enumerable: true
      });

      return queryBuilder;
    }
  };

  // Helper function to match filters
  function matchFilters(item, filters) {
    return filters.every(filter => {
      if (filter.type === 'eq') {
        return item[filter.column] === filter.value;
      }
      return true;
    });
  }

  // Override insert/update to work with our query builder pattern
  const originalFrom = mockClient.from;
  mockClient.from = (table) => {
    const base = originalFrom(table);
    
    base.insert = (row) => ({
      select: () => ({
        single: () => {
          let newItem;
          if (table === 'tickets') {
            newItem = {
              id: mockNextId.ticket++,
              ...row,
              unique_code: `CKT-${Date.now().toString(36).toUpperCase()}`,
              status: 'pending',
              booked_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            };
            mockTickets.push(newItem);
          } else if (table === 'transactions') {
            newItem = {
              id: mockNextId.transaction++,
              ...row,
              created_at: new Date().toISOString()
            };
            mockTransactions.push(newItem);
          }
          return { data: newItem, error: null };
        }
      })
    });
    
    base.update = (updates) => ({
      eq: (column, value) => ({
        select: () => ({
          single: () => {
            let item;
            if (table === 'tickets') {
              item = mockTickets.find(t => t[column] === value);
              if (item) {
                Object.assign(item, updates);
                if (updates.status === 'confirmed') {
                  item.confirmed_at = new Date().toISOString();
                }
                if (updates.status === 'cancelled') {
                  item.cancelled_at = new Date().toISOString();
                }
              }
            } else if (table === 'transactions') {
              item = mockTransactions.find(t => t[column] === value);
              if (item) {
                Object.assign(item, updates);
                if (updates.status === 'success') {
                  item.completed_at = new Date().toISOString();
                }
              }
            } else if (table === 'profiles') {
              item = mockProfiles.find(p => p[column] === value);
              if (item) {
                Object.assign(item, { ...updates, updated_at: new Date().toISOString() });
              }
            }
            return { data: item, error: null };
          }
        })
      })
    });
    
    return base;
  };

  supabase = mockClient;
  supabaseAdmin = mockClient;
}

module.exports = { supabase, supabaseAdmin, hasRealSupabase, mockPlans, mockTickets, mockTransactions, mockProfiles, mockUsers };
