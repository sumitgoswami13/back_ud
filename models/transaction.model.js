import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: String, // external user ID format (like USER_email_timestamp)
      required: true,
      index: true,
    },

    userInfo: {
      first_name: { type: String, required: true, trim: true },
      last_name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pin_code: { type: String, required: true, trim: true },
    },

    documents: [
      {
        name: { type: String, required: true, trim: true },
        size: { type: Number, required: true },
        type: { type: String, required: true, trim: true },
        document_type: { type: String, required: true, trim: true },
        document_category: { type: String, required: true, trim: true },
      },
    ],

    pricing: {
      subtotal: { type: Number, required: true },
      gst_amount: { type: Number, required: true },
      gst_percentage: { type: Number, required: true },
      total_amount: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    metadata: {
      total_documents: { type: Number },
      platform: { type: String },
      version: { type: String },
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
