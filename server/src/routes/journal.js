import express from 'express'
import JournalEntry from '../models/JournalEntry.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Create entry
router.post('/', async (req, res) => {
  try {
    const { title, content, gratitude = '', mood = 'Okay', date } = req.body
    if (!content || !date) {
      return res.status(400).json({ message: 'Content and date are required' })
    }
    const entry = await JournalEntry.create({
      user: req.user.id,
      title,
      content,
      gratitude,
      mood,
      date,
    })
    return res.status(201).json(entry)
  } catch (err) {
    console.error('Create entry error', err)
    return res.status(500).json({ message: 'Failed to create entry' })
  }
})

// Get all entries for user
router.get('/', async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.id }).sort({ date: -1 })
    return res.json(entries)
  } catch (err) {
    console.error('Fetch entries error', err)
    return res.status(500).json({ message: 'Failed to fetch entries' })
  }
})

// Get single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user.id })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    return res.json(entry)
  } catch (err) {
    console.error('Fetch entry error', err)
    return res.status(500).json({ message: 'Failed to fetch entry' })
  }
})

// Update entry
router.put('/:id', async (req, res) => {
  try {
    const { title, content, gratitude, mood, date } = req.body
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content, gratitude, mood, date },
      { new: true },
    )
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    return res.json(entry)
  } catch (err) {
    console.error('Update entry error', err)
    return res.status(500).json({ message: 'Failed to update entry' })
  }
})

// Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    return res.status(204).send()
  } catch (err) {
    console.error('Delete entry error', err)
    return res.status(500).json({ message: 'Failed to delete entry' })
  }
})

export default router

