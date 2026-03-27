// =====================================================
// controllers/loyaltyController.js
// GlossyKiss Rewards — no login, phone-based
// =====================================================

const LoyaltyPoints = require("../models/LoyaltyPoints")
const Coupon        = require("../models/Coupon")

// GET /api/loyalty/:phone
const getLoyaltyAccount = async (req, res) => {
  const account = await LoyaltyPoints.findOne({ phone: req.params.phone })
    .select("-transactions")

  if (!account) {
    return res.status(200).json({
      success:  true,
      exists:   false,
      message:  "No rewards account found for this phone number. You'll be enrolled automatically on your first order!",
    })
  }

  // Points value in naira
  const pointsValue = Math.floor(account.currentBalance / 100) * 500

  res.status(200).json({
    success:      true,
    exists:       true,
    account: {
      phone:          account.phone,
      firstName:      account.firstName,
      tier:           account.tier,
      currentBalance: account.currentBalance,
      pointsValue,    // GHS value of current points
      totalEarned:    account.totalEarned,
      totalRedeemed:  account.totalRedeemed,
      lastActivityAt: account.lastActivityAt,
    },
  })
}

// GET /api/loyalty/:phone/history
const getLoyaltyHistory = async (req, res) => {
  const account = await LoyaltyPoints.findOne({ phone: req.params.phone })
  if (!account) return res.status(404).json({ success: false, message: "No account found." })

  const history = [...account.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 50)

  res.status(200).json({ success: true, balance: account.currentBalance, tier: account.tier, history })
}

// POST /api/loyalty/redeem
// Body: { phone, points, orderId }
const redeemPoints = async (req, res) => {
  const { phone, points } = req.body
  if (!phone || !points || points < 100) {
    return res.status(400).json({ success: false, message: "Minimum redemption is 100 points (GHS 5)." })
  }

  const account = await LoyaltyPoints.findOne({ phone })
  if (!account) return res.status(404).json({ success: false, message: "No rewards account found." })
  if (account.currentBalance < points) {
    return res.status(400).json({ success: false, message: `Insufficient points. You have ${account.currentBalance} points.` })
  }

  // Create a one-time coupon for the discount
  const discount = account.redeemPoints(points)
  await account.save()

  // Generate a single-use coupon code
  const code = `RWRD-${phone.slice(-4)}-${Date.now().toString(36).toUpperCase()}`
  await Coupon.create({
    code,
    description:   `Rewards redemption — ${points} points`,
    discountType:  "fixed",
    discountValue: discount,
    maxUses:       1,
    expiryDate:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive:      true,
  })

  res.status(200).json({
    success:   true,
    message:   `Redeemed ${points} points for a GHS ${discount.toLocaleString()} discount!`,
    couponCode: code,
    discount,
    newBalance: account.currentBalance,
  })
}

const loyaltyController = { getLoyaltyAccount, getLoyaltyHistory, redeemPoints }


// =====================================================
// controllers/referralController.js
// =====================================================

const Referral = require("../models/Referral")
const Coupon2  = require("../models/Coupon")

// POST /api/referral/register — get your referral link
const registerReferral = async (req, res) => {
  const { email, name, phone } = req.body
  if (!email || !name) return res.status(400).json({ success: false, message: "Email and name required." })

  let referral = await Referral.findOne({ referrerEmail: email.toLowerCase() })

  if (!referral) {
    referral = await Referral.create({
      referrerEmail: email,
      referrerName:  name,
      referrerPhone: phone || "",
    })
  }

  const link = `https://www.glossykisscosmetics.store/shop?ref=${referral.referralCode}`

  res.status(200).json({
    success: true,
    referralCode: referral.referralCode,
    referralLink: link,
    totalReferrals:      referral.totalReferrals,
    successfulReferrals: referral.successfulReferrals,
    totalRewardsEarned:  referral.totalRewardsEarned,
    message: `Share your link and earn GHS 50 for every friend who makes their first purchase!`,
  })
}

