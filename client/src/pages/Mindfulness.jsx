import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMeditations } from '../api/meditations.js'
import './Pages.css'
import './Mindfulness.css'
import { Play, Pause, Music, Clock, Wind, Sparkles } from 'lucide-react'
import { SkeletonCard } from '../components/Skeleton.jsx'
import { VideoPlayer } from '../components/VideoPlayer.jsx'

// --- HELPER: Format Time ---
const formatTime = (seconds) => {
    if (!seconds) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
}

const Mindfulness = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'audio')

    // Sync tab state with URL
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && (tab === 'audio' || tab === 'breathing')) {
            setActiveTab(tab)
        }
    }, [searchParams])

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setSearchParams({ tab })
    }

    return (
        <section className="page">
            {/* HEADER */}
            <div className="card text-center" style={{ padding: '3rem 1rem', background: 'linear-gradient(to bottom, #f0fdf4, white)', marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mindfulness Studio</h1>
                <p className="muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Cultivate presence and peace. Choose your practice below.
                </p>
            </div>

            {/* TABS */}
            <div className="tabs-container">
                <div className="tab-switcher">
                    <button
                        className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
                        onClick={() => handleTabChange('audio')}
                    >
                        Guided Meditations
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
                        onClick={() => handleTabChange('breathing')}
                    >
                        Box Breathing
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="mindfulness-content">
                {activeTab === 'audio' ? <AudioMeditations /> : <BreathingTool />}
            </div>
        </section>
    )
}

// --- SUB-COMPONENT: Audio Meditations ---
const AudioMeditations = () => {
    const [items, setItems] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Audio State
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    const selected = useMemo(
        () => items.find((item) => (item.id || item._id) === selectedId) || items[0],
        [items, selectedId],
    )

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await getMeditations()
                setItems(data || [])
                if (data && data.length > 0) {
                    setSelectedId(data[0].id || data[0]._id)
                }
            } catch (err) {
                setError(err?.message || 'Failed to load meditations')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return
        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)
        const onEnded = () => setIsPlaying(false)

        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', onEnded)

        return () => {
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('ended', onEnded)
        }
    }, [selected])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
            setCurrentTime(0)
        }
    }, [selectedId])

    const togglePlay = () => {
        if (!audioRef.current || !selected?.audioUrl) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            // Explicitly load if the source changed or to be safe
            audioRef.current.load()

            const playPromise = audioRef.current.play()
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log("Playing:", selected.audioUrl)
                        setIsPlaying(true)
                    })
                    .catch((error) => {
                        console.warn("Playback prevented:", error.message)
                        setIsPlaying(false)
                    })
            }
        }
    }

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value)
        if (audioRef.current) {
            audioRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    if (loading) return (
        <div className="split">
            <SkeletonCard />
            <SkeletonCard />
        </div>
    )

    if (error) return <div className="card error">{error}</div>

    return (
        <div className="split">
            {/* LIST */}
            <div className="card">
                <h3>Library</h3>
                <div className="media-grid">
                    {items.map((item) => {
                        const id = item.id || item._id
                        const isActive = id === selectedId
                        return (
                            <div
                                key={id}
                                className={`media-card ${isActive ? 'selected' : ''}`}
                                onClick={() => setSelectedId(id)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="media-icon">
                                    {item.category === 'video' ? <Play size={20} /> : <Music size={20} />}
                                </div>
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <p className="media-title" style={{ fontSize: '1rem' }}>{item.title}</p>
                                    <p className="media-description" style={{ fontSize: '0.85rem' }}>{item.durationMinutes ? `${item.durationMinutes} min` : 'Audio'}</p>
                                </div>
                                {isActive && <div className="badge">Playing</div>}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* PLAYER */}
            <div className="player-card active">
                {selected ? (
                    <div className="stack">
                        {selected.category === 'video' ? (
                            <VideoPlayer url={selected.audioUrl} />
                        ) : null}

                        <div className="track-info">
                            {selected.category !== 'video' && (
                                <div className="track-icon">
                                    <Music size={32} />
                                </div>
                            )}
                            <h2 className="track-title">{selected.title}</h2>
                            <p className="track-desc">{selected.description}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                                <span className="badge">
                                    <Clock size={12} style={{ marginRight: 4 }} />
                                    {selected.durationMinutes ? `${selected.durationMinutes} min` : 'Unknown'}
                                </span>
                                <span className="badge" style={{ background: 'var(--secondary-100)', color: 'var(--secondary-700)' }}>
                                    {selected.type || 'Meditation'}
                                </span>
                            </div>
                        </div>

                        {selected.category !== 'video' && (
                            <div className="player-controls">
                                <audio
                                    key={selected.id || selected._id}
                                    ref={audioRef}
                                    src={selected.audioUrl}
                                    preload="metadata"
                                    onError={(e) => console.error("Audio Element Error:", e)}
                                />
                                <div className="progress-container">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="progress-bar"
                                        style={{ backgroundSize: `${(currentTime / (duration || 1)) * 100}% 100%` }}
                                    />
                                    <div className="time-row">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="control-buttons">
                                    <button className="btn-mini" onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 10 }}>-10s</button>
                                    <button className="btn-play" onClick={togglePlay}>
                                        {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" style={{ marginLeft: 3 }} />}
                                    </button>
                                    <button className="btn-mini" onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10 }}>+10s</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center muted">Select a track</div>
                )}
            </div>
        </div>
    )
}

// --- SUB-COMPONENT: Breathing Tool ---
const BreathingTool = () => {
    const [phase, setPhase] = useState('Get Ready')
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        let interval
        let timeout

        // Start the cycle after a brief pause
        timeout = setTimeout(() => {
            setIsActive(true)
            setPhase('Breathe In...') // 0s

            const cycle = () => {
                setTimeout(() => setPhase('Hold...'), 4000)   // 4s
                setTimeout(() => setPhase('Breathe Out...'), 8000) // 8s
                setTimeout(() => setPhase('Hold...'), 12000)  // 12s
            }

            cycle() // Run first cycle

            interval = setInterval(() => {
                setPhase('Breathe In...')
                cycle()
            }, 16000)

        }, 1000)

        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [])

    return (
        <div className="breathing-container">
            <div className="breathing-circle-wrapper">
                <div className={`breathing-circle ${isActive ? 'animate' : ''}`}></div>
                <div className="breathing-ring ring-1"></div>
                <div className="breathing-ring ring-2"></div>
                <div className="instruction-text">
                    {phase}
                </div>
            </div>
            <div className="timer-subtext">
                4 seconds each step
            </div>
        </div>
    )
}

export default Mindfulness
