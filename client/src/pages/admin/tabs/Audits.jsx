import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useAdminAuditLogs } from '@/hooks'
import Loading from '@/components/loading/Loading'
import './Audits.css'

// Audit logs component
function Audits() {
  const { auditLogs, loading, error, refetch } = useAdminAuditLogs()
  const [categoryFilters, setCategoryFilters] = useState([])
  const [actionFilters, setActionFilters] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (!log) return false
      
      const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(log.table_name)
      const matchesAction = actionFilters.length === 0 || actionFilters.includes(log.action)
      
      const logDate = log.changed_at ? new Date(log.changed_at) : null
      const matchesDateFrom = !dateFrom || (logDate && logDate >= new Date(dateFrom))
      const matchesDateTo = !dateTo || (logDate && logDate <= new Date(new Date(dateTo).setHours(23, 59, 59, 999)))
      
      return matchesCategory && matchesAction && matchesDateFrom && matchesDateTo
    })
  }, [auditLogs, categoryFilters, actionFilters, dateFrom, dateTo])

  const hasActiveFilters = categoryFilters.length > 0 || actionFilters.length > 0 || dateFrom || dateTo

  const categories = useMemo(() => {
    const cats = new Set()
    auditLogs.forEach(log => log.table_name && cats.add(log.table_name))
    return Array.from(cats)
  }, [auditLogs])

  const actions = useMemo(() => {
    const acts = new Set()
    auditLogs.forEach(log => log.action && acts.add(log.action))
    return Array.from(acts)
  }, [auditLogs])

  const toggleCategoryFilter = (category) => {
    if (categoryFilters.includes(category)) {
      setCategoryFilters(categoryFilters.filter(c => c !== category))
    } else {
      setCategoryFilters([...categoryFilters, category])
    }
    setOpenDropdown(null)
  }

  const toggleActionFilter = (action) => {
    if (actionFilters.includes(action)) {
      setActionFilters(actionFilters.filter(a => a !== action))
    } else {
      setActionFilters([...actionFilters, action])
    }
    setOpenDropdown(null)
  }

  const clearAllFilters = () => {
    setCategoryFilters([])
    setActionFilters([])
    setDateFrom('')
    setDateTo('')
  }

  const toggleDropdown = (dropdownName) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(dropdownName)
    }
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  const getCategoryBadgeClass = (tableName) => {
    const tn = (tableName || '').toLowerCase()
    if (tn.includes('user') || tn.includes('auth') || tn.includes('profiles')) return 'audits_category-user'
    if (tn.includes('booking') || tn.includes('ticket') || tn.includes('tickets')) return 'audits_category-booking'
    if (tn.includes('plan') || tn.includes('ticket_plans')) return 'audits_category-plan'
    if (tn.includes('system')) return 'audits_category-system'
    return 'audits_category-default'
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown Date'
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="audits_tab">
      <div className="audits_tab-header">
        <div className="audits_header-content">
          <h1 className="audits_audit-title">Audit Logs</h1>
          <p className="audits_advisory-text">
            Track all system activities and changes. Filter by category, action, or date range.
          </p>
        </div>
      </div>

      <div className="audits_filters-container" ref={dropdownRef}>
        <div className="audits_filters-left">
          <span className="audits_filters-label">Filters:</span>

          <div className="audits_filter-dropdown">
            <button 
              className={`audits_filter-badge ${openDropdown === 'category' ? 'audits_active' : ''}`}
              onClick={() => toggleDropdown('category')}
            >
              <svg className="audits_filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Category
              {categoryFilters.length > 0 && (
                <span className="audits_filter-count">{categoryFilters.length}</span>
              )}
            </button>
            {openDropdown === 'category' && (
              <div className="audits_dropdown-menu">
                <div className="audits_dropdown-header">
                  Select Categories
                  {categoryFilters.length > 0 && (
                    <button 
                      className="audits_clear-filter-btn"
                      onClick={() => setCategoryFilters([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {categories.length === 0 ? (
                  <div className="audits_dropdown-empty">No categories available</div>
                ) : (
                  categories.map(category => (
                  <div 
                    key={category} 
                    className="audits_dropdown-item" 
                    onClick={() => toggleCategoryFilter(category)}
                  >
                    <input 
                      type="checkbox" 
                      checked={categoryFilters.includes(category)} 
                      onChange={() => {}}
                    />
                    <span className={`audits_category-mini ${getCategoryBadgeClass(category)}`}>
                      {category || 'Unknown'}
                    </span>
                  </div>
                )))}
              </div>
            )}
          </div>

          <div className="audits_filter-dropdown">
            <button 
              className={`audits_filter-badge ${openDropdown === 'action' ? 'audits_active' : ''}`}
              onClick={() => toggleDropdown('action')}
            >
              <svg className="audits_filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Action
              {actionFilters.length > 0 && (
                <span className="audits_filter-count">{actionFilters.length}</span>
              )}
            </button>
            {openDropdown === 'action' && (
              <div className="audits_dropdown-menu">
                <div className="audits_dropdown-header">
                  Select Actions
                  {actionFilters.length > 0 && (
                    <button 
                      className="audits_clear-filter-btn"
                      onClick={() => setActionFilters([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {actions.length === 0 ? (
                  <div className="audits_dropdown-empty">No actions available</div>
                ) : (
                  actions.map(action => (
                  <div 
                    key={action} 
                    className="audits_dropdown-item" 
                    onClick={() => toggleActionFilter(action)}
                  >
                    <input 
                      type="checkbox" 
                      checked={actionFilters.includes(action)} 
                      onChange={() => {}}
                    />
                    {action}
                  </div>
                )))}
              </div>
            )}
          </div>

          <div className="audits_date-filter">
            <div className="audits_date-input-wrapper">
              <svg className="audits_date-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                className="audits_date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="audits_date-label">From</span>
            </div>
          </div>

          <div className="audits_date-filter">
            <div className="audits_date-input-wrapper">
              <svg className="audits_date-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                className="audits_date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <span className="audits_date-label">To</span>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <button className="audits_clear-all-btn" onClick={clearAllFilters}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear All
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="audits_active-filters">
          {categoryFilters.map(tableName => (
            <span key={tableName} className="audits_active-filter-tag">
              <span className={`audits_category-mini ${getCategoryBadgeClass(tableName)}`}>
                {tableName}
              </span>
              <button onClick={() => toggleCategoryFilter(tableName)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
          {actionFilters.map(action => (
            <span key={action} className="audits_active-filter-tag">
              {action}
              <button onClick={() => toggleActionFilter(action)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
          {dateFrom && (
            <span className="audits_active-filter-tag">
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
            <span className="audits_active-filter-tag">
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

      {error && (
        <div className="audits_error-container">
          <div className="audits_error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="audits_error-message">{error}</p>
          <button className="audits_retry-btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      )}

      {loading && (
        <div className="audits_loading-container">
          <Loading isVisible={true} message="Loading audit logs..." />
        </div>
      )}

      {!loading && !error && (
        <div className="audits_audit-logs-container">
          {filteredLogs.length === 0 ? (
            <div className="audits_empty-state">
              <svg className="audits_empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <h3>No Audit Logs Found</h3>
              <p>{hasActiveFilters ? 'Try adjusting your filters' : 'No audit logs have been recorded yet'}</p>
            </div>
          ) : (
            <div className="audits_table-wrapper">
              <table className="audits_audit-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Timestamp</th>
                    <th>Description</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="audits_log-row">
                      <td className="audits_id-cell">
                        {log.id}
                      </td>
                      <td className="audits_category-cell">
                        <span className={`audits_category-badge ${getCategoryBadgeClass(log.table_name)}`}>
                          {log.table_name || 'Unknown'}
                        </span>
                      </td>
                      <td className="audits_action-cell">
                        {log.action || 'Unknown'}
                      </td>
                      <td className="audits_user-cell">
                        {log.changed_by ? (String(log.changed_by).substring(0, 12) + '...') : 'System'}
                      </td>
                      <td className="audits_timestamp-cell">
                        {formatTimestamp(log.changed_at)}
                      </td>
                      <td className="audits_description-cell">
                        {`Record ${log.record_id}`}
                      </td>
                      <td className="audits_details-cell">
                        {log.old_data || log.new_data ? (
                          <details className="audits_metadata-toggle">
                            <summary>View</summary>
                            <pre className="audits_metadata-content">
                              {JSON.stringify({ old: log.old_data, new: log.new_data }, null, 2)}
                            </pre>
                          </details>
                        ) : '-'}
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

export default Audits
