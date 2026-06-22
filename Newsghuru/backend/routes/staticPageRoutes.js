const express = require("express");
const router = express.Router();
const StaticPage = require("../models/StaticPage");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/pages/:slug - Public page retrieval (language-aware)
router.get("/pages/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const language = req.query.language || "ta";
    const page = await StaticPage.findOne({ slug, language });
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
    const filter = {};
    if (req.query.language) {
      filter.language = req.query.language;
    }
    const pages = await StaticPage.find(filter, "title slug language lastUpdated").sort({ slug: 1, language: 1 });
    res.json({ success: true, pages });
  } catch (error) {
    console.error("GET /api/admin/pages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/pages/:slug - Admin page edit/create (language-aware)
router.put("/admin/pages/:slug", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { title, content, language } = req.body;
    const lang = language || "ta";
    
    if (!title || content === undefined) {
      return res.status(400).json({ success: false, message: "Title and Content are required" });
    }

    let page = await StaticPage.findOne({ slug, language: lang });
    if (!page) {
      page = new StaticPage({
        title,
        slug,
        language: lang,
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
