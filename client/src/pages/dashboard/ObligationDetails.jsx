import {
    useEffect,
    useState,
} from 'react';

import { useParams } from 'react-router-dom';

import { obligationService } from '../../services/obligationService';
import { paymentService } from '../../services/paymentService';
import { useAuthStore } from '../../store/authStore';

import ProgressBar from '../../components/ProgressBar';
import PaymentTimeline from '../../components/PaymentTimeline';
import NegotiationChat from '../../components/NegotiationChat';

export default function ObligationDetails() {
    const { id } = useParams();

    const user = useAuthStore(
        (s) => s.user
    );

    const [data, setData] = useState(null);
    const [pay, setPay] = useState('');
    const [paymentError, setPaymentError] = useState('');

    const load = () =>
        obligationService
            .detail(id)
            .then((r) => setData(r.data));

    useEffect(() => {
        load();
    }, [id]);

    if (!data) {
        return (
            <main className="max-w-4xl mx-auto p-5 py-12">
                Loading...
            </main>
        );
    }

    const o = data.obligation;

    const isDebtor =
        String(o.debtor?._id) ===
        String(user.id);

    const accept = async (a) => {
        await obligationService.respond(id, a);
        load();
    };

    const createPayment = async () => {
        const amount = Number(
            pay || o.remainingAmount
        );

        if (
            amount < o.minimumPayment &&
            amount !== o.remainingAmount
        ) {
            setPaymentError(
                `Payment must be at least ₹${o.minimumPayment}.`
            );
            return;
        }

        setPaymentError('');

        try {
            const r = await paymentService.order({
                obligationId: id,
                amount,
            });

            if (r.data.mode === 'mock') {
                await paymentService.mockSuccess(
                    r.data.paymentId
                );

                await load();

                alert(
                    'Mock payment successful. Add Razorpay keys for real checkout.'
                );

                return;
            }

            if (!window.Razorpay) {
                alert(
                    'Razorpay Checkout script is not loaded.'
                );

                return;
            }

            const rz = new window.Razorpay({
                key: r.data.keyId,
                amount: r.data.amount * 100,
                currency: 'INR',
                order_id: r.data.orderId,

                handler: async (response) => {
                    await paymentService.verify(
                        response
                    );

                    load();
                },
            });

            rz.open();
        } catch (error) {
            setPaymentError(
                error.response?.data?.message ||
                'Amount is greater than the remaining balance.'
            );
        }
    };

    return (
        <main className="max-w-5xl mx-auto px-5 py-10">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <div className="text-xs text-slate-500">
                        {isDebtor
                            ? 'YOUR OBLIGATION'
                            : 'OWED TO YOU'}
                    </div>

                    <h1 className="text-3xl font-black mt-1">
                        ₹
                        {o.remainingAmount.toLocaleString()}{' '}
                        remaining
                    </h1>

                    <p className="text-slate-500 mt-2">
                        {o.creditor?.name} ↔{' '}
                        {o.debtor?.name}
                    </p>
                </div>

                <span className="px-3 py-2 rounded-full bg-slate-800 text-sm">
                    {o.status}
                </span>
            </div>

            <div className="card p-6 mt-7">
                <ProgressBar
                    paid={o.totalPaid}
                    total={o.originalAmount}
                />

                <div className="grid sm:grid-cols-4 gap-4 mt-6 text-sm">
                    <div>
                        <span className="text-slate-500 block">
                            Original
                        </span>

                        ₹
                        {o.originalAmount.toLocaleString()}
                    </div>

                    <div>
                        <span className="text-slate-500 block">
                            Paid
                        </span>

                        ₹
                        {o.totalPaid.toLocaleString()}
                    </div>

                    <div>
                        <span className="text-slate-500 block">
                            Minimum
                        </span>

                        ₹
                        {o.minimumPayment.toLocaleString()}
                    </div>

                    <div>
                        <span className="text-slate-500 block">
                            Transactions
                        </span>

                        {
                            data.payments.filter(
                                (p) =>
                                    p.status ===
                                    'SUCCESSFUL'
                            ).length
                        }{' '}
                        / {o.maxTransactions}
                    </div>
                </div>
            </div>

            {o.status === 'PENDING' &&
                isDebtor && (
                    <div className="card p-5 mt-5 flex gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                accept(true)
                            }
                        >
                            Accept obligation
                        </button>

                        <button
                            className="btn btn-muted"
                            onClick={() =>
                                accept(false)
                            }
                        >
                            Reject
                        </button>
                    </div>
                )}

            {isDebtor &&
                ![
                    'SETTLED',
                    'CANCELLED',
                    'PENDING',
                ].includes(o.status) && (
                    <div className="card p-5 mt-5">
                        <h2 className="font-bold">
                            Make a payment
                        </h2>

                        <div className="flex gap-2 mt-3">
                            <input
                                className="input"
                                type="number"
                                min="1"
                                max={
                                    o.remainingAmount
                                }
                                placeholder={
                                    o.remainingAmount
                                }
                                value={pay}
                                onChange={(e) => {
                                    setPay(e.target.value); 
                                    setPaymentError('');
                                }}
                            />

                            <button
                                className="btn btn-primary"
                                onClick={
                                    createPayment
                                }
                            >
                                Pay
                            </button>
                        </div>

                        {paymentError && (
                            <p className="text-sm text-red-600 mt-2">
                                {paymentError}
                            </p>
                        )}

                        <p className="text-xs text-slate-500 mt-2">
                            Backend rules validate every
                            payment. Razorpay Test Mode is
                            used when configured.
                        </p>
                    </div>
                )}

            <div className="grid md:grid-cols-2 gap-5 mt-5">
                <div className="card p-5">
                    <h2 className="font-bold mb-4">
                        Payment history
                    </h2>

                    <PaymentTimeline
                        payments={data.payments}
                    />
                </div>

                <NegotiationChat id={id} />
            </div>
        </main>
    );
}