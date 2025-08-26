// services/note.service.js
import mongoose from "mongoose";
import Note from "../models/note.model.js";
import Document from "../models/document.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { sendDocumentNoteEmail } from "./email.service.js";

/**
 * Add a note to a document
 */
export async function addDocumentNote({
  documentId,
  userId,
  noteText,
  noteType = "user",
  priority = "medium",
  isInternal = false,
  attachments = [],
  req
}) {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new Error("Invalid documentId");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }
  if (!noteText || !noteText.trim()) {
    throw new Error("Note text is required");
  }

  // Verify document exists
  const document = await Document.findById(documentId).lean();
  if (!document) {
    throw new Error("Document not found");
  }

  // Verify user exists
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  // Get transaction details
  const transaction = await Transaction.findById(document.transactionId).lean();
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Create metadata from request
  const metadata = {
    ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
    userAgent: req?.get('User-Agent') || 'unknown',
    platform: req?.get('X-Platform') || 'web',
  };

  // Create the note
  const note = await Note.create({
    documentId,
    userId,
    transactionId: document.transactionId,
    noteText: noteText.trim(),
    noteType,
    priority,
    isInternal,
    attachments,
    metadata,
  });

  // Get the document owner for email notification
  const documentOwner = await User.findById(document.userId).lean();
  
  // Send email notification
  try {
    // Determine who should receive the email
    const emailRecipients = [];
    
    // Get all admin users
    const admins = await User.find({ type: 'admin' }).select('email firstName').lean();
    
    // If user creates a note, notify all admins
    if (user.type !== 'admin') {
      admins.forEach(admin => {
        emailRecipients.push({
          email: admin.email,
          firstName: admin.firstName,
          role: 'admin'
        });
      });
    }
    
    // If admin creates a public note, notify document owner (if different from note author)
    if (user.type === 'admin' && !isInternal) {
      if (documentOwner && documentOwner._id.toString() !== userId.toString()) {
        emailRecipients.push({
          email: documentOwner.email,
          firstName: documentOwner.firstName,
          role: 'document_owner'
        });
      }
    }

    // Always notify admins for high/urgent priority notes
    if (priority === 'high' || priority === 'urgent') {
      admins.forEach(admin => {
        if (!emailRecipients.find(r => r.email === admin.email)) {
          emailRecipients.push({
            email: admin.email,
            firstName: admin.firstName,
            role: 'admin'
          });
        }
      });
    }

    // Send emails to all recipients
    for (const recipient of emailRecipients) {
      await sendDocumentNoteEmail({
        email: recipient.email,
        firstName: recipient.firstName,
        documentType: document.documentType,
        transactionId: transaction.transactionId,
        noteText: noteText.trim(),
        noteAuthor: `${user.firstName} ${user.lastName}`,
        noteType,
        priority,
        isInternal,
        recipientRole: recipient.role
      });
    }
  } catch (emailError) {
    console.error('Failed to send note notification email:', emailError);
    // Don't throw error - note creation should still succeed
  }

  // Populate the note with user details for response
  const populatedNote = await Note.findById(note._id)
    .populate('userId', 'firstName lastName email type')
    .lean();

  return populatedNote;
}

/**
 * Get all notes for a document
 */
export async function getDocumentNotes(documentId, userId, userType = 'user') {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new Error("Invalid documentId");
  }

  // Verify document exists
  const document = await Document.findById(documentId).lean();
  if (!document) {
    throw new Error("Document not found");
  }

  // Build filter based on user type and permissions
  const filter = { documentId };
  
  // Regular users can only see non-internal notes and their own notes
  if (userType !== 'admin') {
    filter.$or = [
      { isInternal: false },
      { userId: userId, isInternal: true }
    ];
  }
  // Admins can see all notes (no additional filter needed)

  const notes = await Note.find(filter)
    .populate('userId', 'firstName lastName email type')
    .sort({ createdAt: -1 })
    .lean();

  return notes;
}

/**
 * Get all notes for a transaction
 */
export async function getTransactionNotes(transactionId, userId, userType = 'user') {
  if (!mongoose.isValidObjectId(transactionId)) {
    throw new Error("Invalid transactionId");
  }

  // Build filter based on user type and permissions
  const filter = { transactionId };
  
  // Regular users can only see non-internal notes and their own notes
  if (userType !== 'admin') {
    filter.$or = [
      { isInternal: false },
      { userId: userId, isInternal: true }
    ];
  }

  const notes = await Note.find(filter)
    .populate('userId', 'firstName lastName email type')
    .populate('documentId', 'documentType documentStatus')
    .sort({ createdAt: -1 })
    .lean();

  return notes;
}

/**
 * Get notes by user
 */
export async function getNotesByUser(userId, userType = 'user') {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  const filter = { userId };
  
  // Regular users can only see their own notes
  // Admins can see notes by any user
  if (userType !== 'admin') {
    // Additional security check - users can only see their own notes
    // This is already handled by the userId filter
  }

  const notes = await Note.find(filter)
    .populate('documentId', 'documentType documentStatus')
    .populate('transactionId', 'transactionId status')
    .sort({ createdAt: -1 })
    .lean();

  return notes;
}

/**
 * Update a note (only by the author or admin)
 */
export async function updateNote(noteId, userId, userType, updates) {
  if (!mongoose.isValidObjectId(noteId)) {
    throw new Error("Invalid noteId");
  }

  const note = await Note.findById(noteId);
  if (!note) {
    throw new Error("Note not found");
  }

  // Check permissions - only note author or admin can update
  if (userType !== 'admin' && note.userId.toString() !== userId.toString()) {
    throw new Error("Permission denied");
  }

  // Only allow certain fields to be updated
  const allowedUpdates = ['noteText', 'priority', 'isInternal'];
  const filteredUpdates = {};
  
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const updatedNote = await Note.findByIdAndUpdate(
    noteId,
    { $set: filteredUpdates },
    { new: true }
  ).populate('userId', 'firstName lastName email type');

  return updatedNote.toObject();
}

/**
 * Delete a note (only by the author or admin)
 */
export async function deleteNote(noteId, userId, userType) {
  if (!mongoose.isValidObjectId(noteId)) {
    throw new Error("Invalid noteId");
  }

  const note = await Note.findById(noteId);
  if (!note) {
    throw new Error("Note not found");
  }

  // Check permissions - only note author or admin can delete
  if (userType !== 'admin' && note.userId.toString() !== userId.toString()) {
    throw new Error("Permission denied");
  }

  await Note.findByIdAndDelete(noteId);
  return { deleted: true, id: noteId };
}

/**
 * Get note statistics for a document
 */
export async function getDocumentNoteStats(documentId) {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new Error("Invalid documentId");
  }

  const stats = await Note.aggregate([
    { $match: { documentId: new mongoose.Types.ObjectId(documentId) } },
    {
      $group: {
        _id: null,
        totalNotes: { $sum: 1 },
        userNotes: { $sum: { $cond: [{ $eq: ["$noteType", "user"] }, 1, 0] } },
        adminNotes: { $sum: { $cond: [{ $eq: ["$noteType", "admin"] }, 1, 0] } },
        highPriorityNotes: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
        urgentNotes: { $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] } },
        internalNotes: { $sum: { $cond: ["$isInternal", 1, 0] } },
        lastNoteDate: { $max: "$createdAt" }
      }
    }
  ]);

  return stats[0] || {
    totalNotes: 0,
    userNotes: 0,
    adminNotes: 0,
    highPriorityNotes: 0,
    urgentNotes: 0,
    internalNotes: 0,
    lastNoteDate: null
  };
}