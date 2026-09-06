import { GoogleGenAI } from "@google/genai";
import { localIntent } from "./intentParser.js";
import { systemPrompt } from "./prompts.js";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
    ? new GoogleGenAI({ apiKey })
    : null;

export async function understand(text, context) {
    const local = localIntent(text);

    // Gemini API key missing
    if (!ai) {
        console.error("GEMINI ERROR: GEMINI_API_KEY is missing");

        return {
            ...local,
            response: local.amount
                ? `I understand that you are proposing ₹${local.amount}. I’ll check that against the agreed repayment rules.`
                : "Tell me what amount you can pay or when you expect to pay."
        };
    }

    console.log("========== GEMINI REQUEST ==========");
    console.log("User:", text);
    console.log("Context:", context);

    const prompt = `
${systemPrompt}

Current obligation context:
${JSON.stringify(context, null, 2)}

User message:
${text}

Return ONLY valid JSON in this format:

{
  "intent": "GENERAL | PAYMENT_PROPOSAL | PROMISE_TO_PAY",
  "amount": number or null,
  "dateISO": "YYYY-MM-DD" or null,
  "response": "natural language response to the user"
}
`;

    // Primary model + fallback models
    const models = [
        process.env.GEMINI_MODEL || "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash"
    ];

    let lastError = null;

    // Try models one by one
    for (const model of models) {
        try {
            console.log(`Trying Gemini model: ${model}`);

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                }
            });

            console.log(`Gemini success with model: ${model}`);
            console.log("Gemini raw response:", response.text);

            const result = JSON.parse(response.text);

            console.log("Gemini parsed response:", result);
            console.log("====================================");

            return result;

        } catch (error) {
            lastError = error;

            console.error(
                `Gemini ${model} failed:`,
                error?.status,
                error?.message
            );

            // If this is not a temporary server/capacity error,
            // don't keep trying other models.
            if (error?.status !== 503) {
                break;
            }

            console.log(`Trying next Gemini model...`);
        }
    }

    // All Gemini models failed
    console.error("========== GEMINI FINAL ERROR ==========");
    console.error(lastError);
    console.error("========================================");

    return {
        ...local,
        response: local.amount
            ? `I understand that you are proposing ₹${local.amount}. I’ll check that against the agreed repayment rules.`
            : "Tell me what amount you can pay or when you expect to pay."
    };
}