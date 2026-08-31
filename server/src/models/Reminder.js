import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        obligation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Obligation',
            required: true,
        },

        scheduledFor: Date,

        sentAt: Date,

        status: {
            type: String,
            enum: [
                'SCHEDULED',
                'SENT',
                'SKIPPED',
                'FAILED',
            ],
            default: 'SCHEDULED',
        },

        channel: {
            type: String,
            default: 'EMAIL',
        },

        message: String,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Reminder', schema);