// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ⭐ Ensure folder exists before saving
const imagePath = path.resolve("public", "images");
if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagePath); // backend/public/images
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default uploadProductImage;
