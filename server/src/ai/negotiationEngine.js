import { understand } from './agent.js';

import {
    validatePayment,
} from '../rules/obligationRules.js';

export async function negotiate(
    text,
    o,
    transactionsUsed
) {
    const intent = await understand(
        text,
        {
            remaining: o.remainingAmount,
            minimumPayment: o.minimumPayment,
            maxTransactions: o.maxTransactions,
            transactionsUsed,
        }
    );

    let decision = null;

    if (intent.amount) {
        decision = validatePayment(
            o,
            intent.amount,
            transactionsUsed
        );

        if (decision.valid) {
            intent.response = `₹${intent.amount} is within the current repayment rules. You can proceed to payment.`;
        } else {
            intent.response = `₹${intent.amount} does not meet the current repayment rules: ${decision.reason} If you need an exception, the creditor must approve it.`;
        }
    }

    return {
        intent,
        decision,
    };
}