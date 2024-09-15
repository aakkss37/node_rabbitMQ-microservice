import express from "express";
import mongoose from "mongoose";
import Order from "./models/order.js";
import amqp from "amqplib";
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

const connectToMongoDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/order_service", { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB order_service");
    } catch (error) {
        console.log("Failed to connect to MongoDB");
        console.log(error);
    }
}

connectToMongoDB();


const createOrder = async (products) => {
    let total = 0;
    products.forEach((item) => {
        total += item.price;
    })
    const order = new Order({
        products,
        total
    });
    order.save();
    return order;
}


let connection, channel;
const connectToRabbitMQ = async () => {
    connection = await amqp.connect("amqp://guest:guest@127.0.0.1:5672");
    channel = await connection.createChannel();
    console.log("Successfully connected to RabbitMQ");
    await channel.assertQueue("order-service-queue");
    return channel;
}
connectToRabbitMQ().then(() => {
    channel.consume("order-service-queue", (data) => {
        const { product } = JSON.parse(data);
        const newOrder = createOrder(product);
        console.log(newOrder, "<===== newOrder placed");
        console.log("Consumed from order-service-queue");
        channel.ack(data);
    })
});

app.listen(process.env.PORT || 3002, () => console.log("order_service started on port 3002"));