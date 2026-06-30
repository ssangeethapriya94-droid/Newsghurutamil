const mongoose = require('mongoose');

const MONGO_URI = "mongodb://adminUser:newsghuru@ac-pyx1tza-shard-00-00.ixuhnzc.mongodb.net:27017,ac-pyx1tza-shard-00-01.ixuhnzc.mongodb.net:27017,ac-pyx1tza-shard-00-02.ixuhnzc.mongodb.net:27017/myAppDB?ssl=true&replicaSet=atlas-10tbk4-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});
const User = mongoose.model('User', userSchema, 'users');

const notifySchema = new mongoose.Schema({
  recipientId: mongoose.Schema.Types.ObjectId,
  text: String,
  type: String,
  read: Boolean,
  reason: String,
  createdAt: Date
});
const Notification = mongoose.model('Notification', notifySchema, 'notifications');

async function run() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB successfully");

  const users = await User.find({}, 'name email role');
  console.log("\nUSERS IN DATABASE:");
  console.log(users);

  const total = await Notification.countDocuments();
  console.log("\nTOTAL NOTIFICATIONS IN DB:", total);

  const sample = await Notification.find().sort({ createdAt: -1 }).limit(10);
  console.log("\nLATEST 10 NOTIFICATIONS IN DB:");
  console.log(JSON.stringify(sample, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
