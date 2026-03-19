import Advertise from "../models/Advertise.js";

// 📌 Create Ad
export const createAd = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const ad = await Advertise.create({
      image: req.file.filename,
    });

    res.status(201).json(ad);
  } catch (err) {
    console.error("Create Ad Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Get All Ads
export const getAds = async (req, res) => {
  try {
    const ads = await Advertise.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Delete Ad
export const deleteAd = async (req, res) => {
  try {
    const ad = await Advertise.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    await ad.deleteOne();
    res.json({ message: "Ad deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
