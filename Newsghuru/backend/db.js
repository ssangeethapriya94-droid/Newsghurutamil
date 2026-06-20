const mongoose = require("mongoose");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const connectDB = async () => {

  try {

    await mongoose.connect(
      process.env.MONGO_URI,
      {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000
      }
    );

    console.log(
      "MongoDB Connected"
    );

  } catch (error) {

    console.error("MongoDB Connection Error:", error);
    throw error;

  }
};

module.exports = connectDB;