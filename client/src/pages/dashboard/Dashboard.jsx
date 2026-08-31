import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import { Link } from 'react-router-dom';

import { obligationService } from '../../services/obligationService';
import { useAuthStore } from '../../store/authStore';

import ObligationCard from '../../components/ObligationCard';

export default function Dashboard() {
    const user = useAuthStore(
        (s) => s.user
    );

    const [items, setItems] = useState([]);

    useEffect(() => {
        obligationService
            .list()
            .then((r) =>
                setItems(r.data.obligations)
            );
    }, []);

    const stats = useMemo(
        () => ({
            owed: items
                .filter(
                    (o) =>
                        String(o.creditor?._id) ===
                        String(user?.id)
                )
                .reduce(
                    (a, o) =>
                        a + o.remainingAmount,
                    0
                ),

            debt: items
                .filter(
                    (o) =>
                        String(o.debtor?._id) ===
                        String(user?.id)
                )
                .reduce(
                    (a, o) =>
                        a + o.remainingAmount,
                    0
                ),

            active: items.filter(
                (o) =>
                    ![
                        'SETTLED',
                        'CANCELLED',
                    ].includes(o.status)
            ).length,

            overdue: items.filter(
                (o) => o.status === 'OVERDUE'
            ).length,
        }),
        [items, user]
    );

    return (
        <main className="max-w-6xl mx-auto px-5 py-10">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="text-slate-500 text-sm">
                        OVERVIEW
                    </div>

                    <h1 className="text-3xl font-black mt-1">
                        Good to see you,{' '}
                        {user?.name}
                    </h1>
                </div>

                <Link
                    to="/obligations/new"
                    className="btn btn-primary"
                >
                    + New obligation
                </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    [
                        'Money owed to you',
                        stats.owed,
                    ],
                    [
                        'You owe',
                        stats.debt,
                    ],
                    [
                        'Active',
                        stats.active,
                    ],
                    [
                        'Overdue',
                        stats.overdue,
                    ],
                ].map(([t, v]) => (
                    <div
                        className="card p-5"
                        key={t}
                    >
                        <div className="text-sm text-slate-500">
                            {t}
                        </div>

                        <div className="text-2xl font-black mt-2">
                            {typeof v === 'number' &&
                            t !== 'Active' &&
                            t !== 'Overdue'
                                ? `₹${v.toLocaleString()}`
                                : v}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {items.map((o) => (
                    <ObligationCard
                        key={o._id}
                        o={o}
                        userId={user?.id}
                    />
                ))}
            </div>

            {!items.length && (
                <div className="text-center text-slate-500 py-20">
                    No obligations yet. Create your
                    first one.
                </div>
            )}
        </main>
    );
}