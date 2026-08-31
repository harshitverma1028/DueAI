export default function ProgressBar({
    paid,
    total,
}) {
    const p = total
        ? Math.min(
              100,
              Math.round((paid / total) * 100)
          )
        : 0;

    return (
        <div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                    className="h-full bg-slate-200"
                    style={{
                        width: `${p}%`,
                    }}
                />
            </div>

            <div className="text-xs text-slate-500 mt-1">
                {p}% settled
            </div>
        </div>
    );
}