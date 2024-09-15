import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
}, {
    timestamps: true
});

export default mongoose.model("Products", ProductSchema);