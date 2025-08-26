// controllers/note.controller.js
import {
  addDocumentNote,
  getDocumentNotes,
  getTransactionNotes,
  getNotesByUser,
  updateNote,
  deleteNote,
  getDocumentNoteStats,
} from "../services/note.service.js";

export async function addDocumentNoteController(req, res) {
  try {
    const { documentId } = req.params;
    const {
      noteText,
      noteType = "user",
      priority = "medium",
      isInternal = false,
      attachments = [],
    } = req.body;

    // For now, we'll extract userId from request body
    // In a real app, this would come from JWT token
    const { userId, userType = "user" } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId is required" 
      });
    }

    // Only admins can create admin notes or internal notes
    const finalNoteType = userType === "admin" ? noteType : "user";
    const finalIsInternal = userType === "admin" ? isInternal : false;

    console.log('Adding note:', { documentId, userId, userType, noteText, priority });

    const data = await addDocumentNote({
      documentId,
      userId,
      noteText,
      noteType: finalNoteType,
      priority,
      isInternal: finalIsInternal,
      attachments,
      req,
    });

    console.log('Note added successfully, email should be sent');
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Error adding note:', err);
    const code = err.message.includes("not found") ? 404 : 400;
    res.status(code).json({ success: false, message: err.message });
  }
}

export async function getDocumentNotesController(req, res) {
  try {
    const { documentId } = req.params;
    const { userId, userType = "user" } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId is required" 
      });
    }

    const data = await getDocumentNotes(documentId, userId, userType);
    res.json({ success: true, data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    res.status(code).json({ success: false, message: err.message });
  }
}

export async function getTransactionNotesController(req, res) {
  try {
    const { transactionId } = req.params;
    const { userId, userType = "user" } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId is required" 
      });
    }

    const data = await getTransactionNotes(transactionId, userId, userType);
    res.json({ success: true, data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    res.status(code).json({ success: false, message: err.message });
  }
}

export async function getNotesByUserController(req, res) {
  try {
    const { userId } = req.params;
    const { userType = "user" } = req.query;

    const data = await getNotesByUser(userId, userType);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateNoteController(req, res) {
  try {
    const { noteId } = req.params;
    const { userId, userType = "user" } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId is required" 
      });
    }

    const data = await updateNote(noteId, userId, userType, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 
                 err.message.includes("Permission denied") ? 403 : 400;
    res.status(code).json({ success: false, message: err.message });
  }
}

export async function deleteNoteController(req, res) {
  try {
    const { noteId } = req.params;
    const { userId, userType = "user" } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId is required" 
      });
    }

    const data = await deleteNote(noteId, userId, userType);
    res.json({ success: true, data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 
                 err.message.includes("Permission denied") ? 403 : 400;
    res.status(code).json({ success: false, message: err.message });
  }
}

export async function getDocumentNoteStatsController(req, res) {
  try {
    const { documentId } = req.params;
    const data = await getDocumentNoteStats(documentId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}