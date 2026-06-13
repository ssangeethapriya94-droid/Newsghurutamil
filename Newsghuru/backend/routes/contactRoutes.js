const express = require("express");
const router = express.Router();
const ContactQuery = require("../models/ContactQuery");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// PUBLIC: Submit a new contact query/subscription
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, category, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and Email are required" });
    }

    const newQuery = new ContactQuery({
      name,
      email,
      phone,
      category,
      message,
    });

    await newQuery.save();

    // Notify all admins
    const admins = await Admin.find({});
    const notifications = admins.map((admin) => ({
      recipientId: admin._id,
      type: "contact",
      text: `New contact query received from ${name}`,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: "Query submitted successfully",
      data: newQuery,
    });
  } catch (error) {
    console.error("Submit query error:", error);
    res.status(500).json({ success: false, message: "Server error submitting query" });
  }
});

// ADMIN: Get unread count
router.get("/unread-count", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const count = await ContactQuery.countDocuments({ status: "Pending" });
    res.json({ success: true, count });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ success: false, message: "Server error getting unread count" });
  }
});

// ADMIN: Get all queries
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const queries = await ContactQuery.find().sort({ createdAt: -1 });
    res.json({ success: true, data: queries });
  } catch (error) {
    console.error("Fetch queries error:", error);
    res.status(500).json({ success: false, message: "Server error fetching queries" });
  }
});

// ADMIN: Update status to Reviewed
router.put("/:id/review", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const query = await ContactQuery.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    query.status = "Reviewed";
    await query.save();

    res.json({ success: true, message: "Query marked as reviewed", data: query });
  } catch (error) {
    console.error("Update query status error:", error);
    res.status(500).json({ success: false, message: "Server error updating query status" });
  }
});

// ADMIN: Delete a query
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const query = await ContactQuery.findByIdAndDelete(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found" });
    }

    res.json({ success: true, message: "Query deleted successfully" });
  } catch (error) {
    console.error("Delete query error:", error);
    res.status(500).json({ success: false, message: "Server error deleting query" });
  }
});

module.exports = router;
