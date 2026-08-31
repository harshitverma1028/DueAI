import { useEffect } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/dashboard/Dashboard';
import CreateObligation from './pages/dashboard/CreateObligation';
import ObligationDetails from './pages/dashboard/ObligationDetails';

import MyOwed from './pages/obligations/MyOwed';
import MyDebts from './pages/obligations/MyDebts';

import { useAuthStore } from './store/authStore';

function Guard({ children }) {
    const {
        user,
        loading,
    } = useAuthStore();

    if (loading) {
        return (
            <div className="p-10">
                Loading...
            </div>
        );
    }

    return user ? (
        children
    ) : (
        <Navigate
            to="/login"
            replace
        />
    );
}

export default function App() {
    const init = useAuthStore(
        (s) => s.init
    );

    useEffect(() => {
        init();
    }, [init]);

    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <Guard>
                            <Dashboard />
                        </Guard>
                    }
                />

                <Route
                    path="/obligations/new"
                    element={
                        <Guard>
                            <CreateObligation />
                        </Guard>
                    }
                />

                <Route
                    path="/obligations/:id"
                    element={
                        <Guard>
                            <ObligationDetails />
                        </Guard>
                    }
                />

                <Route
                    path="/owed"
                    element={
                        <Guard>
                            <MyOwed />
                        </Guard>
                    }
                />

                <Route
                    path="/debts"
                    element={
                        <Guard>
                            <MyDebts />
                        </Guard>
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}