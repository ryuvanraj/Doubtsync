import { supabase } from '../utils/supabase.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
    },
});

// Signup Function
const signup = async (req, res) => {
    try {
        const { email, password, fullName, userType } = req.body;
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    user_type: userType
                }
            }
        });

        if (error) throw error;

        res.status(201).json({
            message: 'Signup successful',
            user: data.user
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

// Login Function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        res.json({
            message: 'Login successful',
            session: data.session,
            user: data.user
        });
    } catch (error) {
        res.status(401).json({
            error: error.message
        });
    }
};

// Send OTP Function
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);

        if (error.response && error.response.status === 400) {
            res.status(400).json({ error: "Invalid email address" });
        } else if (error.response && error.response.status === 401) {
            res.status(401).json({ error: "Unauthorized access" });
        } else {
            res.status(500).json({ error: "Failed to send OTP" });
        }
    }
};

// Verify OTP Function
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const { data, error } = await supabase
            .from('otps')
            .select('*')
            .eq('email', email)
            .eq('code', otp)
            .eq('verified', false)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (error) throw error;
        if (!data) throw new Error('Invalid or expired OTP');

        await supabase
            .from('otps')
            .update({ verified: true })
            .eq('id', data.id);

        res.json({
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

// ✅ Export All Functions Correctly
export { signup, login, sendOtp, verifyOtp };
