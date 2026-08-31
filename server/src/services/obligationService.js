import Obligation from '../models/Obligation.js';
import Payment from '../models/Payment.js';

import { audit } from './auditService.js';

export async function getAccessible(id, userId) {
    return Obligation.findOne({
        _id: id,
        $or: [
            { creditor: userId },
            { debtor: userId },
        ],
    })
        .populate('creditor', 'name email')
        .populate('debtor', 'name email');
}

export async function applySuccessfulPayment(payment) {
    const o = await Obligation.findById(payment.obligation);

    if (!o) {
        throw new Error('Obligation not found');
    }

    if (
        payment.status === 'SUCCESSFUL' &&
        payment._wasApplied
    ) {
        return o;
    }

    const paid = await Payment.countDocuments({
        obligation: o._id,
        status: 'SUCCESSFUL',
    });

    const remaining = Math.max(
        0,
        o.originalAmount -
            (
                await Payment.aggregate([
                    {
                        $match: {
                            obligation: o._id,
                            status: 'SUCCESSFUL',
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: '$amount',
                            },
                        },
                    },
                ])
            ).at(0)?.total ||
            0
    );

    o.totalPaid = o.originalAmount - remaining;
    o.remainingAmount = remaining;
    o.status =
        remaining === 0
            ? 'SETTLED'
            : 'PARTIALLY_PAID';

    if (remaining === 0) {
        o.nextReminderAt = null;
    }

    await o.save();

    await audit({
        actor: payment.payer,
        obligation: o._id,
        event: 'PAYMENT_SUCCESSFUL',
        metadata: {
            paymentId: payment._id,
            amount: payment.amount,
            remaining,
        },
    });

    if (remaining === 0) {
        await audit({
            actor: payment.payer,
            obligation: o._id,
            event: 'OBLIGATION_SETTLED',
        });
    }

    return o;
}