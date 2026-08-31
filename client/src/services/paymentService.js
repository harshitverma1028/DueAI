import { api } from './api';

export const paymentService = {
    order: (d) =>
        api.post('/payments/order', d),

    mockSuccess: (paymentId) =>
        api.post(
            '/payments/mock-success',
            { paymentId }
        ),

    verify: (d) =>
        api.post('/payments/verify', d),
};