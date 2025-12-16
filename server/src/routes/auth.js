import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'changeme'
const TOKEN_EXPIRY = '7d'

const generateToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  })

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, adminSecret, therapistSecret } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    let role = 'user'
    if (adminSecret === 'admin123') role = 'admin'
    if (therapistSecret === 'therapist123') role = 'therapist'

    const user = await User.create({ name, email, password, role })
    const token = generateToken(user)

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        therapist: user.therapist
      },
    })
  } catch (err) {
    console.error('Register error', err)
    return res.status(500).json({ message: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('🔐 Login attempt:', { email, password: password ? '***' : 'missing' })

    if (!email || !password) {
      console.log('❌ Missing credentials')
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    console.log('👤 User found:', user ? user.email : 'NOT FOUND')

    if (!user) {
      console.log('❌ User not found in database')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const valid = await user.comparePassword(password)
    console.log('🔑 Password valid:', valid)

    if (!valid) {
      console.log('❌ Invalid password')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (user.isBanned) {
      console.log('🚫 User is banned')
      return res.status(403).json({ message: 'Your account has been suspended.' })
    }

    const token = generateToken(user)
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        therapist: user.therapist
      },
    })
  } catch (err) {
    console.error('Login error', err)
    return res.status(500).json({ message: 'Login failed' })
  }
})

export default router

