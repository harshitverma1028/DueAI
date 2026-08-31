import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        obligation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Obligation',
            required: true,
        },

        debtor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        dueDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: [
                'PENDING',
                'FULFILLED',
                'MISSED',
                'CANCELLED',
            ],
            default: 'PENDING',
        },

        fulfilledPayment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
        },
    },
    {
        timestamps: true,
    }
);

schema.index({
    dueDate: 1,
    status: 1,
});

export default mongoose.model('Commitment', schema);