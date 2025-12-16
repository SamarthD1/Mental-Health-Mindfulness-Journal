import mongoose from 'mongoose'

const meditationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Meditation', 'Breathing', 'Other'], default: 'Meditation' },
    category: { type: String, enum: ['audio', 'video'], default: 'audio' },
    durationMinutes: { type: Number, default: 5 },
    audioUrl: { type: String, required: true },
  },
  { timestamps: true },
)

const Meditation = mongoose.model('Meditation', meditationSchema)

export default Meditation

