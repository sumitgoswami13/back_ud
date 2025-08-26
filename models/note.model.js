// models/Note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },
    noteText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    noteType: {
      type: String,
      enum: ["user", "admin", "system"],
      default: "user",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isInternal: {
      type: Boolean,
      default: false, // false means visible to user, true means admin-only
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileSize: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    metadata: {
      ipAddress: String,
      userAgent: String,
      platform: String,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
noteSchema.index({ documentId: 1, createdAt: -1 });
noteSchema.index({ transactionId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, createdAt: -1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;