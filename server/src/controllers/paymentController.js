import Payment from '../models/Payment.js';

import {
    createOrder,
    verifyCheckoutSignature,
} from '../services/paymentService.js';

import {
    applySuccessfulPayment,
} from '../services/obligationService.js';

export async function order(req, res, next) {
    try {
        res.json(
            await createOrder({
                obligation: req.body.obligationId,
                userId: req.user._id,
                amount: Number(req.body.amount),
            })
        );
    } catch (e) {
        next(e);
    }
}

export async function verify(req, res, next) {
    try {
        const {
            paymentId,
            orderId,
            signature,
        } = req.body;

        if (
            !verifyCheckoutSignature(
                orderId,
                paymentId,
                signature
            )
        ) {
            return res.status(400).json({
                message: 'Invalid payment signature',
            });
        }

        const p = await Payment.findOne({
            razorpayOrderId: orderId,
            payer: req.user._id,
        });

        if (!p) {
            return res.status(404).json({
                message: 'Payment record not found',
            });
        }

        p.status = 'SUCCESSFUL';
        p.razorpayPaymentId = paymentId;
        p.razorpaySignature = signature;

        await p.save();

        const o = await applySuccessfulPayment(p);

        res.json({
            payment: p,
            obligation: o,
        });
    } catch (e) {
        next(e);
    }
}

export async function mockSuccess(req, res, next) {
    try {
        const p = await Payment.findOne({
            _id: req.body.paymentId,
            payer: req.user._id,
            status: 'CREATED',
        });

        if (!p) {
            return res.status(404).json({
                message: 'Payment not found',
            });
        }

        p.status = 'SUCCESSFUL';

        await p.save();

        const o = await applySuccessfulPayment(p);

        res.json({
            payment: p,
            obligation: o,
        });
    } catch (e) {
        next(e);
    }
}