// GET /api/referral/validate/:code — check if a referral code is valid
const validateReferralCode = async (req, res) => {
  const referral = await Referral.findOne({ referralCode: req.params.code.toUpperCase(), isActive: true })
  if (!referral) return res.status(404).json({ success: false, message: "Invalid referral code." })
  res.status(200).json({
    success: true,
    isValid: true,
    referrerName: referral.referrerName,
    message: `You've been referred by ${referral.referrerName}! You'll get GHS 5 off your first order.`,
  })
}

// GET /api/referral/stats/:email — get referral stats
const getReferralStats = async (req, res) => {
  const referral = await Referral.findOne({ referrerEmail: req.params.email.toLowerCase() })
  if (!referral) return res.status(404).json({ success: false, message: "No referral account found." })

  res.status(200).json({
    success:             true,
    referralCode:        referral.referralCode,
    totalReferrals:      referral.totalReferrals,
    successfulReferrals: referral.successfulReferrals,
    totalRewardsEarned:  referral.totalRewardsEarned,
    referredCustomers:   referral.referredCustomers.slice(0, 20),
    rewardCoupons:       referral.rewardCoupons.filter(c => !c.isUsed),
  })
}

const referralController = { registerReferral, validateReferralCode, getReferralStats }


// =====================================================
// controllers/quizController.js — Beauty Finder Quiz
// =====================================================

const QuizResult = require("../models/BeautyQuiz")
const Product2   = require("../models/Product")
const Newsletter = require("../models/Newsletter")
const { sendNewsletterWelcome } = require("../utils/emailService")

// POST /api/quiz/submit
// Takes quiz answers, recommends products, optionally saves email
const submitQuiz = async (req, res) => {
  const { answers, email, firstName, sessionId, subscribeNewsletter } = req.body

  if (!answers || !sessionId) {
    return res.status(400).json({ success: false, message: "answers and sessionId required." })
  }

  // Build product filter based on quiz answers
  const filter = { status: "Active" }
  const tagFilters = []

  if (answers.skinType)    tagFilters.push(answers.skinType)
  if (answers.skinTone)    tagFilters.push(answers.skinTone)
  if (answers.makeupStyle) tagFilters.push(answers.makeupStyle)
  if (answers.perfumeFamily) tagFilters.push(answers.perfumeFamily)

  if (answers.skinConcerns?.length) {
    tagFilters.push(...answers.skinConcerns)
  }

  if (tagFilters.length > 0) {
    filter.tags = { $in: tagFilters }
  }

  // Budget filter
  if (answers.budget === "under-5000")   filter.price = { $lte: 5000 }
  if (answers.budget === "5000-15000")   filter.price = { $gte: 5000, $lte: 15000 }
  if (answers.budget === "15000-plus")   filter.price = { $gte: 15000 }

  let recommended = await Product2.find(filter)
    .sort({ averageRating: -1, totalSold: -1 })
    .limit(8)
    .select("title price discountPrice images SKU averageRating reviewCount tags")

  // Fallback: if no matches, return best sellers
  if (recommended.length < 3) {
    recommended = await Product2.find({ status: "Active" })
      .sort({ totalSold: -1 })
      .limit(8)
      .select("title price discountPrice images SKU averageRating reviewCount tags")
  }

  const productIds = recommended.map(p => p._id)

  // Save quiz result
  await QuizResult.create({
    answers,
    recommendedProducts:  productIds,
    email:                email || null,
    firstName:            firstName || "",
    subscribedNewsletter: subscribeNewsletter || false,
    sessionId,
  })

  // Handle newsletter subscription from quiz
  if (email && subscribeNewsletter) {
    const existing = await Newsletter.findOne({ email: email.toLowerCase() })
    if (!existing) {
      await Newsletter.create({ email, firstName: firstName || "", source: "beauty-quiz", isVerified: true })
      await sendNewsletterWelcome(email, firstName)
    }
  }

  res.status(200).json({
    success: true,
    message: "Your personalised picks are ready! 💄",
    recommendations: recommended,
    quizSummary: {
      skinType:    answers.skinType,
      makeupStyle: answers.makeupStyle,
      budget:      answers.budget,
    },
  })
}

const quizController = { submitQuiz }

module.exports = { loyaltyController, referralController, quizController }