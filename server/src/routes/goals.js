import express from 'express'
import Goal from '../models/Goal.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Create goal
router.post('/', async (req, res) => {
  try {
    const { description, targetDate, completed = false } = req.body
    if (!description || !targetDate) {
      return res.status(400).json({ message: 'Description and targetDate are required' })
    }
    const nowCompleted = Boolean(completed)
    const goal = await Goal.create({
      user: req.user.id,
      description,
      targetDate,
      completed: nowCompleted,
      completedDate: nowCompleted ? new Date() : undefined,
    })
    return res.status(201).json(goal)
  } catch (err) {
    console.error('Create goal error', err)
    return res.status(500).json({ message: 'Failed to create goal' })
  }
})

// Get all goals for user
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 })
    return res.json(goals)
  } catch (err) {
    console.error('Fetch goals error', err)
    return res.status(500).json({ message: 'Failed to fetch goals' })
  }
})

// Update goal
router.put('/:id', async (req, res) => {
  try {
    const { description, targetDate, completed } = req.body
    const update = {}
    if (description !== undefined) update.description = description
    if (targetDate !== undefined) update.targetDate = targetDate
    if (completed !== undefined) {
      update.completed = completed
      update.completedDate = completed ? new Date() : undefined
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      update,
      { new: true },
    )
    if (!goal) return res.status(404).json({ message: 'Goal not found' })
    return res.json(goal)
  } catch (err) {
    console.error('Update goal error', err)
    return res.status(500).json({ message: 'Failed to update goal' })
  }
})

// Delete goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!goal) return res.status(404).json({ message: 'Goal not found' })
    return res.status(204).send()
  } catch (err) {
    console.error('Delete goal error', err)
    return res.status(500).json({ message: 'Failed to delete goal' })
  }
})

export default router

