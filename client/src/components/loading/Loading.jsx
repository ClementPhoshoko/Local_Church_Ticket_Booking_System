import React from 'react'
import './Loading.css'

function Loading({ message = 'Loading...', isVisible = false }) {
  if (!isVisible) return null

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  )
}

export default Loading
