import express from 'express'
import Meditation from '../models/Meditation.js'
import { authMiddleware } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/roles.js'

const router = express.Router()

// Authenticated: list all meditations
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const items = await Meditation.find().sort({ createdAt: -1 })
    return res.json(items)
  } catch (err) {
    console.error('List meditations error', err)
    return res.status(500).json({ message: 'Failed to fetch meditations' })
  }
})

// Authenticated: get single meditation
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid meditation id' })
    }
    const item = await Meditation.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'Meditation not found' })
    return res.json(item)
  } catch (err) {
    console.error('Get meditation error', err)
    return res.status(500).json({ message: 'Failed to fetch meditation' })
  }
})

// Admin: create meditation
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, description, type, category, durationMinutes, audioUrl } = req.body
    if (!title || !description || !audioUrl) {
      return res
        .status(400)
        .json({ message: 'Title, description, and audioUrl are required' })
    }
    const item = await Meditation.create({
      title,
      description,
      type,
      category,
      durationMinutes,
      audioUrl,
    })
    return res.status(201).json(item)
  } catch (err) {
    console.error('Create meditation error', err)
    return res.status(500).json({ message: 'Failed to create meditation' })
  }
})

// Admin: update meditation
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, description, type, category, durationMinutes, audioUrl } = req.body
    const item = await Meditation.findByIdAndUpdate(
      req.params.id,
      { title, description, type, category, durationMinutes, audioUrl },
      { new: true },
    )
    if (!item) return res.status(404).json({ message: 'Meditation not found' })
    return res.json(item)
  } catch (err) {
    console.error('Update meditation error', err)
    return res.status(500).json({ message: 'Failed to update meditation' })
  }
})

// Admin: delete meditation
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const item = await Meditation.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Meditation not found' })
    return res.status(204).send()
  } catch (err) {
    console.error('Delete meditation error', err)
    return res.status(500).json({ message: 'Failed to delete meditation' })
  }
})

export default router

