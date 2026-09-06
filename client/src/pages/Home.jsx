import { Link } from 'react-router-dom';

import {
    ArrowRight,
    BrainCircuit,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';

export default function Home() {
    return (
        <main>
            <section className="max-w-6xl mx-auto px-5 py-24 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <div className="text-xs uppercase tracking-[.25em] text-slate-500 mb-4">
                        Digital Obligation Management
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                        From agreement to{' '}
                        <span className="text-slate-400">
                            ₹0.
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 mt-6 max-w-xl">
                        DueAI helps two people manage an
                        ongoing financial obligation—rules,
                        negotiation, reminders, real payments
                        and settlement in one shared ledger.
                    </p>

                    <div className="flex gap-3 mt-8">
                        <Link
                            to="/register"
                            className="btn btn-primary"
                        >
                            Start an obligation
                            <ArrowRight size={17} />
                        </Link>

                        <Link
                            to="/login"
                            className="btn btn-muted"
                        >
                            Login
                        </Link>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="text-sm text-slate-500">
                        OBLIGATION
                    </div>

                    <div className="text-4xl font-black mt-2">
                        ₹10,000
                    </div>

                    <div className="mt-6 space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span>Agreement</span>
                            <span>✓</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Rules</span>
                            <span>₹4,000 min · 3 max</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Negotiation</span>
                            <span>AI assisted</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Payment</span>
                            <span>Razorpay</span>
                        </div>

                        <div className="border-t border-slate-800 pt-4 flex justify-between font-bold">
                            <span>Remaining</span>
                            <span>₹3,000</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-5 pb-24 grid md:grid-cols-3 gap-4">
                {[
                    [
                        ShieldCheck,
                        'Rule-first',
                        'Financial truth stays in the backend.',
                    ],
                    [
                        BrainCircuit,
                        'AI negotiation',
                        'AI understands conversation without controlling balances.',
                    ],
                    [
                        WalletCards,
                        'Shared ledger',
                        'Both parties see payment progress through settlement.',
                    ],
                ].map(([I, t, d]) => (
                    <div
                        className="card p-5"
                        key={t}
                    >
                        <I />

                        <h3 className="font-bold mt-4">
                            {t}
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            {d}
                        </p>
                    </div>
                ))}
            </section>


            <section className="max-w-6xl mx-auto px-5 pb-10">
                <footer className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
                    DueAI © {new Date().getFullYear()} . All rights reserved.
                    <br />Harshit verma
                </footer>
            </section>
        </main>
    );
}