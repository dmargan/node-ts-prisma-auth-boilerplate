import { Router } from "express";
import productController from "../controllers/productController";
import authController from "../controllers/authController";

const router = Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("ADMIN", "EDITOR"),
    productController.getProducts
  );

export default router;
