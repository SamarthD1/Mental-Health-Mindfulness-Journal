import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb+srv://samarthd470_db_user:Tjhx74nuX9J9xzwe@mentalhealthjournal.ol0dgmj.mongodb.net/'

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI)
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
            {
                name: 'Therapist User 2',
                email: 'therapist2@mindspace.com',
                password: 'therapist123',
                role: 'therapist',
            },
            {
                name: 'Therapist User 3',
                email: 'therapist3@mindspace.com',
                password: 'therapist123',
                role: 'therapist',
            },
            {
                name: 'Therapist User 4',
                email: 'therapist4@mindspace.com',
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

        console.log('Seeding complete!')
        process.exit(0)
    } catch (err) {
        console.error('Seeding failed:', err)
        process.exit(1)
    }
}

seedUsers()
