// =====================================================
// controllers/adminController.js
// Manage admin accounts (SuperAdmin only for most actions)
// =====================================================

const Admin       = require("../models/Admin");
const ActivityLog = require("../models/ActivityLog");
const logActivity = require("../middleware/activityLogger");
const { uploadToCloudinary } = require("../utils/Cloudinaryupload");
const { sendEmail } = require("../utils/Emailservice");
const { newAdminInviteTemplate } = require("../utils/authEmailTemplates");

const getAllAdmins = async (req, res) => {
  const admins = await Admin.find().select("-__v").sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: admins.length, admins });
};

const getAdminById = async (req, res) => {
  const admin = await Admin.findById(req.params.id).select("-__v");
  if (!admin) return res.status(404).json({ success: false, message: "Admin not found." });
  res.status(200).json({ success: true, admin });
};

const createAdmin = async (req, res) => {
  const { name, email, password, role, phone, permissions } = req.body;

  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ success: false, message: "Email already registered." });
  }

  // Use provided password or generate a secure random one
  const tempPassword = password || Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase();

  const admin = await Admin.create({
    name,
    email,
    password:        tempPassword,
    role:            role || "Manager",
    phone:           phone || null,
    permissions:     permissions || [],
    isEmailVerified: true, // Auto-verify manually created admins for immediate access
    isActive:        true,
  });

  // ── Activation link ──────────────────────────────
  const clientUrl     = process.env.ADMIN_CLIENT_URL || "http://localhost:3000";
  const loginUrl      = `${clientUrl}/auth/login`;

  const inviterName = req.admin?.name || "System";
  const { subject, html } = newAdminInviteTemplate(admin.name, inviterName, tempPassword, loginUrl);
  
  // Send email asynchronously to prevent UI freeze
  sendEmail(admin.email, subject, html).catch(err => console.error("Admin invite email failure:", err));

  await logActivity(req, "CREATED_ADMIN", `${admin.name} (${admin.email}) — Role: ${admin.role}`);

  res.status(201).json({
    success: true,
    message: `Admin account created! An invitation email is being sent to ${admin.email}.`,
    admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
};

const updateAdmin = async (req, res) => {
  const isSelf       = req.admin._id.toString() === req.params.id;
  const isSuperAdmin = req.admin.role === "SuperAdmin";
  if (!isSelf && !isSuperAdmin) return res.status(403).json({ success: false, message: "You can only update your own profile." });

  const allowed = ["name","phone"];
  if (isSuperAdmin) {
    allowed.push("role", "permissions");
  }
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (req.file) updates.avatar = await uploadToCloudinary(req.file.buffer, "avatars");

  const updated = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!updated) return res.status(404).json({ success: false, message: "Admin not found." });
  await logActivity(req, "UPDATED_ADMIN", `Admin: ${updated.name}`);
  res.status(200).json({ success: true, message: "Profile updated.", admin: updated });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (req.admin._id.toString() !== req.params.id) return res.status(403).json({ success: false, message: "Can only change your own password." });
  const admin = await Admin.findById(req.params.id).select("+password");
  if (!admin) return res.status(404).json({ success: false, message: "Admin not found." });
  const ok = await admin.comparePassword(currentPassword);
  if (!ok) return res.status(400).json({ success: false, message: "Current password is incorrect." });
  admin.password = newPassword;
  await admin.save();
  await logActivity(req, "CHANGED_PASSWORD", `Admin: ${admin.name}`);
  res.status(200).json({ success: true, message: "Password changed successfully." });
};

const deactivateAdmin = async (req, res) => {
  if (req.admin._id.toString() === req.params.id) return res.status(400).json({ success: false, message: "Cannot deactivate yourself." });
  const admin = await Admin.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!admin) return res.status(404).json({ success: false, message: "Admin not found." });
  await logActivity(req, "DEACTIVATED_ADMIN", `Admin: ${admin.name}`);
  res.status(200).json({ success: true, message: `${admin.name} deactivated.` });
};

const deleteAdmin = async (req, res) => {
  if (req.admin._id.toString() === req.params.id) return res.status(400).json({ success: false, message: "Cannot delete yourself." });
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) return res.status(404).json({ success: false, message: "Admin not found." });
  await logActivity(req, "DELETED_ADMIN", `Admin: ${admin.name} (${admin.email})`);
  res.status(200).json({ success: true, message: `${admin.name} permanently deleted.` });
};

