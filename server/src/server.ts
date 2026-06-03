import "dotenv/config";
import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000, () => {
  console.log("Registering /api/products route");
  console.log("Server jalan");
});