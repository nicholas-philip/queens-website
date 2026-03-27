// =====================================================
// controllers/alertController.js
// Back-in-stock alerts + recently viewed (session)
// =====================================================

const BackInStockAlert = require("../models/BackinStockAlert")
const Product          = require("../models/Product")

// POST /api/alerts/back-in-stock
const subscribeBackInStock = async (req, res) => {
  const { productId, email, firstName, variantId } = req.body
  if (!productId || !email) {
    return res.status(400).json({ success: false, message: "productId and email required." })
  }

  const product = await Product.findById(productId)
  if (!product) return res.status(404).json({ success: false, message: "Product not found." })

  // If actually in stock, don't create alert
  if (product.stockQuantity > 0 && product.status === "Active") {
    return res.status(400).json({ success: false, message: "This product is currently in stock!" })
  }

  try {
    await BackInStockAlert.create({ productId, email, firstName: firstName || "", variantId: variantId || null })
    res.status(201).json({
      success: true,
      message: `We'll email you at ${email} the moment "${product.title}" is back in stock! 🔔`,
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ success: true, message: "You're already on the waitlist for this product!" })
    }
    throw err
  }
}

const alertController = { subscribeBackInStock }


// =====================================================
// controllers/returnController.js
// Customer-initiated return/exchange requests
// =====================================================

const ReturnRequest = require("../models/ReturnRequest")
const Order         = require("../models/Order")

// POST /api/returns
const submitReturn = async (req, res) => {
  const { orderNumber, customerEmail, customerPhone, type, items, reason, description } = req.body
  if (!orderNumber || !customerPhone || !type || !items?.length || !reason) {
    return res.status(400).json({ success: false, message: "orderNumber, customerPhone, type, items and reason are required." })
  }

  // Verify the order exists and matches the customer
  const order = await Order.findOne({ orderNumber })
  if (!order) return res.status(404).json({ success: false, message: "Order not found. Check your order number." })

  if (order.customerDetails.phone !== customerPhone) {
    return res.status(403).json({ success: false, message: "Phone number doesn't match this order." })
  }

  // Check if delivered (can only return delivered orders)
  if (order.currentStatus !== "Delivered") {
    return res.status(400).json({ success: false, message: "Returns can only be requested for delivered orders." })
  }

  // Check if already submitted
  const existing = await ReturnRequest.findOne({ orderRef: order._id, status: { $nin: ["Rejected"] } })
  if (existing) {
    return res.status(400).json({ success: false, message: `A ${existing.type} request already exists for this order (Status: ${existing.status}).` })
  }

  const request = await ReturnRequest.create({
    orderRef:      order._id,
    orderNumber,
    customerName:  order.customerDetails.name,
    customerEmail: customerEmail || order.customerDetails.email || "",
    customerPhone,
    type,
    items,
    reason,
    description:   description || "",
    status:        "Pending",
  })

  res.status(201).json({
    success: true,
    message: `Your ${type.toLowerCase()} request has been submitted. Our team will review it within 24-48 hours.`,
    requestId: request._id,
    status:    request.status,
  })
}

// GET /api/returns/track?orderNumber=...&phone=...
const trackReturn = async (req, res) => {
  const { orderNumber, phone } = req.query
  if (!orderNumber || !phone) {
    return res.status(400).json({ success: false, message: "orderNumber and phone required." })
  }

  const requests = await ReturnRequest.find({
    orderNumber,
    customerPhone: phone,
  }).select("type reason status adminNote refundAmount createdAt resolvedAt")

  if (!requests.length) {
    return res.status(404).json({ success: false, message: "No return requests found for this order." })
  }

  res.status(200).json({ success: true, requests })
}

const returnController = { submitReturn, trackReturn }


// =====================================================
// controllers/giftCardController.js
// =====================================================

const GiftCard = require("../models/GiftCard")
const { sendEmail } = require("../utils/emailService")

