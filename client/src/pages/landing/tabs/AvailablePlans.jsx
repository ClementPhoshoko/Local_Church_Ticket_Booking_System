import React from 'react'
import Loading from '../../../components/loading/Loading'
import './AvailablePlans.css'

function AvailablePlans({ plans, plansLoading, plansError, refetchPlans, handleBuyTicket }) {
  return (
    <div className="tab-content">
      <h2>Ticket Plans</h2>

      {plansLoading && <Loading isVisible={true} message="Loading plans..." />}

      {plansError && (
        <div className="error-container">
          <p className="error-message">{plansError}</p>
          <button className="retry-btn" onClick={refetchPlans}>Try Again</button>
        </div>
      )}

      {!plansLoading && !plansError && (
        <div className="plans-grid">
          {plans.length === 0 ? (
            <div className="empty-state">No plans available at the moment.</div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="plan-card">
                <div className="plan-info">
                  <div className="plan-name">{plan.name}</div>
                  {plan.description && <p className="plan-desc">{plan.description}</p>}
                  <div className="plan-price">
                    {plan.currency} {plan.price.toFixed(2)}
                  </div>
                </div>
                <div className="plan-actions">
                  <button
                    className="primary-btn"
                    onClick={() => handleBuyTicket(plan.id)}
                  >
                    Buy Ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AvailablePlans
