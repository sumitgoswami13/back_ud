// server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import "./config/email.js"; // Initialize email configuration
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import documentRoutes from "./routes/document.routes.js";
import noteRoutes from "./routes/note.routes.js";

dotenv.config();

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Adjust this to your needs
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

// Serve uploaded files statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notes", noteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
