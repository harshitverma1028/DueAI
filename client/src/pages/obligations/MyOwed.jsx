import { useEffect, useState } from 'react';

import { obligationService } from '../../services/obligationService';
import { useAuthStore } from '../../store/authStore';

import ObligationCard from '../../components/ObligationCard';

export default function MyOwed() {
    const user = useAuthStore(
        (s) => s.user
    );

    const [items, setItems] = useState([]);

    useEffect(() => {
        obligationService
            .list()
            .then((r) =>
                setItems(
                    r.data.obligations.filter(
                        (o) =>
                            String(o.creditor?._id) ===
                            String(user.id)
                    )
                )
            );
    }, [user]);

    return (
        <List
            title="Money owed to you"
            items={items}
            user={user}
        />
    );
}

function List({
    title,
    items,
    user,
}) {
    return (
        <main className="max-w-6xl mx-auto px-5 py-10">
            <h1 className="text-3xl font-black">
                {title}
            </h1>

            <div className="grid md:grid-cols-2 gap-4 mt-7">
                {items.map((o) => (
                    <ObligationCard
                        key={o._id}
                        o={o}
                        userId={user.id}
                    />
                ))}
            </div>
        </main>
    );
}