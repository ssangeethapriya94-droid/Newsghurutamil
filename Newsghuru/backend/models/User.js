const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "editor", "reporter", "reader"],
    default: "reporter",
  },
  phone: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  twitter: {
    type: String,
    default: "",
  },
  linkedin: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "",
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumValidUntil: {
    type: Date,
    default: null,
  },
  premiumPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    default: null,
  },
  upcomingPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    default: null,
  },
  upcomingValidUntil: {
    type: Date,
    default: null,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  notificationEnabled: {
    type: Boolean,
    default: false,
  },
  fcmToken: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    enum: ["ta", "en", "hi", "te", "ml"],
    default: "ta",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check and transition subscription status if expired
userSchema.methods.checkSubscription = async function () {
  const SubscriptionPlan = mongoose.model("SubscriptionPlan");
  const Transaction = mongoose.model("Transaction");

  let shouldSave = false;

  // 1. Self-heal premiumPlan if user is premium but the plan is deleted/missing
  if (this.isPremium) {
    if (this.premiumPlan) {
      const planExists = await SubscriptionPlan.findById(this.premiumPlan);
      if (!planExists) {
        console.log(`⚠️ User ${this.email} has premiumPlan pointing to non-existent plan ID: ${this.premiumPlan}. Attempting to self-heal...`);
        const latestTx = await Transaction.findOne({ userId: this._id, status: "Success" }).sort({ createdAt: -1 });
        if (latestTx) {
          let matchedPlan = await SubscriptionPlan.findOne({ price: latestTx.amount });
          if (!matchedPlan) {
            matchedPlan = await SubscriptionPlan.findOne({ price: { $gte: latestTx.amount - 10, $lte: latestTx.amount + 10 } });
          }
          if (matchedPlan) {
            this.premiumPlan = matchedPlan._id;
            console.log(`✅ Self-healed: Matched transaction amount ₹${latestTx.amount} to plan: ${matchedPlan.name} (${matchedPlan._id})`);
            shouldSave = true;
          } else {
            const defaultPlan = await SubscriptionPlan.findOne({ name: "1 Month" });
            if (defaultPlan) {
              this.premiumPlan = defaultPlan._id;
              console.log(`✅ Self-healed with default 1 Month plan for user ${this.email}`);
              shouldSave = true;
            }
          }
        } else {
          const defaultPlan = await SubscriptionPlan.findOne({ name: "1 Month" });
          if (defaultPlan) {
            this.premiumPlan = defaultPlan._id;
            console.log(`✅ Self-healed with default 1 Month plan (no transaction found) for user ${this.email}`);
            shouldSave = true;
          }
        }
      }
    } else {
      console.log(`⚠️ User ${this.email} is Premium but has no premiumPlan set. Attempting to self-heal...`);
      const latestTx = await Transaction.findOne({ userId: this._id, status: "Success" }).sort({ createdAt: -1 });
      if (latestTx) {
        let matchedPlan = await SubscriptionPlan.findOne({ price: latestTx.amount });
        if (!matchedPlan) {
          matchedPlan = await SubscriptionPlan.findOne({ price: { $gte: latestTx.amount - 10, $lte: latestTx.amount + 10 } });
        }
        if (matchedPlan) {
          this.premiumPlan = matchedPlan._id;
          console.log(`✅ Self-healed: Matched transaction amount ₹${latestTx.amount} to plan: ${matchedPlan.name} (${matchedPlan._id})`);
          shouldSave = true;
        } else {
          const defaultPlan = await SubscriptionPlan.findOne({ name: "1 Month" });
          if (defaultPlan) {
            this.premiumPlan = defaultPlan._id;
            console.log(`✅ Self-healed with default 1 Month plan for user ${this.email}`);
            shouldSave = true;
          }
        }
      } else {
        const defaultPlan = await SubscriptionPlan.findOne({ name: "1 Month" });
        if (defaultPlan) {
          this.premiumPlan = defaultPlan._id;
          console.log(`✅ Self-healed with default 1 Month plan (no transaction found) for user ${this.email}`);
          shouldSave = true;
        }
      }
    }
  }

  // 2. Validate upcomingPlan. If it exists but is deleted from the DB, clear it
  if (this.upcomingPlan) {
    const upcomingPlanExists = await SubscriptionPlan.findById(this.upcomingPlan);
    if (!upcomingPlanExists) {
      console.log(`⚠️ User ${this.email} has upcomingPlan pointing to non-existent plan ID: ${this.upcomingPlan}. Clearing it.`);
      this.upcomingPlan = null;
      this.upcomingValidUntil = null;
      shouldSave = true;
    }
  }

  // 3. Transition to upcomingPlan if the active premium plan has expired
  if (this.isPremium && this.premiumValidUntil && new Date() > this.premiumValidUntil) {
    if (this.upcomingPlan) {
      this.premiumPlan = this.upcomingPlan;
      this.premiumValidUntil = this.upcomingValidUntil;
      this.upcomingPlan = null;
      this.upcomingValidUntil = null;
      this.isPremium = true;
      console.log(`✅ Transitioned user ${this.email} to upcoming plan.`);
    } else {
      this.isPremium = false;
      this.premiumValidUntil = null;
      this.premiumPlan = null;
    }
    shouldSave = true;
  }

  if (shouldSave) {
    await this.save();
  }
};

module.exports = mongoose.model("User", userSchema);
