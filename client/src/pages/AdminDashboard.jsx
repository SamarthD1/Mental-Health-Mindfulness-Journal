import { useState, useEffect } from 'react'
import { getMeditations } from '../api/meditations.js'

import { getCircles, createCircle, deleteCircle, getCircleMembers, banCircleMember } from '../api/circles.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Trash2, Plus, Users, Music, MessageCircle, ShieldBan, X } from 'lucide-react'
import './AdminDashboard.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050'

const AdminDashboard = () => {
    const { token } = useAuth()
    const [activeTab, setActiveTab] = useState('resources') // resources | users | therapists | circles
    const [meditations, setMeditations] = useState([])
    const [users, setUsers] = useState([])
    const [therapists, setTherapists] = useState([])
    const [newTherapist, setNewTherapist] = useState({ name: '', email: '', password: '', specialty: '', bio: '' })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Helper: Detect Type & Sanitize
    const handleUrlChange = (val) => {
        let cleanUrl = val
        let category = newItem.category

        // 1. Extract URL from iframe if present
        if (val.includes('<iframe')) {
            const match = val.match(/src="([^"]+)"/)
            if (match && match[1]) {
                cleanUrl = match[1]
            }
        }

        // 2. Auto-detect video
        if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
            category = 'video'
        }

        setNewItem({ ...newItem, audioUrl: cleanUrl, category })
    }

    // Form State for New Meditation
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        type: 'Meditation',
        category: 'audio',
        durationMinutes: 5,
        audioUrl: ''
    })

    const fetchMeditations = async () => {
        try {
            const data = await getMeditations()
            setMeditations(data || [])
        } catch (err) {
            console.error(err)
        }
    }

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch users')
            const data = await res.json()
            setUsers(data)
        } catch (err) {
            setError(err.message)
        }
    }


    const fetchTherapists = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/therapist/list`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch therapists')
            const data = await res.json()
            setTherapists(data)
        } catch (err) {
            setError(err.message)
        }
    }

    useEffect(() => {
        if (token) {
            if (activeTab === 'resources') fetchMeditations()
            if (activeTab === 'users') fetchUsers()
            if (activeTab === 'circles') fetchCirclesList()
            if (activeTab === 'therapists') fetchTherapists()
        }
    }, [activeTab, token])

    const handleCreateMeditation = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API_BASE}/api/meditations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newItem)
            })
            if (!res.ok) throw new Error('Failed to create')
            alert('Created successfully!')
            setNewItem({ title: '', description: '', type: 'Meditation', category: 'audio', durationMinutes: 5, audioUrl: '' })
            fetchMeditations()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleCreateTherapist = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API_BASE}/api/therapist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newTherapist)
            })
            if (!res.ok) throw new Error('Failed to create therapist')
            alert('Therapist created successfully!')
            setNewTherapist({ name: '', email: '', password: '', specialty: '', bio: '' })
            fetchTherapists()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteTherapist = async (id) => {
        if (!window.confirm('Are you sure you want to delete this therapist?')) return
        try {
            const res = await fetch(`${API_BASE}/api/therapist/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to delete')
            fetchTherapists()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteMeditation = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        try {
            const res = await fetch(`${API_BASE}/api/meditations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to delete')
            fetchMeditations()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleBanUser = async (id, currentStatus) => {
        const action = currentStatus ? 'unban' : 'ban'
        if (!confirm(`Are you sure you want to ${action} this user?`)) return
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${id}/ban`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to update status')
            fetchUsers()
        } catch (err) {
            alert(err.message)
        }
    }

    // Circles Management
    const [circlesList, setCirclesList] = useState([])
    const [selectedCircle, setSelectedCircle] = useState(null)
    const [circleMembers, setCircleMembers] = useState([])
    const [newCircle, setNewCircle] = useState({ name: '', description: '', rules: '' })

    const fetchCirclesList = async () => {
        try {
            const data = await getCircles() // Reusing the public getCircles which returns all
            setCirclesList(data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchCircleMembers = async (circleId) => {
        try {
            const data = await getCircleMembers(circleId)
            setCircleMembers(data)
        } catch (err) {
            console.error(err)
            alert('Failed to fetch members')
        }
    }

    const handleCreateCircle = async (e) => {
        e.preventDefault()
        try {
            await createCircle(newCircle)
            alert('Circle created!')
            setNewCircle({ name: '', description: '', rules: '' })
            fetchCirclesList()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create circle')
        }
    }

    const handleDeleteCircle = async (id) => {
        if (!confirm('Delete this circle? This cannot be undone.')) return
        try {
            await deleteCircle(id)
            fetchCirclesList()
            if (selectedCircle && selectedCircle._id === id) {
                setSelectedCircle(null)
                setCircleMembers([])
            }
        } catch (err) {
            alert('Failed to delete circle')
        }
    }

    const handleViewMembers = (circle) => {
        setSelectedCircle(circle)
        fetchCircleMembers(circle._id)
    }

    const handleBanMember = async (userId) => {
        if (!confirm('Ban this user from the circle? They will not be able to rejoin.')) return
        try {
            await banCircleMember(selectedCircle._id, userId)
            alert('User banned')
            fetchCircleMembers(selectedCircle._id)
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to ban user')
        }
    }

    return (
        <section className="page admin-page">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p className="muted">Manage application resources and users.</p>
                {error && <div className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
            </div>

            <div className="admin-tabs">
                <button
                    className={`admin-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resources')}
                >
                    <Music size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Manage Resources
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Manage Users
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'therapists' ? 'active' : ''}`}
                    onClick={() => setActiveTab('therapists')}
                >
                    <Users size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Manage Therapists
                </button>

                <button
                    className={`admin-tab-btn ${activeTab === 'circles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('circles')}
                >
                    <MessageCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Manage Circles
                </button>
            </div>

            {activeTab === 'resources' && (
                <div className="tab-content">
                    {/* Create Form */}
                    <div className="admin-form-card">
                        <h3>Add New Meditation</h3>
                        <form onSubmit={handleCreateMeditation}>
                            <div className="field">
                                <label>Title</label>
                                <input
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    required
                                    placeholder="e.g. Morning Calm"
                                />
                            </div>
                            <div className="field">
                                <label>Description</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    required
                                    placeholder="Short description..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="field">
                                    <label>Type</label>
                                    <select
                                        value={newItem.type}
                                        onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                                    >
                                        <option value="Meditation">Meditation</option>
                                        <option value="Breathing">Breathing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Media Category</label>
                                    <select
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option value="audio">Audio (MP3)</option>
                                        <option value="video">Video (YouTube)</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Duration (min)</label>
                                    <input
                                        type="number"
                                        value={newItem.durationMinutes}
                                        onChange={e => setNewItem({ ...newItem, durationMinutes: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label>Audio URL (Link)</label>
                                <input
                                    value={newItem.audioUrl}
                                    onChange={e => handleUrlChange(e.target.value)}
                                    required
                                    placeholder="https://..."
                                />
                            </div>
                            <button type="submit" className="button primary" style={{ width: '100%' }}>
                                <Plus size={18} /> Add Item
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="resource-list">
                        {meditations.map(item => (
                            <div key={item._id || item.id} className="resource-item">
                                <div className="resource-info">
                                    <h4>{item.title}</h4>
                                    <div className="resource-meta">
                                        [{item.category || 'audio'}] {item.type} • {item.durationMinutes} min
                                    </div>
                                </div>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteMeditation(item._id || item.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'therapists' && (
                <div className="tab-content">
                    <div className="admin-form-card">
                        <h3>Add New Therapist</h3>
                        <form onSubmit={handleCreateTherapist}>
                            <div className="form-row">
                                <div className="field">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={newTherapist.name}
                                        onChange={(e) => setNewTherapist({ ...newTherapist, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={newTherapist.email}
                                        onChange={(e) => setNewTherapist({ ...newTherapist, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="field">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={newTherapist.password}
                                        onChange={(e) => setNewTherapist({ ...newTherapist, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Specialty</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Anxiety, Depression"
                                        value={newTherapist.specialty}
                                        onChange={(e) => setNewTherapist({ ...newTherapist, specialty: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label>Bio</label>
                                <textarea
                                    placeholder="Therapist biography..."
                                    value={newTherapist.bio}
                                    onChange={(e) => setNewTherapist({ ...newTherapist, bio: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="button primary" style={{ width: '100%' }}>
                                <Plus size={18} /> Add Therapist
                            </button>
                        </form>
                    </div>

                    <div className="resource-list">
                        {therapists.map((therapist) => (
                            <div key={therapist._id} className="resource-item">
                                <div className="resource-info">
                                    <h4>{therapist.name}</h4>
                                    <div className="resource-meta">
                                        {therapist.specialty} • {therapist.email}
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                        {therapist.bio && therapist.bio.substring(0, 100)}...
                                    </p>
                                </div>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteTherapist(therapist._id)}
                                    title="Delete Therapist"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="tab-content">
                    <div className="user-table-container">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`role-badge ${u.role}`}>{u.role}</span>
                                        </td>
                                        <td>
                                            {u.isBanned
                                                ? <span style={{ color: 'red', fontWeight: 'bold' }}>Suspended</span>
                                                : <span style={{ color: 'green' }}>Active</span>
                                            }
                                        </td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {u.role !== 'admin' && (
                                                <button
                                                    className={`btn-delete ${u.isBanned ? 'banned' : ''}`}
                                                    style={u.isBanned ? { backgroundColor: '#10b981', color: 'white' } : {}}
                                                    onClick={() => handleBanUser(u._id, u.isBanned)}
                                                >
                                                    {u.isBanned ? 'Unban User' : 'Ban User'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {activeTab === 'circles' && (
                <div className="tab-content">
                    {/* Create Circle Form */}
                    <div className="admin-form-card">
                        <h3>Create New Circle</h3>
                        <form onSubmit={handleCreateCircle}>
                            <div className="field">
                                <label>Name</label>
                                <input
                                    value={newCircle.name}
                                    onChange={e => setNewCircle({ ...newCircle, name: e.target.value })}
                                    required
                                    placeholder="e.g. Anxiety Support"
                                />
                            </div>
                            <div className="field">
                                <label>Description</label>
                                <textarea
                                    value={newCircle.description}
                                    onChange={e => setNewCircle({ ...newCircle, description: e.target.value })}
                                    required
                                    placeholder="Purpose of this circle..."
                                />
                            </div>
                            <div className="field">
                                <label>Rules</label>
                                <input
                                    value={newCircle.rules}
                                    onChange={e => setNewCircle({ ...newCircle, rules: e.target.value })}
                                    placeholder="e.g. Be kind, No spam"
                                />
                            </div>
                            <button type="submit" className="button primary" style={{ width: '100%' }}>
                                <Plus size={18} /> Create Circle
                            </button>
                        </form>
                    </div>

                    {/* Circles List */}
                    <div className="resource-list">
                        {circlesList.map(circle => (
                            <div key={circle._id} className="resource-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div className="resource-info">
                                        <h4>{circle.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{circle.description}</p>
                                        <div className="resource-meta">
                                            Members: {circle.memberCount || 0}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="button secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            onClick={() => handleViewMembers(circle)}
                                        >
                                            <Users size={16} /> View Members
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteCircle(circle._id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Members List Expansion */}
                                {selectedCircle && selectedCircle._id === circle._id && (
                                    <div style={{ marginTop: '1rem', width: '100%', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <h5 style={{ margin: 0 }}>Members ({circleMembers.length})</h5>
                                            <button onClick={() => setSelectedCircle(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>
                                        </div>
                                        {circleMembers.length === 0 ? (
                                            <p className="muted" style={{ fontSize: '0.9rem' }}>No members found.</p>
                                        ) : (
                                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                {circleMembers.map(member => (
                                                    <div key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#f9fafb', borderRadius: '6px' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{member.email}</div>
                                                        </div>
                                                        <button
                                                            className="btn-delete"
                                                            title="Ban User"
                                                            onClick={() => handleBanMember(member._id)}
                                                        >
                                                            <ShieldBan size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default AdminDashboard
