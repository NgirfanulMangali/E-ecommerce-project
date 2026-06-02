import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.routes";

const app=express();

app.use(cors());

app.use(express.json());

app.use("/auth",authRoutes);

app.use("/api/products", productRoutes);

app.listen(5000,()=>{

 console.log("Server jalan");

});