import React, { useState, useRef, useEffect } from 'react'
import { useAdminBookings } from '@/hooks'
import Loading from '@/components/loading/Loading'
import './Bookings.css'

// Bookings tab component
function Bookings({ onStatusChange }) {
  const { bookings, loading, error, refetch } = useAdminBookings()
  const [filters, setFilters] = useState({
    plan: [],
    status: [],
    actions: []
  })
  const [showPlanDropdown, setShowPlanDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPlanDropdown(false)
        setShowStatusDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Get unique plan names from bookings
  const uniquePlans = [...new Set(bookings.map(b => b.plan_name).filter(Boolean))]
  const uniqueStatuses = ['pending', 'confirmed', 'cancelled', 'refunded']

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type]
      const isSelected = current.includes(value)
      return {
        ...prev,
        [type]: isSelected ? current.filter(v => v !== value) : [...current, value]
      }
    })
    setShowPlanDropdown(false)
    setShowStatusDropdown(false)
  }

  const clearFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      [type]: []
    }))
  }

  const clearAllFilters = () => {
    setFilters({ plan: [], status: [], actions: [] })
  }

  // Apply filters
  const filteredBookings = bookings.filter(booking => {
    const planMatch = filters.plan.length === 0 || filters.plan.includes(booking.plan_name)
    const statusMatch = filters.status.length === 0 || filters.status.includes(booking.ticket_status)
    return planMatch && statusMatch
  })

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bookings_status-pending'
      case 'confirmed':
        return 'bookings_status-confirmed'
      case 'cancelled':
        return 'bookings_status-cancelled'
      case 'refunded':
        return 'bookings_status-refunded'
      default:
        return ''
    }
  }

  const hasActiveFilters = filters.plan.length > 0 || filters.status.length > 0

  return (
    <div className="bookings_tab">
      {/* Header Section */}
      <div className="bookings_tab-header">
        <div className="bookings_header-content">
          <h1 className="bookings_booking-title">All Bookings</h1>
          <p className="bookings_advisory-text">
            Manage all ticket bookings in one place. You can view booking details, update statuses, and filter by plan or status.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bookings_filters-container" ref={dropdownRef}>
        <div className="bookings_filters-left">
          <span className="bookings_filters-label">Filters:</span>
          
          {/* Plan Filter */}
          <div className="bookings_filter-dropdown">
            <button 
              className={`bookings_filter-badge ${filters.plan.length > 0 ? 'bookings_active' : ''}`}
              onClick={() => {
                setShowPlanDropdown(!showPlanDropdown)
                setShowStatusDropdown(false)
              }}
            >
              <svg className="bookings_filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Plan
              {filters.plan.length > 0 && (
                <span className="bookings_filter-count">{filters.plan.length}</span>
              )}
            </button>
            {showPlanDropdown && (
              <div className="bookings_dropdown-menu">
                <div className="bookings_dropdown-header">
                  <span>Select Plans</span>
                  {filters.plan.length > 0 && (
                    <button className="bookings_clear-filter-btn" onClick={() => clearFilter('plan')}>Clear</button>
                  )}
                </div>
                {uniquePlans.length === 0 ? (
                  <div className="bookings_dropdown-empty">No plans available</div>
                ) : (
                  uniquePlans.map(plan => (
                    <label key={plan} className="bookings_dropdown-item">
                      <input 
                        type="checkbox" 
                        checked={filters.plan.includes(plan)}
                        onChange={() => toggleFilter('plan', plan)}
                      />
                      <span>{plan}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="bookings_filter-dropdown">
            <button 
              className={`bookings_filter-badge ${filters.status.length > 0 ? 'bookings_active' : ''}`}
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown)
                setShowPlanDropdown(false)
              }}
            >
              <svg className="bookings_filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Status
              {filters.status.length > 0 && (
                <span className="bookings_filter-count">{filters.status.length}</span>
              )}
            </button>
            {showStatusDropdown && (
              <div className="bookings_dropdown-menu">
                <div className="bookings_dropdown-header">
                  <span>Select Statuses</span>
                  {filters.status.length > 0 && (
                    <button className="bookings_clear-filter-btn" onClick={() => clearFilter('status')}>Clear</button>
                  )}
                </div>
                {uniqueStatuses.map(status => (
                  <label key={status} className="bookings_dropdown-item">
                    <input 
                      type="checkbox" 
                      checked={filters.status.includes(status)}
                      onChange={() => toggleFilter('status', status)}
                    />
                    <span className={`bookings_status-mini bookings_status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <button className="bookings_clear-all-btn" onClick={clearAllFilters}>
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
        <div className="bookings_active-filters">
          {filters.plan.map(plan => (
            <span key={`plan-${plan}`} className="bookings_active-filter-tag">
              {plan}
              <button onClick={() => toggleFilter('plan', plan)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
          {filters.status.map(status => (
            <span key={`status-${status}`} className="bookings_active-filter-tag">
              <span className={`bookings_status-mini bookings_status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              <button onClick={() => toggleFilter('status', status)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bookings_error-container">
          <div className="bookings_error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="bookings_error-message">{error}</p>
          <button className="bookings_retry-btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bookings_loading-container">
          <Loading isVisible={true} message="Loading bookings..." />
        </div>
      )}

      {/* Bookings Table */}
      {!loading && !error && (
        <div className="bookings_bookings-table-container">
          {filteredBookings.length === 0 ? (
            <div className="bookings_empty-state">
              <svg className="bookings_empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h3>No Bookings Found</h3>
              <p>{hasActiveFilters ? 'Try adjusting your filters' : 'No bookings have been made yet'}</p>
            </div>
          ) : (
            <div className="bookings_table-wrapper">
              <table className="bookings_bookings-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Booked At</th>
                    <th className="bookings_actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.ticket_uuid} className="bookings_booking-row">
                      <td className="bookings_code-cell">
                        <span className="bookings_code-badge">{booking.unique_code}</span>
                      </td>
                      <td className="bookings_user-cell">
                        <div className="bookings_user-info">
                          <div className="bookings_user-avatar">
                            {booking.first_name?.charAt(0)}{booking.last_name?.charAt(0)}
                          </div>
                          <div className="bookings_user-details">
                            <span className="bookings_user-name">{booking.first_name} {booking.last_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="bookings_plan-cell">
                        <span className="bookings_plan-name">{booking.plan_name}</span>
                      </td>
                      <td className="bookings_status-cell">
                        <span className={`bookings_status-badge ${getStatusBadgeClass(booking.ticket_status)}`}>
                          {booking.ticket_status.charAt(0).toUpperCase() + booking.ticket_status.slice(1)}
                        </span>
                      </td>
                      <td className="bookings_date-cell">
                        {new Date(booking.booked_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="bookings_actions-cell">
                        <select 
                          className="bookings_status-select"
                          value={booking.ticket_status}
                          onChange={(e) => onStatusChange?.(booking.ticket_uuid, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="cancelled">Cancel</option>
                          <option value="refunded">Refund</option>
                        </select>
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

export default Bookings
