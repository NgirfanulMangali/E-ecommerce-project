// src/app.ts
import path from "path";
import cors from "cors";
import express from "express";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use('/auth', authRoutes);
app.use('/products', productRoutes);

export default app;