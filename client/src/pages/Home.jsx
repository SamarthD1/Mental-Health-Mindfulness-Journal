import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Pages.css'

const Home = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      title: 'Daily Journal',
      description: 'Log daily mood, thoughts, and gratitude to keep track of your mental state.',
      icon: '📝',
      link: '/journal',
    },
    {
      title: 'Guided Exercises',
      description: 'Access guided meditation and breathing exercises to calm your mind.',
      icon: '🧘',
      link: '/exercises',
    },
    {
      title: 'Insights',
      description: 'View trends and insights over time to understand your emotional patterns.',
      icon: '📊',
      link: '/insights',
    },
    {
      title: 'Goals',
      description: 'Set mental health goals and track your progress towards achieving them.',
      icon: '🎯',
      link: '/goals',
    },
  ]

  return (
    <section className="page home-page">
      <div className="hero">
        <p className="eyebrow">Welcome to MindSpace</p>
        <h1>Your personal space to reflect, relax, and grow.</h1>
        <p className="lede">
          A private, secure, and intuitive journal designed to help you prioritize your
          mental wellness. Track your moods, practice mindfulness, and gain valuable insights.
        </p>
        <div className="actions">
          {isAuthenticated ? (
            <Link className="button primary" to="/dashboard">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link className="button primary" to="/register">
                Get Started
              </Link>
              <Link className="button ghost" to="/login">
                Log In
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features-section" style={{ marginTop: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#111827' }}>
          Everything you need for your journey
        </h2>
        <div className="split">
          {features.map((feature) => (
            <div key={feature.title} className="card feature-card">
              <div
                className="feature-icon"
                style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p className="muted">{feature.description}</p>
              {isAuthenticated && (
                <Link to={feature.link} className="inline-link">
                  Open {feature.title} &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Home
