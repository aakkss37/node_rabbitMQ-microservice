import express from "express";
import mongoose from "mongoose";
import Product from "./models/product.js";
import amqp from "amqplib";
import productRouter from "./routes/routes.js";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
const app = express();  // create express app

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use("/images", express.static("images"));
app.use("/public", express.static("public"));
app.use("/css", express.static("css"));

const connectToMongoDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/product_service", { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Failed to connect to MongoDB");
        console.log(error);
    }
}
connectToMongoDB();

app.use("/api", productRouter);
app.listen(process.env.PORT || 3001, () => console.log("Server started on port 3001"));