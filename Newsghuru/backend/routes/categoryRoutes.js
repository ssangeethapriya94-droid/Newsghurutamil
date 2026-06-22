const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/categories - Get all categories
router.get("/", async (req, res) => {
  try {
    const query = {};
    const lang = req.query.language || "ta";
    if (lang !== "all") {
      query.language = lang;
    }
    const categories = await Category.find(query).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error fetching categories" });
  }
});

// POST /api/categories - Create a category (Admin only)
router.post("/", verifyToken, authorizeRoles("admin", "reporter"), async (req, res) => {
  try {
    const { name, slug, language } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    const targetLanguage = language || "ta";
    
    // Check if slug already exists for this language
    const existing = await Category.findOne({ slug: normalizedSlug, language: targetLanguage });
    if (existing) {
      return res.status(400).json({ message: "Category with this slug already exists for this language" });
    }

    const category = new Category({
      name: name.trim(),
      slug: normalizedSlug,
      language: targetLanguage
    });

    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error creating category" });
  }
});

// PUT /api/categories/:id - Update a category (Admin only)
router.put("/:id", verifyToken, authorizeRoles("admin", "reporter"), async (req, res) => {
  try {
    const { name, slug, language } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const targetLanguage = language || category.language || "ta";
    if (language) category.language = language;
    if (name) category.name = name.trim();
    if (slug) {
      const normalizedSlug = slug.toLowerCase().trim();
      if (normalizedSlug !== category.slug || language !== undefined) {
        const existing = await Category.findOne({ slug: normalizedSlug, language: targetLanguage });
        if (existing && existing._id.toString() !== category._id.toString()) {
          return res.status(400).json({ message: "Category with this slug already exists for this language" });
        }
        category.slug = normalizedSlug;
      }
    }

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error updating category" });
  }
});

// DELETE /api/categories/:id - Delete a category (Admin only)
router.delete("/:id", verifyToken, authorizeRoles("admin", "reporter"), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error deleting category" });
  }
});

module.exports = router;
