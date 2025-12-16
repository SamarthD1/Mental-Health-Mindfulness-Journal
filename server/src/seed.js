import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Circle from './models/Circle.js'

dotenv.config()

const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb+srv://samarthd470_db_user:Tjhx74nuX9J9xzwe@mentalhealthjournal.ol0dgmj.mongodb.net/'

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI, { dbName: 'mentalhealthjournal' })
        console.log('Connected to MongoDB...')

        const usersToSeed = [
            {
                name: 'Admin User',
                email: 'admin@mindspace.com',
                password: 'admin123',
                role: 'admin',
            },
            {
                name: 'Therapist User',
                email: 'therapist@mindspace.com',
                password: 'therapist123',
                role: 'therapist',
            },
        ]

        for (const u of usersToSeed) {
            const existing = await User.findOne({ email: u.email })
            if (!existing) {
                await User.create(u)
                console.log(`Created user: ${u.email} (${u.role})`)
            } else {
                console.log(`User already exists: ${u.email}`)
            }
        }

        // Seed Circles
        const circlesToSeed = [
            { name: 'Anxiety Support', description: 'A safe space to share feelings of anxiety.', rules: 'Be kind.' },
            { name: 'Depression Awareness', description: 'Support for those battling depression.', rules: 'No judgement.' },
            { name: 'Mindfulness & Meditation', description: 'Discuss techniques and experiences.', rules: 'Stay on topic.' },
            { name: 'Gratitude', description: 'Share what you are grateful for today.', rules: 'Positive vibes only.' },
            { name: 'Sleep Struggles', description: 'Tips and support for better sleep.', rules: 'Supportive advice.' }
        ]

        for (const c of circlesToSeed) {
            const existing = await Circle.findOne({ name: c.name })
            if (!existing) {
                await Circle.create(c)
                console.log(`Created circle: ${c.name}`)
            } else {
                console.log(`Circle already exists: ${c.name}`)
            }
        }

        console.log('Seeding complete!')
        process.exit(0)
    } catch (err) {
        console.error('Seeding failed:', err)
        process.exit(1)
    }
}

seedUsers()
