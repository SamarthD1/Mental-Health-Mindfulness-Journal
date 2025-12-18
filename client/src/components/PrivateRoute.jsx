import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If roles are defined and user doesn't have permissions
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // Smart redirect based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else if (user?.role === 'therapist') {
      return <Navigate to="/therapist-dashboard" replace />
    } else {
      // Default user
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default PrivateRoute
