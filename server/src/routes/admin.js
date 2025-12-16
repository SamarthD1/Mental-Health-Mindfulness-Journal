import express from 'express'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/roles.js'

const router = express.Router()

// Admin: List all users
router.get('/users', authMiddleware, authorizeRoles('admin'), async (_req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 })
        res.json(users)
    } catch (err) {
        console.error('List users error', err)
        res.status(500).json({ message: 'Failed to fetch users' })
    }
})

// Admin: Toggle Ban Status
router.put('/users/:id/ban', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        user.isBanned = !user.isBanned
        await user.save()

        res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, isBanned: user.isBanned })
    } catch (err) {
        console.error('Toggle ban error', err)
        res.status(500).json({ message: 'Failed to update user status' })
    }
})

export default router
