import {
    verifyWebhook,
} from '../services/paymentService.js';

import Payment from '../models/Payment.js';

import {
    applySuccessfulPayment,
} from '../services/obligationService.js';

export async function webhook(req, res) {
    try {
        const sig =
            req.headers['x-razorpay-signature'];

        if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
            return res.status(503).json({
                message: 'Webhook secret not configured',
            });
        }

        if (!verifyWebhook(req.body, sig)) {
            return res.status(400).json({
                message: 'Invalid webhook signature',
            });
        }

        const event = JSON.parse(
            req.body.toString()
        );

        if (
            [
                'payment.captured',
                'order.paid',
            ].includes(event.event)
        ) {
            const rp =
                event.payload.payment?.entity;

            const p = await Payment.findOne({
                $or: [
                    {
                        razorpayPaymentId: rp?.id,
                    },
                    {
                        razorpayOrderId: rp?.order_id,
                    },
                ],
            });

            if (
                p &&
                p.status !== 'SUCCESSFUL'
            ) {
                p.status = 'SUCCESSFUL';
                p.razorpayPaymentId = rp.id;
                p.webhookEventId = event.id;

                await p.save();

                await applySuccessfulPayment(p);
            }
        }

        res.json({
            received: true,
        });
    } catch (e) {
        console.error(e);

        res.status(500).json({
            message: 'Webhook processing failed',
        });
    }
}