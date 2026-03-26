const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/phili/OneDrive/Desktop/queens-website/admin-dashboard/backend/.env' });

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const Admin = mongoose.model('Admin', new mongoose.Schema({
      firebaseUid: { type: String, sparse: true, unique: true },
      email: String
    }));

    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admins.`);

    const adminsWithNullUid = admins.filter(a => a.firebaseUid === null);
    console.log(`Admins with firebaseUid === null: ${adminsWithNullUid.length}`);
    adminsWithNullUid.forEach(a => console.log(`- ${a.email}`));

    const adminsWithNoUid = admins.filter(a => a.firebaseUid === undefined);
    console.log(`Admins with firebaseUid === undefined: ${adminsWithNoUid.length}`);

    if (adminsWithNullUid.length > 0) {
      console.log('Fixing admins with firebaseUid === null...');
      for (const admin of adminsWithNullUid) {
        await Admin.updateOne({ _id: admin._id }, { $unset: { firebaseUid: "" } });
        console.log(`Unset firebaseUid for ${admin.email}`);
      }
    }

    // Try to check for duplicate nulls/missing if index creation failed
    // But usually Mongoose handle it.

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAdmins();
