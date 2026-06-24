import React, { useState, useMemo } from 'react'
import { useAdminUsers } from '@/hooks'
import Loading from '@/components/loading/Loading'
import './Users.css'

function Users() {
  const { users, loading, error, refetch } = useAdminUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Apply filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        [
          user.first_name,
          user.last_name,
          user.email,
          user.contact_number
        ].some(field => 
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        )

      // Date from filter
      const matchesDateFrom = !dateFrom || 
        new Date(user.created_at) >= new Date(dateFrom)

      // Date to filter (end of day)
      const matchesDateTo = !dateTo || 
        new Date(user.created_at) <= new Date(new Date(dateTo).setHours(23, 59, 59, 999))

      return matchesSearch && matchesDateFrom && matchesDateTo
    })
  }, [users, searchTerm, dateFrom, dateTo])

  const hasActiveFilters = searchTerm || dateFrom || dateTo

  const clearAllFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="users_tab">
      {/* Header Section */}
      <div className="users_tab-header">
        <div className="users_header-content">
          <h1 className="users_users-title">All Users</h1>
          <p className="users_advisory-text">
            Manage all registered users in the system. Search by name, email, or contact number, 
            and filter by registration date range.
          </p>
        </div>
      </div>

      {/* Filters Container */}
      <div className="users_filters-container">
        <div className="users_filters-left">
          <span className="users_filters-label">Filters:</span>
          
          {/* Search Filter */}
          <div className="users_search-filter">
            <div className="users_search-input-wrapper">
              <svg className="users_search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="users_search-input"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="users_clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date From Filter */}
          <div className="users_date-filter">
            <div className="users_date-input-wrapper">
              <svg className="users_date-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                className="users_date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="users_date-label">From</span>
            </div>
          </div>

          {/* Date To Filter */}
          <div className="users_date-filter">
            <div className="users_date-input-wrapper">
              <svg className="users_date-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                className="users_date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <span className="users_date-label">To</span>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <button className="users_clear-all-btn" onClick={clearAllFilters}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="users_active-filters">
          {searchTerm && (
            <span className="users_active-filter-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              "{searchTerm}"
              <button onClick={() => setSearchTerm('')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
          {dateFrom && (
            <span className="users_active-filter-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              From: {new Date(dateFrom).toLocaleDateString()}
              <button onClick={() => setDateFrom('')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
          {dateTo && (
            <span className="users_active-filter-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              To: {new Date(dateTo).toLocaleDateString()}
              <button onClick={() => setDateTo('')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Error Container */}
      {error && (
        <div className="users_error-container">
          <div className="users_error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="users_error-message">{error}</p>
          <button className="users_retry-btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading Container */}
      {loading && (
        <div className="users_loading-container">
          <Loading isVisible={true} message="Loading users..." />
        </div>
      )}

      {/* Users Table Container */}
      {!loading && !error && (
        <div className="users_users-table-container">
          {filteredUsers.length === 0 ? (
            <div className="users_empty-state">
              <svg className="users_empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>No Users Found</h3>
              <p>{hasActiveFilters ? 'Try adjusting your filters' : 'No users have registered yet'}</p>
            </div>
          ) : (
            <div className="users_table-wrapper">
              <table className="users_users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Contact Number</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="users_user-row">
                      <td className="users_id-cell">
                        <span className="users_id-badge">{user.id.substring(0, 12)}...</span>
                      </td>
                      <td className="users_name-cell">
                        <span className="users_first-name">{user.first_name}</span>
                      </td>
                      <td className="users_name-cell">
                        <span className="users_last-name">{user.last_name}</span>
                      </td>
                      <td className="users_email-cell">
                        <a href={`mailto:${user.email}`} className="users_email-link">{user.email}</a>
                      </td>
                      <td className="users_contact-cell">
                        {user.contact_number ? (
                          <span className="users_contact-number">{user.contact_number}</span>
                        ) : (
                          <span className="users_no-data">—</span>
                        )}
                      </td>
                      <td className="users_date-cell">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Users
