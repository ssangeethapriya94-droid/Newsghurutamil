const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/subscription/plans - Get all plans (public)
router.get("/plans", async (req, res) => {
  try {
    const totalPlans = await SubscriptionPlan.countDocuments();
    if (totalPlans === 0) {
      const defaultPlans = [
        {
          name: "1 Month",
          price: 129,
          duration: "Month",
          durationMonths: 1,
          benefits: [
            "பிரீமியம் கட்டுரைகள்",
            "விளம்பரமற்ற வாசிப்பு"
          ],
          isRecommended: false,
          language: "ta"
        },
        {
          name: "6 Months",
          price: 749,
          duration: "6 Months",
          durationMonths: 6,
          benefits: [
            "பிரீமியம் கட்டுரைகள்",
            "விளம்பரமற்ற வாசிப்பு"
          ],
          isRecommended: false,
          language: "ta"
        },
        {
          name: "1 Year",
          price: 999,
          duration: "Year",
          durationMonths: 12,
          benefits: [
            "பிரீமியம் கட்டுரைகள்",
            "விளம்பரமற்ற வாசிப்பு"
          ],
          isRecommended: true,
          language: "ta"
        },
        {
          name: "LIFETIME",
          price: 9999,
          duration: "Lifetime",
          durationMonths: 999,
          benefits: [
            "பிரீமியம் கட்டுரைகள்",
            "விளம்பரமற்ற வாசிப்பு"
          ],
          isRecommended: false,
          language: "ta"
        },
        // English plans
        {
          name: "1 Month",
          price: 129,
          duration: "Month",
          durationMonths: 1,
          benefits: [
            "Premium Articles",
            "Ad-free Reading"
          ],
          isRecommended: false,
          language: "en"
        },
        {
          name: "6 Months",
          price: 749,
          duration: "6 Months",
          durationMonths: 6,
          benefits: [
            "Premium Articles",
            "Ad-free Reading"
          ],
          isRecommended: false,
          language: "en"
        },
        {
          name: "1 Year",
          price: 999,
          duration: "Year",
          durationMonths: 12,
          benefits: [
            "Premium Articles",
            "Ad-free Reading"
          ],
          isRecommended: true,
          language: "en"
        },
        {
          name: "LIFETIME",
          price: 9999,
          duration: "Lifetime",
          durationMonths: 999,
          benefits: [
            "Lifetime Articles",
            "Ad-free Reading"
          ],
          isRecommended: false,
          language: "en"
        }
      ];
      await SubscriptionPlan.insertMany(defaultPlans);
      console.log("✅ Auto-seeded subscription plans inside GET /plans route for both English and Tamil");
    }
    
    const { language } = req.query;
    let query = {};
    if (language) {
      if (language === "ta") {
        query = { $or: [{ language: "ta" }, { language: { $exists: false } }] };
      } else {
        query = { language };
      }
    }

    const plans = await SubscriptionPlan.find(query).sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    console.error("Fetch plans error:", error);
    res.status(500).json({ success: false, message: "Error fetching plans" });
  }
});

// POST /api/subscription/plans - Create a new plan (Admin only)
router.post("/plans", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, price, duration, durationMonths, benefits, isRecommended, language } = req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({ success: false, message: "Name, price, and duration are required" });
    }

    const targetLanguage = language || "ta";
    const planExists = await SubscriptionPlan.findOne({ name, language: targetLanguage });
    if (planExists) {
      return res.status(400).json({ success: false, message: `Plan with this name already exists for language: ${targetLanguage}` });
    }

    const newPlan = new SubscriptionPlan({
      name,
      price,
      duration,
      durationMonths: durationMonths || 1,
      benefits: benefits || [],
      isRecommended: !!isRecommended,
      language: targetLanguage
    });

    await newPlan.save();
    res.status(201).json({ success: true, message: "Subscription plan created successfully", plan: newPlan });
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(500).json({ success: false, message: "Error creating plan" });
  }
});

