import { api } from './api';

export const obligationService = {
    list: () =>
        api.get('/obligations'),

    create: (d) =>
        api.post('/obligations', d),

    detail: (id) =>
        api.get(`/obligations/${id}`),

    respond: (id, accept) =>
        api.post(
            `/obligations/${id}/respond`,
            { accept }
        ),

    negotiate: (id, message) =>
        api.post(
            `/negotiations/${id}`,
            { message }
        ),

    history: (id) =>
        api.get(`/negotiations/${id}`),
};