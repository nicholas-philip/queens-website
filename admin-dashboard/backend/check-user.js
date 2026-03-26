require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await Admin.findOne({ email: "emmanuellalodonu@gmail.com" });
  if (user) {
    console.log("Found user:", user);
  } else {
    console.log("No user found.");
  }
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
