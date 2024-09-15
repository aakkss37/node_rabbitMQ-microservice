import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    products: [{
        product_id: String,
    }],
    total: Number
}, {
    timestamps: true
});

export default mongoose.model("Order", OrderSchema);