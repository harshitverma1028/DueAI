export default function PaymentTimeline({
    payments = [],
}) {
    return (
        <div className="space-y-3">
            {payments.map((p) => (
                <div
                    key={p._id}
                    className="flex justify-between p-3 rounded-lg bg-slate-900 border border-slate-800"
                >
                    <div>
                        <div className="font-semibold">
                            ₹
                            {p.amount.toLocaleString()}
                        </div>

                        <div className="text-xs text-slate-500">
                            {new Date(
                                p.createdAt
                            ).toLocaleString()}
                        </div>
                    </div>

                    <span className="text-xs text-slate-400">
                        {p.status}
                    </span>
                </div>
            ))}
        </div>
    );
}