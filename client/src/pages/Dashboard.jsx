import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target, BarChart3, Headphones, TrendingUp, Calendar, Smile, Wind, Users, UserPlus } from 'lucide-react';
import './Pages.css';
import './Dashboard.css';
import { getJournalEntries } from '../api/journal.js';
import { SkeletonCard } from '../components/Skeleton.jsx';

const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
  "The present moment is the only time over which we have dominion. - Thich Nhat Hanh",
  "The greatest weapon against stress is our ability to choose one thought over another. - William James",
  "You don't have to be perfect to be amazing. - Unknown"
];

import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.name || 'User');
  const [currentQuote, setCurrentQuote] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');

  // Stats State
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.name) setUsername(user.name);

    // Set greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    // Set quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);

    // Fetch stats data
    const fetchStats = async () => {
      try {
        const data = await getJournalEntries();
        setEntries(data || []);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = useMemo(() => {
    if (!entries.length) return { total: 0, streak: 0, avgMood: '-' };

    // Total
    const total = entries.length;

    // Streak (Approximation: Consecutive unique dates)
    const dates = [...new Set(entries.map(e => e.date.split('T')[0]))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If latest entry is today or yesterday, start counting
    if (dates.length > 0 && (dates[0] === today || dates[0] === yesterday)) {
      streak = 1;
      let currentDate = new Date(dates[0]);

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i]);
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
          currentDate = prevDate;
        } else {
          break;
        }
      }
    }

    return { total, streak, avgMood: 'Great' }; // Mock avgMood logic for now or implement mapping
  }, [entries]);

  const quickActions = [
    {
      title: 'Journal',
      icon: <BookOpen size={32} />,
      path: '/journal',
      color: 'var(--primary-600)'
    },
    {
      title: 'Goals',
      icon: <Target size={32} />,
      path: '/goals',
      color: 'var(--secondary-600)'
    },
    {
      title: 'Insights',
      icon: <BarChart3 size={32} />,
      path: '/insights',
      color: 'var(--accent-600)'
    },
    {
      title: 'Community',
      icon: <Users size={32} />,
      path: '/community',
      color: '#ec4899' // Pinkish
    },
    {
      title: 'Meditate',
      icon: <Headphones size={32} />,
      path: '/mindfulness?tab=audio',
      color: '#10b981'
    },
    {
      title: 'Breathe',
      icon: <Wind size={32} />,
      path: '/mindfulness?tab=breathing',
      color: '#3b82f6'
    },
    {
      title: user?.therapist ? 'My Therapist' : 'Therapist',
      icon: <UserPlus size={32} />,
      path: '/therapists',
      color: user?.therapist ? '#10b981' : '#8b5cf6' // Green if connected, Violet if not
    }
  ];

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>Good {timeOfDay}, {username}!</h1>
        <p className="welcome-text">Your mental health journey is important.</p>
      </div>

      <div className="quote-card">
        <div className="quote-icon">"</div>
        <p className="quote-text">{currentQuote}</p>
      </div>

      {loading ? (
        <div className="stats-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="stats-section">
          <h2>Your Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#ecfccb', color: '#65a30d' }}>
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Entries</h3>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3>Current Streak</h3>
                <div className="stat-value">{stats.streak} days</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                <Smile size={24} />
              </div>
              <div className="stat-content">
                <h3>Mood Check</h3>
                <div className="stat-value">Checking In</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          {quickActions.map((action, index) => (
            <Link to={action.path} key={index} className="action-card" style={{ '--card-color': action.color }}>
              <div className="action-icon">{action.icon}</div>
              <h3>{action.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
