import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTherapistList, selectTherapist, getMyTherapist, disconnectTherapist } from '../api/therapist.js'
import { useAuth } from '../context/AuthContext.jsx'
import { UserPlus, UserCheck, Check, XCircle } from 'lucide-react'
import './Pages.css'

const SelectTherapist = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [therapists, setTherapists] = useState([])
    const [myTherapist, setMyTherapist] = useState(null)
    const [loading, setLoading] = useState(true)

    // Redirect therapists and admins away from this page
    useEffect(() => {
        if (user?.role === 'therapist') {
            navigate('/therapist-dashboard', { replace: true })
        } else if (user?.role === 'admin') {
            navigate('/admin', { replace: true })
        }
    }, [user, navigate])

    // If we are redirecting, render nothing or a loader
    if (user?.role === 'therapist' || user?.role === 'admin') return null

    const refreshData = async () => {
        setLoading(true)
        try {
            const my = await getMyTherapist()
            setMyTherapist(my)

            if (!my) {
                const list = await getTherapistList()
                // Filter out the current user if they somehow have therapist role
                const filteredList = list.filter(t => t._id !== user?.id && t._id !== user?._id)
                setTherapists(filteredList)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshData()
    }, [])

    const handleSelect = async (therapist) => {
        if (!confirm(`Select ${therapist.name} as your therapist?`)) return
        try {
            await selectTherapist(therapist._id)
            // Ideally force a user context refresh here. For now, reload data
            await refreshData()
            // We can also force a reload of the page to update context if needed
            window.location.reload()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to select therapist')
        }
    }

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect from your therapist?')) return
        try {
            await disconnectTherapist()
            setMyTherapist(null)
            await refreshData()
            window.location.reload()
        } catch (err) {
            alert(err.message)
        }
    }

    if (loading) return <div className="page-container">Loading...</div>

    if (myTherapist) {
        return (
            <div className="page-container">
                <header className="page-header">
                    <h1>My Therapist</h1>
                    <p className="subtitle">You are currently connected with a professional.</p>
                </header>

                <div className="card" style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#dcfce7', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: '#166534' }}>
                        {myTherapist.name.charAt(0)}
                    </div>
                    <h2>{myTherapist.name}</h2>
                    <p className="muted" style={{ marginBottom: '2rem' }}>{myTherapist.email}</p>

                    <button className="button ghost" onClick={handleDisconnect} style={{ color: '#ef4444', width: '100%' }}>
                        <XCircle size={18} /> Disconnect
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Find a Therapist</h1>
                <p className="subtitle">Connect with a professional to guide your journey.</p>
            </header>

            <div className="therapist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {therapists.length === 0 ? (
                    <p>No therapists available at the moment.</p>
                ) : (
                    therapists.map(therapist => (
                        <div key={therapist._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#0284c7' }}>
                                {therapist.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{therapist.name}</h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Licensed Therapist</p>
                            </div>

                            <button className="button primary" onClick={() => handleSelect(therapist)}>
                                <UserPlus size={18} /> Select Therapist
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default SelectTherapist
