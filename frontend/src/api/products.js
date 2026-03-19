// src/api/products.js

import axios from "axios";
// ⭐ ખાતરી કરો કે BASE_URL તમારા Express સર્વરના API રાઉટ સાથે મેળ ખાય છે
const BASE_URL = "http://localhost:5000/api/products"; 


// 📦 Get All Products (FIX: આ ફંક્શન ખૂટે છે, તેને ઉમેરો)
export const getProducts = async () => {
    try {
        // http://localhost:5000/api/products પર GET કોલ થશે
        const res = await axios.get(BASE_URL); 
        return res.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};


// Add Product (તમારું હાલનું ફંક્શન)
export const addProduct = async (productData, token) => {
    // Calling BASE_URL/add 
    return await axios.post(`${BASE_URL}/add`, productData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Update Product (તમારું હાલનું ફંક્શન)
export const updateProduct = async (id, productData, token) => {
    // Calling BASE_URL/edit/:id
    const res = await axios.put(`${BASE_URL}/edit/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Delete Product (તમારું હાલનું ફંક્શન)
export const deleteProduct = async (id, token) => {
    // Calling BASE_URL/delete/:id
    const res = await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// નોંધ: જો તમારી પાસે getProductById ફંક્શન પણ હોય, તો તે પણ આ ફાઇલમાં હોવું જોઈએ.
// export const getProductById = async (id) => { ... }