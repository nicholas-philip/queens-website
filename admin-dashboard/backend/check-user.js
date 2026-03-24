const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/phili/OneDrive/Desktop/queens-website/admin-dashboard/backend/.env' });
const Admin = require('c:/Users/phili/OneDrive/Desktop/queens-website/admin-dashboard/backend/models/Admin.js');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await Admin.findOne({ email: 'philipnicholas386@gmail.com' });
        if (admin) {
            console.log("LOG: User Found.");
            console.log("LOG: Verified?", admin.isEmailVerified);
            console.log("LOG: AuthProvider?", admin.authProvider);
            console.log("LOG: Has Password?", !!admin.password);
        } else {
            console.log("LOG: User Not Found.");
        }
    } catch (err) {
        console.error("ERROR:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}
checkUser();
