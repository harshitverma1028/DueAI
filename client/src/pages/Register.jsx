import { useState } from 'react';
import {
    Link,
    useNavigate,
} from 'react-router-dom';

import { useAuthStore } from '../store/authStore';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [err, setErr] = useState('');

    const register = useAuthStore(
        (s) => s.register
    );

    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setErr('');

        try {
            await register(form);
            nav('/dashboard');
        } catch (e) {
            setErr(
                e.response?.data?.message ||
                    'Registration failed'
            );
        }
    };

    return (
        <main className="min-h-[80vh] grid place-items-center px-5">
            <div className="card p-7 w-full max-w-md">
                <h1 className="text-2xl font-black mb-6">
                    Create your DueAI account
                </h1>

                <form
                    onSubmit={submit}
                    className="space-y-4"
                >
                    <input
                        className="input"
                        placeholder="Full name"
                        required
                        value={form.name}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                name: e.target.value,
                            })
                        }
                    />

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
                        placeholder="Password (8+ characters)"
                        type="password"
                        minLength="8"
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
                        Create account
                    </button>
                </form>

                <p className="text-sm text-slate-500 text-center mt-4">
                    Already registered?{' '}
                    <Link
                        className="text-slate-200"
                        to="/login"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}