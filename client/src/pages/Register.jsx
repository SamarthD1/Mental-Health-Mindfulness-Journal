import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Pages.css'

const Register = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated, loading, error } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError(null)

    if (!form.name || !form.email || !form.password) {
      setLocalError('Please fill out all fields.')
      return
    }

    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setLocalError(err?.message || 'Registration failed.')
    }
  }

  return (
    <section className="page">
      <div className="auth-container">
        <div className="card">
          <h2>Create your account</h2>
          <p className="muted">Sign up to start journaling and tracking your mood.</p>
          {localError && <p className="error">{localError}</p>}
          {error && !localError && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
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
                autoComplete="new-password"
              />
            </div>
            <div className="form-actions">
              <button className="button primary" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <Link to="/login" className="inline-link" style={{ textAlign: 'right', lineHeight: '1.2' }}>
                Already have an account?<br />Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Register

