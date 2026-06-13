const express = require("express");
const router = express.Router();
const Information = require("../models/Information");

// GET /api/information - Fetch current information message
router.get("/", async (req, res) => {
  try {
    const info = await Information.findOne().sort({ updatedAt: -1 });
    res.json(info || { message: "" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/information - Save/Update information message
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    
    // We update the existing document or create a new one
    let info = await Information.findOne();
    if (info) {
      info.message = message;
      await info.save();
    } else {
      info = new Information({ message });
      await info.save();
    }
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/information - Clear current information message
router.delete("/", async (req, res) => {
  try {
    await Information.deleteMany({});
    res.json({ message: "Information cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
