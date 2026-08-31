import { Link } from 'react-router-dom';

import ProgressBar from './ProgressBar';

export default function ObligationCard({
    o,
    userId,
}) {
    const creditor =
        String(
            o.creditor?._id ||
                o.creditor
        ) === String(userId);

    const other = creditor
        ? o.debtor
        : o.creditor;

    return (
        <div className="card p-5">
            <div className="flex justify-between gap-3">
                <div>
                    <div className="text-xs text-slate-500">
                        {creditor
                            ? 'OWED TO YOU'
                            : 'YOUR OBLIGATION'}
                    </div>

                    <h3 className="font-bold text-lg mt-1">
                        {other?.name ||
                            other?.email}
                    </h3>
                </div>

                <span className="text-xs px-2 py-1 rounded-full bg-slate-800">
                    {o.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                    <div className="text-xs text-slate-500">
                        Remaining
                    </div>

                    <div className="text-2xl font-black">
                        ₹
                        {o.remainingAmount.toLocaleString()}
                    </div>
                </div>

                <div>
                    <div className="text-xs text-slate-500">
                        Original
                    </div>

                    <div className="font-bold">
                        ₹
                        {o.originalAmount.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <ProgressBar
                    paid={o.totalPaid}
                    total={o.originalAmount}
                />
            </div>

            <Link
                to={`/obligations/${o._id}`}
                className="btn btn-muted w-full mt-5"
            >
                View details
            </Link>
        </div>
    );
}