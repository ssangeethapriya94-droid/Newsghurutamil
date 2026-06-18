import React, { useState, useEffect } from "react";
import API from "../config/api";
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiAward } from "react-icons/fi";
import "../styles/ReporterMyArticles.css"; // Reuse general styles

function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("1 Month");
  const [durationMonths, setDurationMonths] = useState(1);
  const [isRecommended, setIsRecommended] = useState(false);
  
  // Benefits management list
  const [benefits, setBenefits] = useState([]);
  const [newBenefit, setNewBenefit] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/subscription/plans");
      if (res.data && res.data.success) {
        setPlans(res.data.plans || []);
      }
    } catch (error) {
      console.error("Fetch plans error:", error);
      alert("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index) => {
    setBenefits(benefits.filter((_, idx) => idx !== index));
  };

  const handleClearForm = () => {
    setName("");
    setPrice("");
    setDuration("1 Month");
    setDurationMonths(1);
    setIsRecommended(false);
    setBenefits([]);
    setNewBenefit("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price || !duration.trim()) {
      alert("Please enter plan name, price, and duration");
      return;
    }

    const payload = {
      name: name.trim(),
      price: Number(price),
      duration: duration.trim(),
      durationMonths: Number(durationMonths),
      isRecommended,
      benefits
    };

    try {
      if (editingId) {
        await API.put(`/api/subscription/plans/${editingId}`, payload);
        alert("Subscription plan updated successfully 🎉");
      } else {
        await API.post("/api/subscription/plans", payload);
        alert("Subscription plan created successfully 🎉");
      }
      handleClearForm();
      fetchPlans();
    } catch (error) {
      console.error("Save plan error:", error);
      alert(error.response?.data?.message || "Failed to save plan");
    }
  };

  const handleEdit = (plan) => {
    setEditingId(plan._id);
    setName(plan.name);
    setPrice(plan.price);
    setDuration(plan.duration);
    setDurationMonths(plan.durationMonths);
    setIsRecommended(plan.isRecommended || false);
    setBenefits(plan.benefits || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) {
      return;
    }

    try {
      await API.delete(`/api/subscription/plans/${id}`);
      alert("Subscription plan deleted successfully 🗑️");
      fetchPlans();
    } catch (error) {
      console.error("Delete plan error:", error);
      alert("Failed to delete subscription plan");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: "800", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <FiAward style={{ color: "#ea580c" }} /> Subscription Plans Manager
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px", alignItems: "start" }}>
        {/* LEFT PANEL: PLANS LIST */}
        <div>
          {loading && plans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading plans...</div>
          ) : plans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px" }}>
              No subscription plans configured. Fill the form to add one.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {plans.map((plan) => (
                <div 
                  key={plan._id} 
                  style={{
                    background: "#ffffff",
                    border: plan.isRecommended ? "2px solid #ea580c" : "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "20px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}
                >
                  {plan.isRecommended && (
                    <span style={{
                      position: "absolute",
                      top: "-12px",
                      right: "15px",
                      background: "#ea580c",
                      color: "#ffffff",
                      fontSize: "9px",
                      fontWeight: "800",
                      padding: "3px 10px",
                      borderRadius: "10px",
                      letterSpacing: "0.5px"
                    }}>
                      RECOMMENDED
                    </span>
                  )}
                  
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", marginBottom: "5px" }}>
                    {plan.name}
                  </div>
                  
                  <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#ea580c", margin: "10px 0" }}>
                    ₹{plan.price} <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>/ {plan.duration}</span>
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "15px", fontWeight: "600" }}>
                    Duration: {plan.durationMonths} Month(s)
                  </div>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", flexGrow: 1, marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "8px" }}>Benefits:</div>
                    <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "0.82rem", color: "#475569", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {plan.benefits.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                    <button 
                      onClick={() => handleEdit(plan)}
                      style={{ background: "#f1f5f9", border: "none", color: "#475569", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem", fontWeight: "700" }}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(plan._id)}
                      style={{ background: "#fee2e2", border: "none", color: "#ef4444", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem", fontWeight: "700" }}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: ADD/EDIT FORM */}
        <div style={{ background: "#ffffff", padding: "24px", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
            {editingId ? "Edit Plan" : "Add Plan"}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Plan Name *</label>
              <input 
                type="text" 
                placeholder="e.g. 1 Month, 1 Year"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "5px", fontSize: "0.88rem" }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Price (INR) *</label>
              <input 
                type="number" 
                placeholder="e.g. 129, 999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "5px", fontSize: "0.88rem" }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Duration Label *</label>
              <input 
                type="text" 
                placeholder="e.g. 1 Month, 1 Year, LIFETIME"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "5px", fontSize: "0.88rem" }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Duration (Months) *</label>
              <input 
                type="number" 
                placeholder="e.g. 1, 12, 999"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "5px", fontSize: "0.88rem" }}
                required
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "5px 0" }}>
              <input 
                type="checkbox" 
                id="isRecommended"
                checked={isRecommended}
                onChange={(e) => setIsRecommended(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <label htmlFor="isRecommended" style={{ fontSize: "0.82rem", fontWeight: "700", color: "#475569", cursor: "pointer" }}>
                Mark as Recommended
              </label>
            </div>

            {/* BENEFIT ITEMS MULTI-INPUT */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Subscription Benefits</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  type="text" 
                  placeholder="Type a benefit..."
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  style={{ flexGrow: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "5px", fontSize: "0.88rem" }}
                />
                <button 
                  type="button"
                  onClick={handleAddBenefit}
                  style={{ background: "#ea580c", border: "none", color: "white", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <FiPlus />
                </button>
              </div>

              {/* Added benefits list */}
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                {benefits.map((b, index) => (
                  <li 
                    key={index}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      fontSize: "0.82rem", 
                      background: "#f8fafc", 
                      padding: "6px 10px", 
                      borderRadius: "4px", 
                      border: "1px solid #e2e8f0" 
                    }}
                  >
                    <span>{b}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveBenefit(index)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "15px", marginTop: "10px" }}>
              <button 
                type="submit"
                style={{ flexGrow: 1, background: "#ea580c", border: "none", color: "white", padding: "10px", borderRadius: "5px", fontWeight: "700", cursor: "pointer" }}
              >
                {editingId ? "Update Plan" : "Create Plan"}
              </button>
              {editingId && (
                <button 
                  type="button"
                  onClick={handleClearForm}
                  style={{ background: "#64748b", border: "none", color: "white", padding: "10px", borderRadius: "5px", fontWeight: "700", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
