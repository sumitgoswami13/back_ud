// middlewares/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = "uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function toShortSlug(filename, max = 24) {
  const base = path.parse(filename).name;
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, max) || "file";
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const short = toShortSlug(file.originalname);
    const now = Date.now();                // ms
    const tsSec = Math.floor(now / 1000);  // seconds
    const tsMs = now % 1000;               // ms remainder
    const rnd = Math.random().toString(36).slice(2, 7);
    const unique = `${short}_${tsSec}-${tsMs}_${rnd}${ext}`;
    cb(null, unique);
  },
});

function fileFilter(req, file, cb) {
  const ok = file.mimetype === "application/pdf" || file.mimetype.startsWith("image/");
  if (!ok) return cb(new Error("Only PDF or image files are allowed"));
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
