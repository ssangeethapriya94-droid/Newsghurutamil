import React, { useState, useEffect } from "react";
import API from "../config/api";
import {
  FiFileText, FiPlusCircle, FiUsers, FiCheckCircle, FiClock, FiDollarSign,
  FiAlertCircle, FiTrendingUp, FiInfo
} from "react-icons/fi";
import "../styles/ReporterCreateNews.css";

const SponsoredManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [packages, setPackages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [combos, setCombos] = useState([]);
  const [comboAnalytics, setComboAnalytics] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Current User Role — read from the keys set during login
  const userRole = localStorage.getItem("role") || "reporter";
  const isAdmin = userRole === "admin";
  const isEditor = userRole === "editor";
  const isReporter = userRole === "reporter";

  // Modals / Selected States
  const [assignModal, setAssignModal] = useState({ open: false, item: null });
  const [assignForm, setAssignForm] = useState({
    reporterId: "",
    packageType: "Sponsored News Article",
    packagePrice: 8000,
    placement: "homepage_sponsored",
    durationDays: 30,
    videoPackage: "None",
    videoCharge: 0,
    paymentStatus: "Paid"
  });

  const [directForm, setDirectForm] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",
    title: "",
    subtitle: "",
    description: "",
    category: "General",
    packageType: "Sponsored News Article",
    packagePrice: 8000,
    placement: "homepage_sponsored",
    durationDays: 30,
    videoPackage: "None",
    videoCharge: 0,
    sponsoredLabel: "Sponsored Content",
    paymentStatus: "Paid",
    language: "both",
    videoUrl: ""
  });
  const [directFiles, setDirectFiles] = useState({ logo: null, image: null, video: null });

  // Workflow Editor / Writer state
  const [workModal, setWorkModal] = useState({ open: false, item: null, mode: "" }); // mode: 'write' or 'edit' or 'approve'
  const [workForm, setWorkForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    shortDescription: "",
    category: "General",
    sponsoredLabel: "Sponsored Content",
    language: "both",
    videoUrl: "",
    placement: "homepage_sponsored",
    durationDays: 30,
    paymentStatus: "Paid",
    rejectionReason: ""
  });
  const [workFiles, setWorkFiles] = useState({ image: null, video: null });

  const fetchData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        // Admin: fetch all data from admin endpoints
        const [allRes, pkgRes, anaRes, comboRes, comboAnaRes] = await Promise.all([
          API.get("/api/sponsored/admin/all").catch(() => ({ data: { success: false, articles: [], reporters: [] } })),
          API.get("/api/sponsored/packages").catch(() => ({ data: { success: false, packages: [] } })),
          API.get("/api/sponsored/admin/analytics").catch(() => ({ data: { success: false, analytics: null } })),
          API.get("/api/sponsored/admin/combos").catch(() => ({ data: { success: false, combos: [] } })),
          API.get("/api/sponsored/admin/combos/analytics").catch(() => ({ data: { success: false, analytics: null } }))
        ]);

        if (allRes.data.success) {
          setArticles(allRes.data.articles || []);
          setReporters(allRes.data.reporters || []);
        }
        if (pkgRes.data.success) {
          setPackages(pkgRes.data.packages || []);
        }
        if (anaRes.data.success) {
          setAnalytics(anaRes.data.analytics);
        }
        if (comboRes.data.success) {
          setCombos(comboRes.data.combos || []);
        }
        if (comboAnaRes.data.success) {
          setComboAnalytics(comboAnaRes.data.analytics);
        }
      } else {
        // Reporter / Editor: fetch only their assigned tasks + packages
        const [assignedRes, pkgRes] = await Promise.all([
          API.get("/api/sponsored/reporter/assigned").catch(() => ({ data: { tasks: [] } })),
          API.get("/api/sponsored/packages").catch(() => ({ data: { packages: [] } }))
        ]);

        if (assignedRes.data.success) {
          setArticles(assignedRes.data.tasks || []);
        }
        if (pkgRes.data.success) {
          setPackages(pkgRes.data.packages || []);
        }

        // Editor also gets review queue
        if (isEditor) {
          const reviewRes = await API.get("/api/sponsored/editor/review").catch(() => ({ data: { reviews: [] } }));
          if (reviewRes.data.success) {
            // Merge assigned + pending review (deduplicate by _id)
            const existing = assignedRes.data.tasks || [];
            const reviews = reviewRes.data.reviews || [];
            const merged = [...existing];
            reviews.forEach(r => {
              if (!merged.find(a => a._id === r._id)) merged.push(r);
            });
            setArticles(merged);
          }
        }
      }
    } catch (err) {
      console.error("Error loading sponsored data:", err);
      setMessage({ type: "error", text: "Failed to load sponsored management data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Default tab for reporters/editors: go directly to articles workflow
    if (isReporter || isEditor) {
      setActiveTab("articles");
    }
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // Open Assign Modal
  const openAssign = (item) => {
    setAssignModal({ open: true, item });
    setAssignForm({
      reporterId: item.reporterId?._id || item.reporterId || (reporters[0]?._id || ""),
      packageType: item.packageType || "Sponsored News Article",
      packagePrice: item.packagePrice || 8000,
      placement: item.placement || "homepage_sponsored",
      durationDays: item.durationDays || 30,
      videoPackage: item.videoPackage || "None",
      videoCharge: item.videoCharge || 0,
      paymentStatus: item.paymentStatus || "Paid"
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/api/sponsored/admin/assign/${assignModal.item._id}`, assignForm);
      if (res.data.success) {
        showMsg("success", "Reporter assigned & request updated successfully!");
        setAssignModal({ open: false, item: null });
        fetchData();
      }
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to assign reporter");
    }
  };

  // Submit Direct Create (Admin only)
  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(directForm).forEach(key => formData.append(key, directForm[key]));
    if (directFiles.logo) formData.append("logo", directFiles.logo);
    if (directFiles.image) formData.append("image", directFiles.image);
    if (directFiles.video) formData.append("video", directFiles.video);

    try {
      const res = await API.post("/api/sponsored/admin/create-direct", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        showMsg("success", "Sponsored article created and published live!");
        setDirectForm({
          companyName: "", contactPerson: "", phone: "", email: "", website: "",
          title: "", subtitle: "", description: "", category: "General",
          packageType: "Sponsored News Article", packagePrice: 8000, placement: "homepage_sponsored",
          durationDays: 30, videoPackage: "None", videoCharge: 0, sponsoredLabel: "Sponsored Content",
          paymentStatus: "Paid", language: "both", videoUrl: ""
        });
        setDirectFiles({ logo: null, image: null, video: null });
        setActiveTab("articles");
        fetchData();
      }
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to create direct article");
    }
  };

  const getPreviewUrl = (id) => {
    const origin = window.location.origin;
    if (origin.includes("localhost")) {
      return `http://localhost:3005/sponsored/${id}`;
    }
    return `${origin.replace("admin.", "")}/sponsored/${id}`;
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this sponsored article? 🗑️")) return;
    try {
      const res = await API.delete(`/api/sponsored/admin/delete/${id}`);
      if (res.data.success) {
        showMsg("success", res.data.message || "Sponsored article deleted successfully!");
        fetchData();
      }
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to delete article");
    }
  };

  // Open Workflow Work Modal
  const openWork = (item, mode) => {
    setWorkModal({ open: true, item, mode });
    setWorkForm({
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      shortDescription: item.shortDescription || "",
      category: item.category || "General",
      sponsoredLabel: item.sponsoredLabel || "Sponsored Content",
      language: item.language || "both",
      videoUrl: item.videoUrl || "",
      placement: item.placement || "homepage_sponsored",
      durationDays: item.durationDays || 30,
      paymentStatus: item.paymentStatus || "Paid",
      rejectionReason: "",
      companyName: item.companyName || "",
      contactPerson: item.contactPerson || "",
      phone: item.phone || "",
      email: item.email || "",
      website: item.website || "",
      packageType: item.packageType || "",
      packagePrice: item.packagePrice || 0,
    });
    setWorkFiles({ image: null, video: null, logo: null });
  };

  const handleWorkSubmit = async (e, submitToNext = false) => {
    e.preventDefault();
    const { item, mode } = workModal;
    const formData = new FormData();
    Object.keys(workForm).forEach(key => formData.append(key, workForm[key]));
    if (submitToNext) {
      if (mode === "write") formData.append("submitToEditor", "true");
      if (mode === "edit") formData.append("submitToAdmin", "true");
    }
    if (workFiles.image) formData.append("image", workFiles.image);
    if (workFiles.video) formData.append("video", workFiles.video);
    if (workFiles.logo) formData.append("logo", workFiles.logo);

    try {
      let endpoint = `/api/sponsored/reporter/draft/${item._id}`;
      if (mode === "edit") endpoint = `/api/sponsored/editor/verify/${item._id}`;
      if (mode === "admin_edit") endpoint = `/api/sponsored/admin/edit/${item._id}`;

      const res = await API.put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        showMsg("success", res.data.message);
        setWorkModal({ open: false, item: null, mode: "" });
        fetchData();
      }
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to save workflow changes");
    }
  };

  // Admin Final Publish
  const handleFinalPublish = async (item) => {
    try {
      const res = await API.put(`/api/sponsored/admin/publish/${item._id}`, workForm);
      if (res.data.success) {
        showMsg("success", "Sponsored article approved and published live! 🌟");
        setWorkModal({ open: false, item: null, mode: "" });
        fetchData();
      }
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to publish article");
    }
  };

  // Package Rate Update
  const handlePackageSave = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/api/sponsored/admin/packages", { packages });
      if (res.data.success) {
        showMsg("success", "Package pricing updated successfully!");
        fetchData();
      }
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update package pricing");
    }
  };

  const handleRejectRequest = async (item) => {
    const reason = prompt("Enter the rejection reason to notify the sponsor:", "The content does not meet our guidelines.");
    if (reason === null) return;

    try {
      const res = await API.put(`/api/sponsored/admin/reject/${item._id}`, { rejectionReason: reason });
      if (res.data.success) {
        showMsg("success", res.data.message);
        fetchData();
      }
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to reject sponsored request.");
    }
  };

  const handleRejectCombo = async (item) => {
    const reason = prompt("Enter the rejection reason to notify the sponsor:", "The content does not meet our guidelines.");
    if (reason === null) return;

    try {
      const res = await API.put(`/api/sponsored/admin/combos/reject/${item._id}`, { rejectionReason: reason });
      if (res.data.success) {
        showMsg("success", res.data.message);
        fetchData();
      }
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to reject combo campaign.");
    }
  };

  const handleToggleChecklistTask = async (combo, taskIndex) => {
    const updatedChecklist = [...combo.socialChecklist];
    const task = updatedChecklist[taskIndex];
    task.status = task.status === "Completed" ? "Pending" : "Completed";
    task.completedAt = task.status === "Completed" ? new Date() : null;

    try {
      const res = await API.put(`/api/sponsored/admin/combos/update/${combo._id}`, {
        socialChecklist: updatedChecklist
      });
      if (res.data.success) {
        showMsg("success", "Campaign checklist updated!");
        fetchData();
      }
    } catch (err) {
      showMsg("error", "Failed to update checklist task.");
    }
  };

  const handleAssignComboReporter = async (combo, reporterId) => {
    try {
      const res = await API.put(`/api/sponsored/admin/combos/update/${combo._id}`, {
        assignedReporterId: reporterId || null
      });
      if (res.data.success) {
        showMsg("success", "Reporter assigned to combo campaign!");
        fetchData();
      }
    } catch (err) {
      showMsg("error", "Failed to assign reporter.");
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading Sponsored CMS Workspace...</div>;

  const requestsList = articles.filter(a => a.status === "request_submitted");
  const workflowList = isAdmin
    ? articles.filter(a => a.status !== "request_submitted")
    : articles; // For reporters/editors, all returned articles are already their workflow tasks

  // Build tabs based on role
  const tabs = [
    ...(isAdmin ? [{ id: "dashboard", label: "📊 Analytics & Overview", icon: <FiTrendingUp /> }] : []),
    ...(isAdmin ? [{ id: "requests", label: `📩 Sponsor Requests (${requestsList.length})`, icon: <FiClock /> }] : []),
    ...(isAdmin ? [{ id: "combos", label: `🚀 Combo Campaigns (${combos.length})`, icon: <FiPlusCircle /> }] : []),
    { id: "articles", label: `✍️ Articles Workflow (${workflowList.length})`, icon: <FiFileText /> },
    ...(isAdmin ? [{ id: "create_direct", label: "➕ Direct Publish", icon: <FiPlusCircle /> }] : []),
    ...(isAdmin ? [{ id: "packages", label: "💰 Packages & Video Rates", icon: <FiDollarSign /> }] : []),
  ];

  return (
    <div className="reporter-create-news" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      
      {/* HEADER ACTIONS */}
      <div className="header-actions" style={{ marginBottom: "24px" }}>
        <div>
          <h2>Sponsored Articles & Video Promotion CMS</h2>
          <div className="header-subtitle">
            Manage corporate sponsorships, sponsor request inquiries, media coverage workflows, and video promotion packages.
          </div>
        </div>
      </div>

      {/* NOTIFICATION MESSAGES */}
      {message.text && (
        <div style={{
          background: message.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          borderLeft: `4px solid ${message.type === "success" ? "#10b981" : "#ef4444"}`,
          color: message.type === "success" ? "#10b981" : "#ef4444",
          padding: "14px 18px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px"
        }}>
          {message.type === "success" ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
          <span style={{ fontWeight: "700" }}>{message.text}</span>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "25px", borderBottom: "2px solid var(--border-color)", paddingBottom: "12px" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px", borderRadius: "10px", fontWeight: "800", fontSize: "0.92rem", cursor: "pointer",
              border: activeTab === tab.id ? "none" : "1px solid var(--border-color)",
              background: activeTab === tab.id ? "var(--accent-orange, #ea580c)" : "var(--card-bg, #fff)",
              color: activeTab === tab.id ? "#fff" : "var(--text-main)",
              display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 1. DASHBOARD & ANALYTICS TAB (Admin only) */}
      {activeTab === "dashboard" && isAdmin && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            <div style={{ background: "var(--card-bg, #fff)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-color)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "700" }}>TOTAL SPONSORED</span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "8px 0 0 0", color: "#3b82f6" }}>{analytics?.totalArticles || articles.length}</h3>
            </div>
            <div style={{ background: "var(--card-bg, #fff)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-color)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "700" }}>SPONSOR REQUESTS</span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "8px 0 0 0", color: "#f59e0b" }}>{analytics?.requestsCount || requestsList.length}</h3>
            </div>
            <div style={{ background: "var(--card-bg, #fff)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-color)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "700" }}>ACTIVE PUBLISHED</span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "8px 0 0 0", color: "#10b981" }}>{analytics?.activeCount || 0}</h3>
            </div>
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#fff", padding: "20px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "700" }}>TOTAL SPONSOR REVENUE</span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "8px 0 0 0", color: "#fdba74" }}>₹{(analytics?.totalRevenue || 0).toLocaleString()}</h3>
            </div>
          </div>

          <div style={{ background: "var(--card-bg, #fff)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--text-main)" }}>Recent Sponsored Activity</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>Company / Title</th>
                  <th style={{ padding: "10px" }}>Package</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  <th style={{ padding: "10px" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {articles.slice(0, 5).map(a => (
                  <tr key={a._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "700" }}>{a.companyName} <div style={{ fontSize: "0.8rem", fontWeight: "400", color: "var(--text-muted)" }}>{a.title}</div></td>
                    <td style={{ padding: "10px" }}>{a.packageType}</td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: a.status === "published" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: a.status === "published" ? "#10b981" : "#d97706" }}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px", color: "var(--text-muted)" }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SPONSOR REQUESTS TAB (Admin only) */}
      {activeTab === "requests" && isAdmin && (
        <div style={{ background: "var(--card-bg, #fff)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 16px 0" }}>📩 Incoming Sponsor Request Inquiries</h3>
          {requestsList.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No new sponsor inquiries pending.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {requestsList.map(req => (
                <div key={req._id} style={{ border: "1.5px solid var(--border-color)", borderRadius: "16px", overflow: "hidden", background: "rgba(245,158,11,0.02)" }}>
                  {/* Card Header */}
                  <div style={{ background: "linear-gradient(135deg, rgba(234,88,12,0.08) 0%, rgba(251,191,36,0.06) 100%)", padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      {req.companyLogo && (
                        <img
                          src={req.companyLogo}
                          alt={req.companyName}
                          onError={e => { e.target.style.display = "none"; }}
                          style={{ width: "54px", height: "54px", borderRadius: "10px", objectFit: "contain", border: "1px solid var(--border-color)", background: "#fff", padding: "4px" }}
                        />
                      )}
                      <div>
                        <h4 style={{ margin: "0 0 2px 0", fontSize: "1.15rem", color: "var(--accent-orange)", fontWeight: "900" }}>{req.companyName}</h4>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                          Submitted: {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => openAssign(req)} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px" }}>
                        <FiUsers /> Assign Reporter & Setup
                      </button>
                      <button onClick={() => handleRejectRequest(req)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                        Reject & Refund
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Contact Details */}
                    <div style={{ background: "var(--bg-light, #f8fafc)", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ fontWeight: "800", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📋 Contact Details</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.88rem" }}>
                        <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Contact Person: </span><span style={{ fontWeight: "600" }}>{req.contactPerson}</span></div>
                        <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>📞 Phone: </span><a href={`tel:${req.phone}`} style={{ color: "var(--accent-orange)", fontWeight: "600" }}>{req.phone}</a></div>
                        <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>✉️ Email: </span><a href={`mailto:${req.email}`} style={{ color: "var(--accent-orange)", fontWeight: "600" }}>{req.email}</a></div>
                        {req.website && <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>🌐 Website: </span><a href={req.website} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontWeight: "600" }}>{req.website}</a></div>}
                      </div>
                    </div>

                    {/* Package & Placement Details */}
                    <div style={{ background: "var(--bg-light, #f8fafc)", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ fontWeight: "800", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📦 Package & Placement</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.88rem" }}>
                        <div>
                          <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Package: </span>
                          <span style={{ background: "rgba(234,88,12,0.12)", color: "var(--accent-orange)", padding: "2px 8px", borderRadius: "6px", fontWeight: "800", fontSize: "0.82rem" }}>{req.packageType}</span>
                        </div>
                        <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Package Price: </span><span style={{ fontWeight: "600" }}>₹{(req.packagePrice || 0).toLocaleString()}</span></div>
                        {req.videoPackage && req.videoPackage !== "None" && (
                          <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>🎥 Video Add-on: </span><span style={{ fontWeight: "600" }}>{req.videoPackage} (+₹{(req.videoCharge || 0).toLocaleString()})</span></div>
                        )}
                        <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Total Paid: </span><span style={{ fontWeight: "800", color: "#10b981" }}>₹{((req.packagePrice || 0) + (req.videoCharge || 0)).toLocaleString()}</span></div>
                        <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Placement: </span><span style={{ fontWeight: "600" }}>{req.placement?.replace(/_/g, " ")}</span></div>
                        <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Duration: </span><span style={{ fontWeight: "600" }}>{req.durationDays} days</span></div>
                        {req.preferredPublishDate && <div><span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Preferred Date: </span><span style={{ fontWeight: "600" }}>{new Date(req.preferredPublishDate).toLocaleDateString()}</span></div>}
                      </div>
                    </div>

                    {/* Event Details / Message */}
                    {req.eventDetails && (
                      <div style={{ gridColumn: "span 2", background: "rgba(234,88,12,0.05)", border: "1px solid rgba(234,88,12,0.18)", borderRadius: "10px", padding: "14px" }}>
                        <div style={{ fontWeight: "800", fontSize: "0.82rem", color: "var(--accent-orange)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📝 Sponsor Message / Event Details</div>
                        <div style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text-main)" }}>{req.eventDetails}</div>
                      </div>
                    )}

                    {/* Uploaded Media */}
                    {(req.image || req.videoUrl || (req.documents && req.documents.length > 0)) && (
                      <div style={{ gridColumn: "span 2", background: "var(--bg-light, #f8fafc)", borderRadius: "10px", padding: "14px" }}>
                        <div style={{ fontWeight: "800", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📎 Uploaded Media by Sponsor</div>
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>
                          {req.image && (
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>REFERENCE IMAGE</div>
                              <img
                                src={req.image}
                                alt="Sponsor uploaded"
                                onError={e => { e.target.style.display = "none"; }}
                                style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                              />
                              <div><a href={req.image} target="_blank" rel="noreferrer" style={{ fontSize: "0.72rem", color: "#3b82f6" }}>View Full</a></div>
                            </div>
                          )}
                          {req.videoUrl && (
                            <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.85rem" }}>
                              <div style={{ fontWeight: "700", color: "#2563eb", marginBottom: "4px" }}>🎥 Video Reference</div>
                              <a href={req.videoUrl} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", wordBreak: "break-all", fontSize: "0.82rem" }}>
                                {req.videoUrl.length > 60 ? req.videoUrl.substring(0, 60) + "..." : req.videoUrl}
                              </a>
                            </div>
                          )}
                          {req.documents && req.documents.length > 0 && req.documents.map((doc, i) => (
                            <div key={i} style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.85rem" }}>
                              <div style={{ fontWeight: "700", color: "#059669", marginBottom: "4px" }}>📄 Document {i + 1}</div>
                              <a href={doc} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontSize: "0.82rem" }}>Download / View</a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* 3. ARTICLES WORKFLOW TAB */}
      {activeTab === "articles" && (
        <div style={{ background: "var(--card-bg, #fff)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 16px 0" }}>✍️ Sponsored Articles Production Workflow</h3>

          {/* Reporter info banner */}
          {isReporter && (
            <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1.5px solid rgba(59, 130, 246, 0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FiInfo style={{ color: "#3b82f6", flexShrink: 0 }} size={18} />
              <span style={{ fontSize: "0.9rem", color: "#1d4ed8", fontWeight: "600" }}>
                These are the sponsored assignments assigned to you by the Admin. Review the sponsor's brief and write/edit the article draft.
              </span>
            </div>
          )}

          {workflowList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <FiFileText size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
              <p style={{ fontWeight: "700" }}>
                {isReporter ? "No sponsored assignments have been assigned to you yet." : "No sponsored articles in workflow."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Company / Title</th>
                    {isAdmin && <th style={{ padding: "10px" }}>Assigned Reporter</th>}
                    <th style={{ padding: "10px" }}>Package</th>
                    <th style={{ padding: "10px" }}>Placement</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workflowList.map(a => (
                    <tr key={a._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ fontWeight: "700" }}>{a.companyName}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{a.title}</div>
                      </td>
                      {isAdmin && <td style={{ padding: "10px" }}>{a.reporterId?.name || "Unassigned"}</td>}
                      <td style={{ padding: "10px", fontSize: "0.82rem" }}>
                        <div style={{ fontWeight: "600" }}>{a.packageType}</div>
                        <div style={{ color: "var(--accent-orange)", fontWeight: "700" }}>
                          ₹{((a.packagePrice || 0) + (a.videoCharge || 0)).toLocaleString()}
                        </div>
                        {a.videoPackage && a.videoPackage !== "None" && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>
                            🎥 Includes: {a.videoPackage} (+₹{a.videoCharge?.toLocaleString()})
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px" }}><span style={{ background: "var(--bg-light)", padding: "4px 8px", borderRadius: "6px" }}>{a.placement}</span></td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: a.status === "published" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)", color: a.status === "published" ? "#10b981" : "#2563eb" }}>
                          {a.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "10px" }}>
                        {/* Assign button for admin on unassigned */}
                        {isAdmin && a.status === "assigned_to_reporter" && (
                          <button onClick={() => openAssign(a)} style={{ padding: "5px 10px", fontSize: "0.78rem", borderRadius: "7px", background: "var(--bg-light)", border: "1px solid var(--border-color)", cursor: "pointer", marginBottom: "4px", display: "block" }}>
                            ✏️ Reassign
                          </button>
                        )}
                        {isReporter && (a.status === "assigned_to_reporter" || a.status === "draft") && (
                          <button onClick={() => openWork(a, "write")} className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>✍️ Write / Edit Draft</button>
                        )}
                        {(isEditor || isAdmin) && a.status === "pending_editor_review" && (
                          <button onClick={() => openWork(a, "edit")} className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", background: "#2563eb" }}>🔍 Review & Verify SEO</button>
                        )}
                        {isAdmin && a.status === "pending_admin_approval" && (
                          <button onClick={() => openWork(a, "approve")} className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", background: "#10b981" }}>🌟 Final Verify & Publish</button>
                        )}
                        {a.status === "published" && (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => window.open(getPreviewUrl(a._id), "_blank")}
                              className="btn-primary"
                              style={{ padding: "5px 10px", fontSize: "0.75rem", background: "#3b82f6", border: "none" }}
                            >
                              👁️ Preview
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => openWork(a, "admin_edit")}
                                  className="btn-primary"
                                  style={{ padding: "5px 10px", fontSize: "0.75rem", background: "#ea580c", border: "none" }}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(a._id)}
                                  className="btn-primary"
                                  style={{ padding: "5px 10px", fontSize: "0.75rem", background: "#ef4444", border: "none" }}
                                >
                                  🗑️ Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. DIRECT PUBLISH TAB (Admin only) */}
      {activeTab === "create_direct" && isAdmin && (
        <div style={{ background: "var(--card-bg, #fff)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 16px 0" }}>➕ Publish Ready-Made Sponsored Article</h3>
          <form onSubmit={handleDirectSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <h4 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>1. Sponsor Information</h4>
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Company Name *</label>
              <input type="text" value={directForm.companyName} onChange={e => setDirectForm({...directForm, companyName: e.target.value})} required style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Contact Person *</label>
              <input type="text" value={directForm.contactPerson} onChange={e => setDirectForm({...directForm, contactPerson: e.target.value})} required style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Email *</label>
              <input type="email" value={directForm.email} onChange={e => setDirectForm({...directForm, email: e.target.value})} required style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Phone *</label>
              <input type="text" value={directForm.phone} onChange={e => setDirectForm({...directForm, phone: e.target.value})} required style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Website URL</label>
              <input type="text" value={directForm.website} onChange={e => setDirectForm({...directForm, website: e.target.value})} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Company Logo Image</label>
              <input type="file" onChange={e => setDirectFiles({...directFiles, logo: e.target.files[0]})} style={{ width: "100%" }} />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <h4 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>2. Article Content & Media</h4>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Article Title *</label>
              <input type="text" value={directForm.title} onChange={e => setDirectForm({...directForm, title: e.target.value})} required style={{ width: "100%" }} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Full Article Content (HTML / Text) *</label>
              <textarea rows={6} value={directForm.description} onChange={e => setDirectForm({...directForm, description: e.target.value})} required style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Featured Banner Image *</label>
              <input type="file" onChange={e => setDirectFiles({...directFiles, image: e.target.files[0]})} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Promotional Video (MP4 File or URL)</label>
              <input type="file" onChange={e => setDirectFiles({...directFiles, video: e.target.files[0]})} style={{ width: "100%" }} />
              <input type="text" placeholder="Or paste YouTube embed URL" value={directForm.videoUrl} onChange={e => setDirectForm({...directForm, videoUrl: e.target.value})} style={{ width: "100%", marginTop: "6px" }} />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <h4 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>3. Package, Placement & Duration</h4>
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Placement Slot</label>
              <select value={directForm.placement} onChange={e => setDirectForm({...directForm, placement: e.target.value})} style={{ width: "100%" }}>
                <option value="homepage_sponsored">Homepage Sponsored Section</option>
                <option value="category_sponsored">Category Sponsored Section</option>
                <option value="sidebar_widget">Sidebar Sticky Widget</option>
                <option value="featured_banner">Featured Sponsored Banner</option>
                <option value="normal_feed">Normal News Feed</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Publish Duration (Days)</label>
              <input type="number" value={directForm.durationDays} onChange={e => setDirectForm({...directForm, durationDays: e.target.value})} style={{ width: "100%" }} />
            </div>

            <div style={{ gridColumn: "span 2", textAlign: "right", marginTop: "10px" }}>
              <button type="submit" className="btn-primary" style={{ padding: "12px 24px" }}>🚀 Publish Sponsored Article Directly</button>
            </div>
          </form>
        </div>
      )}

      {/* COMBO CAMPAIGNS TAB (Admin only) */}
      {activeTab === "combos" && isAdmin && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Combo Analytics Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ background: "var(--card-bg, #fff)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-color)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "700" }}>TOTAL COMBO REVENUE</span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "8px 0 0 0", color: "#10b981" }}>₹{(comboAnalytics?.totalRevenue || 0).toLocaleString()}</h3>
            </div>
            <div style={{ background: "var(--card-bg, #fff)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-color)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "700" }}>STARTER BUNDLES</span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "8px 0 0 0", color: "#2563eb" }}>{comboAnalytics?.starterCount || 0}</h3>
            </div>
            <div style={{ background: "var(--card-bg, #fff)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-color)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "700" }}>BUSINESS GROWTH</span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "8px 0 0 0", color: "#ea580c" }}>{comboAnalytics?.growthCount || 0}</h3>
            </div>
            <div style={{ background: "var(--card-bg, #fff)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-color)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "700" }}>PREMIUM BRAND</span>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "8px 0 0 0", color: "#a855f7" }}>{comboAnalytics?.premiumCount || 0}</h3>
            </div>
          </div>

          {/* Combo Requests List */}
          <div style={{ background: "var(--card-bg, #fff)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 16px 0" }}>🚀 Active Combo Package Campaigns</h3>
            {combos.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No combo campaigns purchased yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {combos.map(item => (
                  <div key={item._id} style={{ border: "1.5px solid var(--border-color)", borderRadius: "16px", overflow: "hidden", background: item.status === "rejected" ? "rgba(239,68,68,0.01)" : "rgba(59,130,246,0.01)" }}>
                    {/* Header */}
                    <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)", padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {item.logo && (
                          <img
                            src={item.logo}
                            alt={item.companyName}
                            onError={e => { e.target.style.display = "none"; }}
                            style={{ width: "54px", height: "54px", borderRadius: "10px", objectFit: "contain", border: "1px solid var(--border-color)", background: "#fff", padding: "4px" }}
                          />
                        )}
                        <div>
                          <h4 style={{ margin: "0 0 2px 0", fontSize: "1.15rem", color: "var(--accent-orange)", fontWeight: "900" }}>{item.companyName} ({item.packageName})</h4>
                          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                            Campaign Cost: <strong>₹{item.packagePrice?.toLocaleString()}</strong> | Status: <span style={{ textTransform: "uppercase", color: item.status === "active" ? "#10b981" : "#ef4444" }}>{item.status}</span>
                          </div>
                        </div>
                      </div>

                      {item.status !== "rejected" && item.status !== "completed" && (
                        <button onClick={() => handleRejectCombo(item)} className="btn-danger" style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                          Reject & Refund Combo
                        </button>
                      )}
                    </div>

                    {/* Details Panel */}
                    <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      {/* Left: Campaign Checklist & Assigned Reporter */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px" }}>
                          <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase" }}>📌 Campaign Progress Checklist</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {item.socialChecklist?.map((task, idx) => (
                              <label key={idx} style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "10px", fontSize: "0.9rem", cursor: "pointer" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <input
                                    type="checkbox"
                                    checked={task.status === "Completed"}
                                    onChange={() => handleToggleChecklistTask(item, idx)}
                                  />
                                  <span style={{ textDecoration: task.status === "Completed" ? "line-through" : "none", fontWeight: "600" }}>
                                    {task.taskName}
                                  </span>
                                </div>
                                {task.completedAt && (
                                  <span style={{ fontSize: "0.75rem", color: "#10b981" }}>
                                    (Done: {new Date(task.completedAt).toLocaleDateString()})
                                  </span>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px" }}>
                          <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase" }}>👤 Oversight Reporter</div>
                          <select
                            value={item.assignedReporterId?._id || item.assignedReporterId || ""}
                            onChange={e => handleAssignComboReporter(item, e.target.value)}
                            style={{ width: "100%", padding: "8px", borderRadius: "6px" }}
                          >
                            <option value="">-- Unassigned --</option>
                            {reporters.map(r => <option key={r._id} value={r._id}>{r.name} ({r.role})</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Right: Sub-Articles created & Sponsor details */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px" }}>
                          <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase" }}>📰 Spawned Articles</div>
                          {item.sponsoredArticles?.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>No sub-articles initialized.</p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {item.sponsoredArticles?.map(sub => (
                                <div key={sub._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                  <div style={{ fontWeight: "700", fontSize: "0.88rem" }}>{sub.title || "Coverage Placeholder"}</div>
                                  <span style={{ fontSize: "0.78rem", background: sub.status === "active" ? "#10b981" : "#f59e0b", color: "#fff", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase" }}>{sub.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ background: "#fff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px" }}>
                          <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase" }}>📞 Contact Info</div>
                          <div style={{ fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div><strong>Person:</strong> {item.contactPerson}</div>
                            <div><strong>Phone:</strong> {item.phone}</div>
                            <div><strong>Email:</strong> {item.email}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 5. PACKAGES & VIDEO RATES TAB (Admin only) */}
      {activeTab === "packages" && isAdmin && (
        <div style={{ background: "var(--card-bg, #fff)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 16px 0" }}>💰 Sponsored Packages & Video Promotion Rate Control</h3>
          <form onSubmit={handlePackageSave}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "20px" }}>
              {packages.map((pkg, idx) => (
                <div key={pkg.packageId} style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "12px", background: pkg.isComboPackage ? "rgba(16,185,129,0.03)" : (pkg.isVideoPackage ? "rgba(59,130,246,0.03)" : "rgba(245,158,11,0.03)") }}>
                  <div style={{ fontWeight: "800", fontSize: "1rem", color: pkg.isComboPackage ? "#10b981" : (pkg.isVideoPackage ? "#2563eb" : "#ea580c"), marginBottom: "8px" }}>
                    {pkg.isComboPackage ? "🚀 " : (pkg.isVideoPackage ? "🎥 " : "📰 ")} {pkg.nameEn}
                  </div>
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: "700" }}>Package Price (₹)</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={e => {
                        const newPkgs = [...packages];
                        newPkgs[idx].price = Number(e.target.value);
                        setPackages(newPkgs);
                      }}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "right" }}>
              <button type="submit" className="btn-primary" style={{ padding: "12px 24px" }}>💾 Save All Package Rates</button>
            </div>
          </form>
        </div>
      )}

      {/* ASSIGN REPORTER MODAL */}
      {assignModal.open && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "var(--card-bg, #fff)", padding: "24px", borderRadius: "16px", maxWidth: "500px", width: "100%" }}>
            <h3 style={{ marginTop: 0 }}>🎯 Assign Reporter & Configure Package</h3>
            <form onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Select Reporter *</label>
                <select value={assignForm.reporterId} onChange={e => setAssignForm({...assignForm, reporterId: e.target.value})} required style={{ width: "100%" }}>
                  <option value="">-- Choose Reporter --</option>
                  {reporters.map(r => <option key={r._id} value={r._id}>{r.name} ({r.role})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Package Type</label>
                <select value={assignForm.packageType} onChange={e => setAssignForm({...assignForm, packageType: e.target.value})} style={{ width: "100%" }}>
                  {packages.filter(p => !p.isVideoPackage).map(p => <option key={p.packageId} value={p.nameEn}>{p.nameEn} (₹{p.price})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Placement Slot</label>
                <select value={assignForm.placement} onChange={e => setAssignForm({...assignForm, placement: e.target.value})} style={{ width: "100%" }}>
                  <option value="homepage_sponsored">Homepage Sponsored Section</option>
                  <option value="category_sponsored">Category Sponsored Section</option>
                  <option value="sidebar_widget">Sidebar Sticky Widget</option>
                  <option value="featured_banner">Featured Sponsored Banner</option>
                  <option value="normal_feed">Normal News Feed</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" onClick={() => setAssignModal({ open: false, item: null })} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "none" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "8px 16px" }}>Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORKFLOW MODAL (WRITE / EDIT / APPROVE) */}
      {workModal.open && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "var(--card-bg, #fff)", padding: "24px", borderRadius: "16px", maxWidth: "780px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginTop: 0 }}>
              {workModal.mode === "write" ? "✍️ Draft Sponsored Article" : (workModal.mode === "edit" ? "🔍 Editor Review & Verification" : "🌟 Admin Final Publication")}
            </h3>

            {/* Sponsor Brief Panel — visible to reporter & editor for context */}
            {workModal.item && (isReporter || isEditor) && (
              <div style={{
                background: "linear-gradient(135deg, rgba(234,88,12,0.06) 0%, rgba(251,191,36,0.06) 100%)",
                border: "1.5px solid rgba(234,88,12,0.2)",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "20px"
              }}>
                <div style={{ fontWeight: "800", fontSize: "1rem", color: "var(--accent-orange, #ea580c)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiInfo size={16} /> Sponsor Brief — Read Before Writing
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "start" }}>
                  {/* Left Column: Text Information */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.88rem" }}>
                    <div>
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Company / Org:</span>
                      <span style={{ marginLeft: "6px", fontWeight: "700" }}>{workModal.item.companyName}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Contact Person:</span>
                      <span style={{ marginLeft: "6px" }}>{workModal.item.contactPerson}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Phone:</span>
                      <span style={{ marginLeft: "6px" }}>{workModal.item.phone || "—"}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Email:</span>
                      <span style={{ marginLeft: "6px" }}>{workModal.item.email || "—"}</span>
                    </div>
                    {workModal.item.website && (
                      <div>
                        <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Website:</span>
                        <a href={workModal.item.website} target="_blank" rel="noreferrer" style={{ marginLeft: "6px", color: "var(--accent-orange)" }}>{workModal.item.website}</a>
                      </div>
                    )}
                    <div>
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Package:</span>
                      <span style={{ marginLeft: "6px", fontWeight: "700", color: "var(--accent-orange)" }}>{workModal.item.packageType}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Placement:</span>
                      <span style={{ marginLeft: "6px" }}>{workModal.item.placement}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Duration:</span>
                      <span style={{ marginLeft: "6px" }}>{workModal.item.durationDays} days</span>
                    </div>
                    {workModal.item.videoPackage && workModal.item.videoPackage !== "None" && (
                      <div>
                        <span style={{ fontWeight: "700", color: "var(--text-muted)" }}>Video Package:</span>
                        <span style={{ marginLeft: "6px" }}>{workModal.item.videoPackage}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Uploaded Assets Previews */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    {workModal.item.companyLogo && (
                      <div style={{ width: "100%", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Sponsor Logo:</span>
                        <img 
                          src={workModal.item.companyLogo.startsWith("http") ? workModal.item.companyLogo : `${API.defaults.baseURL || "http://localhost:5000"}${workModal.item.companyLogo}`} 
                          alt="Sponsor Logo" 
                          style={{ maxHeight: "50px", maxWidth: "100%", objectFit: "contain", borderRadius: "6px", background: "#fff", border: "1px solid rgba(0,0,0,0.1)", padding: "4px" }} 
                        />
                      </div>
                    )}
                    {workModal.item.image && (
                      <div style={{ width: "100%", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Uploaded Banner/Image:</span>
                        <img 
                          src={workModal.item.image.startsWith("http") ? workModal.item.image : `${API.defaults.baseURL || "http://localhost:5000"}${workModal.item.image}`} 
                          alt="Uploaded Banner" 
                          style={{ width: "100%", maxHeight: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {workModal.item.eventDetails && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(0,0,0,0.04)", borderRadius: "8px", borderLeft: "3px solid var(--accent-orange)" }}>
                    <div style={{ fontWeight: "700", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>SPONSOR MESSAGE / EVENT DETAILS:</div>
                    <div style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>{workModal.item.eventDetails}</div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={e => handleWorkSubmit(e, false)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {workModal.mode === "admin_edit" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--bg-light, #f8fafc)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <div style={{ gridColumn: "span 2", fontWeight: "800", color: "var(--accent-orange, #ea580c)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                    🏢 Sponsor Information & Brand Settings
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Company Name *</label>
                    <input type="text" value={workForm.companyName} onChange={e => setWorkForm({...workForm, companyName: e.target.value})} required style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Contact Person *</label>
                    <input type="text" value={workForm.contactPerson} onChange={e => setWorkForm({...workForm, contactPerson: e.target.value})} required style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Phone *</label>
                    <input type="text" value={workForm.phone} onChange={e => setWorkForm({...workForm, phone: e.target.value})} required style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Email *</label>
                    <input type="email" value={workForm.email} onChange={e => setWorkForm({...workForm, email: e.target.value})} required style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Website URL</label>
                    <input type="text" value={workForm.website} onChange={e => setWorkForm({...workForm, website: e.target.value})} style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Replace Company Logo Image</label>
                    {workModal.item?.companyLogo && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Current Logo:</span>
                        <img 
                          src={workModal.item.companyLogo.startsWith("http") ? workModal.item.companyLogo : `${API.defaults.baseURL || "http://localhost:5000"}${workModal.item.companyLogo}`} 
                          alt="Logo Preview" 
                          style={{ height: "40px", objectFit: "contain", borderRadius: "6px", border: "1px solid var(--border-color)", background: "#fff", padding: "2px" }} 
                        />
                      </div>
                    )}
                    <input type="file" onChange={e => setWorkFiles({...workFiles, logo: e.target.files[0]})} style={{ width: "100%" }} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Article Title *</label>
                <input type="text" value={workForm.title} onChange={e => setWorkForm({...workForm, title: e.target.value})} required style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Full Article Content *</label>
                <textarea rows={6} value={workForm.description} onChange={e => setWorkForm({...workForm, description: e.target.value})} required style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Sponsored Badge Label</label>
                <input type="text" value={workForm.sponsoredLabel} onChange={e => setWorkForm({...workForm, sponsoredLabel: e.target.value})} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Upload / Replace Featured Image</label>
                {(workModal.item?.image || workModal.item?.companyLogo) && (
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      Current Featured Image {(!workModal.item?.image && workModal.item?.companyLogo) ? "(Uploaded as Logo by Sponsor)" : ""}:
                    </span>
                    <img 
                      src={(workModal.item.image || workModal.item.companyLogo).startsWith("http") 
                        ? (workModal.item.image || workModal.item.companyLogo) 
                        : `${API.defaults.baseURL || "http://localhost:5000"}${workModal.item.image || workModal.item.companyLogo}`} 
                      alt="Featured Preview" 
                      style={{ width: "100%", maxHeight: "150px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--border-color)", background: "#fff" }} 
                    />
                  </div>
                )}
                <input type="file" onChange={e => setWorkFiles({...workFiles, image: e.target.files[0]})} style={{ width: "100%" }} />
              </div>

              {(workModal.mode === "approve" || workModal.mode === "admin_edit") && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--bg-light, #f8fafc)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <div style={{ gridColumn: "span 2", fontWeight: "800", color: "var(--accent-orange, #ea580c)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                    ⚙️ Publishing & Placement Settings
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Placement Slot</label>
                    <select value={workForm.placement} onChange={e => setWorkForm({...workForm, placement: e.target.value})} style={{ width: "100%" }}>
                      <option value="homepage_sponsored">Homepage Sponsored Section</option>
                      <option value="category_sponsored">Category Sponsored Section</option>
                      <option value="sidebar_widget">Sidebar Sticky Widget</option>
                      <option value="featured_banner">Featured Sponsored Banner</option>
                      <option value="normal_feed">Normal News Feed</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Language Target</label>
                    <select value={workForm.language} onChange={e => setWorkForm({...workForm, language: e.target.value})} style={{ width: "100%" }}>
                      <option value="both">Both English & Tamil</option>
                      <option value="en">English Only</option>
                      <option value="ta">Tamil Only</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Category</label>
                    <input type="text" value={workForm.category} onChange={e => setWorkForm({...workForm, category: e.target.value})} style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Publish Duration (Days)</label>
                    <input type="number" value={workForm.durationDays} onChange={e => setWorkForm({...workForm, durationDays: e.target.value})} style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Payment Status</label>
                    <select value={workForm.paymentStatus} onChange={e => setWorkForm({...workForm, paymentStatus: e.target.value})} style={{ width: "100%" }}>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", fontSize: "0.82rem", marginBottom: "4px" }}>Video Promotion URL (YouTube / Embed)</label>
                    <input type="text" value={workForm.videoUrl} onChange={e => setWorkForm({...workForm, videoUrl: e.target.value})} style={{ width: "100%" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "15px" }}>
                <button type="button" onClick={() => setWorkModal({ open: false, item: null, mode: "" })} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "none" }}>Cancel</button>
                {workModal.mode === "write" && (
                  <>
                    <button type="submit" style={{ padding: "10px 18px", borderRadius: "8px", background: "#64748b", color: "#fff", border: "none" }}>💾 Save Draft</button>
                    <button type="button" onClick={e => handleWorkSubmit(e, true)} className="btn-primary" style={{ padding: "10px 18px" }}>🚀 Submit to Editor</button>
                  </>
                )}
                {workModal.mode === "edit" && (
                  <button type="button" onClick={e => handleWorkSubmit(e, true)} className="btn-primary" style={{ padding: "10px 18px", background: "#2563eb" }}>✅ Verify & Send to Admin</button>
                )}
                {workModal.mode === "approve" && (
                  <button type="button" onClick={() => handleFinalPublish(workModal.item)} className="btn-primary" style={{ padding: "10px 18px", background: "#10b981" }}>🌟 Approve & Publish Live</button>
                )}
                {workModal.mode === "admin_edit" && (
                  <button type="submit" className="btn-primary" style={{ padding: "10px 18px", background: "#ea580c" }}>💾 Save Published Changes</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SponsoredManagement;
