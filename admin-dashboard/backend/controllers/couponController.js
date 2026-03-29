// =====================================================
// controllers/couponController.js
// Manages promotional coupon codes.
//
// GET    /admin/coupons             — list all
// POST   /admin/coupons             — create
// GET    /admin/coupons/:id         — single
// PUT    /admin/coupons/:id         — update
// PATCH  /admin/coupons/:id/toggle  — activate/deactivate
// DELETE /admin/coupons/:id         — delete
// POST   /coupons/validate          — public validation at checkout
// =====================================================

const Coupon      = require("../models/Coupon");
const logActivity = require("../middleware/activityLogger");

const validateCoupon = async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found.", isValid: false });
  const check = coupon.isValid(orderTotal);
  if (!check.valid) return res.status(400).json({ success: false, message: check.reason, isValid: false });
  const discountAmount = coupon.calculateDiscount(orderTotal);
  res.status(200).json({
    success: true, isValid: true, couponCode: coupon.code,
    discountType: coupon.discountType, discountValue: coupon.discountValue,
    discountAmount, originalTotal: orderTotal, newTotal: orderTotal - discountAmount,
    message: `Coupon applied! You save GH₵${discountAmount.toLocaleString()}.`,
  });
};

const getAllCoupons = async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  const now     = new Date();
  const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
  const enriched = coupons.map((c) => ({
    ...c.toObject(),
    isExpired:     now > c.expiryDate,
    remainingUses: c.maxUses ? c.maxUses - c.usedCount : "Unlimited",
  }));
  res.status(200).json({ success: true, count: coupons.length, coupons: enriched });
};

const getCouponById = async (req, res) => {
  const c = await Coupon.findById(req.params.id);
  if (!c) return res.status(404).json({ success: false, message: "Coupon not found." });
  res.status(200).json({ success: true, coupon: c });
};

const createCoupon = async (req, res) => {
  const { code } = req.body;
  const exists = await Coupon.findOne({ code: code?.trim().toUpperCase() });
  if (exists) return res.status(400).json({ success: false, message: `Coupon "${code}" already exists.` });
  const coupon = await Coupon.create(req.body);
  await logActivity(req, "CREATED_COUPON", `Coupon: ${coupon.code}`, `${coupon.discountValue}${coupon.discountType === "percentage" ? "%" : "GH₵"} off`);
  res.status(201).json({ success: true, message: `Coupon "${coupon.code}" created.`, coupon });
};

const updateCoupon = async (req, res) => {
  if (req.body.code) return res.status(400).json({ success: false, message: "Coupon code cannot be changed." });
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
  await logActivity(req, "UPDATED_COUPON", `Coupon: ${coupon.code}`);
  res.status(200).json({ success: true, message: "Coupon updated.", coupon });
};

const toggleCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  const state = coupon.isActive ? "activated" : "deactivated";
  await logActivity(req, "TOGGLED_COUPON", `Coupon: ${coupon.code}`, `Now ${state}`);
  res.status(200).json({ success: true, message: `Coupon "${coupon.code}" ${state}.`, isActive: coupon.isActive });
};

const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
  await logActivity(req, "DELETED_COUPON", `Coupon: ${coupon.code}`);
  res.status(200).json({ success: true, message: `Coupon "${coupon.code}" deleted.` });
};

module.exports = { validateCoupon, getAllCoupons, getCouponById, createCoupon, updateCoupon, toggleCoupon, deleteCoupon };
