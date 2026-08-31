import { Router } from 'express';

import { protect } from '../middleware/auth.js';

import * as c from '../controllers/paymentController.js';

const r = Router();

r.use(protect);

r.post('/order', c.order);

r.post('/verify', c.verify);

r.post('/mock-success', c.mockSuccess);

export default r;