import { Router } from 'express';
import { z } from 'zod';

import {
    register,
    login,
    logout,
    me,
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const r = Router();

r.post(
    '/register',
    validate(
        z.object({
            name: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(8),
            phone: z.string().optional(),
        })
    ),
    register
);

r.post(
    '/login',
    validate(
        z.object({
            email: z.string().email(),
            password: z.string().min(1),
        })
    ),
    login
);

r.post('/logout', logout);

r.get('/me', protect, me);

export default r;