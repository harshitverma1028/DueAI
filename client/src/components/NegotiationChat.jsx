import {
    useEffect,
    useState,
} from 'react';

import { Send } from 'lucide-react';

import { obligationService } from '../services/obligationService';

export default function NegotiationChat({ id }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        obligationService
            .history(id)
            .then((r) =>
                setMessages(
                    r.data.conversation?.messages ||
                        []
                )
            )
            .catch(() => {});
    }, [id]);

    const send = async (e) => {
        e.preventDefault();

        if (!text.trim()) {
            return;
        }

        const m = text;

        setText('');
        setBusy(true);

        try {
            const r =
                await obligationService.negotiate(
                    id,
                    m
                );

            setMessages(
                r.data.conversation.messages
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="card p-5">
            <h3 className="font-bold mb-4">
                Negotiation
            </h3>

            <div className="space-y-3 max-h-72 overflow-auto mb-4">
                {messages.length ? (
                    messages.map((m, i) => (
                        <div
                            key={i}
                            className={
                                m.role === 'AI'
                                    ? 'bg-slate-800 p-3 rounded-xl max-w-[85%]'
                                    : 'bg-slate-200 text-slate-900 p-3 rounded-xl max-w-[85%] ml-auto'
                            }
                        >
                            {m.content}
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-sm">
                        Tell DueAI what you can pay or
                        when you expect to pay.
                    </p>
                )}
            </div>

            <form
                onSubmit={send}
                className="flex gap-2"
            >
                <input
                    className="input"
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                    placeholder="I can pay ₹5,000..."
                />

                <button
                    disabled={busy}
                    className="btn btn-primary"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}