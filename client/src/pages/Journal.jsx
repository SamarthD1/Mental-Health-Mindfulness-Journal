import { useEffect, useMemo, useState } from 'react'
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  updateJournalEntry,
} from '../api/journal.js'
import './Journal.css'
import { useToast } from '../context/ToastContext.jsx'
import { SkeletonCard, SkeletonText, SkeletonTitle } from '../components/Skeleton.jsx'
import { Plus, Trash2, X } from 'lucide-react'

const moods = [
  { label: 'Great', emoji: '😄', color: '#10b981' },
  { label: 'Good', emoji: '🙂', color: '#3b82f6' },
  { label: 'Okay', emoji: '😐', color: '#6366f1' },
  { label: 'Low', emoji: '😔', color: '#f59e0b' },
  { label: 'Stressed', emoji: '😫', color: '#ef4444' },
  { label: 'Anxious', emoji: '😰', color: '#8b5cf6' }
]

const todayLocal = () => {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  const localISO = new Date(now - tzOffset).toISOString().slice(0, 10)
  return localISO
}

const emptyEntry = () => ({
  title: '',
  content: '',
  gratitude: '',
  mood: 'Okay',
  date: todayLocal(),
})

const getId = (entry) => entry?.id || entry?._id

const Journal = () => {
  const [entries, setEntries] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState(emptyEntry)
  const [editForm, setEditForm] = useState(emptyEntry)
  const { addToast } = useToast()

  const selectedEntry = useMemo(
    () => entries.find((entry) => getId(entry) === selectedId) || null,
    [entries, selectedId],
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getJournalEntries()
        // Sort by date desc
        const sorted = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date))
        setEntries(sorted)
      } catch (err) {
        addToast('Failed to load entries.', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast])

  useEffect(() => {
    if (selectedEntry) {
      setEditForm({
        title: selectedEntry.title || '',
        content: selectedEntry.content || '',
        gratitude: selectedEntry.gratitude || '',
        mood: selectedEntry.mood || 'Okay',
        date: selectedEntry.date?.slice(0, 10) || todayLocal(),
      })
    } else {
      setEditForm(emptyEntry())
    }
  }, [selectedEntry])

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target
    setter((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const created = await createJournalEntry(form)
      setEntries((prev) => [created, ...prev])
      setForm(emptyEntry())
      addToast('Journal entry created!', 'success')
    } catch (err) {
      addToast('Failed to create entry.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    if (!selectedId) return
    setSaving(true)
    try {
      const updated = await updateJournalEntry(selectedId, editForm)
      setEntries((prev) =>
        prev.map((entry) => (getId(entry) === selectedId ? updated : entry)),
      )
      addToast('Entry updated successfully.', 'success')
    } catch (err) {
      addToast('Failed to update entry.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Delete this entry?')) return
    setDeleting(true)
    try {
      await deleteJournalEntry(id)
      setEntries((prev) => prev.filter((entry) => getId(entry) !== id))
      if (selectedId === id) setSelectedId(null)
      addToast('Entry deleted.', 'info')
    } catch (err) {
      addToast('Failed to delete entry.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // Group entries by Date (e.g. "Today", "Yesterday", "Dec 12, 2024")
  const groupedEntries = useMemo(() => {
    const groups = {}
    entries.forEach(entry => {
      const dateObj = new Date(entry.date)
      const dateStr = dateObj.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      if (!groups[dateStr]) groups[dateStr] = []
      groups[dateStr].push(entry)
    })
    return groups
  }, [entries])

  return (
    <section className="page">
      <div className="split">
        {/* LEFT COLUMN: CREATE or EDIT */}
        <div className="card">
          {selectedId ? (
            <>
              <div className="list-header" style={{ marginBottom: '1rem' }}>
                <h2 style={{ marginBottom: 0 }}>Edit Entry</h2>
                <button
                  className="button ghost"
                  onClick={() => setSelectedId(null)}
                  title="Cancel Edit"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="stack">
                <div className="field">
                  <label>Date & Mood</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date}
                      onChange={handleChange(setEditForm)}
                      style={{ width: 'auto' }}
                    />
                  </div>
                  <div className="mood-selector">
                    {moods.map((m) => (
                      <button
                        key={m.label}
                        type="button"
                        className={`mood-pill ${editForm.mood === m.label ? 'selected' : ''}`}
                        onClick={() => setEditForm((prev) => ({ ...prev, mood: m.label }))}
                      >
                        <span className="mood-emoji">{m.emoji}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <input
                    name="title"
                    type="text"
                    value={editForm.title}
                    onChange={handleChange(setEditForm)}
                    placeholder="Title"
                    className="input-lg"
                    style={{ fontWeight: 'bold' }}
                  />
                </div>

                <div className="field">
                  <textarea
                    name="content"
                    rows="6"
                    value={editForm.content}
                    onChange={handleChange(setEditForm)}
                    placeholder="Content..."
                  />
                </div>
                <div className="field">
                  <textarea
                    name="gratitude"
                    rows="2"
                    value={editForm.gratitude}
                    onChange={handleChange(setEditForm)}
                    placeholder="Gratitude..."
                    style={{ background: 'var(--secondary-50)' }}
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => handleDelete(selectedId)}
                    disabled={deleting}
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                  <button className="button primary" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Entry'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2>New entry</h2>
              <p className="muted">Capture how you are feeling today.</p>
              <form onSubmit={handleCreate} className="stack">
                <div className="field">
                  <label>Date & Mood</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange(setForm)}
                      style={{ width: 'auto' }}
                    />
                  </div>
                  <div className="mood-selector">
                    {moods.map((m) => (
                      <button
                        key={m.label}
                        type="button"
                        className={`mood-pill ${form.mood === m.label ? 'selected' : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, mood: m.label }))}
                      >
                        <span className="mood-emoji">{m.emoji}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <input
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange(setForm)}
                    placeholder="Title (optional)"
                    className="input-lg"
                    style={{ fontWeight: 'bold' }}
                  />
                </div>

                <div className="field">
                  <textarea
                    name="content"
                    rows="6"
                    value={form.content}
                    onChange={handleChange(setForm)}
                    placeholder="Write your thoughts..."
                  />
                </div>
                <div className="field">
                  <textarea
                    name="gratitude"
                    rows="2"
                    value={form.gratitude}
                    onChange={handleChange(setForm)}
                    placeholder="I am grateful for..."
                    style={{ background: 'var(--secondary-50)' }}
                  />
                </div>

                <div className="form-actions">
                  <button className="button primary" type="submit" disabled={saving}>
                    <Plus size={18} />
                    {saving ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: TIMELINE LIST */}
        <div className="timeline-container">
          <div className="list-header" style={{ marginBottom: '1.5rem' }}>
            <h2>Your Journey</h2>
          </div>

          {loading ? (
            <div className="stack">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="timeline">
              {Object.keys(groupedEntries).length === 0 && (
                <div className="card muted" style={{ textAlign: 'center', padding: '3rem', fontStyle: 'italic' }}>
                  <p>“The blank page is a canvas for your soul.”</p>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Start writing your first entry today.</p>
                </div>
              )}

              {Object.entries(groupedEntries).map(([dateLabel, groupEntries]) => (
                <div key={dateLabel} className="timeline-group">
                  <div className="timeline-date">{dateLabel}</div>
                  <div className="stack">
                    {groupEntries.map(entry => {
                      const m = moods.find(m => m.label === entry.mood)
                      // Highlight logic: if edit mode, only highlight selected.
                      const isActive = getId(entry) === selectedId
                      return (
                        <div
                          key={getId(entry)}
                          className={`entry-card ${isActive ? 'active' : ''}`}
                          onClick={() => setSelectedId(getId(entry))}
                          style={{ borderLeftColor: m?.color || 'var(--neutral-300)' }}
                        >
                          <div className="entry-header">
                            <h3 className="entry-title">{entry.title || 'Untitled'}</h3>
                            <span className="entry-mood-icon" title={entry.mood}>
                              {m?.emoji || '😐'}
                            </span>
                          </div>
                          <p className="entry-content-preview">
                            {entry.content || <i className="muted">No content</i>}
                          </p>
                          {entry.gratitude && (
                            <p className="entry-gratitude" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary-500)', fontStyle: 'italic' }}>
                              <span style={{ fontWeight: '600' }}>Gratitude:</span> {entry.gratitude}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Journal
