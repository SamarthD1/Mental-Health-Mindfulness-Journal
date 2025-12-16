import mongoose from 'mongoose'

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    description: { type: String, required: true, trim: true },
    targetDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedDate: { type: Date },
  },
  { timestamps: true },
)

goalSchema.pre('save', function setCompletedDate() {
  if (this.isModified('completed')) {
    this.completedDate = this.completed ? new Date() : undefined
  }
})

const Goal = mongoose.model('Goal', goalSchema)

export default Goal

