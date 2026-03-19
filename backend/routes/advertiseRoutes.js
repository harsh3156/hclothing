// backend/routes/advertiseRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { protect, adminMiddleware } from "../middleware/authMiddleware.js";
import Advertise from "../models/Advertise.js";

const router = express.Router();

// 📂 Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/ads"); // Save ads inside /public/images/ads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

const upload = multer({ storage });

// 📌 Add new advertisement (Admin only)
router.post(
  "/",
  protect,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      const ad = new Advertise({
        image: req.file.filename,
      });

      await ad.save();
      res.json(ad);
    } catch (err) {
      console.error("Error uploading ad:", err);
      res.status(500).json({ message: "Failed to upload ad" });
    }
  }
);

// 📌 Get all advertisements (Public)
router.get("/", async (req, res) => {
  try {
    const ads = await Advertise.find();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ads" });
  }
});

// 📌 Delete advertisement (Admin only)
router.delete("/:id", protect, adminMiddleware, async (req, res) => {
  try {
    const ad = await Advertise.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    await ad.deleteOne();
    res.json({ message: "Ad deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete ad" });
  }
});

export default router;
