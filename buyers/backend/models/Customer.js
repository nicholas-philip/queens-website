// =====================================================
// models/Customer.js
// Shared CRM model.
// =====================================================

const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, default: null, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },

    lastAddress: {
      street:  { type: String, default: "" },
      city:    { type: String, default: "" },
      state:   { type: String, default: "" },
      country: { type: String, default: "Ghana" },
    },

    totalSpent:    { type: Number, default: 0, min: 0 },
    totalOrders:   { type: Number, default: 0, min: 0 },

    firstOrderDate: { type: Date, default: null },
    lastOrderDate:  { type: Date, default: null },

    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    tags:   { type: [String], default: [] },
    notes:  { type: String,   default: "" },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Upsert from an order (Static method)
CustomerSchema.statics.updateFromOrder = async function (order) {
  const { customerDetails, total, _id: orderId, createdAt } = order;
  const now = createdAt || new Date();

  let customer = await this.findOne({ phone: customerDetails.phone });

  if (customer) {
    customer.totalSpent  += total;
    customer.totalOrders += 1;
    customer.lastOrderDate = now;
    customer.lastAddress = {
      street:  customerDetails.address?.street  || "",
      city:    customerDetails.address?.city    || "",
      state:   customerDetails.address?.state   || "",
      country: customerDetails.address?.country || "Ghana",
    };
    if (customerDetails.email && !customer.email) customer.email = customerDetails.email;
    customer.orders.push(orderId);
    await customer.save();
  } else {
    customer = await this.create({
      name:         customerDetails.name,
      phone:        customerDetails.phone,
      email:        customerDetails.email || null,
      lastAddress: {
        street:  customerDetails.address?.street  || "",
        city:    customerDetails.address?.city    || "",
        state:   customerDetails.address?.state   || "",
        country: customerDetails.address?.country || "Ghana",
      },
      totalSpent:     total,
      totalOrders:    1,
      firstOrderDate: now,
      lastOrderDate:  now,
      orders:         [orderId],
    });
  }
  return customer;
};

module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
