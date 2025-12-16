import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import JournalEntry from '../models/JournalEntry.js'
import { moodScore } from '../utils/moodUtils.js'

import mongoose from 'mongoose'

const router = express.Router()

const buildMatch = (userId, from, to) => {
  const match = { user: new mongoose.Types.ObjectId(userId) }
  if (from || to) {
    match.date = {}
    if (from) match.date.$gte = new Date(from)
    if (to) match.date.$lte = new Date(to)
  }
  return match
}

router.use(authMiddleware)

// Mood trend: average score per day
router.get('/mood-trend', async (req, res) => {
  try {
    let { from, to } = req.query
    if (!from && !to) {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      from = start.toISOString().slice(0, 10)
      to = now.toISOString().slice(0, 10)
    }
    const match = buildMatch(req.user.id, from, to)

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          moodScore: {
            $switch: {
              branches: [
                { case: { $eq: ['$mood', 'Great'] }, then: 5 },
                { case: { $eq: ['$mood', 'Good'] }, then: 4 },
                { case: { $eq: ['$mood', 'Okay'] }, then: 3 },
                { case: { $eq: ['$mood', 'Low'] }, then: 2 },
                { case: { $eq: ['$mood', 'Stressed'] }, then: 1 },
                { case: { $eq: ['$mood', 'Anxious'] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $project: {
          moodScore: 1,
          day: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'UTC' } },
        },
      },
      {
        $group: {
          _id: '$day',
          averageMood: { $avg: '$moodScore' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]

    const result = await JournalEntry.aggregate(pipeline)
    const data = result.map((row) => ({
      date: row._id,
      averageMood: Number(row.averageMood.toFixed(2)),
      count: row.count,
    }))
    return res.json(data)
  } catch (err) {
    console.error('Mood trend error', err)
    return res.status(500).json({ message: 'Failed to fetch mood trend' })
  }
})

// Mood distribution: counts per mood
router.get('/mood-distribution', async (req, res) => {
  try {
    let { from, to } = req.query
    if (!from && !to) {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      from = start.toISOString().slice(0, 10)
      to = now.toISOString().slice(0, 10)
    }
    const match = buildMatch(req.user.id, from, to)

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]

    const result = await JournalEntry.aggregate(pipeline)
    const data = result.map((row) => ({
      mood: row._id || 'Unknown',
      count: row.count,
    }))
    return res.json(data)
  } catch (err) {
    console.error('Mood distribution error', err)
    return res.status(500).json({ message: 'Failed to fetch mood distribution' })
  }
})

export default router

