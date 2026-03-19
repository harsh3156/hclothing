import mongoose from "mongoose";

const advertiseSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true, // ✅ must have image
    },
    link: {
      type: String,
      default: "", // optional
    },
  },
  { timestamps: true }
);

export default mongoose.model("Advertise", advertiseSchema);
