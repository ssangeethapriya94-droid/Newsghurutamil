const express = require("express");
const router = express.Router();
const RasiPalan = require("../models/RasiPalan");
const TempleBlog = require("../models/TempleBlog");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Helper to notify admins when Editor submits content
const notifyAdmins = async (type, text, language = "ta") => {
  try {
    const admins = await User.find({ role: "admin" });
    const notifications = admins.map((admin) =>
      Notification.create({
        recipientId: admin._id,
        type,
        text,
        language,
      })
    );
    await Promise.all(notifications);
  } catch (err) {
    console.error("Failed to create admin notification:", err);
  }
};

// Helper to notify Editor of status changes
const notifyEditor = async (editorId, type, text, reason = "", language = "ta") => {
  if (!editorId) return;
  try {
    await Notification.create({
      recipientId: editorId,
      type,
      text,
      reason,
      language,
    });
  } catch (err) {
    console.error("Failed to create editor notification:", err);
  }
};

/* =========================================================================
   RASI PALAN ENDPOINTS
   ========================================================================= */

// GET /api/anmigam/rasi-palan - Get all Rasi Palan entries (or filter by status/language/periodType)
router.get("/rasi-palan", async (req, res) => {
  try {
    let query = {};
    
    // Check role to determine permissions
    let isAdminOrEditor = false;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret_key");
        const user = await User.findById(decoded.userId);
        if (user && (user.role === "admin" || user.role === "editor")) {
          isAdminOrEditor = true;
        }
      } catch (err) {
        // Guest user
      }
    }

    if (!isAdminOrEditor) {
      // Guests only see published ones
      query.status = "published";
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.language) {
      query.language = req.query.language;
    }
    
    if (req.query.periodType) {
      query.periodType = req.query.periodType;
    }

    if (req.query.date) {
      const targetDate = new Date(req.query.date + "T00:00:00.000Z");
      if (req.query.periodType === "day" || !req.query.periodType) {
        query.date = targetDate;
      } else {
        // For week/month, find range that covers the targetDate
        query.date = { $lte: targetDate };
        query.endDate = { $gte: targetDate };
      }
    }

    const records = await RasiPalan.find(query)
      .populate("createdBy", "name email role")
      .sort({ date: -1, createdAt: -1 });
    
    res.json(records);
  } catch (error) {
    console.error("Error fetching Rasi Palans:", error);
    res.status(500).json({ message: "Server error fetching Rasi Palan entries" });
  }
});

// GET /api/anmigam/rasi-palan/latest - Get latest published Rasi Palan
router.get("/rasi-palan/latest", async (req, res) => {
  try {
    const { language = "ta", periodType = "day", date } = req.query;
    
    let query = {
      status: "published",
      language,
      periodType,
    };

    if (date) {
      const targetDate = new Date(date + "T00:00:00.000Z");
      if (periodType === "day") {
        query.date = targetDate;
      } else {
        query.date = { $lte: targetDate };
        query.endDate = { $gte: targetDate };
      }
    }

    // Sort by date descending to get the most recent matching prediction
    const record = await RasiPalan.findOne(query)
      .populate("createdBy", "name email role")
      .sort({ date: -1, createdAt: -1 });

    if (!record && date) {
      // Fallback: if no exact range covers the date, just return the absolute newest published record
      const fallbackRecord = await RasiPalan.findOne({
        status: "published",
        language,
        periodType,
      })
        .populate("createdBy", "name email role")
        .sort({ date: -1, createdAt: -1 });
      return res.json(fallbackRecord);
    }

    res.json(record);
  } catch (error) {
    console.error("Error fetching latest Rasi Palan:", error);
    res.status(500).json({ message: "Server error fetching latest Rasi Palan" });
  }
});

// GET /api/anmigam/rasi-palan/:id - Get single Rasi Palan entry
router.get("/rasi-palan/:id", async (req, res) => {
  try {
    const record = await RasiPalan.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("approvedBy", "name email role");
      
    if (!record) {
      return res.status(404).json({ message: "Rasi Palan entry not found" });
    }
    res.json(record);
  } catch (error) {
    console.error("Error fetching Rasi Palan details:", error);
    res.status(500).json({ message: "Server error fetching Rasi Palan details" });
  }
});

