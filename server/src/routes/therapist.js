import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import JournalEntry from '../models/JournalEntry.js'
import mongoose from 'mongoose'

const router = express.Router()

router.use(authMiddleware)

// @route   GET /api/therapist/list
// @desc    Get all therapists
// @access  Private (Users)
router.get('/list', async (req, res) => {
    try {
        const therapists = await User.find({ role: 'therapist' }).select('name email _id')
        res.json(therapists)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   POST /api/therapist/select
// @desc    Select a therapist
// @access  Private (Users)
router.post('/select', async (req, res) => {
    const { therapistId } = req.body
    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        const therapist = await User.findById(therapistId)
        if (!therapist || therapist.role !== 'therapist') {
            return res.status(400).json({ message: 'Invalid therapist' })
        }

        user.therapist = therapistId
        await user.save()
        res.json({ message: 'Therapist selected successfully', therapist: { name: therapist.name, id: therapist._id } })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   POST /api/therapist/disconnect
// @desc    Disconnect from current therapist
// @access  Private
router.post('/disconnect', async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        user.therapist = undefined
        await user.save()
        res.json({ message: 'Disconnected successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   GET /api/therapist/my-therapist
// @desc    Get current therapist details
// @access  Private
router.get('/my-therapist', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('therapist', 'name email _id')
        if (!user) return res.status(404).json({ message: 'User not found' })

        if (!user.therapist) {
            return res.json(null)
        }
        res.json(user.therapist)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   GET /api/therapist/patients
// @desc    Get my patients
// @access  Private (Therapist Only)
router.get('/patients', async (req, res) => {
    if (req.user.role !== 'therapist') {
        return res.status(403).json({ message: 'Not authorized' })
    }

    try {
        const patients = await User.find({ therapist: req.user.id }).select('name email _id createdAt')
        res.json(patients)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   GET /api/therapist/patient/:id/mood-trend
// @desc    Get mood trend for a specific patient
// @access  Private (Therapist Only)
router.get('/patient/:id/mood-trend', async (req, res) => {
    if (req.user.role !== 'therapist') {
        return res.status(403).json({ message: 'Not authorized' })
    }

    try {
        const patientId = req.params.id
        // Verify this patient belongs to this therapist
        const patient = await User.findOne({ _id: patientId, therapist: req.user.id })
        if (!patient) return res.status(403).json({ message: 'Not authorized to view this patient' })

        // Reuse mood logic (simplified for now, copy of insights logic basically)
        let { from, to } = req.query
        if (!from && !to) {
            const now = new Date()
            const start = new Date(now)
            start.setDate(start.getDate() - 30)
            from = start.toISOString().slice(0, 10)
            to = now.toISOString().slice(0, 10)
        }

        const match = { user: new mongoose.Types.ObjectId(patientId) }
        if (from || to) {
            match.date = {}
            if (from) match.date.$gte = new Date(from)
            if (to) match.date.$lte = new Date(to)
        }

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

        res.json(data)

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router