const getAdminActivityLog = async (req, res) => {
  const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 20, skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    ActivityLog.find({ adminId: req.params.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ActivityLog.countDocuments({ adminId: req.params.id }),
  ]);
  res.status(200).json({ success: true, total, page, totalPages: Math.ceil(total / limit), logs });
};

const adminController = { getAllAdmins, getAdminById, createAdmin, updateAdmin, changePassword, deactivateAdmin, deleteAdmin, getAdminActivityLog };


// =====================================================
// controllers/notificationController.js
// =====================================================

const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  const { isRead, type, page = 1, limit = 20 } = req.query;
  const filter = { $or: [{ adminId: req.admin._id }, { adminId: null }] };
  if (isRead !== undefined) filter.isRead = isRead === "true";
  if (type) filter.type = type;
  const pg   = parseInt(page), lim = parseInt(limit), skip = (pg - 1) * lim;
  const [data, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);
  res.status(200).json({ success: true, unreadCount: unread, data, pagination: { total, page: pg, totalPages: Math.ceil(total / lim) } });
};

const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ isRead: false, $or: [{ adminId: req.admin._id }, { adminId: null }] });
  res.status(200).json({ success: true, unreadCount: count });
};

const markOneRead = async (req, res) => {
  const n = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!n) return res.status(404).json({ success: false, message: "Notification not found." });
  res.status(200).json({ success: true, message: "Marked as read.", notification: n });
};

const markAllRead = async (req, res) => {
  const result = await Notification.updateMany({ isRead: false, $or: [{ adminId: req.admin._id }, { adminId: null }] }, { $set: { isRead: true } });
  res.status(200).json({ success: true, message: `${result.modifiedCount} notification(s) marked as read.` });
};

const deleteNotification = async (req, res) => {
  const n = await Notification.findByIdAndDelete(req.params.id);
  if (!n) return res.status(404).json({ success: false, message: "Notification not found." });
  res.status(200).json({ success: true, message: "Notification deleted." });
};

const clearReadNotifications = async (req, res) => {
  const result = await Notification.deleteMany({ isRead: true, $or: [{ adminId: req.admin._id }, { adminId: null }] });
  res.status(200).json({ success: true, message: `${result.deletedCount} read notification(s) cleared.` });
};

const notificationController = { getNotifications, getUnreadCount, markOneRead, markAllRead, deleteNotification, clearReadNotifications };


// =====================================================
// controllers/settingsController.js
// =====================================================

const Settings = require("../models/Settings");
const logActivity2 = require("../middleware/activityLogger");
const { uploadToCloudinary: uploadImg } = require("../utils/Cloudinaryupload");

const getSettings = async (req, res) => {
  const settings = await Settings.load();
  res.status(200).json({ success: true, settings });
};

const updateSettings = async (req, res) => {
  const restricted = ["_id","__v","createdAt","updatedAt"];
  const updates    = {};
  Object.keys(req.body).forEach((k) => { if (!restricted.includes(k)) updates[k] = req.body[k]; });
  if (req.file) updates.logoUrl = await uploadImg(req.file.buffer, "store");

  const settings = await Settings.findOneAndUpdate({}, updates, { new: true, upsert: true, runValidators: true });
  await logActivity2(req, "UPDATED_SETTINGS", "Store Settings", `Fields: ${Object.keys(updates).join(", ")}`);
  res.status(200).json({ success: true, message: "Settings updated.", settings });
};

const toggleMaintenanceMode = async (req, res) => {
  const { enabled, message } = req.body;
  if (typeof enabled !== "boolean") return res.status(400).json({ success: false, message: "enabled must be true or false." });
  const updates = { maintenanceMode: enabled };
  if (message) updates.maintenanceMessage = message;
  const settings = await Settings.findOneAndUpdate({}, updates, { new: true, upsert: true });
  await logActivity2(req, `MAINTENANCE_MODE_${enabled ? "ON" : "OFF"}`, "Store Settings");
  res.status(200).json({ success: true, message: `Maintenance mode ${enabled ? "enabled" : "disabled"}.`, maintenanceMode: settings.maintenanceMode, maintenanceMessage: settings.maintenanceMessage });
};

