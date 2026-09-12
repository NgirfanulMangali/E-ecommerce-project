import { Router } from 'express';
import { getProducts } from '../controllers/product.controller.js';
import { getProductByIdController } from '../controllers/product-detailed.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductByIdController)

export default router;

