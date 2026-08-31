export function validatePayment(
    obligation,
    amount,
    transactionsUsed
) {
    const remaining = Number(obligation.remainingAmount);
    const max = Number(obligation.maxTransactions);
    const min = Number(obligation.minimumPayment);

    if (!Number.isFinite(amount) || amount <= 0) {
        return {
            valid: false,
            reason: 'Payment must be greater than zero.',
        };
    }

    if (amount > remaining) {
        return {
            valid: false,
            reason: 'Payment cannot exceed the remaining balance.',
        };
    }

    if (transactionsUsed >= max) {
        return {
            valid: false,
            reason: 'Maximum transaction limit reached.',
        };
    }

    if (amount < min && amount !== remaining) {
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
    if (newRemaining === 0) {
        return 'SETTLED';
    }

    if (obligation.status === 'OVERDUE') {
        return 'ACTIVE';
    }

    return 'PARTIALLY_PAID';
}