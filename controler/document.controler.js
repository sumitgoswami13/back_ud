// controllers/document.controller.js
import fs from "fs/promises";
import path from "path";
import {
  uploadDocument,
  uploadMultipleDocuments,
  getDocumentsByUser,
  getDocumentsByTransaction,
  getDocumentById,
  updateDocumentStatus,
  deleteDocument,
  attachSignedDocumentLinkFromFile,
} from "../services/document.service.js"; // adjust path if different

function diskPath(file) {
  return path.resolve(file.path);
}

export async function uploadSingleDocumentController(req, res) {
  const { userId, transactionId, documentType } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ success: false, message: "File is required" });

  try {
    const data = await uploadDocument({
      userId,
      transactionId,
      documentType,
      file,
      req,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    try { await fs.unlink(diskPath(file)); } catch (_) {}
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function uploadManyDocumentsController(req, res) {
  const { userId, transactionId, documentType } = req.body;
  const files = req.files;

  if (!files || !files.length) {
    return res.status(400).json({ success: false, message: "Files are required" });
  }

  try {
    const data = await uploadMultipleDocuments({
      userId,
      transactionId,
      files,
      documentType, // if you support per-file types, switch to req.body.documentTypes[]
      req,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    await Promise.allSettled((files || []).map((f) => fs.unlink(diskPath(f))));
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getDocumentsByUserController(req, res) {
  try {
    const data = await getDocumentsByUser(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getDocumentsByTransactionController(req, res) {
  try {
    const data = await getDocumentsByTransaction(req.params.transactionId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getDocumentByIdController(req, res) {
  try {
    const data = await getDocumentById(req.params.documentId);
    res.json({ success: true, data });
  } catch (err) {
    const code = err.message === "Document not found" ? 404 : 400;
    res.status(code).json({ success: false, message: err.message });
  }
}

export async function updateDocumentStatusController(req, res) {
  try {
    const data = await updateDocumentStatus({
      documentId: req.params.documentId,
      documentStatus: req.body.documentStatus,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function attachSignedLinkFileController(req, res) {
  const { documentId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ success: false, message: "File is required" });

  try {
    const data = await attachSignedDocumentLinkFromFile({ documentId, file, req });
    console.log('Signed document uploaded successfully, email should be sent');
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error uploading signed document:', err);
    try { await fs.unlink(diskPath(file)); } catch {}
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function deleteDocumentController(req, res) {
  try {
    const data = await deleteDocument(req.params.documentId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
