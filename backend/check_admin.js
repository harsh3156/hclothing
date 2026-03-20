import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminUsers = await User.find({ isAdmin: true });
        console.log("Admin Users found:", adminUsers.length);
        adminUsers.forEach(u => console.log(`- ${u.email} (Name: ${u.name})`));
        
        const allUsers = await User.find({});
        console.log("Total Users:", allUsers.length);
        
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkAdmin();
