import mongoose from "mongoose";
import Document from "../models/document.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

function buildFullUrl(req, filePath) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const relativePath = filePath.replace(/\\/g, "/");
  return `${baseUrl}/${relativePath}`;
}

function assertTxCompleted(tx) {
  const isCompleted =
    (typeof tx.paymentStatus === "string" && tx.paymentStatus === "completed") ||
    (typeof tx.status === "string" && tx.status === "completed");
  if (!isCompleted) throw new Error("Transaction not completed");
}

export async function uploadDocument({ userId, transactionId, documentType, file, req }) {
  if (!userId || !transactionId || !documentType || !file || !req) {
    throw new Error("Missing required fields");
  }
  if (!mongoose.isValidObjectId(userId)) throw new Error("Invalid userId");

  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  const tx = await Transaction.findOne({transactionId});
  if (!tx) throw new Error("Transaction not found");
  console.log(tx.status);
  if(tx.status !== "completed") throw new Error("Transaction not completed");

  const fullLink = buildFullUrl(req, file.path);

  const doc = await Document.create({
    userId,
    transactionId:tx._id,
    documentType,
    documentLink: fullLink,
  });

  if (Array.isArray(tx.documentIds)) {
    tx.documentIds.push(doc._id);
    await tx.save();
  }

  return doc.toObject();
}

export async function uploadMultipleDocuments({ userId, transactionId, files, documentType, req }) {
  if (!userId || !transactionId || !files || files.length === 0 || !req) {
    throw new Error("Missing required fields");
  }
  if (!mongoose.isValidObjectId(userId)) throw new Error("Invalid userId");


  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  const tx = await Transaction.findOne({transactionId});
  if (!tx) throw new Error("Transaction not found");
  console.log(tx.status);
  if(tx.status !== "completed") throw new Error("Transaction not completed");

  const docsToInsert = files.map((file) => ({
    userId,
    transactionId:tx._id,
    documentType,
    documentLink: buildFullUrl(req, file.path),
  }));

  const created = await Document.insertMany(docsToInsert);
  if (Array.isArray(tx.documentIds)) {
    tx.documentIds.push(...created.map((d) => d._id));
    await tx.save();
  }

  return created.map((d) => d.toObject());
}
export async function getDocumentsByUser(userId) {
  if (!mongoose.isValidObjectId(userId)) throw new Error("Invalid userId");
  return Document.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getDocumentsByTransaction(transactionId) {
  if (!mongoose.isValidObjectId(transactionId)) throw new Error("Invalid transactionId");
  return Document.find({ transactionId }).sort({ createdAt: -1 }).lean();
}

export async function getDocumentById(documentId) {
  if (!mongoose.isValidObjectId(documentId)) throw new Error("Invalid documentId");
  const doc = await Document.findById(documentId).lean();
  if (!doc) throw new Error("Document not found");
  return doc;
}

export async function updateDocumentStatus({ documentId, documentStatus }) {
  if (!mongoose.isValidObjectId(documentId)) throw new Error("Invalid documentId");
  const allowed = ["pending", "under_review", "approved", "rejected", "signed"];
  if (!allowed.includes(documentStatus)) throw new Error("Invalid status");

  const doc = await Document.findByIdAndUpdate(
    documentId,
    { $set: { documentStatus } },
    { new: true }
  ).lean();

  if (!doc) throw new Error("Document not found");
  return doc;
}

export async function attachSignedDocumentLinkFromFile({ documentId, file, req }) {
  if (!mongoose.isValidObjectId(documentId)) throw new Error("Invalid documentId");
  if (!file || !req) throw new Error("Signed document file is required");

  const signedLink = buildFullUrl(req, file.path);

  const doc = await Document.findByIdAndUpdate(
    documentId,
    { $set: { signedDocumentLink: signedLink, documentStatus: "signed" } },
    { new: true }
  ).lean();

  if (!doc) throw new Error("Document not found");
  return doc;
}

export async function deleteDocument(documentId) {
  if (!mongoose.isValidObjectId(documentId)) throw new Error("Invalid documentId");
  const doc = await Document.findByIdAndDelete(documentId).lean();
  if (!doc) throw new Error("Document not found");
  return { deleted: true, id: documentId };
}
