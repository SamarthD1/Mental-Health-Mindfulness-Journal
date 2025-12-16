import { useState, useEffect, useMemo } from 'react'
import { getMyPatients, getPatientMoodTrend } from '../api/therapist.js'
import { Users, TrendingUp, Calendar, Activity, Heart } from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts'
import './Pages.css'

const TherapistDashboard = () => {
    const [patients, setPatients] = useState([])
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [moodData, setMoodData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await getMyPatients()
                setPatients(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchPatients()
    }, [])

    const handleViewPatient = async (patient) => {
        setSelectedPatient(patient)
        try {
            const data = await getPatientMoodTrend(patient._id)
            setMoodData(data)
        } catch (err) {
            console.error(err)
            alert('Failed to load patient data')
        }
    }

    // Calculate statistics
    const stats = useMemo(() => {
        if (!moodData.length) return { avgMood: 0, trend: 'stable', entries: 0 }

        const avg = moodData.reduce((sum, d) => sum + d.averageMood, 0) / moodData.length
        const recent = moodData.slice(-7)
        const older = moodData.slice(0, -7)

        let trend = 'stable'
        if (recent.length && older.length) {
            const recentAvg = recent.reduce((sum, d) => sum + d.averageMood, 0) / recent.length
            const olderAvg = older.reduce((sum, d) => sum + d.averageMood, 0) / older.length
            if (recentAvg > olderAvg + 0.3) trend = 'improving'
            else if (recentAvg < olderAvg - 0.3) trend = 'declining'
        }

        return {
            avgMood: avg.toFixed(1),
            trend,
            entries: moodData.reduce((sum, d) => sum + d.count, 0)
        }
    }, [moodData])

    if (loading) return <div className="page-container">Loading...</div>

    return (
        <div className="page-container" style={{ maxWidth: '1400px' }}>
            <header className="page-header">
                <h1>Therapist Dashboard</h1>
                <p className="subtitle">Monitor your patients' progress and wellbeing.</p>
            </header>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Users size={32} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{patients.length}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Patients</div>
                </div>

                {selectedPatient && (
                    <>
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <Activity size={32} style={{ color: '#8b5cf6', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.entries}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Journal Entries</div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <Heart size={32} style={{ color: '#ec4899', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.avgMood}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Avg Mood Score</div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <TrendingUp size={32} style={{ color: stats.trend === 'improving' ? '#10b981' : stats.trend === 'declining' ? '#ef4444' : '#6b7280', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', textTransform: 'capitalize' }}>{stats.trend}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Recent Trend</div>
                        </div>
                    </>
                )}
            </div>

            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Patient List Sidebar */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', background: '#f9fafb' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} /> My Patients
                        </h3>
                    </div>
                    <div className="patient-list">
                        {patients.length === 0 ? (
                            <p style={{ padding: '1rem', color: '#666' }}>No patients assigned yet.</p>
                        ) : (
                            patients.map(p => (
                                <div
                                    key={p._id}
                                    onClick={() => handleViewPatient(p)}
                                    style={{
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f0f0f0',
                                        background: selectedPatient?._id === p._id ? '#eff6ff' : 'white',
                                        borderLeft: selectedPatient?._id === p._id ? '4px solid #3b82f6' : '4px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Since {new Date(p.createdAt).toLocaleDateString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="patient-detail">
                    {selectedPatient ? (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>{selectedPatient.name}</h2>
                                    <p style={{ color: '#666', margin: '0.25rem 0 0' }}>{selectedPatient.email}</p>
                                </div>
                                <div className="badge" style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600 }}>Active</div>
                            </div>

                            {/* Mood Chart */}
                            <h3><TrendingUp size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Mood Trend (Last 30 Days)</h3>
                            <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                                {moodData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={moodData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12, fill: '#666' }}
                                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            />
                                            <YAxis
                                                domain={[0, 5]}
                                                ticks={[1, 2, 3, 4, 5]}
                                                tick={{ fontSize: 12, fill: '#666' }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="averageMood"
                                                stroke="#8b5cf6"
                                                strokeWidth={3}
                                                dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '8px', color: '#666' }}>
                                        No mood data available for this period.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                            <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <h3>Select a patient to view details</h3>
                            <p>Click on a patient from the sidebar to view their mood trends and activity.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TherapistDashboard
