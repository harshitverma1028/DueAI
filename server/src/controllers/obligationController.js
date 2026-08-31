import { z } from 'zod';

import Obligation from '../models/Obligation.js';
import Payment from '../models/Payment.js';
import Commitment from '../models/Commitment.js';

import { audit } from '../services/auditService.js';
import { getAccessible } from '../services/obligationService.js';

export const createSchema = z.object({
    debtorEmail: z.string().email(),
    originalAmount: z.coerce.number().positive(),
    maxTransactions: z.coerce.number().int().positive(),
    minimumPayment: z.coerce.number().min(0),
    reminderIntervalDays: z.coerce.number().int().positive(),
    deadline: z.string().optional(),
    negotiationEnabled: z.boolean().default(true),
});

export async function create(req, res) {
    const d = await (
        await import('../models/User.js')
    ).default.findOne({
        email: req.body.debtorEmail,
    });

    if (!d) {
        return res.status(404).json({
            message: 'Debtor must register first',
        });
    }

    if (String(d._id) === String(req.user._id)) {
        return res.status(400).json({
            message:
                'Creditor and debtor must be different users',
        });
    }

    if (
        req.body.minimumPayment >
        req.body.originalAmount
    ) {
        return res.status(400).json({
            message:
                'Minimum payment cannot exceed original amount',
        });
    }

    const o = await Obligation.create({
        creditor: req.user._id,
        debtor: d._id,
        originalAmount: req.body.originalAmount,
        totalPaid: 0,
        remainingAmount: req.body.originalAmount,
        maxTransactions: req.body.maxTransactions,
        minimumPayment: req.body.minimumPayment,
        reminderIntervalDays:
            req.body.reminderIntervalDays,
        deadline: req.body.deadline || null,
        negotiationEnabled:
            req.body.negotiationEnabled,
        nextReminderAt: null,
    });

    await audit({
        actor: req.user._id,
        obligation: o._id,
        event: 'OBLIGATION_CREATED',
    });

    res.status(201).json({
        obligation: o,
    });
}

export async function list(req, res) {
    const docs = await Obligation.find({
        $or: [
            { creditor: req.user._id },
            { debtor: req.user._id },
        ],
    })
        .populate('creditor', 'name email')
        .populate('debtor', 'name email')
        .sort({ createdAt: -1 });

    res.json({
        obligations: docs,
    });
}

export async function detail(req, res) {
    const o = await getAccessible(
        req.params.id,
        req.user._id
    );

    if (!o) {
        return res.status(404).json({
            message: 'Obligation not found',
        });
    }

    const payments = await Payment.find({
        obligation: o._id,
    }).sort({
        createdAt: -1,
    });

    const commitments = await Commitment.find({
        obligation: o._id,
    }).sort({
        dueDate: 1,
    });

    res.json({
        obligation: o,
        payments,
        commitments,
    });
}

export async function respond(req, res) {
    const o = await Obligation.findOne({
        _id: req.params.id,
        debtor: req.user._id,
    });

    if (!o) {
        return res.status(404).json({
            message: 'Obligation not found',
        });
    }

    if (o.status !== 'PENDING') {
        return res.status(400).json({
            message: 'Obligation is no longer pending',
        });
    }

    if (req.body.accept) {
        o.status = 'ACTIVE';
        o.acceptedAt = new Date();
        o.nextReminderAt = new Date(
            Date.now() +
                o.reminderIntervalDays * 86400000
        );

        await o.save();

        await audit({
            actor: req.user._id,
            obligation: o._id,
            event: 'OBLIGATION_ACCEPTED',
        });
    } else {
        o.status = 'CANCELLED';

        await o.save();

        await audit({
            actor: req.user._id,
            obligation: o._id,
            event: 'OBLIGATION_REJECTED',
        });
    }

    res.json({
        obligation: o,
    });
}