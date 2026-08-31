import { create } from 'zustand';

import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
    user: null,

    loading: true,

    init: async () => {
        try {
            const r = await authService.me();

            set({
                user: r.data.user,
                loading: false,
            });
        } catch {
            set({
                user: null,
                loading: false,
            });
        }
    },

    login: async (d) => {
        const r = await authService.login(d);

        set({
            user: r.data.user,
        });

        return r;
    },

    register: async (d) => {
        const r = await authService.register(d);

        set({
            user: r.data.user,
        });

        return r;
    },

    logout: async () => {
        await authService.logout();

        set({
            user: null,
        });
    },
}));