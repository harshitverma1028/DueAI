import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        obligation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Obligation',
            required: true,
        },

        initiatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        messages: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },

                role: {
                    type: String,
                    enum: ['USER', 'AI', 'SYSTEM'],
                },

                content: String,

                structuredIntent: {
                    type: Object,
                },

                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        status: {
            type: String,
            enum: ['OPEN', 'CLOSED'],
            default: 'OPEN',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Negotiation', schema);