export function localIntent(text) {
    const amountMatch = text
        .replace(/,/g, '')
        .match(
            /(?:₹|rs\.?|inr\s*)?(\d+(?:\.\d+)?)/i
        );

    const amount = amountMatch
        ? Number(amountMatch[1])
        : null;

    let intent = 'GENERAL';

    if (amount) {
        intent = /pay|give|send|can do|afford|only/i.test(
            text
        )
            ? 'PAYMENT_PROPOSAL'
            : 'GENERAL';
    }

    if (
        /next|tomorrow|friday|monday|week/i.test(text) &&
        amount
    ) {
        intent = 'PROMISE_TO_PAY';
    }

    return {
        intent,
        amount,
        dateISO: null,
    };
}