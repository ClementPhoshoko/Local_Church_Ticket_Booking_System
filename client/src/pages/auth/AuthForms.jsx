import React, { useState } from 'react'
import './AuthForms.css'
import { supabase } from '../../services/supabase'
import Loading from '../../components/loading/Loading'

function AuthForms() {
  const [isLogin, setIsLogin] = useState(true)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    contact_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null) // 'success' or 'error'

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setMessageType(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      })

      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        setMessage('Login successful!')
        setMessageType('success')
      }
    } catch (err) {
      setMessage('An unexpected error occurred')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setMessageType(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            first_name: signupForm.first_name,
            last_name: signupForm.last_name,
            contact_number: signupForm.contact_number
          }
        }
      })

      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        setMessage('Sign up successful! Please check your email for verification.')
        setMessageType('success')
      }
    } catch (err) {
      setMessage('An unexpected error occurred')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    })
  }

  const handleSignupChange = (e) => {
    setSignupForm({
      ...signupForm,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Loading 
        isVisible={loading} 
        message={isLogin ? 'Signing in...' : 'Creating account...'} 
      />
      <div className="auth-forms">
        <div className={`auth-forms__card ${isLogin ? 'auth-forms__card--login' : 'auth-forms__card--signup'}`}>
          <div className="auth-forms__header">
            <h1 className="auth-forms__title">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="auth-forms__subtitle">
              {isLogin
                ? 'Sign in to continue to your account'
                : 'Join us and book your tickets today'}
            </p>
          </div>

          {message && (
            <div className={`auth-forms__message auth-forms__message--${messageType}`}>
              {message}
            </div>
          )}

          <div className="auth-forms__tabs">
            <button
              className={`auth-forms__tab ${isLogin ? 'auth-forms__tab--active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`auth-forms__tab ${!isLogin ? 'auth-forms__tab--active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <form key="login" className="auth-forms__form" onSubmit={handleLoginSubmit}>
              <div className="auth-forms__field">
                <label className="auth-forms__label" htmlFor="login-email">
                  Email
                </label>
                <input
                  className="auth-forms__input"
                  type="email"
                  id="login-email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                  placeholder="user@example.com"
                  disabled={loading}
                />
              </div>
              <div className="auth-forms__field">
                <label className="auth-forms__label" htmlFor="login-password">
                  Password
                </label>
                <input
                  className="auth-forms__input"
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <button className="auth-forms__button" type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Login'}
              </button>
            </form>
          ) : (
            <form key="signup" className="auth-forms__form" onSubmit={handleSignupSubmit}>
              <div className="auth-forms__field">
                <label className="auth-forms__label" htmlFor="signup-first-name">
                  First Name
                </label>
                <input
                  className="auth-forms__input"
                  type="text"
                  id="signup-first-name"
                  name="first_name"
                  value={signupForm.first_name}
                  onChange={handleSignupChange}
                  required
                  placeholder="John"
                  disabled={loading}
                />
              </div>
              <div className="auth-forms__field">
                <label className="auth-forms__label" htmlFor="signup-last-name">
                  Last Name
                </label>
                <input
                  className="auth-forms__input"
                  type="text"
                  id="signup-last-name"
                  name="last_name"
                  value={signupForm.last_name}
                  onChange={handleSignupChange}
                  required
                  placeholder="Doe"
                  disabled={loading}
                />
              </div>
              <div className="auth-forms__field">
                <label className="auth-forms__label" htmlFor="signup-email">
                  Email
                </label>
                <input
                  className="auth-forms__input"
                  type="email"
                  id="signup-email"
                  name="email"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  required
                  placeholder="user@example.com"
                  disabled={loading}
                />
              </div>
              <div className="auth-forms__field">
                <label className="auth-forms__label" htmlFor="signup-contact-number">
                  Contact Number
                </label>
                <input
                  className="auth-forms__input"
                  type="tel"
                  id="signup-contact-number"
                  name="contact_number"
                  value={signupForm.contact_number}
                  onChange={handleSignupChange}
                  required
                  placeholder="+1 234 567 8900"
                  disabled={loading}
                />
              </div>
              <div className="auth-forms__field">
                <label className="auth-forms__label" htmlFor="signup-password">
                  Password
                </label>
                <input
                  className="auth-forms__input"
                  type="password"
                  id="signup-password"
                  name="password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <button className="auth-forms__button" type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Sign Up'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

export default AuthForms
