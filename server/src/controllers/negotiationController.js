import Negotiation from '../models/Negotiation.js';
import Obligation from '../models/Obligation.js';
import Payment from '../models/Payment.js';
import Commitment from '../models/Commitment.js';

import { negotiate } from '../ai/negotiationEngine.js';
import { audit } from '../services/auditService.js';

export async function chat(req, res, next) {
    try {
        const o = await Obligation.findOne({
            _id: req.params.id,
            $or: [
                { creditor: req.user._id },
                { debtor: req.user._id },
            ],
        });

        if (!o) {
            return res.status(404).json({
                message: 'Obligation not found',
            });
        }

        if (!o.negotiationEnabled) {
            return res.status(400).json({
                message: 'Negotiation is disabled',
            });
        }

        const tx = await Payment.countDocuments({
            obligation: o._id,
            status: 'SUCCESSFUL',
        });

        const result = await negotiate(
            req.body.message,
            o,
            tx
        );

        let n = await Negotiation.findOne({
            obligation: o._id,
            status: 'OPEN',
        });

        if (!n) {
            n = await Negotiation.create({
                obligation: o._id,
                initiatedBy: req.user._id,
                messages: [],
            });
        }

        n.messages.push({
            sender: req.user._id,
            role: 'USER',
            content: req.body.message,
            structuredIntent: result.intent,
        });

        n.messages.push({
            role: 'AI',
            content: result.intent.response,
            structuredIntent: result.intent,
        });

        await n.save();

        if (
            result.intent.intent === 'PROMISE_TO_PAY' &&
            result.intent.amount &&
            result.intent.dateISO
        ) {
            const c = await Commitment.create({
                obligation: o._id,
                debtor: o.debtor,
                amount: result.intent.amount,
                dueDate: new Date(
                    result.intent.dateISO
                ),
            });

            await audit({
                actor: req.user._id,
                obligation: o._id,
                event: 'COMMITMENT_CREATED',
                metadata: {
                    commitmentId: c._id,
                    amount: c.amount,
                },
            });
        }

        await audit({
            actor: req.user._id,
            obligation: o._id,
            event: 'NEGOTIATION_STARTED',
        });

        res.json({
            conversation: n,
            result,
        });
    } catch (e) {
        next(e);
    }
}

export async function history(req, res) {
    const n = await Negotiation.findOne({
        obligation: req.params.id,
    }).populate('messages.sender', 'name');

    res.json({
        conversation: n,
    });
}