// POST /api/anmigam/rasi-palan - Create Rasi Palan (Admin & Editor only)
router.post("/rasi-palan", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { language, periodType, date, endDate, dayName, title, predictions, status } = req.body;

    if (!language || !periodType || !date || !predictions || !Array.isArray(predictions) || predictions.length === 0) {
      return res.status(400).json({ message: "Missing required fields (language, periodType, date, predictions)" });
    }

    const formattedDate = new Date(date + "T00:00:00.000Z");
    const formattedEndDate = endDate ? new Date(endDate + "T00:00:00.000Z") : null;

    // Default status handling based on role
    let finalStatus = "draft";
    if (req.user.role === "admin") {
      finalStatus = status || "published";
    } else {
      // Editor can save as draft or submit
      finalStatus = ["draft", "submitted"].includes(status) ? status : "draft";
    }

    const newRecord = new RasiPalan({
      language,
      periodType,
      date: formattedDate,
      endDate: formattedEndDate,
      dayName,
      title,
      predictions,
      status: finalStatus,
      createdBy: req.user._id,
      publishedAt: finalStatus === "published" ? new Date() : null,
    });

    const saved = await newRecord.save();

    if (saved.status === "submitted") {
      await notifyAdmins(
        "submitted",
        `New Rasi Palan (${periodType}) in ${language === "ta" ? "Tamil" : "English"} submitted by Editor ${req.user.name} is pending review.`,
        language
      );
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating Rasi Palan:", error);
    res.status(500).json({ message: "Server error creating Rasi Palan" });
  }
});

// PUT /api/anmigam/rasi-palan/:id - Update Rasi Palan (Admin & Editor only)
router.put("/rasi-palan/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { language, periodType, date, endDate, dayName, title, predictions, status } = req.body;
    const record = await RasiPalan.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Rasi Palan not found" });
    }

    // Role checks
    if (req.user.role === "editor") {
      if (record.status !== "draft" && record.status !== "rejected") {
        return res.status(403).json({ message: "Not authorized. Editors can only edit Draft or Rejected entries." });
      }
    }

    const oldStatus = record.status;

    if (language !== undefined) record.language = language;
    if (periodType !== undefined) record.periodType = periodType;
    if (date !== undefined) record.date = new Date(date + "T00:00:00.000Z");
    if (endDate !== undefined) record.endDate = endDate ? new Date(endDate + "T00:00:00.000Z") : null;
    if (dayName !== undefined) record.dayName = dayName;
    if (title !== undefined) record.title = title;
    if (predictions !== undefined) record.predictions = predictions;

    if (req.user.role === "admin") {
      if (status !== undefined) {
        record.status = status;
        if (status === "published" && oldStatus !== "published") {
          record.publishedAt = new Date();
          record.approvedBy = req.user._id;
        }
      }
    } else {
      // Editor status update
      if (status !== undefined) {
        record.status = ["draft", "submitted"].includes(status) ? status : "draft";
      }
    }

    const updated = await record.save();

    if (updated.status === "submitted" && oldStatus !== "submitted") {
      await notifyAdmins(
        "submitted",
        `Rasi Palan (${record.periodType}) in ${record.language === "ta" ? "Tamil" : "English"} submitted by Editor ${req.user.name} is pending review.`,
        record.language
      );
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating Rasi Palan:", error);
    res.status(500).json({ message: "Server error updating Rasi Palan" });
  }
});

// PUT /api/anmigam/rasi-palan/:id/approve - Approve Rasi Palan (Admin only)
router.put("/rasi-palan/:id/approve", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const record = await RasiPalan.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Rasi Palan entry not found" });
    }

    record.status = "approved";
    record.approvedBy = req.user._id;
    await record.save();

    await notifyEditor(
      record.createdBy,
      "approved",
      `Your Rasi Palan entry for ${record.date.toISOString().split("T")[0]} has been Approved by Admin.`,
      "",
      record.language
    );

    res.json(record);
  } catch (error) {
    console.error("Error approving Rasi Palan:", error);
    res.status(500).json({ message: "Server error approving Rasi Palan" });
  }
});