const settingsController = { getSettings, updateSettings, toggleMaintenanceMode };


// =====================================================
// controllers/bulkController.js
// =====================================================

const Order2    = require("../models/Order");
const Product2  = require("../models/Product");
const Invoice2  = require("../models/Invoice");
const Category2 = require("../models/Category");
const logActivity3 = require("../middleware/activityLogger");
const { deleteFromCloudinary } = require("../utils/Cloudinaryupload");

const bulkUpdateOrderStatus = async (req, res) => {
  const { ids, status, note } = req.body;
  const valid = ["Pending","Processing","Shipped","Delivered","Cancelled"];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: `Invalid status.` });
  const log = { status, note: note || `Bulk → ${status}`, changedAt: new Date() };
  const result = await Order2.updateMany({ _id: { $in: ids } }, { $set: { currentStatus: status }, $push: { statusHistory: log } });
  await logActivity3(req, "BULK_UPDATED_ORDERS", `${result.modifiedCount} orders → ${status}`);
  res.status(200).json({ success: true, message: `${result.modifiedCount} order(s) updated to "${status}".`, modified: result.modifiedCount });
};

const bulkUpdateProductStatus = async (req, res) => {
  const { ids, status } = req.body;
  const valid = ["Active","Draft","Out of Stock"];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: `Invalid status.` });
  const filter = { _id: { $in: ids } };
  if (status === "Active") filter.stockQuantity = { $gt: 0 };
  const result = await Product2.updateMany(filter, { $set: { status } });
  await logActivity3(req, "BULK_UPDATED_PRODUCT_STATUS", `${result.modifiedCount} products → ${status}`);
  res.status(200).json({ success: true, message: `${result.modifiedCount} product(s) set to "${status}".`, modified: result.modifiedCount });
};

const bulkDeleteProducts = async (req, res) => {
  const { ids } = req.body;
  const products = await Product2.find({ _id: { $in: ids } });
  if (!products.length) return res.status(404).json({ success: false, message: "No products found." });
  const catCounts = {};
  products.forEach((p) => { const id = p.category?.toString(); if (id) catCounts[id] = (catCounts[id] || 0) + 1; });
  const allImages = products.flatMap((p) => p.images);
  await Promise.all([
    ...allImages.map(deleteFromCloudinary),
    Product2.deleteMany({ _id: { $in: ids } }),
    ...Object.entries(catCounts).map(([id, n]) => Category2.findByIdAndUpdate(id, { $inc: { productCount: -n } })),
  ]);
  await logActivity3(req, "BULK_DELETED_PRODUCTS", `${products.length} products deleted`);
  res.status(200).json({ success: true, message: `${products.length} product(s) deleted.`, deleted: products.length });
};

const bulkRestockProducts = async (req, res) => {
  const { ids, quantity, reason } = req.body;
  if (!quantity || quantity <= 0) return res.status(400).json({ success: false, message: "Quantity must be positive." });
  const result = await Product2.updateMany({ _id: { $in: ids } }, { $inc: { stockQuantity: quantity }, $set: { status: "Active" } });
  await logActivity3(req, "BULK_RESTOCKED", `${result.modifiedCount} products - +${quantity} units. Reason: ${reason || "None"}`);
  res.status(200).json({ success: true, message: `${result.modifiedCount} product(s) restocked +${quantity} units.`, modified: result.modifiedCount });
};

const bulkUpdateInvoiceStatus = async (req, res) => {
  const { ids, status } = req.body;
  const valid = ["Paid","Unpaid","Overdue"];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: `Invalid status.` });
  const result = await Invoice2.updateMany({ _id: { $in: ids } }, { $set: { status } });
  await logActivity3(req, "BULK_UPDATED_INVOICES", `${result.modifiedCount} invoices → ${status}`);
  res.status(200).json({ success: true, message: `${result.modifiedCount} invoice(s) marked "${status}".`, modified: result.modifiedCount });
};

const bulkController = { bulkUpdateOrderStatus, bulkUpdateProductStatus, bulkDeleteProducts, bulkRestockProducts, bulkUpdateInvoiceStatus };


