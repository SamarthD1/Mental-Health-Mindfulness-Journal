import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getCircles, joinCircle, leaveCircle, getCirclePosts, createPost } from '../api/circles.js'
import { Users, Send, MessageCircle, Check } from 'lucide-react'
import './Community.css'

const Community = () => {
    const { user } = useAuth()
    const [circles, setCircles] = useState([])
    const [activeCircle, setActiveCircle] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [showMyCircles, setShowMyCircles] = useState(false)

    useEffect(() => {
        fetchCircles()
    }, [])

    useEffect(() => {
        if (activeCircle) {
            fetchPosts(activeCircle._id)
        }
    }, [activeCircle])

    const fetchCircles = async () => {
        try {
            const data = await getCircles()
            setCircles(data)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    const fetchPosts = async (circleId) => {
        try {
            const data = await getCirclePosts(circleId)
            setPosts(data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleJoin = async () => {
        try {
            await joinCircle(activeCircle._id)
            // Update local state to reflect membership
            setCircles(circles.map(c =>
                c._id === activeCircle._id ? { ...c, isMember: true } : c
            ))
            setActiveCircle(prev => ({ ...prev, isMember: true })) // Update active ref
        } catch (err) {
            if (err.response?.data?.message === 'Already a member') {
                // Still update UI if API says we are member
                setCircles(circles.map(c =>
                    c._id === activeCircle._id ? { ...c, isMember: true } : c
                ))
                setActiveCircle(prev => ({ ...prev, isMember: true }))
            } else {
                alert('Failed to join')
            }
        }
    }

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to leave this circle?')) return
        try {
            await leaveCircle(activeCircle._id)
            setCircles(circles.map(c =>
                c._id === activeCircle._id ? { ...c, isMember: false } : c
            ))
            setActiveCircle(prev => ({ ...prev, isMember: false }))
        } catch (err) {
            alert('Failed to leave')
        }
    }

    const handlePost = async (e) => {
        e.preventDefault()
        if (!message.trim()) return

        // Auto-join if not member
        if (activeCircle && !activeCircle.isMember) {
            try {
                await joinCircle(activeCircle._id)
                // Optimistically update membership
                setCircles(circles.map(c =>
                    c._id === activeCircle._id ? { ...c, isMember: true } : c
                ))
                setActiveCircle(prev => ({ ...prev, isMember: true }))
            } catch (err) {
                // If error is not "Already a member", might fail posting
                if (err.response?.data?.message !== 'Already a member') {
                    // Continue trying to post anyway? Or warn?
                    // Let's try posting.
                }
            }
        }

        try {
            const newPost = await createPost(activeCircle._id, { content: message, isAnonymous })
            setMessage('')
            // Optimistic Update or Refresh
            setPosts(prev => [newPost, ...prev])
        } catch (err) {
            console.error(err)
            alert('Failed to post.')
        }
    }

    const filteredCircles = showMyCircles
        ? circles.filter(c => c.isMember)
        : circles

    return (
        <section className="page community-page">
            <h1 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users /> Community Support Circles
            </h1>

            <div className="community-container">
                {/* Left Sidebar: Circles List */}
                <div className="circles-sidebar">
                    <div className="circles-filter">
                        <label>
                            Show only My Circles
                            <input
                                type="checkbox"
                                checked={showMyCircles}
                                onChange={e => setShowMyCircles(e.target.checked)}
                            />
                        </label>
                    </div>

                    <h3 style={{ marginBottom: '1rem' }}>Topics</h3>
                    {loading ? <p>Loading...</p> : filteredCircles.map(c => (
                        <div
                            key={c._id}
                            className={`circle-card ${activeCircle?._id === c._id ? 'active' : ''}`}
                            onClick={() => setActiveCircle(c)}
                        >
                            <h3>
                                {c.name}
                                {c.isMember && <span className="badge-member">MEMBER</span>}
                            </h3>
                            <p>{c.description}</p>
                        </div>
                    ))}
                    {showMyCircles && filteredCircles.length === 0 && (
                        <p className="muted" style={{ fontStyle: 'italic' }}>You haven't joined any circles yet.</p>
                    )}
                </div>

                {/* Right Area: Feed/Chat */}
                <div className="chat-area">
                    {activeCircle ? (
                        <>
                            <div className="chat-header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2>{activeCircle.name}</h2>
                                        <p className="muted">{activeCircle.rules}</p>
                                    </div>
                                    {!activeCircle.isMember ? (
                                        <button className="button primary sm" onClick={handleJoin}>
                                            Join Circle
                                        </button>
                                    ) : (
                                        <button className="button outline sm" onClick={handleLeave} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                            Leave
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="chat-messages">
                                {posts.length === 0 ? (
                                    <div style={{ textAlign: 'center', marginTop: '2rem', color: '#999' }}>
                                        <MessageCircle size={48} style={{ opacity: 0.2 }} />
                                        <p>No posts yet. Be the first to share.</p>
                                    </div>
                                ) : (
                                    posts.map(post => (
                                        <div key={post._id} className={`message-card ${post.user?._id === user?._id ? 'own-message' : ''}`}>
                                            <div className="message-meta">
                                                <span>{post.isAnonymous ? 'Anonymous' : (post.user?.name || 'User')}</span>
                                                <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="message-content">{post.content}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="post-input-area">
                                <form onSubmit={handlePost}>
                                    <input
                                        type="text"
                                        placeholder={`Share your thoughts... ${!activeCircle.isMember ? '(Posting joins the circle)' : ''}`}
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                    />
                                    <div className="anon-toggle">
                                        <input
                                            type="checkbox"
                                            id="anon"
                                            checked={isAnonymous}
                                            onChange={e => setIsAnonymous(e.target.checked)}
                                        />
                                        <label htmlFor="anon">Anonymous</label>
                                    </div>
                                    <button type="submit" className="button primary icon-only">
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="join-banner">
                            <Users size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <h2>Welcome to Community Circles</h2>
                            <p>Select a topic from the left to join the conversation.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default Community
