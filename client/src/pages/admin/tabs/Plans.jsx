import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useAdminPlans } from '@/hooks'
import Loading from '@/components/loading/Loading'
import './Plans.css'

function Plans() {
  const { plans, loading, error, createPlan, updatePlan, deactivatePlan, refetch } = useAdminPlans()
  
  // Filter states
  const [statusFilters, setStatusFilters] = useState(['active'])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
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
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    max_tickets: '',
    is_active: true
  })

  // Apply filters
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      // Status filter
      const planStatus = plan.is_active ? 'active' : 'inactive'
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(planStatus)
      
      // Price range filter
      const price = Number(plan.price)
      const matchesMin = !priceRange.min || price >= Number(priceRange.min)
      const matchesMax = !priceRange.max || price <= Number(priceRange.max)
      
      return matchesStatus && matchesMin && matchesMax
    })
  }, [plans, statusFilters, priceRange])

  const hasActiveFilters = statusFilters.length > 0 || priceRange.min || priceRange.max

  const handleCreatePlan = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      max_tickets: '',
      is_active: true
    })
    setIsModalOpen(true)
  }

  const handleEditPlan = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      max_tickets: plan.max_tickets?.toString() || '',
      is_active: plan.is_active
    })
    setIsModalOpen(true)
  }

  const handleDeactivatePlan = async (planId) => {
    if (window.confirm('Are you sure you want to deactivate this plan? This will prevent new bookings.')) {
      await deactivatePlan(planId)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, formData)
      } else {
        await createPlan(formData)
      }
      setIsModalOpen(false)
      setEditingPlan(null)
    } catch (err) {
      console.error('Failed to save plan:', err)
    }
  }

  const handleClearAllFilters = () => {
    setStatusFilters(['active'])
    setPriceRange({ min: '', max: '' })
  }

  const handleStatusFilterToggle = (status) => {
    if (statusFilters.includes(status)) {
      setStatusFilters(statusFilters.filter(s => s !== status))
    } else {
      setStatusFilters([...statusFilters, status])
    }
    setOpenDropdown(null)
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

  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'plans_status-active' : 'plans_status-inactive'
  }

  const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive'
  }

  return (
    <div className="plans_tab">
      {/* Header Section */}
      <div className="plans_tab-header">
        <div className="plans_header-content">
          <h1 className="plans_plans-title">All Plans</h1>
          <p className="plans_advisory-text">
            Create and manage ticket plans for your church events with flexible options for different attendee groups. Edit existing plans, deactivate outdated ones, and filter by status or price range to keep your event offerings organized and up-to-date for your congregation.
          </p>
        </div>
      </div>

      {/* Filters Container */}
      <div className="plans_filters-container" ref={dropdownRef}>
        <div className="plans_filters-left">
          <span className="plans_filters-label">Filters:</span>
          
          {/* Status Filter */}
          <div className="plans_filter-dropdown">
            <button 
              className={`plans_filter-badge ${openDropdown === 'status' ? 'plans_active' : ''}`}
              onClick={() => toggleDropdown('status')}
            >
              <svg className="plans_filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="6" y1="6" x2="6" y2="6.01" />
                <line x1="12" y1="6" x2="12" y2="6.01" />
                <line x1="18" y1="6" x2="18" y2="6.01" />
                <line x1="6" y1="12" x2="6" y2="12.01" />
                <line x1="12" y1="12" x2="12" y2="12.01" />
                <line x1="18" y1="12" x2="18" y2="12.01" />
                <line x1="6" y1="18" x2="6" y2="18.01" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
                <line x1="18" y1="18" x2="18" y2="18.01" />
              </svg>
              Status
              {statusFilters.length > 0 && (
                <span className="plans_filter-count">{statusFilters.length}</span>
              )}
            </button>
            
            {openDropdown === 'status' && (
              <div className="plans_dropdown-menu">
                <div className="plans_dropdown-header">
                  Select Status
                  {statusFilters.length > 0 && (
                    <button 
                      className="plans_clear-filter-btn"
                      onClick={() => setStatusFilters([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="plans_dropdown-item" onClick={() => handleStatusFilterToggle('active')}>
                  <input 
                    type="checkbox" 
                    checked={statusFilters.includes('active')} 
                    onChange={() => {}}
                  />
                  <span className="plans_status-mini plans_status-active">Active</span>
                </div>
                <div className="plans_dropdown-item" onClick={() => handleStatusFilterToggle('inactive')}>
                  <input 
                    type="checkbox" 
                    checked={statusFilters.includes('inactive')} 
                    onChange={() => {}}
                  />
                  <span className="plans_status-mini plans_status-inactive">Inactive</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Price Range Filter */}
          <div className="plans_price-filter">
            <div className="plans_price-input-wrapper">
              <svg className="plans_price-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <input
                type="number"
                className="plans_price-input"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
              <span className="plans_price-separator">—</span>
              <input
                type="number"
                className="plans_price-input"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="plans_filters-right">
          {hasActiveFilters && (
            <button className="plans_clear-all-btn" onClick={handleClearAllFilters}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear All
            </button>
          )}
          <button className="plans_create-btn" onClick={handleCreatePlan}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Plan
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="plans_active-filters">
          {statusFilters.map(status => (
            <span key={status} className="plans_active-filter-tag">
              <span className={`plans_status-mini ${getStatusBadgeClass(status === 'active')}`}>
                {getStatusLabel(status === 'active')}
              </span>
              <button onClick={() => handleStatusFilterToggle(status)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
          {priceRange.min && (
            <span className="plans_active-filter-tag">
              Min: ₱{Number(priceRange.min).toLocaleString()}
              <button onClick={() => setPriceRange({ ...priceRange, min: '' })}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
          {priceRange.max && (
            <span className="plans_active-filter-tag">
              Max: ₱{Number(priceRange.max).toLocaleString()}
              <button onClick={() => setPriceRange({ ...priceRange, max: '' })}>
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
        <div className="plans_error-container">
          <div className="plans_error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="plans_error-message">{error}</p>
          <button className="plans_retry-btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading Container */}
      {loading && (
        <div className="plans_loading-container">
          <Loading isVisible={true} message="Loading plans..." />
        </div>
      )}

      {/* Plans Cards Container */}
      {!loading && !error && (
        <div className="plans_plans-container">
          {filteredPlans.length === 0 ? (
            <div className="plans_empty-state">
              <svg className="plans_empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <h3>No Plans Found</h3>
              <p>{hasActiveFilters ? 'Try adjusting your filters' : 'Create your first ticket plan'}</p>
              {!hasActiveFilters && (
                <button className="plans_create-btn plans_create-btn-large" onClick={handleCreatePlan}>
                  Create Plan
                </button>
              )}
            </div>
          ) : (
            <div className="plans_plans-grid">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="plans_plan-card">
                  <div className="plans_plan-header">
                    <div className="plans_plan-title-section">
                      <h3 className="plans_plan-name">{plan.name}</h3>
                      <span className={`plans_status-badge ${getStatusBadgeClass(plan.is_active)}`}>
                        {getStatusLabel(plan.is_active)}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="plans_plan-description">{plan.description}</p>
                    )}
                  </div>
                  
                  <div className="plans_plan-details">
                    <div className="plans_detail-item">
                      <span className="plans_detail-label">Price</span>
                      <span className="plans_detail-value">₱{Number(plan.price).toLocaleString()}</span>
                    </div>
                    {plan.max_tickets && (
                      <div className="plans_detail-item">
                        <span className="plans_detail-label">Max Tickets</span>
                        <span className="plans_detail-value">{plan.max_tickets}</span>
                      </div>
                    )}
                    <div className="plans_detail-item">
                      <span className="plans_detail-label">Created</span>
                      <span className="plans_detail-value">
                        {new Date(plan.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="plans_plan-actions">
                    <button 
                      className="plans_action-btn plans_action-btn-edit"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    {plan.is_active && (
                      <button 
                        className="plans_action-btn plans_action-btn-deactivate"
                        onClick={() => handleDeactivatePlan(plan.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="plans_modal-overlay" onClick={closeDropdown}>
          <div className="plans_modal" onClick={(e) => e.stopPropagation()}>
            <div className="plans_modal-header">
              <h2 className="plans_modal-title">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button 
                className="plans_modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <form className="plans_modal-form" onSubmit={handleSubmit}>
              <div className="plans_form-group">
                <label className="plans_form-label">Plan Name</label>
                <input
                  type="text"
                  className="plans_form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter plan name"
                  required
                />
              </div>
              
              <div className="plans_form-group">
                <label className="plans_form-label">Description</label>
                <textarea
                  className="plans_form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter plan description (optional)"
                  rows={3}
                />
              </div>
              
              <div className="plans_form-row">
                <div className="plans_form-group">
                  <label className="plans_form-label">Price</label>
                  <input
                    type="number"
                    className="plans_form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div className="plans_form-group">
                  <label className="plans_form-label">Max Tickets</label>
                  <input
                    type="number"
                    className="plans_form-input"
                    value={formData.max_tickets}
                    onChange={(e) => setFormData({ ...formData, max_tickets: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    min="1"
                  />
                </div>
              </div>
              
              {editingPlan && (
                <div className="plans_form-group">
                  <label className="plans_form-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span className="plans_form-checkbox-label">Plan is active</span>
                  </label>
                </div>
              )}
              
              <div className="plans_modal-actions">
                <button 
                  type="button" 
                  className="plans_action-btn plans_action-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="plans_action-btn plans_action-btn-submit">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Plans
