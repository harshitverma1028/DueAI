import {Router} from 'express';
import {webhook} from '../controllers/webhookController.js';
const r=Router();
r.post('/razorpay',webhook);
export default r;
