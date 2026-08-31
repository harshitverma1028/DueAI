import Reminder from '../models/Reminder.js';
import Obligation from '../models/Obligation.js';
import Commitment from '../models/Commitment.js';

import { sendReminderEmail } from './notificationService.js';
import { audit } from './auditService.js';

export async function processReminders() {
    const now = new Date();

    const obligations = await Obligation.find({
        remainingAmount: { $gt: 0 },
        status: {
            $in: ['ACTIVE', 'PARTIALLY_PAID', 'OVERDUE'],
        },
        nextReminderAt: {
            $lte: now,
        },
    }).populate('debtor', 'name email');

    for (const o of obligations) {
        const commitment = await Commitment.findOne({
            obligation: o._id,
            status: 'PENDING',
            dueDate: {
                $gte: now,
            },
        });

        if (commitment) continue;

        const overdue = o.deadline && o.deadline < now;

        if (overdue && o.status !== 'OVERDUE') {
            o.status = 'OVERDUE';
            await o.save();
        }

        const message = overdue
            ? `Your ₹${o.remainingAmount} outstanding balance is now overdue.`
            : `You currently have ₹${o.remainingAmount} outstanding on your DueAI obligation.`;

        await sendReminderEmail({
            to: o.debtor.email,
            name: o.debtor.name,
            message,
        });

        await Reminder.create({
            obligation: o._id,
            scheduledFor: now,
            sentAt: new Date(),
            status: 'SENT',
            message,
        });

        await audit({
            obligation: o._id,
            actor: o.debtor._id,
            event: 'REMINDER_SENT',
            metadata: {
                message,
            },
        });

        o.nextReminderAt = new Date(
            Date.now() + o.reminderIntervalDays * 86400000
        );

        await o.save();
    }
}