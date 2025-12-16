import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
    {
        circle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Circle',
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true },
)

const Post = mongoose.model('Post', postSchema)

export default Post
