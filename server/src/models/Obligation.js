import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        creditor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        debtor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        originalAmount: {
            type: Number,
            required: true,
            min: 1,
        },

        totalPaid: {
            type: Number,
            default: 0,
            min: 0,
        },

        remainingAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        maxTransactions: {
            type: Number,
            required: true,
            min: 1,
        },

        minimumPayment: {
            type: Number,
            required: true,
            min: 0,
        },

        reminderIntervalDays: {
            type: Number,
            required: true,
            min: 1,
        },

        deadline: Date,

        negotiationEnabled: {
            type: Boolean,
            default: true,
        },

        status: {
            type: String,
            enum: [
                'PENDING',
                'ACCEPTED',
                'ACTIVE',
                'PARTIALLY_PAID',
                'OVERDUE',
                'SETTLED',
                'CANCELLED',
            ],
            default: 'PENDING',
        },

        nextReminderAt: Date,

        acceptedAt: Date,
    },
    {
        timestamps: true,
    }
);

schema.index({
    creditor: 1,
    status: 1,
});

schema.index({
    debtor: 1,
    status: 1,
});

export default mongoose.model('Obligation', schema);