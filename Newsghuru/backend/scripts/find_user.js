const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.findById("6a2938ff427fc7b8cca3e89e");
  const fs = require("fs");
  fs.writeFileSync("user_found.json", JSON.stringify(u, null, 2));
  await mongoose.disconnect();
}
run().catch(console.error);
