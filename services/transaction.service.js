import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

export async function createTransaction(payload) {
  const {
    transaction_id,
    user_id,
    user_info,
    documents,
    pricing,
    status = "pending",
    metadata,
  } = payload;

  if (!transaction_id || !user_id || !user_info || !documents || !pricing) {
    throw new Error("Missing required fields");
  }

  // ✅ Verify user exists
  const user = await User.findById(user_id);
  if (!user) {
    throw new Error("User not found");
  }

  const tx = await Transaction.create({
    transactionId: transaction_id,
    userId: user._id, // store the actual Mongo ObjectId
    userInfo: user_info,
    documents,
    pricing,
    status,
    metadata,
  });

  return tx.toObject();
}
export async function updateTransaction(transactionId, updates) {
  if (!transactionId) throw new Error("transactionId required");

  const tx = await Transaction.findOneAndUpdate(
    { transactionId },
    { $set: updates },
    { new: true }
  );

  if (!tx) throw new Error("Transaction not found");
  return tx.toObject();
}

export async function getTransactionsByUserId(userId) {
  if (!userId) throw new Error("userId required");
  const txs = await Transaction.find({ userId }).sort({ createdAt: -1 }).lean();
  return txs;
}

export async function getTransactionById(transactionId) {
  if (!transactionId) throw new Error("transactionId required");
  const tx = await Transaction.findOne({ transactionId }).lean();
  if (!tx) throw new Error("Transaction not found");
  return tx;
}
