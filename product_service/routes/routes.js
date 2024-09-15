import Router from "express";
import Product from "../models/product.js";
import amqp from "amqplib";
const router = new Router();

let connection, channel;

const connectToRabbitMQ = async () => {
    connection = await amqp.connect("amqp://guest:guest@127.0.0.1:5672");
    channel = await connection.createChannel();
    console.log("Successfully connected to RabbitMQ");
    await channel.assertQueue("product-service-queue");
    return channel;
}
connectToRabbitMQ();

router.get("/", (req, res) => {
    res.send("Hello World")
});

router.get("/products", async (req, res) => {
    const products = await Product.find();
    res.send(products);
});

router.post("/products", async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.send(product);
});

router.put("/products/:id", async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body);
    res.send(product);
});

router.delete("/products/:id", async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.send(product);
});

router.get("/products/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.send(product);
});

router.post("/buy", async (req, res) => {
    console.log(req.body);
    if (!req.body.productIds) {
        res.status(400).send("Product ID is required");
        return;
    }
    const { productIds } = req.body;
    const products = await Product.find({ _id: { $in: productIds } });
    channel.sendToQueue("order-service-queue", Buffer.from(JSON.stringify({ products })));
    channel.consume("product-service-queue", (data) => {
        console.log("Consumed from product-service-queue");
        channel.ack(data);
    })
    res.send("Order placed successfully");
});

export default router