// =====================================================
// controllers/exportController.js
// CSV export for all major data types
// =====================================================

const Order3       = require("../models/Order");
const Transaction3 = require("../models/Transaction");
const Product3     = require("../models/Product");
const Invoice3     = require("../models/Invoice");
const Customer3    = require("../models/Customer");
const logActivity4 = require("../middleware/activityLogger");

const toCSV = (headers, rows) => {
  const escape = (v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
};

const sendCSV = (res, filename, csv) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
};

const buildDateFilter = (q) => {
  const f = {};
  if (q.startDate || q.endDate) {
    f.createdAt = {};
    if (q.startDate) f.createdAt.$gte = new Date(q.startDate);
    if (q.endDate)   f.createdAt.$lte = new Date(q.endDate);
  }
  if (q.status) f.status = q.status;
  return f;
};

const exportOrders = async (req, res) => {
  const filter = buildDateFilter(req.query);
  if (req.query.status) { delete filter.status; filter.currentStatus = req.query.status; }
  const orders  = await Order3.find(filter).sort({ createdAt: -1 }).lean();
  const headers = ["Order Number","Date","Customer Name","Phone","Email","City","State","Items","Subtotal","Discount","Tax","Shipping","Total","Coupon","Status"];
  const rows    = orders.map((o) => ({
    "Order Number": o.orderNumber, "Date": new Date(o.createdAt).toLocaleDateString(),
    "Customer Name": o.customerDetails?.name || "", "Phone": o.customerDetails?.phone || "",
    "Email": o.customerDetails?.email || "", "City": o.customerDetails?.address?.city || "",
    "State": o.customerDetails?.address?.state || "", "Items": o.items?.length || 0,
    "Subtotal": o.subtotal, "Discount": o.discount || 0, "Tax": o.tax || 0,
    "Shipping": o.shipping || 0, "Total": o.total, "Coupon": o.couponCode || "", "Status": o.currentStatus,
  }));
  await logActivity4(req, "EXPORTED_ORDERS", `${rows.length} orders`);
  sendCSV(res, `orders_${Date.now()}.csv`, toCSV(headers, rows));
};

const exportTransactions = async (req, res) => {
  const transactions = await Transaction3.find(buildDateFilter(req.query)).sort({ createdAt: -1 }).populate("orderRef","orderNumber").lean();
  const headers = ["Transaction ID","Date","Order Number","Payment Method","Amount","Status","Is Member","Refund Reason"];
  const rows    = transactions.map((t) => ({
    "Transaction ID": t.transactionId, "Date": new Date(t.createdAt).toLocaleDateString(),
    "Order Number": t.orderRef?.orderNumber || "", "Payment Method": t.paymentMethod,
    "Amount": t.amount, "Status": t.status, "Is Member": t.isMember ? "Yes" : "No",
    "Refund Reason": t.refundReason || "",
  }));
  await logActivity4(req, "EXPORTED_TRANSACTIONS", `${rows.length} transactions`);
  sendCSV(res, `transactions_${Date.now()}.csv`, toCSV(headers, rows));
};

const exportProducts = async (req, res) => {
  const filter = {};
  if (req.query.status)   filter.status   = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  const products = await Product3.find(filter).populate("category","name").sort({ createdAt: -1 }).lean();
  const headers  = ["Title","SKU","Category","Price","Discount Price","Stock","Status","Total Sold","Rating","Tags","Date Added"];
  const rows     = products.map((p) => ({
    "Title": p.title, "SKU": p.SKU, "Category": p.category?.name || "",
    "Price": p.price, "Discount Price": p.discountPrice || "", "Stock": p.stockQuantity,
    "Status": p.status, "Total Sold": p.totalSold || 0, "Rating": p.averageRating || 0,
    "Tags": (p.tags || []).join("; "), "Date Added": new Date(p.createdAt).toLocaleDateString(),
  }));
  await logActivity4(req, "EXPORTED_PRODUCTS", `${rows.length} products`);
  sendCSV(res, `products_${Date.now()}.csv`, toCSV(headers, rows));
};

