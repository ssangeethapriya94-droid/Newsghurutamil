const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const GuestSubscription = require("./models/GuestSubscription");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const users = await User.find({}, { email: 1, fcmToken: 1, isSubscribed: 1, notificationEnabled: 1 });
  console.log("\n--- Users ---");
  users.forEach(u => {
    console.log(`Email: ${u.email} | Subscribed: ${u.isSubscribed} | Enabled: ${u.notificationEnabled} | Token: ${u.fcmToken ? u.fcmToken.substring(0, 30) + "..." : "(none)"}`);
  });

  const guests = await GuestSubscription.find({});
  console.log("\n--- Guests ---");
  guests.forEach(g => {
    console.log(`ID: ${g._id} | Language: ${g.language} | Token: ${g.fcmToken ? g.gcmToken || g.fcmToken.substring(0, 30) + "..." : "(none)"}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
