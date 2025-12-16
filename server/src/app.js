import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import { authMiddleware } from './middleware/auth.js'
import User from './models/User.js'
import journalRoutes from './routes/journal.js'
import meditationRoutes from './routes/meditations.js'
import goalRoutes from './routes/goals.js'
import insightsRoutes from './routes/insights.js'
import adminRoutes from './routes/admin.js'
import circleRoutes from './routes/circles.js'
import therapistRoutes from './routes/therapist.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://samarthd470_db_user:Tjhx74nuX9J9xzwe@mentalhealthjournal.ol0dgmj.mongodb.net/'

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/meditations', meditationRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/insights', insightsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/circles', circleRoutes)
app.use('/api/therapist', therapistRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json(user)
  } catch (err) {
    console.error('Profile fetch error', err)
    return res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist')
  app.use(express.static(clientBuildPath))

  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'))
  })
} else {
  // Development mode root route
  app.get('/', (req, res) => {
    res.send('API is running in Development Mode')
  })
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
