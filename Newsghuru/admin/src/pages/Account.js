import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../config/api";
import "../styles/Account.css";
import { 
  FiUser, FiLock, FiEye, FiEdit2, FiGlobe, FiClock, FiFileText, FiShield, FiAlertTriangle, FiMail 
} from "react-icons/fi";

const PAGE_OPTIONS = [
  { slug: "about", title: "About Us", icon: <FiFileText />, desc: "Manage and publish information about NewsGhuru" },
  { slug: "privacy", title: "Privacy Policy", icon: <FiShield />, desc: "Manage and publish the Privacy Policy for NewsGhuru" },
  { slug: "terms", title: "Terms & Conditions", icon: <FiLock />, desc: "Manage and publish terms of service and usage guidelines" },
  { slug: "disclaimer", title: "Disclaimer", icon: <FiAlertTriangle />, desc: "Manage and publish legal disclaimers" },
  { slug: "contact", title: "Contact Us", icon: <FiMail />, desc: "Manage contact information and instructions" },
  { slug: "advertise", title: "Advertise With Us", icon: <FiGlobe />, desc: "Manage details about advertisement options" }
];

function Account() {
  const [activeSettingsTab, setActiveSettingsTab] = useState("account"); // "account" or page slugs
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Static Pages CMS State
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState("edit"); // "edit" or "preview"

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeSettingsTab !== "account") {
      fetchPageContent(activeSettingsTab);
    }
  }, [activeSettingsTab]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/api/users/profile");
      if (res.data?.success && res.data.user) {
        setProfile({
          username: res.data.user.name || "",
          email: res.data.user.email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchPageContent = async (slug) => {
    try {
      setPageLoading(true);
      const res = await API.get(`/api/pages/${slug}`);
      if (res.data && res.data.success) {
        setContent(res.data.content || "");
        setLastUpdated(res.data.lastUpdated);
      }
    } catch (err) {
      console.error(`Error fetching page ${slug}:`, err);
      alert("Failed to load page content.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const payload = {
        name: profile.username,
        email: profile.email
      };
      const res = await API.put("/api/users/profile", payload);
      if (res.data?.success) {
        alert("Profile updated successfully! 🎉");
        if (res.data.user?.name) {
          localStorage.setItem("userName", res.data.user.name);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Profile update failed ❌");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match! ❌");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await API.put("/api/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data?.success) {
        alert("Password changed successfully! 🎉");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert(error.response?.data?.message || "Password change failed ❌");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Page content cannot be empty.");
      return;
    }

    const currentPage = PAGE_OPTIONS.find(p => p.slug === activeSettingsTab);
    const title = currentPage ? currentPage.title : "Static Page";

    try {
      setSaving(true);
      const res = await API.put(`/api/admin/pages/${activeSettingsTab}`, {
        title,
        content
      });
      if (res.data && res.data.success) {
        setContent(res.data.page?.content || "");
        setLastUpdated(res.data.page?.lastUpdated);
        alert(`"${title}" published successfully! 🚀`);
      }
    } catch (err) {
      console.error(`Error publishing page ${activeSettingsTab}:`, err);
      alert(err.response?.data?.message || "Failed to publish page content.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "clean"],
    ],
  };

  const currentTabInfo = activeSettingsTab === "account" 
    ? { title: "Account Settings", desc: "Manage your admin profile and security credentials" }
    : PAGE_OPTIONS.find(p => p.slug === activeSettingsTab);

  return (
    <div className="account-page">
      <div className="account-header">
        <h1 className="account-title">{currentTabInfo.title}</h1>
        <p className="account-subtitle">{currentTabInfo.desc}</p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="settings-tabs-container">
        <button
          className={`settings-tab ${activeSettingsTab === "account" ? "active" : ""}`}
          onClick={() => setActiveSettingsTab("account")}
        >
          <FiUser /> Account Settings
        </button>
        {PAGE_OPTIONS.map((page) => (
          <button
            key={page.slug}
            className={`settings-tab ${activeSettingsTab === page.slug ? "active" : ""}`}
            onClick={() => setActiveSettingsTab(page.slug)}
          >
            {page.icon} {page.title}
          </button>
        ))}
      </div>

      {activeSettingsTab === "account" ? (
        <div className="account-sections">
          {/* PROFILE CARD */}
          <div className="account-card">
            <h2>Admin Profile</h2>
            <p className="card-desc">Update your public username and admin contact email.</p>
            
            <form onSubmit={handleProfileSubmit} className="account-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              <button type="submit" className="save-btn" disabled={profileLoading}>
                {profileLoading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* PASSWORD CARD */}
          <div className="account-card">
            <h2>Change Password</h2>
            <p className="card-desc">Change your account password regularly to keep it secure.</p>
            
            <form onSubmit={handlePasswordSubmit} className="account-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className="save-btn alt-btn" disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="cms-editor-container">
          {pageLoading ? (
            <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              Loading page content...
            </div>
          ) : (
            <div className="account-card" style={{ display: "block" }}>
              <div className="cms-toolbar">
                <div className="last-published-info">
                  <FiClock style={{ color: "#f97316" }} />
                  <span><strong>Last Published:</strong> {formatDate(lastUpdated)}</span>
                </div>
                
                <div className="editor-mode-toggle">
                  <button 
                    type="button"
                    className={`mode-toggle-btn ${activeEditorTab === "edit" ? "active" : ""}`}
                    onClick={() => setActiveEditorTab("edit")}
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button 
                    type="button"
                    className={`mode-toggle-btn ${activeEditorTab === "preview" ? "active" : ""}`}
                    onClick={() => setActiveEditorTab("preview")}
                  >
                    <FiEye size={14} /> Preview
                  </button>
                </div>
              </div>

              <form onSubmit={handlePublish}>
                {activeEditorTab === "edit" ? (
                  <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "12px", fontSize: "14px", color: "var(--text-main)" }}>
                      Rich Text Content Editor
                    </label>
                    <div className="quill-editor-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        style={{ color: "black" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "15px", fontSize: "14px", color: "var(--text-main)" }}>
                      Live Preview (NewsGhuru Client View)
                    </label>
                    <div 
                      className="preview-container"
                      dangerouslySetInnerHTML={{ __html: content || "<p style='color: #888;'>No content written yet. Use the Edit tab to write some.</p>" }}
                    />
                  </div>
                )}

                <div className="cms-actions-footer">
                  <button
                    type="button"
                    className="save-btn discard-btn"
                    onClick={() => fetchPageContent(activeSettingsTab)}
                    disabled={saving}
                  >
                    Discard Changes
                  </button>
                  
                  <button
                    type="submit"
                    className="save-btn publish-btn"
                    disabled={saving}
                  >
                    <FiGlobe /> {saving ? "Publishing..." : "Publish Updates"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Account;
