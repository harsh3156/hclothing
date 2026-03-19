// POST /api/ads
router.post("/", upload.single("image"), async (req, res) => {
  const { title } = req.body;
  if (!title || !req.file) {
    return res.status(400).json({ message: "Title and image are required" });
  }
  const newAd = new Ad({
    title,
    image: req.file.filename,
  });
  await newAd.save();
  res.json(newAd);
});
