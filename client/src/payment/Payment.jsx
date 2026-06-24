import React from 'react'
import './Payment.css'

function Payment({
  selectedTicket,
  transactions,
  paymentsLoading,
  processingPayment,
  processingCancel,
  handleCloseDetails,
  handleInitiatePayment,
  handleCancelTicket
}) {
  if (!selectedTicket) return null

  return (
    <div className="modal-overlay" onClick={handleCloseDetails}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ticket Details</h2>
          <button className="close-btn" onClick={handleCloseDetails} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          {/* Info rows */}
          <div className="ticket-info">
            <div className="info-row">
              <span className="label">Unique Code</span>
              <span className="value code-value">{selectedTicket.unique_code}</span>
            </div>
            <div className="info-row">
              <span className="label">Plan</span>
              <span className="value">{selectedTicket.ticket_plans?.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Description</span>
              <span className="value">{selectedTicket.ticket_plans?.description || 'No description'}</span>
            </div>
            <div className="info-row">
              <span className="label">Price</span>
              <span className="value">
                {selectedTicket.ticket_plans?.currency} {selectedTicket.ticket_plans?.price.toFixed(2)}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Status</span>
              <span className={`value status-badge status-${selectedTicket.status}`}>
                {selectedTicket.status}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Booked At</span>
              <span className="value">{new Date(selectedTicket.created_at).toLocaleString()}</span>
            </div>
            {selectedTicket.confirmed_at && (
              <div className="info-row">
                <span className="label">Confirmed At</span>
                <span className="value">{new Date(selectedTicket.confirmed_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Payment section */}
          {selectedTicket.status === 'pending' && (
            <div className="payment-section">
              <h3>Complete Payment</h3>
              <p>Click below to complete your payment using our mock payment gateway.</p>
              <button
                className="pay-now-btn"
                onClick={handleInitiatePayment}
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing…' : 'Pay Now'}
              </button>
            </div>
          )}

          {/* Payment history */}
          {transactions.length > 0 && (
            <div className="transactions-section">
              <h3>Payment History</h3>
              <div className="transactions-list">
                {transactions.map(tx => (
                  <div key={tx.id} className="transaction-item">
                    <div className="tx-info">
                      <span className="tx-gateway">{tx.gateway}</span>
                      <span className={`tx-status status-badge status-${tx.status}`}>{tx.status}</span>
                    </div>
                    <div className="tx-amount">
                      {tx.currency} {tx.amount.toFixed(2)}
                    </div>
                    <div className="tx-date">
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {selectedTicket.status === 'confirmed' && (
            <button
              className="cancel-ticket-btn"
              onClick={() => handleCancelTicket(selectedTicket.id)}
              disabled={processingCancel === selectedTicket.id}
            >
              {processingCancel === selectedTicket.id ? 'Cancelling…' : 'Cancel Ticket'}
            </button>
          )}
          <button className="close-modal-btn" onClick={handleCloseDetails}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default Payment
