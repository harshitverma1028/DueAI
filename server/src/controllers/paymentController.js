import Payment from "../models/Payment.js";

import {
    createOrder,
    verifyCheckoutSignature,
} from "../services/paymentService.js";

import {
    applySuccessfulPayment,
} from "../services/obligationService.js";

export async function order(req, res, next) {
    try {
        const { obligationId, amount } = req.body;

        if (!obligationId) {
            return res.status(400).json({
                message: "obligationId is required",
            });
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                message: "Valid payment amount is required",
            });
        }

        const result = await createOrder({
            obligation: obligationId,
            userId: req.user._id,
            amount: numericAmount,
        });

        res.json(result);
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

        if (!paymentId || !orderId || !signature) {
            return res.status(400).json({
                message: "paymentId, orderId and signature are required",
            });
        }

        if (
            !verifyCheckoutSignature(
                orderId,
                paymentId,
                signature
            )
        ) {
            return res.status(400).json({
                message: "Invalid payment signature",
            });
        }

        const p = await Payment.findOne({
            razorpayOrderId: orderId,
            payer: req.user._id,
        });

        if (!p) {
            return res.status(404).json({
                message: "Payment record not found",
            });
        }

        // Prevent duplicate verification
        if (p.status === "SUCCESSFUL") {
            return res.status(400).json({
                message: "Payment has already been completed",
            });
        }

        p.status = "SUCCESSFUL";
        p.razorpayPaymentId = paymentId;
        p.razorpaySignature = signature;

        await p.save();

        const o = await applySuccessfulPayment(p);

        res.json({
            message: "Payment verified successfully",
            payment: p,
            obligation: o,
        });
    } catch (e) {
        next(e);
    }
}

export async function mockSuccess(req, res, next) {
    try {
        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                message: "paymentId is required",
            });
        }

        const p = await Payment.findOne({
            _id: paymentId,
            payer: req.user._id,
            status: "CREATED",
        });

        if (!p) {
            return res.status(404).json({
                message: "Payment not found or already processed",
            });
        }

        p.status = "SUCCESSFUL";

        await p.save();

        const o = await applySuccessfulPayment(p);

        res.json({
            message: "Mock payment successful",
            payment: p,
            obligation: o,
        });
    } catch (e) {
        next(e);
    }
}