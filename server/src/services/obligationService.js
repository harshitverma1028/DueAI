import Obligation from "../models/Obligation.js";
import Payment from "../models/Payment.js";

import { audit } from "./auditService.js";

export async function getAccessible(id, userId) {
    return Obligation.findOne({
        _id: id,
        $or: [
            { creditor: userId },
            { debtor: userId },
        ],
    })
        .populate("creditor", "name email")
        .populate("debtor", "name email");
}

export async function applySuccessfulPayment(payment) {
    const o = await Obligation.findById(payment.obligation);

    if (!o) {
        throw Object.assign(
            new Error("Obligation not found"),
            { status: 404 }
        );
    }

    // Payment must actually be successful
    if (payment.status !== "SUCCESSFUL") {
        throw Object.assign(
            new Error("Payment is not successful"),
            { status: 400 }
        );
    }

    // Prevent the same payment from being applied twice.
    // If the obligation already reflects this payment,
    // do not deduct it again.
    const paymentExists = await Payment.findOne({
        _id: payment._id,
        obligation: o._id,
        status: "SUCCESSFUL",
    });

    if (!paymentExists) {
        throw Object.assign(
            new Error("Successful payment record not found"),
            { status: 404 }
        );
    }

    // Calculate the total amount actually paid
    const result = await Payment.aggregate([
        {
            $match: {
                obligation: o._id,
                status: "SUCCESSFUL",
            },
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    const totalPaid = Number(
        result.at(0)?.total || 0
    );

    const remaining = Math.max(
        0,
        Number(o.originalAmount) - totalPaid
    );

    o.totalPaid = totalPaid;
    o.remainingAmount = remaining;

    // Update obligation status
    if (remaining === 0) {
        o.status = "SETTLED";
        o.nextReminderAt = null;
    } else {
        o.status = "PARTIALLY_PAID";
    }

    await o.save();

    // Audit successful payment
    await audit({
        actor: payment.payer,
        obligation: o._id,
        event: "PAYMENT_SUCCESSFUL",
        metadata: {
            paymentId: payment._id,
            amount: payment.amount,
            totalPaid,
            remaining,
        },
    });

    // Audit settlement
    if (remaining === 0) {
        await audit({
            actor: payment.payer,
            obligation: o._id,
            event: "OBLIGATION_SETTLED",
            metadata: {
                paymentId: payment._id,
            },
        });
    }

    return o;
}