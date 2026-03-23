// =====================================================
// middleware/validate.js
//
// Request body validation using Joi.
// Usage: router.post("/route", validate(schemas.login), handler)
//
// If validation fails → 400 with the first error message.
// If validation passes → calls next().
// =====================================================

const Joi = require("joi");

// ── Reusable field rules ───────────────────────────
const email    = Joi.string().email().lowercase().trim().required();
const password = Joi.string().min(6).required();
const token    = Joi.string().required();
const objectId = Joi.string().pattern(/^[a-f\d]{24}$/i).message("Must be a valid MongoDB ObjectId");

// ── All schemas ────────────────────────────────────
const schemas = {

  // ── AUTH ──────────────────────────────────────
  register: Joi.object({
    name:     Joi.string().trim().min(2).max(80).required(),
    email,
    password,
    role:     Joi.string().valid("SuperAdmin", "Manager", "Support").default("Manager"),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().optional(),
    code:  Joi.string().length(6).pattern(/^\d+$/).message("Code must be a 6-digit number").optional(),
  }).or("token", "code"),

  resendVerification: Joi.object({
    email,
  }),

  login: Joi.object({
    email,
    password: Joi.string().required(), // no min on login — just check presence
  }),

  forgotPassword: Joi.object({
    email,
  }),

  resetPassword: Joi.object({
    token:       Joi.string().optional(),
    code:        Joi.string().length(6).pattern(/^\d+$/).message("Code must be a 6-digit number").optional(),
    newPassword: Joi.string().min(6).required(),
  }).or("token", "code"),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword:     Joi.string().min(6).required(),
  }),

  firebaseLogin: Joi.object({
    idToken: Joi.string().required(),
  }),

  // ── PRODUCTS ──────────────────────────────────
  createProduct: Joi.object({
    title:         Joi.string().trim().min(2).max(200).required(),
    description:   Joi.string().trim().max(5000).required(),
    price:         Joi.number().min(0).required(),
    discountPrice: Joi.number().min(0).optional(),
    stockQuantity: Joi.number().integer().min(0).default(0),
    category:      objectId.required(),
    SKU:           Joi.string().trim().uppercase().optional(),
    tags:          Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    status:        Joi.string().valid("Active", "Draft", "Out of Stock").default("Draft"),
  }).options({ allowUnknown: true }), // allow extra image fields from multer

  adjustStock: Joi.object({
    adjustment: Joi.number().integer().required(),
    reason:     Joi.string().trim().max(200).optional(),
  }),

  // ── ORDERS ────────────────────────────────────
  createOrder: Joi.object({
    customerDetails: Joi.object({
      name:  Joi.string().trim().required(),
      email: Joi.string().email().lowercase().trim().required(),
      phone: Joi.string().trim().required(),
      address: Joi.object({
        street:  Joi.string().required(),
        city:    Joi.string().required(),
        state:   Joi.string().required(),
        zipCode: Joi.string().allow("").optional(),
        country: Joi.string().default("Nigeria"),
      }).required(),
    }).required(),
    items: Joi.array().items(
      Joi.object({
        productId: objectId.required(),
        quantity:  Joi.number().integer().min(1).required(),
        variantId: objectId.optional(),
      })
    ).min(1).required(),
    subtotal:       Joi.number().min(0).required(),
    discount:       Joi.number().min(0).default(0),
    shipping:       Joi.number().min(0).default(0),
    tax:            Joi.number().min(0).default(0),
    total:          Joi.number().min(0).required(),
    couponCode:     Joi.string().trim().uppercase().optional(),
    paymentMethod:  Joi.string().valid("card", "paypal", "bank_transfer", "cash_on_delivery").optional(),
    notes:          Joi.string().trim().max(500).optional(),
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string()
      .valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded")
      .required(),
    note: Joi.string().trim().max(300).optional(),
  }),

  // ── COUPONS ───────────────────────────────────
  validateCoupon: Joi.object({
    code:        Joi.string().trim().uppercase().required(),
    orderAmount: Joi.number().min(0).required(),
  }),

  createCoupon: Joi.object({
    code:             Joi.string().trim().uppercase().min(3).max(30).required(),
    description:      Joi.string().trim().max(500).optional(),
    discountType:     Joi.string().valid("percentage", "fixed").required(),
    discountValue:    Joi.number().min(0).required(),
    minOrderAmount:   Joi.number().min(0).default(0),
    maxUses:          Joi.number().integer().min(1).allow(null).optional(),
    expiryDate:       Joi.date().iso().required(),
    isActive:         Joi.boolean().default(true),
    applicableProducts: Joi.array().items(objectId).optional(),
    applicableCategories: Joi.array().items(objectId).optional(),
  }),

  // ── REVIEWS ────────────────────────────────────
  createReview: Joi.object({
    product:    objectId.required(),
    rating:     Joi.number().integer().min(1).max(5).required(),
    title:      Joi.string().trim().max(120).optional(),
    body:       Joi.string().trim().max(2000).optional(),
    customerName:  Joi.string().trim().max(80).required(),
    customerEmail: Joi.string().email().lowercase().trim().required(),
  }),

  // ── BULK OPERATIONS ───────────────────────────
  bulkUpdateOrders: Joi.object({
    ids:    Joi.array().items(objectId).min(1).required(),
    status: Joi.string()
      .valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded")
      .required(),
  }),

  bulkDeleteProducts: Joi.object({
    ids: Joi.array().items(objectId).min(1).required(),
  }),
};

// ── Middleware factory ─────────────────────────────
// Returns an Express middleware that validates req.body
// against the given Joi schema.
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message.replace(/['"]/g, ""),
    });
  }

  next();
};

module.exports = { validate, schemas };
