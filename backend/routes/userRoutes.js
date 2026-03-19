import express from "express";
import {
    registerUser,
    loginUser,
    verifyOTPAndRegister,
    verifyOTPAndLogin,
    getProfile,
    updateProfile,
    updatePassword,
    getAllUsers,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/verify-otp-register", verifyOTPAndRegister);
router.post("/login", loginUser);
router.post("/verify-otp-login", verifyOTPAndLogin);

// Private (Authenticated) User Routes
router
  .route("/profile")
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.put("/password", protect, updatePassword);

// Private (Admin) Routes
router.get("/", protect, adminOnly, getAllUsers);
// Deleted: router.delete("/:id", protect, adminOnly, deleteUser);

export default router;
