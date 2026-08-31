import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

import * as c from '../controllers/obligationController.js';

const r = Router();

r.use(protect);

r.get('/', c.list);

r.post(
    '/',
    validate(c.createSchema),
    c.create
);

r.get('/:id', c.detail);

r.post(
    '/:id/respond',
    validate(
        z.object({
            accept: z.boolean(),
        })
    ),
    c.respond
);

export default r;