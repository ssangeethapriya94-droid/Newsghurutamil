import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [language, setLanguage] = useState("ta");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editLanguage, setEditLanguage] = useState("ta");
  const [languageFilter, setLanguageFilter] = useState("all");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/categories?language=${languageFilter}`);
      setCategories(res.data || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert("Please fill in both name and slug");
      return;
    }

    try {
      await API.post("/api/categories", {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        language,
      });
      setName("");
      setSlug("");
      alert("Category created successfully 🎉");
      fetchCategories();
    } catch (error) {
      console.error("Create category error:", error);
      alert(error.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim() || !editSlug.trim()) {
      alert("Name and slug cannot be empty");
      return;
    }

    try {
      await API.put(`/api/categories/${id}`, {
        name: editName.trim(),
        slug: editSlug.trim().toLowerCase(),
        language: editLanguage,
      });
      setEditingId(null);
      alert("Category updated successfully");
      fetchCategories();
    } catch (error) {
      console.error("Update category error:", error);
      alert(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    try {
      await API.delete(`/api/categories/${id}`);
      alert("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditLanguage(cat.language || "ta");
  };

  // Helper auto-slug generation
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    // Simple transliteration for English; keep Tamil text as is
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\u0B80-\u0BFF\s-]/g, "") // support tamil unicode block & normal text
      .trim()
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>🏷️ Categories CRUD</h2>
          <div className="header-subtitle">
            Manage news taxonomy and slugs.
          </div>
        </div>
        <div>
          <select 
            value={languageFilter} 
            onChange={(e) => setLanguageFilter(e.target.value)} 
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", cursor: "pointer" }}
          >
            <option value="all">All Languages</option>
            <option value="ta">Tamil</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* CREATE FORM */}
      <form onSubmit={handleCreate} className="categories-create-form">
        <div className="form-group">
          <label>Category Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Sports"
          />
        </div>
        <div className="form-group">
          <label>Slug (Lowercase, e.g. sports)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="e.g. sports"
          />
        </div>
        <div className="form-group">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
            <option value="ta">Tamil</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="form-submit">
          <button type="submit" className="btn-primary add-category-btn">
            Add Category
          </button>
        </div>
      </form>

      {/* LIST TABLE */}
      <div className="table-container">
        {loading && categories.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No categories found.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Language</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    {editingId === cat._id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", width: "90%" }}
                      />
                    ) : (
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    )}
                  </td>
                  <td>
                    {editingId === cat._id ? (
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", width: "90%" }}
                      />
                    ) : (
                      <span className="category-tag">{cat.slug}</span>
                    )}
                  </td>
                  <td>
                    {editingId === cat._id ? (
                      <select 
                        value={editLanguage} 
                        onChange={(e) => setEditLanguage(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
                      >
                        <option value="ta">Tamil</option>
                        <option value="en">English</option>
                      </select>
                    ) : (
                      <span 
                        style={{
                          background: cat.language === "en" ? "#e0f2fe" : "#fef3c7",
                          color: cat.language === "en" ? "#0369a1" : "#b45309",
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          textTransform: "uppercase"
                        }}
                      >
                        {cat.language === "en" ? "English" : "Tamil"}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === cat._id ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => handleUpdate(cat._id)}
                          style={{ color: "#10b981" }}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "15px", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => startEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(cat._id, cat.name)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Categories;