// POST /api/gift-cards/purchase
const purchaseGiftCard = async (req, res) => {
  const { amount, purchaserName, purchaserEmail, recipientName, recipientEmail, personalMessage } = req.body

  if (!amount || !purchaserName || !purchaserEmail || !recipientName || !recipientEmail) {
    return res.status(400).json({ success: false, message: "All fields are required." })
  }

  const validAmounts = [2000, 5000, 10000, 20000, 50000]
  if (!validAmounts.includes(Number(amount))) {
    return res.status(400).json({ success: false, message: `Gift card amounts: ${validAmounts.map(a => `GHS ${a.toLocaleString()}`).join(", ")}` })
  }

  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 1) // expires in 1 year

  const card = await GiftCard.create({
    initialBalance: amount,
    purchaserEmail, purchaserName,
    recipientEmail, recipientName,
    personalMessage: personalMessage || "",
    expiryDate,
  })

  // Send gift card to recipient
  const html = `
    <div style="font-family:Georgia,serif;background:#0a0a0a;padding:20px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:32px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:#c9a96e;letter-spacing:3px">✦ GlossyKiss ✦</div>
        <div style="color:#888;font-size:11px;letter-spacing:2px">GIFT CARD</div>
      </div>
      <div style="height:3px;background:linear-gradient(90deg,#c9a96e,#f0d090,#c9a96e)"></div>
      <div style="padding:32px;text-align:center">
        <p style="font-size:14px;color:#555">Hi <strong>${recipientName}</strong>,</p>
        <p style="font-size:14px;color:#555"><strong>${purchaserName}</strong> has sent you a GlossyKiss gift card!</p>
        ${personalMessage ? `<p style="font-style:italic;color:#888;border-left:3px solid #c9a96e;padding-left:12px;text-align:left">"${personalMessage}"</p>` : ""}
        <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:24px;border-radius:12px;margin:20px 0">
          <div style="color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase">Gift Card Value</div>
          <div style="color:#c9a96e;font-size:36px;font-weight:700">GHS ${Number(amount).toLocaleString()}</div>
          <div style="color:#f5f0e8;font-size:18px;letter-spacing:4px;font-family:monospace;margin-top:12px">${card.code}</div>
        </div>
        <p style="font-size:12px;color:#888">Enter this code at checkout. Valid until ${expiryDate.toLocaleDateString("en-NG", { day:"numeric",month:"long",year:"numeric" })}.</p>
        <a href="https://www.glossykisscosmetics.store/shop" style="display:inline-block;background:linear-gradient(135deg,#c9a96e,#b8935a);color:#fff;padding:13px 30px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:16px">Shop Now</a>
      </div>
    </div>
    </div>`

  await sendEmail(recipientEmail, `You've received a GlossyKiss Gift Card! 💋`, html)

  card.isSent   = true
  card.sentAt   = new Date()
  await card.save()

  res.status(201).json({
    success: true,
    message: `Gift card of GHS ${Number(amount).toLocaleString()} sent to ${recipientEmail}! 🎁`,
    giftCard: { code: card.code, amount, expiryDate, recipientEmail },
  })
}

// POST /api/gift-cards/validate
const validateGiftCard = async (req, res) => {
  const { code, orderTotal } = req.body
  if (!code) return res.status(400).json({ success: false, message: "Gift card code required." })

  const card = await GiftCard.findOne({ code: code.trim().toUpperCase(), isActive: true })
  if (!card)          return res.status(404).json({ success: false, message: "Gift card not found or invalid." })
  if (!card.isActive) return res.status(400).json({ success: false, message: "This gift card has been deactivated." })
  if (card.balance <= 0) return res.status(400).json({ success: false, message: "This gift card has no remaining balance." })
  if (new Date() > card.expiryDate) return res.status(400).json({ success: false, message: "This gift card has expired." })

  const applicable = Math.min(card.balance, Number(orderTotal) || card.balance)

  res.status(200).json({
    success: true, isValid: true,
    balance:     card.balance,
    applicable,
    newTotal:    Math.max((Number(orderTotal) || 0) - applicable, 0),
    message:     `Gift card valid! GHS ${card.balance.toLocaleString()} remaining.`,
  })
}

// GET /api/gift-cards/balance/:code
const checkBalance = async (req, res) => {
  const card = await GiftCard.findOne({ code: req.params.code.toUpperCase() })
    .select("code balance initialBalance expiryDate isActive")
  if (!card) return res.status(404).json({ success: false, message: "Gift card not found." })
  res.status(200).json({
    success: true, code: card.code,
    balance: card.balance, initialBalance: card.initialBalance,
    expiryDate: card.expiryDate, isActive: card.isActive,
  })
}

const giftCardController = { purchaseGiftCard, validateGiftCard, checkBalance }

module.exports = { alertController, returnController, giftCardController }