"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
const product_service_1 = require("../services/product.service");
async function getProducts(req, res) {
    try {
        const products = await (0, product_service_1.getAllProducts)();
        return res.status(200).json({
            data: products,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "An internal server error occurred. Please try again later.",
            code: "INTERNAL_SERVER_ERROR",
        });
    }
}
