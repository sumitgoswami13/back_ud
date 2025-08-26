// routes/document.routes.js
import { Router } from "express";
import { upload } from "../utlis/upload.js";
import {
  uploadSingleDocumentController,
  uploadManyDocumentsController,
  getDocumentsByUserController,
  getDocumentsByTransactionController,
  getDocumentByIdController,
  updateDocumentStatusController,
  deleteDocumentController,
  attachSignedLinkFileController,
} from "../controler/document.controler.js";

const router = Router();

router.post("/upload", upload.single("file"), uploadSingleDocumentController);
router.post("/upload-many", upload.array("files", 10), uploadManyDocumentsController);

router.get("/user/:userId", getDocumentsByUserController);
router.get("/transaction/:transactionId", getDocumentsByTransactionController);
router.get("/:documentId", getDocumentByIdController);

router.patch("/:documentId/status", updateDocumentStatusController);
router.patch(
  "/:documentId/signed-file",
  upload.single("file"),      // form-data key: file
  attachSignedLinkFileController
);
router.delete("/:documentId", deleteDocumentController);

export default router;
