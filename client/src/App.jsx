import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Journal from './pages/Journal.jsx'
import Mindfulness from './pages/Mindfulness.jsx'
import Goals from './pages/Goals.jsx'
import Insights from './pages/Insights.jsx'
import CrisisSupport from './pages/CrisisSupport.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Community from './pages/Community.jsx'
import SelectTherapist from './pages/SelectTherapist.jsx'
import TherapistDashboard from './pages/TherapistDashboard.jsx'
import { ToastContainer } from './components/Toast.jsx'
import './App.css'

const App = () => {
  return (
    <div className="app">
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/crisis" element={<CrisisSupport />} />
          <Route
            path="/insights"
            element={
              <PrivateRoute roles={['user']}>
                <Insights />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['user']}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute roles={['user']}>
                <Goals />
              </PrivateRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <PrivateRoute roles={['user']}>
                <Journal />
              </PrivateRoute>
            }
          />
          <Route
            path="/community"
            element={
              <PrivateRoute roles={['user', 'therapist', 'admin']}>
                <Community />
              </PrivateRoute>
            }
          />

          <Route
            path="/therapists"
            element={
              <PrivateRoute roles={['user']}>
                <SelectTherapist />
              </PrivateRoute>
            }
          />

          <Route
            path="/therapist-dashboard"
            element={
              <PrivateRoute roles={['therapist']}>
                <TherapistDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/mindfulness"
            element={
              <PrivateRoute>
                <Mindfulness />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default App
