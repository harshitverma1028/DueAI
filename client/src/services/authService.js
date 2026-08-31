import { api } from './api';

export const authService = {
    register: (d) =>
        api.post('/auth/register', d),

    login: (d) =>
        api.post('/auth/login', d),

    logout: () =>
        api.post('/auth/logout'),

    me: () =>
        api.get('/auth/me'),
};