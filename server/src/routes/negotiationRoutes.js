import { Router } from 'express';
import { z } from 'zod';

import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

import * as c from '../controllers/negotiationController.js';

const r = Router();

r.use(protect);

r.get('/:id', c.history);

r.post(
    '/:id',
    validate(
        z.object({
            message: z.string().min(1).max(2000),
        })
    ),
    c.chat
);

export default r;