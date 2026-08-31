import { localIntent } from './intentParser.js';

export async function understand(text, context) {
    const local = localIntent(text);

    if (!process.env.OPENAI_API_KEY) {
        return {
            ...local,
            response: local.amount
                ? `I understand that you are proposing ₹${local.amount}. I’ll check that against the agreed repayment rules.`
                : 'Tell me what amount you can pay or when you expect to pay.',
        };
    }

    try {
        const r = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },

                body: JSON.stringify({
                    model:
                        process.env.OPENAI_MODEL ||
                        'gpt-4o-mini',

                    temperature: 0.2,

                    response_format: {
                        type: 'json_object',
                    },

                    messages: [
                        {
                            role: 'system',
                            content: `${(
                                await import('./prompts.js')
                            ).systemPrompt}
Context: ${JSON.stringify(context)}`,
                        },
                        {
                            role: 'user',
                            content: text,
                        },
                    ],
                }),
            }
        );

        const j = await r.json();

        return JSON.parse(
            j.choices?.[0]?.message?.content || '{}'
        );
    } catch (e) {
        return {
            ...local,
            response:
                'I could not reach the AI service, so I will use the deterministic repayment rules.',
        };
    }
}