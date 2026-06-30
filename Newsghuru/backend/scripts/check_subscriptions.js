require("dotenv").config();
const connectDB = require("./db");
const mongoose = require("mongoose");
const User = require("./models/User");
const SubscriptionPlan = require("./models/SubscriptionPlan");

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    
    console.log("\n--- SUBSCRIPTION PLANS IN DB ---");
    const plans = await SubscriptionPlan.find({});
    plans.forEach(p => {
      console.log(`Plan ID: ${p._id} | Name: ${p.name} | Price: ${p.price} | Duration: ${p.duration} | DurationMonths: ${p.durationMonths}`);
    });
    
    console.log("\n--- PREMIUM USERS IN DB ---");
    const users = await User.find({ isPremium: true });
    console.log(`Total Premium Users found: ${users.length}`);
    users.forEach(u => {
      console.log(`User Email: ${u.email}`);
      console.log(`  isPremium: ${u.isPremium}`);
      console.log(`  premiumPlan: ${u.premiumPlan} (${typeof u.premiumPlan})`);
      console.log(`  upcomingPlan: ${u.upcomingPlan} (${typeof u.upcomingPlan})`);
      console.log(`  premiumValidUntil: ${u.premiumValidUntil}`);
      console.log(`  upcomingValidUntil: ${u.upcomingValidUntil}`);
    });
    
  } catch (err) {
    console.error("Error in script:", err);
  } finally {
    console.log("\nClosing connection...");
    await mongoose.connection.close();
  }
}

main();
