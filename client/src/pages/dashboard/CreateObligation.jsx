import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { obligationService } from '../../services/obligationService';

export default function CreateObligation() {
    const [f, setF] = useState({
        debtorEmail: '',
        originalAmount: '',
        maxTransactions: 3,
        minimumPayment: '',
        reminderIntervalDays: 3,
        deadline: '',
        negotiationEnabled: true,
    });

    const [err, setErr] = useState('');

    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();

        try {
            const r = await obligationService.create({
                ...f,
                originalAmount: Number(
                    f.originalAmount
                ),
                maxTransactions: Number(
                    f.maxTransactions
                ),
                minimumPayment: Number(
                    f.minimumPayment
                ),
                reminderIntervalDays: Number(
                    f.reminderIntervalDays
                ),
            });

            nav(
                `/obligations/${r.data.obligation._id}`
            );
        } catch (e) {
            setErr(
                e.response?.data?.message ||
                    'Could not create obligation'
            );
        }
    };

    return (
        <main className="max-w-2xl mx-auto px-5 py-10">
            <h1 className="text-3xl font-black">
                Create obligation
            </h1>

            <p className="text-slate-500 mt-2">
                Define the financial rules before inviting
                the debtor into repayment.
            </p>

            <form
                onSubmit={submit}
                className="card p-6 mt-8 space-y-4"
            >
                <Field label="Debtor email">
                    <input
                        className="input"
                        type="email"
                        required
                        value={f.debtorEmail}
                        onChange={(e) =>
                            setF({
                                ...f,
                                debtorEmail:
                                    e.target.value,
                            })
                        }
                    />
                </Field>

                <Field label="Original amount (₹)">
                    <input
                        className="input"
                        type="number"
                        min="1"
                        required
                        value={f.originalAmount}
                        onChange={(e) =>
                            setF({
                                ...f,
                                originalAmount:
                                    e.target.value,
                            })
                        }
                    />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Maximum transactions">
                        <input
                            className="input"
                            type="number"
                            min="1"
                            required
                            value={f.maxTransactions}
                            onChange={(e) =>
                                setF({
                                    ...f,
                                    maxTransactions:
                                        e.target.value,
                                })
                            }
                        />
                    </Field>

                    <Field label="Minimum payment (₹)">
                        <input
                            className="input"
                            type="number"
                            min="0"
                            required
                            value={f.minimumPayment}
                            onChange={(e) =>
                                setF({
                                    ...f,
                                    minimumPayment:
                                        e.target.value,
                                })
                            }
                        />
                    </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Reminder interval (days)">
                        <input
                            className="input"
                            type="number"
                            min="1"
                            required
                            value={
                                f.reminderIntervalDays
                            }
                            onChange={(e) =>
                                setF({
                                    ...f,
                                    reminderIntervalDays:
                                        e.target.value,
                                })
                            }
                        />
                    </Field>

                    <Field label="Deadline">
                        <input
                            className="input"
                            type="date"
                            value={f.deadline}
                            onChange={(e) =>
                                setF({
                                    ...f,
                                    deadline:
                                        e.target.value,
                                })
                            }
                        />
                    </Field>
                </div>

                <label className="flex gap-3 items-center text-sm">
                    <input
                        type="checkbox"
                        checked={f.negotiationEnabled}
                        onChange={(e) =>
                            setF({
                                ...f,
                                negotiationEnabled:
                                    e.target.checked,
                            })
                        }
                    />

                    Enable AI-assisted negotiation
                </label>

                {err && (
                    <p className="text-red-400 text-sm">
                        {err}
                    </p>
                )}

                <button className="btn btn-primary w-full">
                    Create obligation
                </button>
            </form>
        </main>
    );
}

function Field({
    label,
    children,
}) {
    return (
        <label className="block">
            <span className="text-sm text-slate-400 block mb-2">
                {label}
            </span>

            {children}
        </label>
    );
}