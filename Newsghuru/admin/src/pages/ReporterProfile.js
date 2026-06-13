import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaTwitter, FaLinkedin, FaCamera } from "react-icons/fa";
import API from "../config/api";
import "../styles/ReporterProfile.css";

function ReporterProfile() {
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    twitter: "",
    linkedin: "",
  });

  const [role, setRole] = useState("reporter");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/api/users/profile");
        if (res.data?.success && res.data.user) {
          const u = res.data.user;
          setProfileData({
            fullName: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            bio: u.bio || "",
            twitter: u.twitter || "",
            linkedin: u.linkedin || "",
          });
          setRole(u.role || "reporter");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        twitter: profileData.twitter,
        linkedin: profileData.linkedin,
      };
      const res = await API.put("/api/users/profile", payload);
      if (res.data?.success) {
        alert("Profile information saved successfully! 🎉");
        if (res.data.user?.name) {
          localStorage.setItem("userName", res.data.user.name);
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(error.response?.data?.message || "Profile update failed ❌");
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match! ❌");
      return;
    }
    try {
      const res = await API.put("/api/users/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.data?.success) {
        alert("Password updated successfully! 🎉");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.response?.data?.message || "Password update failed ❌");
    }
  };

  return (
    <div className="reporter-profile-container">
      
      <div className="profile-header-card">
        <div className="profile-image-section">
          <div className="image-wrapper">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-img" />
            ) : (
              <div className="profile-placeholder"><FaUser /></div>
            )}
            <label className="image-upload-btn">
              <FaCamera />
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>
          </div>
          <div className="profile-title-info">
            <h2>{profileData.fullName}</h2>
            <p className="role-badge">
              {role === "admin" ? "Super Admin" : role === "editor" ? "Content Editor" : "News Reporter"}
            </p>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-form-card">
          <h3>Personal Information</h3>
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label><FaUser className="input-icon" /> Full Name</label>
              <input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileChange} required />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label><FaEnvelope className="input-icon" /> Email Address</label>
                <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} required />
              </div>
              <div className="form-group half">
                <label><FaPhone className="input-icon" /> Phone Number</label>
                <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Professional Bio</label>
              <textarea name="bio" rows="4" value={profileData.bio} onChange={handleProfileChange} placeholder="Tell readers about your experience..."></textarea>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label><FaTwitter className="input-icon" /> Twitter Link</label>
                <input type="url" name="twitter" value={profileData.twitter} onChange={handleProfileChange} placeholder="https://twitter.com/..." />
              </div>
              <div className="form-group half">
                <label><FaLinkedin className="input-icon" /> LinkedIn Link</label>
                <input type="url" name="linkedin" value={profileData.linkedin} onChange={handleProfileChange} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>

            <button type="submit" className="btn-primary save-btn">Save Profile Changes</button>
          </form>
        </div>

        <div className="password-form-card">
          <h3>Security & Password</h3>
          <form onSubmit={updatePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} autoComplete="current-password" required />
            </div>
            
            <div className="form-group mt-4">
              <label>New Password</label>
              <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} autoComplete="new-password" required />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} autoComplete="new-password" required />
            </div>

            <button type="submit" className="btn-secondary update-btn">Update Password</button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default ReporterProfile;
