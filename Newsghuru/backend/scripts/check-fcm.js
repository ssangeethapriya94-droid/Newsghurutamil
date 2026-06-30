/**
 * FCM Token & Subscription Diagnostics
 * Run: node check-fcm.js
 */
const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

require("dotenv").config();
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", UserSchema, "users");

async function run() {
  console.log("\n🔍 NewsGhuru — FCM Notification Diagnostics\n" + "=".repeat(50));
  
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected\n");

  const allUsers = await User.find({}, {
    email: 1, isSubscribed: 1, notificationEnabled: 1, fcmToken: 1, language: 1
  });

  console.log(`📊 Total users in DB: ${allUsers.length}`);
  console.log("─".repeat(50));

  let noToken = 0, subscribed = 0, notEnabled = 0, staleToken = 0;

  for (const u of allUsers) {
    const email = u.email || "(no email)";
    const hasSub = !!u.isSubscribed;
    const hasEnable = !!u.notificationEnabled;
    const hasToken = !!(u.fcmToken && u.fcmToken.trim());
    const tokenSnippet = hasToken ? u.fcmToken.substring(0, 30) + "..." : "❌ NO TOKEN";
    
    // FCM tokens for APA91b prefix (old FCM) vs new format
    const isOldToken = hasToken && u.fcmToken.startsWith("APA91b");
    const isNewToken = hasToken && !u.fcmToken.startsWith("APA91b");
    const tokenType = isOldToken ? "⚠️ OLD FORMAT" : isNewToken ? "✅ NEW FORMAT" : "";

    console.log(`👤 ${email}`);
    console.log(`   isSubscribed: ${hasSub} | notificationEnabled: ${hasEnable} | language: ${u.language || "undefined (legacy -> ta)"}`);
    console.log(`   FCM Token: ${tokenSnippet} ${tokenType}`);

    if (!hasToken) noToken++;
    if (!hasSub || !hasEnable) notEnabled++;
    if (hasSub && hasEnable && hasToken) subscribed++;
    if (isOldToken) staleToken++;
  }

  console.log("─".repeat(50));
  console.log(`\n📈 SUMMARY:`);
  console.log(`  ✅ Users who WILL receive notifications: ${subscribed}`);
  console.log(`  ❌ Users with NO FCM token: ${noToken}`);
  console.log(`  ⚠️  Users not subscribed/enabled: ${notEnabled}`);
  console.log(`  ⚠️  Users with OLD token format (APA91b): ${staleToken}`);

  if (staleToken > 0) {
    console.log(`\n🚨 PROBLEM FOUND: ${staleToken} user(s) have OLD FCM tokens (APA91b format).`);
    console.log(`   These tokens no longer work. Users must re-allow notifications in the browser.`);
    console.log(`   FIX: Clear old tokens from DB so users get fresh tokens next visit.\n`);
    
    // Auto-clear stale APA91b tokens
    const result = await User.updateMany(
      { fcmToken: { $regex: "^APA91b" } },
      { $set: { fcmToken: "", notificationEnabled: false } }
    );
    console.log(`   ✅ Cleared ${result.modifiedCount} stale APA91b token(s) from DB.`);
    console.log(`   Users will be prompted to re-subscribe on next visit.\n`);
  }

  if (subscribed === 0 && staleToken === 0) {
    console.log(`\n🚨 PROBLEM: No users have valid FCM tokens.`);
    console.log(`   Users need to visit ${process.env.FRONTEND_URL} and click "Allow" on the notification banner.\n`);
  }

  await mongoose.disconnect();
  console.log("✅ Diagnostics complete.\n");
}

run().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
