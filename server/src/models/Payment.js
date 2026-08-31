import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        obligation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Obligation',
            required: true,
        },

        payer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: [
                'CREATED',
                'SUCCESSFUL',
                'FAILED',
            ],
            default: 'CREATED',
        },

        razorpayOrderId: String,

        razorpayPaymentId: String,

        razorpaySignature: String,

        webhookEventId: String,
    },
    {
        timestamps: true,
    }
);

schema.index(
    {
        webhookEventId: 1,
    },
    {
        unique: true,
        sparse: true,
    }
);

export default mongoose.model('Payment', schema);