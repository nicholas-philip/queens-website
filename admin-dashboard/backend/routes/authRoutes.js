const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { verifyAdmin } = require("../middleware/verifyAdmin");

// Public Auth
router.post("/register", auth.registerAdmin);
router.post("/login", auth.loginAdmin);
router.post("/verify-email", auth.verifyEmail);
router.post("/resend-verification", auth.resendVerification);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

// Firebase Auth
router.post("/firebase-login", auth.firebaseLogin);

// Protected Auth
router.get("/me", verifyAdmin, auth.getMyProfile);
router.post("/change-password", verifyAdmin, auth.changePassword);
router.post("/logout", verifyAdmin, auth.logoutAdmin);
router.post("/firebase-link", verifyAdmin, auth.firebaseLink);

module.exports = router;
