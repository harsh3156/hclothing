import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: "h1@gmail.com" });
        if (user) {
            user.password = "admin123";
            user.isAdmin = true;
            await user.save();
            console.log("Admin password reset to 'admin123'");
        } else {
            console.log("Admin user not found, creating one...");
            await User.create({
                name: "Admin",
                email: "h1@gmail.com",
                password: "admin123",
                isAdmin: true
            });
            console.log("Admin user created with email 'h1@gmail.com' and password 'admin123'");
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

resetAdmin();
