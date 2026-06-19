const mongoose = require("mongoose");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const connectDB = async () => {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB Connected"
    );

  } catch (error) {

    console.log(error);

    process.exit(1);
  }
};

module.exports = connectDB;