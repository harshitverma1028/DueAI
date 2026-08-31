import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        obligation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Obligation',
        },

        event: {
            type: String,
            required: true,
        },

        metadata: Object,
    },
    {
        timestamps: true,
    }
);

schema.index({
    obligation: 1,
    createdAt: -1,
});

export default mongoose.model('AuditLog', schema);