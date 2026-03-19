import Product from "../models/Product.js";
import Order from "../models/Order.js"; // Import Order model for star ratings

// ➕ Add Product
export const addProduct = async (req, res) => {
    try {
        const { name, description, price, size } = req.body;

        // Convert price to number
        const numericPrice = Number(price);
        if (!name || isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ message: "Name and valid price are required." });
        }

        const image = req.file ? req.file.filename : "";

        const parsedSize = typeof size === "string" ? JSON.parse(size) : size || {};

        const product = new Product({
            name,
            description,
            price: numericPrice,
            size: {
                M: Number(parsedSize.M) || 0,
                L: Number(parsedSize.L) || 0,
                XL: Number(parsedSize.XL) || 0,
                XXL: Number(parsedSize.XXL) || 0,
            },
            image,
        });

        await product.save();
        res.status(201).json({ message: "Product added successfully", product });
    } catch (err) {
        console.error("Error in addProduct:", err);
        res.status(500).json({ message: "Failed to add product due to server error." });
    }
};

// 📦 Get All Products (Star Ratings only, no written feedback)
export const getProducts = async (req, res) => {
    try {
        // Calculate average star ratings from delivered orders
        const ratingsAggregation = await Order.aggregate([
            {
                $match: {
                    status: "Delivered",
                    "feedback.rating": { $exists: true, $ne: null, $gt: 0 },
                },
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    averageRating: { $avg: "$feedback.rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const products = await Product.find({});

        // Merge products with star rating data
        const productsWithRatings = products.map((product) => {
            const productObj = product.toObject();
            const ratingData = ratingsAggregation.find(
                (r) => r._id.toString() === productObj._id.toString()
            );

            return {
                ...productObj,
                averageRating: ratingData ? parseFloat(ratingData.averageRating.toFixed(1)) : 0,
                totalReviews: ratingData ? ratingData.totalReviews : 0,
            };
        });

        res.json(productsWithRatings);
    } catch (err) {
        console.error("Error fetching products with ratings:", err);
        res.status(500).json({ message: "Failed to fetch products and ratings" });
    }
};

// 🗑️ Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✏️ Update Product
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, size } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const parsedSize = typeof size === "string" ? JSON.parse(size) : size || {};
        const updatedPrice = price !== undefined ? Number(price) : product.price;

        product.name = name || product.name;
        product.description = description || product.description;

        if (!isNaN(updatedPrice) && updatedPrice > 0) {
            product.price = updatedPrice;
        }

        product.size.M = parsedSize.M !== undefined ? Number(parsedSize.M) : product.size.M;
        product.size.L = parsedSize.L !== undefined ? Number(parsedSize.L) : product.size.L;
        product.size.XL = parsedSize.XL !== undefined ? Number(parsedSize.XL) : product.size.XL;
        product.size.XXL = parsedSize.XXL !== undefined ? Number(parsedSize.XXL) : product.size.XXL;

        if (req.file) product.image = req.file.filename;

        await product.save();
        res.json({ message: "Product updated successfully", product });
    } catch (err) {
        console.error("Error in updateProduct:", err);
        res.status(500).json({ message: err.message });
    }
};

// ✅ Get single product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Get star rating for this specific product
        const ratingData = await Order.aggregate([
            {
                $match: {
                    status: "Delivered",
                    "items.product": product._id,
                    "feedback.rating": { $exists: true, $ne: null, $gt: 0 },
                },
            },
            {
                $group: {
                    _id: "$items.product",
                    averageRating: { $avg: "$feedback.rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const ratingInfo = ratingData[0] || { averageRating: 0, totalReviews: 0 };

        res.json({
            ...product.toObject(),
            averageRating: parseFloat(ratingInfo.averageRating.toFixed(1)),
            totalReviews: ratingInfo.totalReviews,
        });
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
