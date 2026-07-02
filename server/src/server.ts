import express from "express";
import productRoutes from "./routes/product.routes";

const app = express();

app.use('/products', productRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});