// PUT /api/anmigam/rasi-palan/:id/reject - Reject Rasi Palan (Admin only)
router.put("/rasi-palan/:id/reject", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const record = await RasiPalan.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Rasi Palan entry not found" });
    }

    record.status = "rejected";
    record.rejectedAt = new Date();
    record.rejectionReason = reason;
    await record.save();

    await notifyEditor(
      record.createdBy,
      "rejected",
      `Your Rasi Palan entry for ${record.date.toISOString().split("T")[0]} was rejected.`,
      reason,
      record.language
    );

    res.json(record);
  } catch (error) {
    console.error("Error rejecting Rasi Palan:", error);
    res.status(500).json({ message: "Server error rejecting Rasi Palan" });
  }
});

// PUT /api/anmigam/rasi-palan/:id/publish - Publish Rasi Palan (Admin only)
router.put("/rasi-palan/:id/publish", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const record = await RasiPalan.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Rasi Palan entry not found" });
    }

    record.status = "published";
    record.publishedAt = new Date();
    record.approvedBy = req.user._id;
    await record.save();

    await notifyEditor(
      record.createdBy,
      "published",
      `Your Rasi Palan entry for ${record.date.toISOString().split("T")[0]} is now Live on the website.`,
      "",
      record.language
    );

    res.json(record);
  } catch (error) {
    console.error("Error publishing Rasi Palan:", error);
    res.status(500).json({ message: "Server error publishing Rasi Palan" });
  }
});

// DELETE /api/anmigam/rasi-palan/:id - Delete Rasi Palan (Admin & Editor only)
router.delete("/rasi-palan/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const record = await RasiPalan.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Rasi Palan not found" });
    }

    if (req.user.role === "editor") {
      const createdByStr = record.createdBy ? record.createdBy.toString() : "";
      if (record.status !== "draft" || createdByStr !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized. Editors can only delete their own Draft entries." });
      }
    }

    await RasiPalan.findByIdAndDelete(req.params.id);
    res.json({ message: "Rasi Palan entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting Rasi Palan:", error);
    res.status(500).json({ message: "Server error deleting Rasi Palan" });
  }
});


/* =========================================================================
   TEMPLE BLOG ENDPOINTS
   ========================================================================= */

// GET /api/anmigam/temple-blogs - Get temple blogs (filter by status/language)
router.get("/temple-blogs", async (req, res) => {
  try {
    let query = {};

    // Check role for permission
    let isAdminOrEditor = false;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret_key");
        const user = await User.findById(decoded.userId);
        if (user && (user.role === "admin" || user.role === "editor")) {
          isAdminOrEditor = true;
        }
      } catch (err) {
        // Guest
      }
    }

    if (!isAdminOrEditor) {
      query.status = "published";
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.language) {
      query.language = req.query.language;
    }

    const blogs = await TempleBlog.find(query)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching Temple Blogs:", error);
    res.status(500).json({ message: "Server error fetching Temple Blogs" });
  }
});

// GET /api/anmigam/temple-blogs/:id - Get single Temple Blog
router.get("/temple-blogs/:id", async (req, res) => {
  try {
    const blog = await TempleBlog.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("approvedBy", "name email role");

    if (!blog) {
      return res.status(404).json({ message: "Temple Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    console.error("Error fetching Temple Blog details:", error);
    res.status(500).json({ message: "Server error fetching Temple Blog details" });
  }
});

// POST /api/anmigam/temple-blogs - Create Temple Blog (Admin & Editor only)
router.post("/temple-blogs", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { title, subtitle, description, content, image, templeName, location, language, status } = req.body;

    if (!title || !content || !language) {
      return res.status(400).json({ message: "Title, content, and language are required fields" });
    }

    let finalStatus = "draft";
    if (req.user.role === "admin") {
      finalStatus = status || "published";
    } else {
      finalStatus = ["draft", "submitted"].includes(status) ? status : "draft";
    }

    const newBlog = new TempleBlog({
      title,
      subtitle,
      description,
      content,
      image,
      templeName,
      location,
      language,
      status: finalStatus,
      createdBy: req.user._id,
      publishedAt: finalStatus === "published" ? new Date() : null,
    });

    const saved = await newBlog.save();

    if (saved.status === "submitted") {
      await notifyAdmins(
        "submitted",
        `New Temple Blog "${saved.title}" submitted by Editor ${req.user.name} is pending review.`,
        language
      );
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating Temple Blog:", error);
    res.status(500).json({ message: "Server error creating Temple Blog" });
  }
});

// PUT /api/anmigam/temple-blogs/:id - Update Temple Blog (Admin & Editor only)
router.put("/temple-blogs/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { title, subtitle, description, content, image, templeName, location, language, status } = req.body;
    const blog = await TempleBlog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Temple Blog not found" });
    }

    if (req.user.role === "editor") {
      if (blog.status !== "draft" && blog.status !== "rejected") {
        return res.status(403).json({ message: "Not authorized. Editors can only edit Draft or Rejected blogs." });
      }
    }

    const oldStatus = blog.status;

    if (title !== undefined) blog.title = title;
    if (subtitle !== undefined) blog.subtitle = subtitle;
    if (description !== undefined) blog.description = description;
    if (content !== undefined) blog.content = content;
    if (image !== undefined) blog.image = image;
    if (templeName !== undefined) blog.templeName = templeName;
    if (location !== undefined) blog.location = location;
    if (language !== undefined) blog.language = language;

    if (req.user.role === "admin") {
      if (status !== undefined) {
        blog.status = status;
        if (status === "published" && oldStatus !== "published") {
          blog.publishedAt = new Date();
          blog.approvedBy = req.user._id;
        }
      }
    } else {
      if (status !== undefined) {
        blog.status = ["draft", "submitted"].includes(status) ? status : "draft";
      }
    }

    const updated = await blog.save();

    if (updated.status === "submitted" && oldStatus !== "submitted") {
      await notifyAdmins(
        "submitted",
        `Temple Blog "${blog.title}" submitted by Editor ${req.user.name} is pending review.`,
        blog.language
      );
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating Temple Blog:", error);
    res.status(500).json({ message: "Server error updating Temple Blog" });
  }
});

