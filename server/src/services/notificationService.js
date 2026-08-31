import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendReminderEmail({
    to,
    name,
    message,
}) {
    if (!resend) {
        console.log(
            `[Reminder:email-disabled] ${to}: ${message}`
        );

        return {
            skipped: true,
        };
    }

    return resend.emails.send({
        from: process.env.RESEND_FROM,
        to,
        subject: 'DueAI repayment reminder',
        text: `Hi ${name},

${message}

— DueAI`,
    });
}