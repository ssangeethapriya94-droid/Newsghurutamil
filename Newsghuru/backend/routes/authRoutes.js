const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");
const News = require("../models/News");
const { sendNewsPublishEmail } = require("../utils/emailService");

const router = express.Router();

// POST /api/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Verify role (if supplied by the dropdown)
    if (role && user.role !== role) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Sync language preference if sent
    const lang = req.query.language || req.body.language;
    if (lang && ["ta", "en", "hi", "te", "ml"].includes(lang)) {
      user.language = lang;
      await user.save();
    }

    // Check if premium subscription has expired
    await user.checkSubscription();

    // 4. Generate JWT Token
    const payload = {
      userId: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "default_super_secret_key", {
      expiresIn: "7d", // Token expires in 7 days
    });
    // 5. Return token, role, and user info
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        premiumValidUntil: user.premiumValidUntil,
        premiumPlan: user.premiumPlan,
        upcomingPlan: user.upcomingPlan,
        upcomingValidUntil: user.upcomingValidUntil,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST /api/register (Mainly for testing/seeding without direct DB access)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const lang = req.query.language || req.body.language || "ta";

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role: role || "reporter", // default to reporter if not provided
      language: lang,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: { id: newUser._id, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// GET /api/users/profile - Get currently logged-in user's profile
router.get("/users/profile", verifyToken, async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Sync language preference if sent
    const lang = req.query.language || req.body.language;
    if (lang && ["ta", "en", "hi", "te", "ml"].includes(lang)) {
      user.language = lang;
      await user.save();
    }

    // Check if premium subscription has expired
    await user.checkSubscription();

    // Populate plans
    await user.populate("premiumPlan");
    await user.populate("upcomingPlan");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
});

// PUT /api/users/profile - Update currently logged-in user's profile
router.put("/users/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, bio, twitter, linkedin, profileImage } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if email is being changed and if it is already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email is already in use by another account" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (twitter !== undefined) user.twitter = twitter;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        twitter: user.twitter,
        linkedin: user.linkedin,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error updating profile" });
  }
});

// PUT /api/users/change-password - Change logged-in user's password
router.put("/users/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    // Hash is handled by the pre-save hook in models/User.js!
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Server error changing password" });
  }
});

// POST /api/users/subscribe - Subscribe to notifications
router.post("/users/subscribe", verifyToken, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isSubscribed = true;
    // Set notificationEnabled to true if they actually provided an fcmToken
    user.notificationEnabled = !!fcmToken; 
    if (fcmToken) {
      user.fcmToken = fcmToken;
    }
    
    const lang = req.query.language || req.body.language || "ta";
    user.language = lang;

    await user.save();

    res.json({
      success: true,
      message: "Subscription successful",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ success: false, message: "Server error during subscription" });
  }
});

// POST /api/users/subscribe-guest - Subscribe guest/visitor to notifications
router.post("/users/subscribe-guest", async (req, res) => {
  try {
    const { fcmToken, language } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, message: "FCM Token is required" });
    }

    const GuestSubscription = require("../models/GuestSubscription");

    // Check if token already exists
    let subscription = await GuestSubscription.findOne({ fcmToken });
    if (!subscription) {
      subscription = new GuestSubscription({
        fcmToken,
        language: language || "ta"
      });
      await subscription.save();
    } else if (subscription.language !== language) {
      subscription.language = language || "ta";
      await subscription.save();
    }

    res.json({
      success: true,
      message: "Guest subscription successful",
    });
  } catch (error) {
    console.error("Guest subscribe error:", error);
    res.status(500).json({ success: false, message: "Server error during guest subscription" });
  }
});

// Admin User Management routes
const { authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/users/list (Admin only)
router.get("/users/list", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Fetch users list error:", error);
    res.status(500).json({ message: "Server error fetching users list" });
  }
});

// POST /api/users/create (Admin only)
router.post("/users/create", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields (name, email, password, role) are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role
    });

    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Admin create user error:", error);
    res.status(500).json({ message: "Server error creating user" });
  }
});

// PUT /api/users/:id/role (Admin only)
router.put("/users/:id/role", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) {
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: "Email is already taken" });
        }
        user.email = email;
      }
    }
    if (role) {
      if (!["admin", "editor", "reporter", "reader"].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      user.role = role;
    }

    await user.save();
    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ message: "Server error updating user" });
  }
});

// DELETE /api/users/:id (Admin only)
router.delete("/users/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

module.exports = router;
