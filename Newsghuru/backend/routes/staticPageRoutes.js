const express = require("express");
const router = express.Router();
const StaticPage = require("../models/StaticPage");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/pages/:slug - Public page retrieval
router.get("/pages/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const page = await StaticPage.findOne({ slug });
    if (!page) {
      return res.json({
        success: true,
        title: "",
        content: "",
        lastUpdated: null,
      });
    }
    res.json({
      success: true,
      title: page.title,
      content: page.content,
      lastUpdated: page.lastUpdated,
    });
  } catch (error) {
    console.error(`GET /api/pages/${req.params.slug} error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/pages - Admin page list
router.get("/admin/pages", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const pages = await StaticPage.find({}, "title slug lastUpdated").sort({ title: 1 });
    res.json({ success: true, pages });
  } catch (error) {
    console.error("GET /api/admin/pages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/pages/:slug - Admin page edit/create
router.put("/admin/pages/:slug", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { title, content } = req.body;
    
    if (!title || content === undefined) {
      return res.status(400).json({ success: false, message: "Title and Content are required" });
    }

    let page = await StaticPage.findOne({ slug });
    if (!page) {
      page = new StaticPage({
        title,
        slug,
        content,
        lastUpdated: new Date(),
      });
    } else {
      page.title = title;
      page.content = content;
      page.lastUpdated = new Date();
    }
    await page.save();

    res.json({
      success: true,
      message: `${title} page updated successfully`,
      page,
    });
  } catch (error) {
    console.error(`PUT /api/admin/pages/${req.params.slug} error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
