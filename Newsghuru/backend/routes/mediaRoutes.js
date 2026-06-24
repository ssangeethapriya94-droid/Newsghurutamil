const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const sanitized = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + sanitized);
  }
});

const upload = multer({ storage });

// GET /api/media - Get all uploaded files in the local folder
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(uploadDir);
    const fileList = files.map(file => {
      const stats = fs.statSync(path.join(uploadDir, file));
      return {
        filename: file,
        url: `/uploads/${file}`,
        size: stats.size,
        createdAt: stats.birthtimeMs
      };
    });

    // Sort by creation date descending
    fileList.sort((a, b) => b.createdAt - a.createdAt);

    res.json(fileList);
  } catch (error) {
    console.error("Media fetch error:", error);
    res.status(500).json({ message: "Server error listing media" });
  }
});

// POST /api/media/upload - Upload a file (Admin and Editor)
router.post("/upload", verifyToken, authorizeRoles("admin", "editor"), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(201).json({
      message: "File uploaded successfully",
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error uploading file" });
  }
});

// DELETE ALL /api/media - Delete all files from local folder (Admin only)
router.delete("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
    }
    res.json({ message: "All files deleted successfully" });
  } catch (error) {
    console.error("Delete all media error:", error);
    res.status(500).json({ message: "Server error deleting all files" });
  }
});

// DELETE /api/media/:filename - Delete a file from local folder (Admin only)
router.delete("/:filename", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const publicId = req.params.filename; 
    if (!publicId) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const filePath = path.join(__dirname, '../uploads', publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ message: "File not found or already deleted" });
    }
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ message: "Server error deleting file" });
  }
});

module.exports = router;
