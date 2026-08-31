import {
    Link,
    useNavigate,
} from 'react-router-dom';

import {
    LogOut,
    Plus,
    WalletCards,
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';

export default function Navbar() {
    const {
        user,
        logout,
    } = useAuthStore();

    const nav = useNavigate();

    return (
        <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur">
            <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
                <Link
                    to="/"
                    className="font-black text-xl flex gap-2 items-center"
                >
                    <WalletCards size={21} />
                    DueAI
                </Link>

                {user ? (
                    <div className="flex items-center gap-3">
                        <Link
                            className="btn btn-muted text-sm"
                            to="/obligations/new"
                        >
                            <Plus size={16} />
                            New obligation
                        </Link>

                        <span className="text-sm text-slate-400 hidden sm:block">
                            {user.name}
                        </span>

                        <button
                            className="btn btn-muted"
                            onClick={async () => {
                                await logout();
                                nav('/login');
                            }}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link
                            className="btn btn-muted"
                            to="/login"
                        >
                            Login
                        </Link>

                        <Link
                            className="btn btn-primary"
                            to="/register"
                        >
                            Get started
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}