// PUT /api/subscription/plans/:id - Update a plan (Admin only)
router.put("/plans/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, price, duration, durationMonths, benefits, isRecommended, language } = req.body;
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    if (name) plan.name = name;
    if (price !== undefined) plan.price = price;
    if (duration) plan.duration = duration;
    if (durationMonths !== undefined) plan.durationMonths = durationMonths;
    if (benefits) plan.benefits = benefits;
    if (isRecommended !== undefined) plan.isRecommended = isRecommended;
    if (language) plan.language = language;

    await plan.save();
    res.json({ success: true, message: "Subscription plan updated successfully", plan });
  } catch (error) {
    console.error("Update plan error:", error);
    res.status(500).json({ success: false, message: "Error updating plan" });
  }
});

// DELETE /api/subscription/plans/:id - Delete a plan (Admin only)
router.delete("/plans/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Subscription plan deleted successfully" });
  } catch (error) {
    console.error("Delete plan error:", error);
    res.status(500).json({ success: false, message: "Error deleting plan" });
  }
});

// POST /api/subscription/create-order - Create Razorpay order or Mock order
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: "Plan ID is required" });
    }

    let plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      // Fallback check by static ID mapping to seeded plan names
      const staticIdMap = {
        "665f80e0c034b12345678901": "1 Month",
        "665f80e0c034b12345678902": "6 Months",
        "665f80e0c034b12345678903": "1 Year",
        "665f80e0c034b12345678904": "LIFETIME"
      };
      const fallbackName = staticIdMap[planId];
      if (fallbackName) {
        plan = await SubscriptionPlan.findOne({ name: fallbackName });
      }
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if Razorpay keys are configured. If not, use mock mode.
    if (keyId && keySecret && keyId !== "your_key_id" && keySecret !== "your_key_secret") {
      try {
        const instance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret
        });

        const options = {
          amount: Math.round(plan.price * 100), // Razorpay accepts amount in paise (1 INR = 100 paise)
          currency: "INR",
          receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
          notes: {
            planId: plan._id.toString(),
            planName: plan.name,
            userId: req.user._id.toString()
          }
        };

        const order = await instance.orders.create(options);
        return res.json({
          success: true,
          isMock: false,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: keyId
        });
      } catch (rzpErr) {
        console.error("Razorpay instance order creation failed, falling back to mock mode:", rzpErr.message);
        // Fallback to mock mode if actual creation fails (e.g. invalid keys)
      }
    }

    // Mock order creation for sandbox testing
    console.log("⚠️ Razorpay credentials missing or invalid. Initializing in Mock Sandbox mode.");
    res.json({
      success: true,
      isMock: true,
      orderId: `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(plan.price * 100),
      currency: "INR",
      key: "rzp_test_mockkey_newsghuru"
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Error creating payment order" });
  }
});

// POST /api/subscription/verify-payment - Verify signature for real payments
router.post("/verify-payment", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ success: false, message: "All payment verification fields are required" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, message: "Razorpay secret key not configured on backend" });
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed. Invalid signature." });
    }

    // Update user subscription state based on plan duration
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      const staticIdMap = {
        "665f80e0c034b12345678901": "1 Month",
        "665f80e0c034b12345678902": "6 Months",
        "665f80e0c034b12345678903": "1 Year",
        "665f80e0c034b12345678904": "LIFETIME"
      };
      const fallbackName = staticIdMap[planId];
      if (fallbackName) {
        plan = await SubscriptionPlan.findOne({ name: fallbackName });
      }
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    const durationMonths = plan.durationMonths || 1;
    if (user.isPremium && user.premiumValidUntil && new Date() < user.premiumValidUntil) {
      const upcomingValidUntil = new Date(user.premiumValidUntil);
      upcomingValidUntil.setMonth(upcomingValidUntil.getMonth() + durationMonths);
      
      user.upcomingPlan = plan._id;
      user.upcomingValidUntil = upcomingValidUntil;
    } else {
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + durationMonths);

      user.isPremium = true;
      user.premiumPlan = plan._id;
      user.premiumValidUntil = validUntil;
      user.upcomingPlan = null;
      user.upcomingValidUntil = null;
    }
    await user.save();

    // Record the transaction
    await Transaction.create({
      userId: user._id,
      planId: plan._id,
      amount: plan.price,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "Success"
    });

    // Remove password and send
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: "Payment verified successfully. Welcome to Premium!",
      user: userObj
    });

  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
});

// POST /api/subscription/verify-mock-payment - Verify mock signature for testing
router.post("/verify-mock-payment", verifyToken, async (req, res) => {
  try {
    const { planId, orderId } = req.body;
    if (!planId || !orderId) {
      return res.status(400).json({ success: false, message: "Plan ID and Order ID are required" });
    }

    // Update user subscription state in DB based on plan duration
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      const staticIdMap = {
        "665f80e0c034b12345678901": "1 Month",
        "665f80e0c034b12345678902": "6 Months",
        "665f80e0c034b12345678903": "1 Year",
        "665f80e0c034b12345678904": "LIFETIME"
      };
      const fallbackName = staticIdMap[planId];
      if (fallbackName) {
        plan = await SubscriptionPlan.findOne({ name: fallbackName });
      }
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    const durationMonths = plan.durationMonths || 1;
    if (user.isPremium && user.premiumValidUntil && new Date() < user.premiumValidUntil) {
      const upcomingValidUntil = new Date(user.premiumValidUntil);
      upcomingValidUntil.setMonth(upcomingValidUntil.getMonth() + durationMonths);
      
      user.upcomingPlan = plan._id;
      user.upcomingValidUntil = upcomingValidUntil;
    } else {
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + durationMonths);

      user.isPremium = true;
      user.premiumPlan = plan._id;
      user.premiumValidUntil = validUntil;
      user.upcomingPlan = null;
      user.upcomingValidUntil = null;
    }
    await user.save();

    // Record the transaction
    await Transaction.create({
      userId: user._id,
      planId: plan._id,
      amount: plan.price,
      paymentId: `mock_pay_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      orderId: orderId,
      status: "Success"
    });

    // Remove password and send
    const userObj = user.toObject();
    delete userObj.password;

    console.log(`✅ User ${user.email} upgraded to premium successfully via mock payment.`);
    res.json({
      success: true,
      message: "Mock payment verified successfully. Welcome to Premium!",
      user: userObj
    });

  } catch (error) {
    console.error("Verify mock payment error:", error);
    res.status(500).json({ success: false, message: "Error verifying mock payment" });
  }
});

