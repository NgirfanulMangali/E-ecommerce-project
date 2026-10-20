import { Router } from "express";
import { addToCart, getCart } from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getCart);
router.post("/", addToCart);

export default router;
