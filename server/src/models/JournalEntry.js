import mongoose from 'mongoose'

const journalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, trim: true },
    content: { type: String, required: true },
    gratitude: { type: String, default: '' },
    mood: { type: String, default: 'Okay' },
    date: { type: Date, required: true },
  },
  { timestamps: true },
)

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema)

export default JournalEntry