const exportInvoices = async (req, res) => {
  const invoices = await Invoice3.find(buildDateFilter(req.query)).sort({ createdAt: -1 }).lean();
  const headers  = ["Invoice ID","Date Issued","Due Date","Customer","Subtotal","Discount","Tax","Shipping","Total","Coupon","Status"];
  const rows     = invoices.map((i) => ({
    "Invoice ID": i.invoiceNumber, "Date Issued": new Date(i.issuedDate).toLocaleDateString(),
    "Due Date": new Date(i.dueDate).toLocaleDateString(), "Customer": i.customerName,
    "Subtotal": i.subtotal, "Discount": i.discount || 0, "Tax": i.tax || 0,
    "Shipping": i.shippingCharge || 0, "Total": i.amount, "Coupon": i.couponCode || "", "Status": i.status,
  }));
  await logActivity4(req, "EXPORTED_INVOICES", `${rows.length} invoices`);
  sendCSV(res, `invoices_${Date.now()}.csv`, toCSV(headers, rows));
};

const exportCustomers = async (req, res) => {
  const customers = await Customer3.find().sort({ totalSpent: -1 }).lean();
  const headers   = ["Name","Phone","Email","City","State","Total Orders","Total Spent","First Order","Last Order","Tags","Blocked"];
  const rows      = customers.map((c) => ({
    "Name": c.name, "Phone": c.phone, "Email": c.email || "",
    "City": c.lastAddress?.city || "", "State": c.lastAddress?.state || "",
    "Total Orders": c.totalOrders, "Total Spent": c.totalSpent,
    "First Order": c.firstOrderDate ? new Date(c.firstOrderDate).toLocaleDateString() : "",
    "Last Order":  c.lastOrderDate  ? new Date(c.lastOrderDate).toLocaleDateString()  : "",
    "Tags": (c.tags || []).join("; "), "Blocked": c.isBlocked ? "Yes" : "No",
  }));
  await logActivity4(req, "EXPORTED_CUSTOMERS", `${rows.length} customers`);
  sendCSV(res, `customers_${Date.now()}.csv`, toCSV(headers, rows));
};

const exportController = { exportOrders, exportTransactions, exportProducts, exportInvoices, exportCustomers };


// =====================================================
// controllers/searchController.js
// Global search across all collections
// =====================================================

const Product4  = require("../models/Product");
const Order4    = require("../models/Order");
const Customer4 = require("../models/Customer");
const Invoice4  = require("../models/Invoice");
const Coupon4   = require("../models/Coupon");

const globalSearch = async (req, res) => {
  const { q, limit = 5 } = req.query;
  if (!q || q.trim().length < 2) return res.status(400).json({ success: false, message: "Query must be at least 2 characters." });

  const regex   = { $regex: q.trim(), $options: "i" };
  const maxRes  = Math.min(parseInt(limit), 20);

  const [products, orders, customers, invoices, coupons] = await Promise.all([
    Product4.find({ $or: [{ title: regex }, { SKU: regex }, { tags: regex }] }).limit(maxRes).select("title SKU price status images stockQuantity").populate("category","name"),
    Order4.find({ $or: [{ orderNumber: regex }, { "customerDetails.name": regex }, { "customerDetails.phone": regex }] }).limit(maxRes).select("orderNumber customerDetails.name customerDetails.phone total currentStatus createdAt"),
    Customer4.find({ $or: [{ name: regex }, { phone: regex }, { email: regex }] }).limit(maxRes).select("name phone email totalOrders totalSpent lastOrderDate"),
    Invoice4.find({ $or: [{ invoiceNumber: regex }, { customerName: regex }] }).limit(maxRes).select("invoiceNumber customerName amount status issuedDate"),
    Coupon4.find({ code: regex }).limit(maxRes).select("code discountType discountValue isActive expiryDate usedCount"),
  ]);

  const total = products.length + orders.length + customers.length + invoices.length + coupons.length;
  res.status(200).json({
    success: true, query: q.trim(), total,
    results: {
      products:  { count: products.length,  data: products  },
      orders:    { count: orders.length,    data: orders    },
      customers: { count: customers.length, data: customers },
      invoices:  { count: invoices.length,  data: invoices  },
      coupons:   { count: coupons.length,   data: coupons   },
    },
  });
};

const searchController = { globalSearch };

module.exports = { adminController, notificationController, settingsController, bulkController, exportController, searchController };