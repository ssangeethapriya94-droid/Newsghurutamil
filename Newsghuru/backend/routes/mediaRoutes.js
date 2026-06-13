const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// GET /api/media - Get all uploaded files in the uploads/ directory
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const dirPath = path.join(__dirname, "../uploads");
    
    // Ensure uploads directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error("Read dir error:", err);
        return res.status(500).json({ message: "Unable to scan uploads directory" });
      }

      const fileList = files.map((file) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          url: `http://localhost:5000/uploads/${file}`,
          size: stats.size,
          createdAt: stats.mtime
        };
      });

      // Sort by creation date descending
      fileList.sort((a, b) => b.createdAt - a.createdAt);

      res.json(fileList);
    });
  } catch (error) {
    console.error("Media fetch error:", error);
    res.status(500).json({ message: "Server error listing media" });
  }
});

// POST /api/media/upload - Upload a file (Admin only)
router.post("/upload", verifyToken, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(201).json({
      message: "File uploaded successfully",
      filename: req.file.filename,
      url: fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error uploading file" });
  }
});

// DELETE /api/media/:filename - Delete a file from disk (Admin only)
router.delete("/:filename", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const filename = req.params.filename;
    // Prevent directory traversal attacks
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const filePath = path.join(__dirname, "../uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ message: "Server error deleting file" });
  }
});

module.exports = router;
