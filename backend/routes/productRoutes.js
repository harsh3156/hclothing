// routes/productRoutes.js (Full Code)

import express from "express";
import {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { protect, adminMiddleware } from "../middleware/authMiddleware.js";
import uploadProductImage from "../middleware/uploadMiddleware.js"; // ⭐ Multer Import

const router = express.Router();

// 📦 Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// 🛡️ Admin protected routes
// ⭐ FIX: Multer middleware ને addProduct controller પહેલાં મૂકો
router.post(
    "/add", 
    protect, 
    adminMiddleware, 
    uploadProductImage.single('image'), // ⭐ Multer Applied
    addProduct
);

// ⭐ Update રાઉટ પણ સુધારો
router.put(
    "/edit/:id", 
    protect, 
    adminMiddleware, 
    uploadProductImage.single('image'), 
    updateProduct
);

router.delete("/delete/:id", protect, adminMiddleware, deleteProduct);

export default router;