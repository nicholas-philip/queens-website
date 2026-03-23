// =====================================================
// controllers/customerController.js
// CRM for the Customers page of the dashboard.
//
// GET    /api/admin/customers          — list
// GET    /api/admin/customers/stats    — analytics
// GET    /api/admin/customers/:id      — detail + order history
// PATCH  /api/admin/customers/:id/tags
// PATCH  /api/admin/customers/:id/notes
// PATCH  /api/admin/customers/:id/block
// DELETE /api/admin/customers/:id
// =====================================================

const Customer    = require("../models/Customer");
const Order       = require("../models/Order");
const logActivity = require("../middleware/activityLogger");

const getAllCustomers = async (req, res) => {
  const { search, isBlocked, city, page = 1, limit = 20, sortBy = "lastOrderDate", sortOrder = "desc" } = req.query;

  const filter = {};
  if (search) filter.$or = [
    { name:  { $regex: search, $options: "i" } },
    { phone: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === "true";
  if (city)                    filter["lastAddress.city"] = { $regex: city, $options: "i" };

  const pg   = parseInt(page), lim = parseInt(limit), skip = (pg - 1) * lim;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [data, total] = await Promise.all([
    Customer.find(filter).sort(sort).skip(skip).limit(lim).select("-orders -__v"),
    Customer.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, data, pagination: { total, page: pg, totalPages: Math.ceil(total / lim) } });
};

const getCustomerStats = async (req, res) => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [total, newThisMonth, topSpenders, avgResult, topCities] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ firstOrderDate: { $gte: startOfMonth } }),
    Customer.find().sort({ totalSpent: -1 }).limit(5).select("name phone email totalSpent totalOrders lastOrderDate"),
    Customer.aggregate([{ $group: { _id: null, avg: { $avg: "$totalSpent" } } }]),
    Customer.aggregate([
      { $group: { _id: "$lastAddress.city", count: { $sum: 1 } } },
      { $project: { _id: 0, city: "$_id", count: 1 } },
      { $sort: { count: -1 } }, { $limit: 5 },
    ]),
  ]);
  res.status(200).json({ success: true, stats: { total, newThisMonth, avgSpend: Math.round(avgResult[0]?.avg || 0), topSpenders, topCities } });
};

const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });
  const orders = await Order.find({ _id: { $in: customer.orders } })
    .sort({ createdAt: -1 }).select("orderNumber total currentStatus createdAt items couponCode");
  res.status(200).json({ success: true, customer, orders });
};

const updateCustomerTags = async (req, res) => {
  const { tags } = req.body;
  if (!Array.isArray(tags)) return res.status(400).json({ success: false, message: "tags must be an array." });
  const c = await Customer.findByIdAndUpdate(req.params.id, { tags }, { new: true });
  if (!c) return res.status(404).json({ success: false, message: "Customer not found." });
  res.status(200).json({ success: true, message: "Tags updated.", tags: c.tags });
};

const updateCustomerNotes = async (req, res) => {
  const c = await Customer.findByIdAndUpdate(req.params.id, { notes: req.body.notes || "" }, { new: true });
  if (!c) return res.status(404).json({ success: false, message: "Customer not found." });
  res.status(200).json({ success: true, message: "Notes saved.", notes: c.notes });
};

const toggleBlockCustomer = async (req, res) => {
  const c = await Customer.findById(req.params.id);
  if (!c) return res.status(404).json({ success: false, message: "Customer not found." });
  c.isBlocked = !c.isBlocked;
  await c.save();
  const state = c.isBlocked ? "blocked" : "unblocked";
  await logActivity(req, c.isBlocked ? "BLOCKED_CUSTOMER" : "UNBLOCKED_CUSTOMER", `${c.name} (${c.phone})`);
  res.status(200).json({ success: true, message: `${c.name} ${state}.`, isBlocked: c.isBlocked });
};

const deleteCustomer = async (req, res) => {
  const c = await Customer.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ success: false, message: "Customer not found." });
  await logActivity(req, "DELETED_CUSTOMER", `${c.name} (${c.phone})`);
  res.status(200).json({ success: true, message: `Customer record deleted. Orders preserved.` });
};

module.exports = { getAllCustomers, getCustomerStats, getCustomerById, updateCustomerTags, updateCustomerNotes, toggleBlockCustomer, deleteCustomer };