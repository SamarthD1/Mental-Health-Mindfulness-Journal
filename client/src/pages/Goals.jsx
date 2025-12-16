import { useEffect, useMemo, useState } from 'react'
import { createGoal, deleteGoal, getGoals, updateGoal } from '../api/goals.js'
import './Pages.css'
import './Goals.css'

const emptyGoal = () => ({
  description: '',
  targetDate: '',
})

const Goals = () => {
  const [form, setForm] = useState(emptyGoal)
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getGoals()
        setGoals(data || [])
      } catch (err) {
        setError(err?.message || 'Failed to load goals.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const { activeGoals, completedGoals } = useMemo(() => {
    return {
      activeGoals: goals.filter((goal) => !goal.completed),
      completedGoals: goals.filter((goal) => goal.completed),
    }
  }, [goals])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = async (event) => {
    event.preventDefault()
    setError(null)

    if (!form.description || !form.targetDate) {
      setError('Please add a description and target date.')
      return
    }

    try {
      const created = await createGoal({
        description: form.description,
        targetDate: form.targetDate,
        completed: false,
      })
      setGoals((prev) => [created, ...prev])
      setForm(emptyGoal())
    } catch (err) {
      setError(err?.message || 'Failed to create goal.')
    }
  }

  const toggleComplete = async (id, current) => {
    try {
      const updated = await updateGoal(id, { completed: !current })
      setGoals((prev) =>
        prev.map((goal) => (goal._id === id || goal.id === id ? updated : goal)),
      )
    } catch (err) {
      setError(err?.message || 'Failed to update goal.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id)
      setGoals((prev) => prev.filter((goal) => goal._id !== id && goal.id !== id))
    } catch (err) {
      setError(err?.message || 'Failed to delete goal.')
    }
  }

  return (
    <section className="page">
      <div className="card">
        <h1>Mental health goals</h1>
        <p className="muted">
          Track intentions and milestones to keep your progress visible.
        </p>
      </div>

      <div className="split">
        <div className="card">
          <h2>Add a new goal</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleAdd} className="stack">
            <div className="field">
              <label htmlFor="description">Goal description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                placeholder="Ex: Journal 3x per week to notice mood patterns"
              />
            </div>
            <div className="field">
              <label htmlFor="targetDate">Target date</label>
              <input
                id="targetDate"
                name="targetDate"
                type="date"
                value={form.targetDate}
                min={today}
                onChange={handleChange}
              />
            </div>
            <div className="form-actions">
              <button className="button primary" type="submit">
                Add goal
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Active goals</h2>
          <p className="muted">
            {loading ? 'Loading...' : activeGoals.length || 'No'} active
          </p>
          <div className="goal-list">
            {activeGoals.length === 0 && (
              <p className="muted">Add a goal to get started.</p>
            )}
            {activeGoals.map((goal) => {
              const id = goal._id || goal.id
              return (
                <label key={id} className="goal-card">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => toggleComplete(id, goal.completed)}
                  />
                  <div className="goal-content">
                    <p className="goal-desc">{goal.description}</p>
                    <p className="meta">Target: {goal.targetDate || 'Not set'}</p>
                    {goal.completedDate && (
                      <p className="meta">
                        Completed: {new Date(goal.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="button ghost"
                    onClick={() => handleDelete(id)}
                  >
                    Delete
                  </button>
                </label>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Completed goals</h2>
        <p className="muted">
          {loading ? 'Loading...' : completedGoals.length || 'No'} completed
        </p>
        <div className="goal-list">
          {completedGoals.length === 0 && (
            <p className="muted">Nothing completed yet. Keep going!</p>
          )}
          {completedGoals.map((goal) => {
            const id = goal._id || goal.id
            return (
              <label key={id} className="goal-card completed">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleComplete(id, goal.completed)}
                />
                <div className="goal-content">
                  <p className="goal-desc">{goal.description}</p>
                  <p className="meta">Target: {goal.targetDate || 'Not set'}</p>
                  {goal.completedDate && (
                    <p className="meta">
                      Completed: {new Date(goal.completedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="goal-delete"
                  aria-label="Delete goal"
                  onClick={() => {
                    if (window.confirm('Delete this goal?')) handleDelete(id)
                  }}
                >
                  ×
                </button>
              </label>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Goals

