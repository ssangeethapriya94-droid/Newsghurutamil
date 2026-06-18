import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/Account.css";

function Account() {
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

  useEffect(() => {
    fetchProfile();
  }, []);

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

  return (
    <div className="account-page">
      <div className="account-header">
        <h1 className="account-title">Account Settings</h1>
        <p className="account-subtitle">Manage your admin profile and security credentials</p>
      </div>

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
    </div>
  );
}

export default Account;
