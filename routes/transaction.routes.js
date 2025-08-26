// routes/transaction.routes.js
import { Router } from "express";
import {
  createTransactionController,
  updateTransactionController,
  getTransactionsByUserIdController,
  getTransactionByIdController,
} from "../controler/transaction.controler.js";

const router = Router();

router.post("/", createTransactionController);
router.patch("/:transactionId", updateTransactionController);
router.get("/user/:userId", getTransactionsByUserIdController);
router.get("/:transactionId", getTransactionByIdController);

export default router;
