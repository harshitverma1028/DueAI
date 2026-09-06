import crypto from "crypto";

import { razorpay } from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import Obligation from "../models/Obligation.js";
import { validatePayment } from "../rules/obligationRules.js";

export async function createOrder({ obligation, userId, amount }) {
    const o = await Obligation.findOne({
        _id: obligation,
        debtor: userId,
    });

    if (!o) {
        throw Object.assign(new Error("Obligation not found"), {
            status: 404,
        });
    }

    const tx = await Payment.countDocuments({
        obligation: o._id,
        status: {
            $in: ["CREATED", "SUCCESSFUL"],
        },
    });

    const check = validatePayment(o, amount, tx);

    if (!check.valid) {
        throw Object.assign(new Error(check.reason), {
            status: 400,
        });
    }

    // Mock payment mode when Razorpay is not configured
    if (!razorpay) {
        const p = await Payment.create({
            obligation: o._id,
            payer: userId,
            amount,
            status: "CREATED",
        });

        return {
            mode: "mock",
            paymentId: p._id,
            amount,
        };
    }

    // Real Razorpay order
    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `obl_${o._id}_${Date.now()}`,
        notes: {
            obligationId: String(o._id),
        },
    });

    const p = await Payment.create({
        obligation: o._id,
        payer: userId,
        amount,
        razorpayOrderId: order.id,
    });

    return {
        mode: "razorpay",
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        paymentId: p._id,
        amount,
    };
}

export function verifyCheckoutSignature(
    orderId,
    paymentId,
    signature
) {
    if (!orderId || !paymentId || !signature) {
        return false;
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
        return false;
    }

    const expected = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        signatureBuffer
    );
}

export function verifyWebhook(raw, signature) {
    if (!raw || !signature) {
        return false;
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        return false;
    }

    const expected = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_WEBHOOK_SECRET
        )
        .update(raw)
        .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        signatureBuffer
    );
}