// GET /api/subscription/status - Get current user's subscription status
router.get("/status", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Auto-expire/transition premium if needed
    await user.checkSubscription();

    await user.populate("premiumPlan");
    await user.populate("upcomingPlan");

    res.json({
      success: true,
      isPremium: user.isPremium,
      premiumValidUntil: user.premiumValidUntil,
      premiumPlan: user.premiumPlan,
      upcomingPlan: user.upcomingPlan,
      upcomingValidUntil: user.upcomingValidUntil
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    res.status(500).json({ success: false, message: "Error fetching subscription status" });
  }
});

// POST /api/subscription/webhook - Handle Razorpay webhook events (raw body needed)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("⚠️ RAZORPAY_WEBHOOK_SECRET not configured. Skipping webhook verification.");
      return res.status(200).json({ received: true });
    }

    const razorpaySignature = req.headers["x-razorpay-signature"];
    if (!razorpaySignature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay signature header" });
    }

    // Verify webhook signature
    const body = req.body.toString();
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("❌ Razorpay webhook signature mismatch");
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = JSON.parse(body);
    console.log("📩 Razorpay webhook event received:", event.event);

    // Handle payment.captured event (most reliable confirmation)
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const notes = payment.notes || {};
      const planId = notes.planId;
      const userId = notes.userId;

      if (planId && userId) {
        const user = await User.findById(userId);
        const plan = await SubscriptionPlan.findById(planId);

        if (user && plan) {
          const durationMonths = plan.durationMonths || 1;
          if (user.isPremium && user.premiumValidUntil && new Date() < user.premiumValidUntil) {
            const upcomingValidUntil = new Date(user.premiumValidUntil);
            upcomingValidUntil.setMonth(upcomingValidUntil.getMonth() + durationMonths);
            
            user.upcomingPlan = plan._id;
            user.upcomingValidUntil = upcomingValidUntil;
          } else {
            const validUntil = new Date();
            validUntil.setMonth(validUntil.getMonth() + durationMonths);

            user.isPremium = true;
            user.premiumPlan = plan._id;
            user.premiumValidUntil = validUntil;
            user.upcomingPlan = null;
            user.upcomingValidUntil = null;
          }
          await user.save();

          // Record the transaction
          const transactionExists = await Transaction.findOne({ paymentId: payment.id });
          if (!transactionExists) {
            await Transaction.create({
              userId: user._id,
              planId: plan._id,
              amount: plan.price,
              paymentId: payment.id,
              orderId: orderId || `wh_order_${Date.now()}`,
              status: "Success"
            });
          }

          console.log(`✅ Webhook: User ${user.email} upgraded to premium via payment.captured event. Valid until: ${validUntil.toISOString()}`);
        }
      } else {
        console.warn("⚠️ Webhook payment.captured: Missing planId or userId in payment notes. Order ID:", orderId);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    res.status(500).json({ success: false, message: "Webhook processing error" });
  }
});

