import express from 'express';
import { login, signup, verifyOtp, sendOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/send-otp', sendOtp);

export default router;
