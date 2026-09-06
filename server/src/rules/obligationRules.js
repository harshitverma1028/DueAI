export function validatePayment(
    obligation,
    amount,
    transactionsUsed
) {
    const paymentAmount = Number(amount);
    const remaining = Number(obligation.remainingAmount);
    const max = Number(obligation.maxTransactions);
    const min = Number(obligation.minimumPayment);
    const transactions = Number(transactionsUsed);

    // Payment is allowed only for active obligations
    if (
        !["ACTIVE", "PARTIALLY_PAID", "OVERDUE"].includes(
            obligation.status
        )
    ) {
        return {
            valid: false,
            reason: `Payments are not allowed when the obligation is ${obligation.status}.`,
        };
    }

    // Amount must be valid and greater than zero
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
        return {
            valid: false,
            reason: "Payment must be greater than zero.",
        };
    }

    // Prevent overpayment
    if (paymentAmount > remaining) {
        return {
            valid: false,
            reason: "Payment cannot exceed the remaining balance.",
        };
    }

    // Transaction limit
    if (
        Number.isFinite(max) &&
        transactions >= max
    ) {
        return {
            valid: false,
            reason: "Maximum transaction limit reached.",
        };
    }

    // Minimum payment
    // Full remaining balance is always allowed even
    // when it is below the minimum payment.
    if (
        paymentAmount < min &&
        paymentAmount !== remaining
    ) {
        return {
            valid: false,
            reason: `Payment must be at least ₹${min}.`,
        };
    }

    return {
        valid: true,
    };
}

export function nextStatus(
    obligation,
    newRemaining
) {
    const remaining = Number(newRemaining);

    if (remaining <= 0) {
        return "SETTLED";
    }

    if (obligation.status === "OVERDUE") {
        return "ACTIVE";
    }

    return "PARTIALLY_PAID";
}