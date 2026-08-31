import { useState } from 'react';
import {
    Link,
    useNavigate,
} from 'react-router-dom';

import { useAuthStore } from '../store/authStore';

export default function Login() {
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [err, setErr] = useState('');

    const login = useAuthStore(
        (s) => s.login
    );

    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setErr('');

        try {
            await login(form);
            nav('/dashboard');
        } catch (e) {
            setErr(
                e.response?.data?.message ||
                    'Login failed'
            );
        }
    };

    return (
        <Auth title="Welcome back">
            <form
                onSubmit={submit}
                className="space-y-4"
            >
                <input
                    className="input"
                    placeholder="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            email: e.target.value,
                        })
                    }
                />

                <input
                    className="input"
                    placeholder="Password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            password: e.target.value,
                        })
                    }
                />

                {err && (
                    <p className="text-red-400 text-sm">
                        {err}
                    </p>
                )}

                <button className="btn btn-primary w-full">
                    Login
                </button>

                <p className="text-sm text-slate-500 text-center">
                    No account?{' '}
                    <Link
                        className="text-slate-200"
                        to="/register"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </Auth>
    );
}

function Auth({ title, children }) {
    return (
        <main className="min-h-[80vh] grid place-items-center px-5">
            <div className="card p-7 w-full max-w-md">
                <h1 className="text-2xl font-black mb-6">
                    {title}
                </h1>

                {children}
            </div>
        </main>
    );
}