// PUT /api/anmigam/temple-blogs/:id/approve - Approve Temple Blog (Admin only)
router.put("/temple-blogs/:id/approve", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const blog = await TempleBlog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Temple Blog not found" });
    }

    blog.status = "approved";
    blog.approvedBy = req.user._id;
    await blog.save();

    await notifyEditor(
      blog.createdBy,
      "approved",
      `Your Temple Blog "${blog.title}" has been Approved by Admin.`,
      "",
      blog.language
    );

    res.json(blog);
  } catch (error) {
    console.error("Error approving Temple Blog:", error);
    res.status(500).json({ message: "Server error approving Temple Blog" });
  }
});

// PUT /api/anmigam/temple-blogs/:id/reject - Reject Temple Blog (Admin only)
router.put("/temple-blogs/:id/reject", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const blog = await TempleBlog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Temple Blog not found" });
    }

    blog.status = "rejected";
    blog.rejectedAt = new Date();
    blog.rejectionReason = reason;
    await blog.save();

    await notifyEditor(
      blog.createdBy,
      "rejected",
      `Your Temple Blog "${blog.title}" was rejected.`,
      reason,
      blog.language
    );

    res.json(blog);
  } catch (error) {
    console.error("Error rejecting Temple Blog:", error);
    res.status(500).json({ message: "Server error rejecting Temple Blog" });
  }
});

// PUT /api/anmigam/temple-blogs/:id/publish - Publish Temple Blog (Admin only)
router.put("/temple-blogs/:id/publish", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const blog = await TempleBlog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Temple Blog not found" });
    }

    blog.status = "published";
    blog.publishedAt = new Date();
    blog.approvedBy = req.user._id;
    await blog.save();

    await notifyEditor(
      blog.createdBy,
      "published",
      `Your Temple Blog "${blog.title}" is now Live on the website.`,
      "",
      blog.language
    );

    res.json(blog);
  } catch (error) {
    console.error("Error publishing Temple Blog:", error);
    res.status(500).json({ message: "Server error publishing Temple Blog" });
  }
});

// DELETE /api/anmigam/temple-blogs/:id - Delete Temple Blog (Admin & Editor only)
router.delete("/temple-blogs/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const blog = await TempleBlog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Temple Blog not found" });
    }

    if (req.user.role === "editor") {
      const createdByStr = blog.createdBy ? blog.createdBy.toString() : "";
      if (blog.status !== "draft" || createdByStr !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized. Editors can only delete their own Draft blogs." });
      }
    }

    await TempleBlog.findByIdAndDelete(req.params.id);
    res.json({ message: "Temple Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting Temple Blog:", error);
    res.status(500).json({ message: "Server error deleting Temple Blog" });
  }
});

module.exports = router;
