import User from "../models/User.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { sendOTP } from "../utils/mailService.js";

// Generate Token Utility
const generateToken = (id, isAdmin) => {
    return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ---------------------------------------------
// @desc Register user (Step 1: Send OTP)
// @route POST /api/users/register
// @access Public
// ---------------------------------------------
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists with this email");
    }

    const otp = generateOTP();
    
    // Save OTP to DB
    await OTP.findOneAndUpdate(
        { email },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
    );

    await sendOTP(email, otp);

    res.status(200).json({
        success: true,
        message: "OTP sent to your email. Please verify to complete registration.",
    });
});

// ---------------------------------------------
// @desc Verify OTP and Complete Registration
// @route POST /api/users/verify-otp-register
// @access Public
// ---------------------------------------------
export const verifyOTPAndRegister = asyncHandler(async (req, res) => {
    const { name, email, password, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    // Delete OTP after verification
    await OTP.deleteOne({ _id: otpRecord._id });

    const user = await User.create({ name, email, password });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id, user.isAdmin),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// ---------------------------------------------
// @desc Login user (Step 1: Verify Password, Step 2: Send OTP for non-admins)
// @route POST /api/users/login
// @access Public
// ---------------------------------------------
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // ✅ ADMIN: Login directly without OTP
        if (user.isAdmin) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id, user.isAdmin),
            });
        }

        // ✅ USER: Send OTP for verification
        const otp = generateOTP();
        
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        await sendOTP(email, otp);

        res.json({
            otpRequired: true,
            email: user.email,
            message: "OTP sent to your email. Please verify to login.",
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

// ---------------------------------------------
// @desc Verify OTP and Complete Login
// @route POST /api/users/verify-otp-login
// @access Public
// ---------------------------------------------
export const verifyOTPAndLogin = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    // Delete OTP after verification
    await OTP.deleteOne({ _id: otpRecord._id });

    const user = await User.findOne({ email });

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id, user.isAdmin),
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// ---------------------------------------------
// @desc Get user profile
// @route GET /api/users/profile
// @access Private
// ---------------------------------------------
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// ---------------------------------------------
// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
// ---------------------------------------------
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;

        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                res.status(400);
                throw new Error("Email is already in use by another account.");
            }
            user.email = req.body.email;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id, updatedUser.isAdmin),
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// ---------------------------------------------
// @desc Update password
// @route PUT /api/users/password
// @access Private
// ---------------------------------------------
export const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error("Both old and new passwords are required.");
    }

    const user = await User.findById(req.user._id);

    if (user) {
        if (!(await user.matchPassword(oldPassword))) {
            res.status(401);
            throw new Error("Incorrect current password.");
        }

        user.password = newPassword;
        await user.save();

        res.json({
            message: "Password updated successfully.",
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// ---------------------------------------------
// @desc Get all users (Admin only)
// @route GET /api/users
// @access Private/Admin
// ---------------------------------------------
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password");
    res.json(users);
});
