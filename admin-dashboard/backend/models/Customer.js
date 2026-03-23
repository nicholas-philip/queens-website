// =====================================================
// models/Customer.js
// CRM system — auto-updates when customers place orders.
// =====================================================

const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true, unique: true },
  address: { type: String },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
}, { timestamps: true });

// A helper function to create or update a customer based on an order
CustomerSchema.statics.updateFromOrder = async function (order) {
  const { customerDetails, total } = order;
  let customer = await this.findOne({ phone: customerDetails.phone });

  if (customer) {
    customer.totalSpent += total;
    customer.orderCount += 1;
    customer.orders.push(order._id);
    await customer.save();
  } else {
    customer = await this.create({
      name: customerDetails.name,
      phone: customerDetails.phone,
      email: customerDetails.email,
      address: `${customerDetails.address.street}, ${customerDetails.address.city}`,
      totalSpent: total,
      orderCount: 1,
      orders: [order._id],
    });
  }
  return customer;
};

module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);