// GET /api/subscription/admin/revenue - Get revenue dashboard details (Admin only)
router.get("/admin/revenue", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    // Fetch all successful transactions
    const transactions = await Transaction.find({ status: "Success" })
      .populate("userId", "name email language")
      .populate("planId", "name price language")
      .sort({ createdAt: -1 });

    // Metrics calculation
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    let tamilRevenue = 0;
    let englishRevenue = 0;
    transactions.forEach(tx => {
      const lang = (tx.planId && tx.planId.language) || (tx.userId && tx.userId.language) || "ta";
      if (lang === "en") {
        englishRevenue += tx.amount;
      } else {
        tamilRevenue += tx.amount;
      }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = transactions
      .filter(tx => new Date(tx.createdAt) >= startOfMonth)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const activeSubscriptions = await User.countDocuments({ isPremium: true });
    const totalPlansSold = transactions.length;

    // Plan distribution map
    const planCounts = {};
    transactions.forEach(tx => {
      const planName = tx.planId ? tx.planId.name : "Unknown Plan";
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });
    const planDistribution = Object.keys(planCounts).map(name => ({
      name,
      value: planCounts[name]
    }));

    // Monthly trends (last 6 months)
    const monthlyTrendsMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      monthlyTrendsMap[label] = 0;
    }

    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const label = date.toLocaleString("en-US", { month: "short", year: "numeric" });
      if (monthlyTrendsMap[label] !== undefined) {
        monthlyTrendsMap[label] += tx.amount;
      }
    });

    const monthlyTrends = Object.keys(monthlyTrendsMap).map(month => ({
      month,
      revenue: monthlyTrendsMap[month]
    }));

    res.json({
      success: true,
      metrics: {
        totalRevenue,
        tamilRevenue,
        englishRevenue,
        monthlyRevenue,
        activeSubscriptions,
        totalPlansSold
      },
      planDistribution,
      monthlyTrends,
      transactions: transactions.slice(0, 50) // Return last 50 transactions for table
    });
  } catch (error) {
    console.error("Admin revenue fetch error:", error);
    res.status(500).json({ success: false, message: "Error fetching revenue details" });
  }
});

module.exports = router;
