import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Pages.css'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading, error } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState(null)

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError(null)

    if (!form.email || !form.password) {
      setLocalError('Please enter your email and password.')
      return
    }

    try {
      const res = await login(form)

      // Role-based redirect
      if (res?.user?.role === 'therapist') {
        navigate('/therapist-dashboard', { replace: true })
      } else if (res?.user?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      setLocalError(err?.message || 'Login failed.')
    }
  }

  return (
    <section className="page">
      <div className="auth-container">
        <div className="card">
          <h2>Welcome back</h2>
          <p className="muted">Log in to view your journal and insights.</p>
          {localError && <p className="error">{localError}</p>}
          {error && !localError && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="form-actions">
              <button className="button primary" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </button>
              <Link to="/register" className="inline-link">
                Need an account? Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login

