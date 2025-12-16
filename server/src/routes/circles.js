import express from 'express'
import Circle from '../models/Circle.js'
import Post from '../models/Post.js'
import { authMiddleware as protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/circles
// @desc    Get all circles with membership status
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const circles = await Circle.find()
        const circlesWithStatus = circles.map(c => ({
            _id: c._id,
            name: c.name,
            description: c.description,
            rules: c.rules,
            isMember: c.members.includes(req.user._id),
            memberCount: c.members.length
        }))
        res.json(circlesWithStatus)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   POST /api/circles/:id/join
// @desc    Join a circle
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
    try {
        const circle = await Circle.findById(req.params.id)
        if (!circle) return res.status(404).json({ message: 'Circle not found' })

        // Check if banned
        if (circle.bannedUsers && circle.bannedUsers.includes(req.user._id)) {
            return res.status(403).json({ message: 'You have been banned from this circle.' })
        }

        // Check if already member
        if (circle.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already a member' })
        }

        circle.members.push(req.user._id)
        await circle.save()
        res.json({ message: 'Joined successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   POST /api/circles/:id/leave
// @desc    Leave a circle
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
    try {
        const circle = await Circle.findById(req.params.id)
        if (!circle) return res.status(404).json({ message: 'Circle not found' })

        // Check if member
        if (!circle.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'Not a member' })
        }

        circle.members = circle.members.filter(id => id.toString() !== req.user._id.toString())
        await circle.save()
        res.json({ message: 'Left successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   GET /api/circles/:id/posts
// @desc    Get posts for a circle
// @access  Private
router.get('/:id/posts', protect, async (req, res) => {
    try {
        const posts = await Post.find({ circle: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
        res.json(posts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   POST /api/circles/:id/posts
// @desc    Create a post in a circle
// @access  Private
router.post('/:id/posts', protect, async (req, res) => {
    const { content, isAnonymous } = req.body
    try {
        const circle = await Circle.findById(req.params.id)
        if (!circle) return res.status(404).json({ message: 'Circle not found' })

        const post = await Post.create({
            circle: req.params.id,
            user: req.user._id,
            content,
            isAnonymous,
        })

        const populatedPost = await Post.findById(post._id).populate('user', 'name')
        res.status(201).json(populatedPost)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   POST /api/circles
// @desc    Create a circle (Admin only)
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' })
    }

    try {
        const { name, description, rules } = req.body
        const existing = await Circle.findOne({ name })
        if (existing) return res.status(400).json({ message: 'Circle already exists' })

        const circle = await Circle.create({ name, description, rules })
        res.status(201).json(circle)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   DELETE /api/circles/:id
// @desc    Delete a circle (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' })
    }

    try {
        const circle = await Circle.findById(req.params.id)
        if (!circle) return res.status(404).json({ message: 'Circle not found' })

        // Optional: Delete associated posts?
        // await Post.deleteMany({ circle: req.params.id }) 

        await circle.deleteOne()
        res.json({ message: 'Circle deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   GET /api/circles/:id/members
// @desc    Get members of a circle (Admin only)
// @access  Private/Admin
router.get('/:id/members', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' })
    }

    try {
        const circle = await Circle.findById(req.params.id).populate('members', 'name email')
        if (!circle) return res.status(404).json({ message: 'Circle not found' })

        res.json(circle.members)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// @route   DELETE /api/circles/:id/members/:userId
// @desc    Ban a member from a circle (Admin only)
// @access  Private/Admin
router.delete('/:id/members/:userId', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' })
    }

    try {
        const circle = await Circle.findById(req.params.id)
        if (!circle) return res.status(404).json({ message: 'Circle not found' })

        const userId = req.params.userId

        // Remove from members
        circle.members = circle.members.filter(id => id.toString() !== userId)

        // Add to bannedUsers if not already there
        if (!circle.bannedUsers.includes(userId)) {
            circle.bannedUsers.push(userId)
        }

        await circle.save()
        res.json({ message: 'User banned from circle' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router
