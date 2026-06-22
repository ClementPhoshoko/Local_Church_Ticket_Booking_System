import React from 'react'
import './AuthLayout.css'
import AuthForms from './AuthForms'
import heroImage from '../../assets/Family_picnic_by_the_lakeside.png'

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__hero">
        <img src={heroImage} alt="Family picnic" className="auth-layout__hero-image" />
      </div>
      <div className="auth-layout__verse">
        <p>For God so loved the world.</p>
        <p>He gave His only begotten Son.</p>
        <p>Whoever believes in Him shall not perish.</p>
        <p>But have everlasting life.</p>
        <p className="auth-layout__verse-reference">John 3:16</p>
      </div>
      <div className="auth-layout__content">
        <AuthForms />
      </div>
    </div>
  )
}

export default AuthLayout
