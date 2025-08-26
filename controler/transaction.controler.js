// controllers/transaction.controller.js
import {
  createTransaction,
  updateTransaction,
  getTransactionsByUserId,
  getTransactionById,
} from "../services/transaction.service.js";

export async function createTransactionController(req, res) {
  try {
    const data = await createTransaction(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateTransactionController(req, res) {
  try {
    const { transactionId } = req.params;
    const data = await updateTransaction(transactionId, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    const code = err.message === "Transaction not found" ? 404 : 400;
    res.status(code).json({ success: false, message: err.message });
  }
}

export async function getTransactionsByUserIdController(req, res) {
  try {
    const { userId } = req.params;
    const data = await getTransactionsByUserId(userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getTransactionByIdController(req, res) {
  try {
    const { transactionId } = req.params;
    const data = await getTransactionById(transactionId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    const code = err.message === "Transaction not found" ? 404 : 400;
    res.status(code).json({ success: false, message: err.message });
  }
}
