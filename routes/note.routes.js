// routes/note.routes.js
import { Router } from "express";
import {
  addDocumentNoteController,
  getDocumentNotesController,
  getTransactionNotesController,
  getNotesByUserController,
  updateNoteController,
  deleteNoteController,
  getDocumentNoteStatsController,
} from "../controler/note.controler.js";

const router = Router();

// Document notes
router.post("/document/:documentId", addDocumentNoteController);
router.get("/document/:documentId", getDocumentNotesController);
router.get("/document/:documentId/stats", getDocumentNoteStatsController);

// Transaction notes
router.get("/transaction/:transactionId", getTransactionNotesController);

// User notes
router.get("/user/:userId", getNotesByUserController);

// Note management
router.patch("/:noteId", updateNoteController);
router.delete("/:noteId", deleteNoteController);

export default router;