// =====================================================
// components/CheckoutModal.jsx
//
// Payment Methods:
//   - Manual MoMo (ACTIVE) — sends paymentMethod:'Manual MoMo' to backend
//   - Paystack (DISABLED)  — shown but non-clickable until enabled
// =====================================================

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShoppingCart, User, Truck, CreditCard,
  ChevronRight, ChevronLeft, Trash2, Plus, Minus,
  CheckCircle, Tag, AlertCircle, Lock, Smartphone, Clock
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useToast } from '../context/ToastContext';
import api from '../api';
import logo from '../assets/logo.png';

// ── Validation helpers ───────────────────────────────
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => /^(\+?233|0)[235]\d{8}$/.test(v.replace(/\s/g, ''));

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Northern',
  'Central', 'Eastern', 'Volta', 'Upper East', 'Upper West',
  'Brong-Ahafo', 'Oti', 'Bono', 'Ahafo', 'Western North',
  'North East', 'Savannah',
];

const SHIPPING_OPTIONS = [
  { id: 'pickup',   name: 'Store Pickup',      price: 0, time: 'Pick up your order for free', disabled: true },
  { id: 'delivery', name: 'Standard Delivery', price: 0, time: 'Delivery fee will be communicated after checkout' },
];

const MOMO_NAME   = 'Samuel Kwesi Nyarko';
const MOMO_NUMBER = '053 647 9169';

// ── Step indicator ───────────────────────────────────
const STEPS = ['Bag', 'Details', 'Shipping', 'Payment'];

const StepBar = ({ current }) => (
  <div className="flex items-center gap-2">
    {STEPS.map((label, i) => {
      const idx   = i + 1;
      const done  = idx < current;
      const active = idx === current;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              done   ? 'bg-gold text-black-rich' :
              active ? 'bg-gold/20 border border-gold text-gold' :
                       'bg-white/5 border border-white/10 text-white/30'
            }`}>
              {done ? '✓' : idx}
            </div>
            <span className={`hidden sm:block text-xs uppercase tracking-widest font-bold transition-colors ${
              active ? 'text-gold' : done ? 'text-white/60' : 'text-white/20'
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mb-4 transition-all duration-500 ${idx < current ? 'bg-gold' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Input component ──────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">{label}</label>
    {children}
    {error && (
      <p className="text-red-400 text-xs flex items-center gap-1 ml-1">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all placeholder:text-white/20
      ${error ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-gold'}`}
  />
);

const Select = ({ error, children, ...props }) => (
  <select
    {...props}
    className={`w-full bg-[#1a1814] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all
      ${error ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-gold'}`}
  >
    {children}
  </select>
);

// ── Main modal ───────────────────────────────────────
const CheckoutModal = () => {
  const toast = useToast();
  const {
    isCheckoutOpen, setCheckoutOpen,
    cartItems, removeFromCart, updateQuantity,
    cartTotal, itemCount, clearCart,
  } = useCartStore();

  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});
  const [paymentMethod, setPaymentMethod] = useState('Paystack');
  // momoStage: 'select' | 'instructions' | 'success'
  const [momoStage, setMomoStage]   = useState('select');
  const [orderResult, setOrderResult] = useState(null);

  // ── Geolocation & Dynamic Leaflet Map States ──────────
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [coordinates, setCoordinates]     = useState(null); // { lat, lng }
  const [gpsLink, setGpsLink]             = useState('');
  const [mapError, setMapError]           = useState('');
  const [mapSearching, setMapSearching]   = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    whatsapp: '', address: '', city: '', region: 'Greater Accra',
    orderNotes: '',
  });

  const [shippingMethod, setShippingMethod] = useState(null);
  const [couponCode, setCouponCode]         = useState('');
  const [couponResult, setCouponResult]     = useState(null);
  const [couponLoading, setCouponLoading]   = useState(false);

  const subtotal = cartTotal();
  const shipping = shippingMethod?.price ?? 0;
  const discount = couponResult?.discountAmount ?? 0;
  const total    = subtotal + shipping - discount;
  // ── Geolocation & Leaflet Map ────────────────────────
  useEffect(() => {
    if (!isCheckoutOpen) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, [isCheckoutOpen]);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setMapError("Geolocation is not supported by your browser.");
      return;
    }
    setMapSearching(true);
    setMapError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setGpsLink(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setMapSearching(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        setMapError("Could not access your location. Please check browser permissions or enter it manually.");
        setMapSearching(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!coordinates || !leafletLoaded || !isCheckoutOpen) return;

    const timer = setTimeout(() => {
      const mapContainer = document.getElementById('checkout-map');
      if (!mapContainer) return;

      if (window.checkoutMapInstance) {
        window.checkoutMapInstance.remove();
      }

      // Initialize Leaflet map centered at our coordinates
      const map = window.L.map('checkout-map', {
        zoomControl: false
      }).setView([coordinates.lat, coordinates.lng], 16);

      window.checkoutMapInstance = map;

      // Add Zoom control at top-right
      window.L.control.zoom({ position: 'topright' }).addTo(map);

      // Premium Dark Mode Tiles (CartoDB Dark Matter)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '© OpenStreetMap & CartoDB'
      }).addTo(map);

      // Bolt style - When the map is dragged, update the location details based on center coordinate
      map.on('moveend', () => {
        const center = map.getCenter();
        setCoordinates({ lat: center.lat, lng: center.lng });
        setGpsLink(`https://www.google.com/maps?q=${center.lat},${center.lng}`);
      });

    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [coordinates, leafletLoaded, isCheckoutOpen]);

  // ── Field change ────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  }, [errors]);

  // ── Step 2 validation ────────────────────────────────
  const validateDetails = () => {
    const errs = {};
    if (!formData.firstName.trim())       errs.firstName = 'Required';
    if (!formData.lastName.trim())        errs.lastName  = 'Required';
    if (!isValidEmail(formData.email))    errs.email     = 'Valid email required';
    if (!isValidPhone(formData.whatsapp)) errs.whatsapp  = 'Valid Ghanaian number required';
    if (!formData.address.trim())         errs.address   = 'Required';
    if (!formData.city.trim())            errs.city      = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && !validateDetails()) return;
    setStep(s => s + 1);
  };

  // ── Coupon validation ────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/orders/coupon', {
        code: couponCode.trim().toUpperCase(),
        orderTotal: subtotal,
      });
      setCouponResult({ discountAmount: data.discountAmount, message: data.message });
    } catch (err) {
      setCouponResult({ discountAmount: 0, message: err.response?.data?.message || 'Invalid code' });
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Place order (Manual MoMo) ────────────────────────
  const handlePlaceManualOrder = async () => {
    if (!shippingMethod) return;
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('queens_session_id');
      const fullAddress = gpsLink 
        ? `${formData.address.trim()} (GPS: ${gpsLink})`
        : formData.address.trim();

      const { data: orderData } = await api.post('/orders', {
        paymentMethod: 'Manual MoMo',
        metadata: { sessionId },
        customerDetails: {
          name:    `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email:   formData.email.trim(),
          phone:   formData.whatsapp.trim(),
          address: {
            street:  fullAddress,
            city:    formData.city.trim(),
            state:   formData.region,
            country: 'Ghana',
          },
        },
        items: cartItems.map(item => ({
          productId:    item.product._id,
          quantity:     item.quantity,
          selectedSize:  item.product.selectedSize,
          selectedColor: item.product.selectedColor,
        })),
        shipping:   shippingMethod.price,
        couponCode: couponCode.trim() || undefined,
        tax:        0,
      });

      if (!orderData.success) throw new Error(orderData.message);

      setOrderResult(orderData.order);
      clearCart();
      setMomoStage('success');
    } catch (err) {
      console.error('Checkout error:', err.response?.data || err.message);
      const isTimeout = err.message === 'Network Error' || err.response?.status === 502 || err.response?.status === 504;
      if (isTimeout) {
        toast.info('Waking up server...', 'Please wait 10 seconds and try again.');
      } else {
        toast.error('Checkout Error', err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Place order & Pay via Paystack ───────────────────
  const handlePaystackCheckout = async () => {
    if (!shippingMethod) return;
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('queens_session_id');
      const fullAddress = gpsLink 
        ? `${formData.address.trim()} (GPS: ${gpsLink})`
        : formData.address.trim();

      // 1. Create order in Database
      const { data: orderData } = await api.post('/orders', {
        paymentMethod: 'Paystack',
        metadata: { sessionId },
        customerDetails: {
          name:    `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email:   formData.email.trim(),
          phone:   formData.whatsapp.trim(),
          address: {
            street:  fullAddress,
            city:    formData.city.trim(),
            state:   formData.region,
            country: 'Ghana',
          },
        },
        items: cartItems.map(item => ({
          productId:    item.product._id,
          quantity:     item.quantity,
          selectedSize:  item.product.selectedSize,
          selectedColor: item.product.selectedColor,
        })),
        shipping:   shippingMethod.price,
        couponCode: couponCode.trim() || undefined,
        tax:        0,
      });

      if (!orderData.success) throw new Error(orderData.message);

      // 2. Initialize Paystack Transaction
      const { data: paystackData } = await api.post('/payment/initialize', {
        orderId: orderData.order._id,
        channel: 'all' // Allows both card and mobile money
      });

      if (!paystackData.success) throw new Error(paystackData.message);

      // 3. Clear cart and redirect to Paystack
      clearCart();
      window.location.href = paystackData.authorization_url;

    } catch (err) {
      console.error('Paystack checkout error:', err.response?.data || err.message);
      toast.error('Payment Error', err.response?.data?.message || 'Could not initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCheckoutOpen(false);
    setStep(1);
    setMomoStage('select');
    setOrderResult(null);
  };

  if (!isCheckoutOpen) return null;

  const slideVariants = {
    enter:  { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0  },
    exit:   { opacity: 0, x: -24 },
  };

  // ── MoMo instructions / success overlay ─────────────
  const renderMoMoOverlay = () => {
    if (momoStage === 'success') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-8 text-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Order Placed! 🎉</h3>
            <p className="text-white/50 text-sm">We are waiting for your MoMo payment confirmation.</p>
          </div>
          {orderResult && (
            <div className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-1.5">
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">Order Details</p>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Order #</span>
                <span className="text-white font-bold">{orderResult.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Amount</span>
                <span className="text-gold font-bold">GHS {orderResult.total?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Status</span>
                <span className="text-amber-400 font-semibold">Pending Confirmation</span>
              </div>
            </div>
          )}
          <div className="w-full p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex gap-2 items-start text-left">
            <Clock size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Once we confirm your MoMo payment, your order will move to <strong className="text-blue-200">Processing</strong>. You'll receive an update soon.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full py-3.5 rounded-2xl bg-gold text-black font-bold text-sm hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
          >
            Done
          </button>
        </motion.div>
      );
    }

    if (momoStage === 'instructions') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Smartphone size={18} className="text-gold" /> Send MoMo Payment
            </h3>
            <p className="text-white/40 text-xs">Transfer the exact amount to the number below, then confirm.</p>
          </div>

          {/* MoMo card */}
          <div className="p-5 rounded-2xl border border-gold/30 bg-gold/5 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Send to</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-gold font-black text-3xl tracking-widest">{MOMO_NUMBER}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('0536479169');
                    toast.success("Copied", "MoMo number copied to clipboard.");
                  }}
                  className="p-2 bg-gold/10 hover:bg-gold/20 rounded-lg text-gold transition-all"
                  title="Copy Number"
                >
                  <Tag size={14} />
                </button>
              </div>
              <p className="text-white/70 text-sm font-semibold">{MOMO_NAME}</p>
              <p className="text-white/30 text-xs">MTN Mobile Money</p>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-white/50 text-sm">Amount to send</span>
              <span className="text-gold font-black text-xl">GHS {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-white/3 rounded-xl border border-white/8 text-xs text-white/50 leading-relaxed space-y-1">
            <p>1. Open your <strong className="text-white/70">MTN MoMo</strong> app or dial <strong className="text-white/70">*170#</strong></p>
            <p>2. Select <strong className="text-white/70">Transfer Money → MoMo</strong></p>
            <p>3. Enter number <strong className="text-white/70">{MOMO_NUMBER}</strong> and amount <strong className="text-white/70">GHS {total.toFixed(2)}</strong></p>
            <p>4. Confirm with your PIN, then click the button below</p>
          </div>

          <button
            onClick={handlePlaceManualOrder}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle size={16} /> I have finished paying
              </>
            )}
          </button>

          <button
            onClick={() => setMomoStage('select')}
            disabled={loading}
            className="w-full py-2 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            ← Go back
          </button>
        </motion.div>
      );
    }

    // momoStage === 'select' — payment method selection
    return (
      <motion.div key="s4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-gold" /> Order Summary
        </h3>

        {/* Delivery info recap */}
        <div className="p-4 bg-white/3 rounded-2xl border border-white/6 mb-3 space-y-1.5">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">Delivering to</p>
          <p className="text-white text-sm font-semibold">{formData.firstName} {formData.lastName}</p>
          <p className="text-white/50 text-xs">{formData.address}, {formData.city}, {formData.region}</p>
          <p className="text-white/50 text-xs">{formData.whatsapp}</p>
        </div>

        {/* Price breakdown */}
        <div className="p-4 bg-white/3 rounded-2xl border border-white/6 space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Subtotal ({itemCount()} items)</span>
            <span className="text-white font-medium">GHS {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Discount ({couponCode})</span>
              <span className="text-green-400 font-medium">−GHS {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Shipping ({shippingMethod?.name})</span>
            <span className="text-white font-medium">
              {shipping === 0 ? (shippingMethod?.id === 'pickup' ? 'Free' : 'TBD') : `GHS ${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="border-t border-white/8 pt-3 flex justify-between">
            <span className="text-white font-bold">Total</span>
            <span className="text-gold font-bold text-xl">GHS {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment method selection */}
        <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">Select Payment Method</p>
        <div className="space-y-3">

          {/* Manual MoMo — ACTIVE */}
          <button
            onClick={() => setPaymentMethod('Manual MoMo')}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
              paymentMethod === 'Manual MoMo'
                ? 'border-gold bg-gold/8 shadow-lg shadow-gold/5'
                : 'border-white/8 bg-white/3 hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                paymentMethod === 'Manual MoMo' ? 'border-gold' : 'border-white/20'
              }`}>
                {paymentMethod === 'Manual MoMo' && <div className="w-2 h-2 rounded-full bg-gold" />}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm flex items-center gap-2">
                  <Smartphone size={14} className="text-gold" /> Manual MoMo Transfer
                </p>
                <p className="text-white/40 text-xs mt-0.5">Send to {MOMO_NUMBER} · {MOMO_NAME}</p>
              </div>
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">Active</span>
            </div>
          </button>

          {/* Paystack — ACTIVE */}
          <button
            type="button"
            onClick={() => setPaymentMethod('Paystack')}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
              paymentMethod === 'Paystack'
                ? 'border-gold bg-gold/8 shadow-lg shadow-gold/5'
                : 'border-white/8 bg-white/3 hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                paymentMethod === 'Paystack' ? 'border-gold' : 'border-white/20'
              }`}>
                {paymentMethod === 'Paystack' && <div className="w-2 h-2 rounded-full bg-gold" />}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm flex items-center gap-2">
                  <CreditCard size={14} className="text-gold" /> Paystack (Card / MoMo)
                </p>
                <p className="text-white/40 text-xs mt-0.5">Secure payment via Cards or Mobile Money (MTN/Telecel/AirtelTigo)</p>
              </div>
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">Active</span>
            </div>
          </button>

        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch md:items-center justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full md:w-[540px] h-full md:h-[92vh] md:rounded-3xl bg-[#0f0e0c] border-l md:border border-white/8 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* ── Header ────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-white/6 flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 flex items-center justify-center">
                <img src={logo} alt="Queens Fashion Store Logo" className="w-full h-full object-contain" />
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold font-bold">Checkout</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {itemCount()} {itemCount() === 1 ? 'item' : 'items'} · GHS {subtotal.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-white/60" />
            </button>
          </div>
          {momoStage !== 'success' && <StepBar current={step} />}
        </div>

        {/* ── Content ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scroll-smooth">
          <AnimatePresence mode="wait">

            {/* STEP 1 — BAG */}
            {step === 1 && (
              <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-gold" /> Your Bag
                </h3>
                {cartItems.length === 0 ? (
                  <div className="text-center py-20 text-white/30">
                    <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Your bag is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.cartItemId || item.product._id} className="flex gap-3 p-3 bg-white/3 rounded-2xl border border-white/6 hover:border-white/10 transition-colors">
                        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                          {item.product.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-white/5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{item.product.title}</p>
                          <p className="text-gold font-bold text-sm mt-0.5">
                            GHS {((item.product.discountPrice ?? item.product.price) * item.quantity).toFixed(2)}
                          </p>
                          {item.product.discountPrice && (
                            <p className="text-white/30 text-xs line-through">
                              GHS {(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          )}
                          {item.product.selectedSize  && <p className="text-white/50 text-xs mt-0.5">Size: {item.product.selectedSize}</p>}
                          {item.product.selectedColor && <p className="text-white/50 text-xs mt-0.5">Color: {item.product.selectedColor}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                              <button onClick={() => updateQuantity(item.cartItemId || item.product._id, item.quantity - 1)} className="px-2 py-1 hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                                <Minus size={12} />
                              </button>
                              <span className="px-3 text-sm font-bold text-white min-w-[28px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.cartItemId || item.product._id, item.quantity + 1)} className="px-2 py-1 hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                                <Plus size={12} />
                              </button>
                            </div>
                            <button onClick={() => removeFromCart(item.cartItemId || item.product._id)} className="text-white/20 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Coupon */}
                    <div className="mt-4 p-4 bg-white/3 rounded-2xl border border-white/6">
                      <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                        <Tag size={11} /> Promo code
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={e => { setCouponCode(e.target.value); setCouponResult(null); }}
                          placeholder="Enter code"
                          className="flex-1 bg-white/5 border border-white/10 focus:border-gold rounded-xl px-3 py-2 text-white text-sm outline-none transition-all placeholder:text-white/20 uppercase"
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-sm font-bold rounded-xl transition-all disabled:opacity-40"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponResult && (
                        <p className={`text-xs mt-2 font-medium ${couponResult.discountAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {couponResult.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2 — DETAILS */}
            {step === 2 && (
              <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User size={18} className="text-gold" /> Delivery Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" error={errors.firstName}>
                    <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ama" error={errors.firstName} />
                  </Field>
                  <Field label="Last name" error={errors.lastName}>
                    <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Mansa" error={errors.lastName} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="WhatsApp number" error={errors.whatsapp}>
                      <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="055 123 4567" error={errors.whatsapp} />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="Email address" error={errors.email}>
                      <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="ama@example.com" error={errors.email} />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="Region" error={errors.region}>
                      <Select name="region" value={formData.region} onChange={handleChange} error={errors.region}>
                        {REGIONS.map(r => <option key={r} value={r} className="bg-neutral-900">{r}</option>)}
                      </Select>
                    </Field>
                  </div>
                   <div className="col-span-2">
                    <Field label="Delivery Location *" error={errors.address}>
                      <Input 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        placeholder="House No., Area or GPS Address" 
                        error={errors.address} 
                      />
                    </Field>
                  </div>

                  {/* Sleek Bolt-Style Geolocation Map Picker */}
                  <div className="col-span-2 space-y-2 mt-1 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">📍 Exact GPS Location (Bolt Style)</span>
                      {gpsLink && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-1 font-bold">
                          ✓ Pinned
                        </span>
                      )}
                    </div>
                    
                    {!coordinates ? (
                      <button
                        type="button"
                        onClick={handleShareLocation}
                        disabled={mapSearching}
                        className="w-full py-3 rounded-xl bg-gold/10 border border-gold/25 hover:bg-gold/20 text-gold text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {mapSearching ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                            Sharing Location...
                          </>
                        ) : (
                          <>
                            📍 Share & Map My Exact Location
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {/* Map Container */}
                        <div className="relative w-full h-[220px] rounded-2xl border border-white/10 overflow-hidden" id="checkout-map" style={{ zIndex: 10 }}>
                          
                          {/* static Bolt-style center marker overlay */}
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[999] mb-5">
                            <div className="relative flex flex-col items-center">
                              {/* glowing pulse */}
                              <div className="w-8 h-8 rounded-full bg-gold/30 absolute -top-4 animate-ping" />
                              {/* gold pin icon */}
                              <div className="w-3.5 h-3.5 rounded-full bg-gold border-2 border-black shadow-xl z-10" />
                              {/* pin stand */}
                              <div className="w-0.5 h-5 bg-gold shadow-lg" />
                              {/* shadow at bottom */}
                              <div className="w-3 h-1 bg-black/40 rounded-full blur-[1px]" />
                            </div>
                          </div>

                        </div>
                        
                        {/* Map Details and Reset */}
                        <div className="flex items-center justify-between gap-3 text-xs bg-white/3 p-3 rounded-xl border border-white/6">
                          <div className="truncate text-white/50 font-medium">
                            <span className="font-bold text-gold">Coordinates: </span>
                            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCoordinates(null);
                              setGpsLink('');
                            }}
                            className="text-gold font-bold text-[10px] uppercase tracking-widest hover:text-gold-light whitespace-nowrap"
                          >
                            Reset Map
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {mapError && (
                      <p className="text-red-400 text-xs mt-1 font-semibold">⚠️ {mapError}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Field label="Nearest Landmark (Optional)">
                      <Input 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        placeholder="e.g. Opposite Total, Near the big church" 
                      />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-start gap-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                      <Truck size={16} className="text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-200/70 leading-relaxed">
                        We deliver via <span className="font-bold text-amber-300">Bolt / Yango</span>. After you place your order, we'll WhatsApp you with the exact delivery fee. You pay the rider directly on delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — SHIPPING */}
            {step === 3 && (
              <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-gold" /> Shipping Method
                </h3>
                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => !opt.disabled && setShippingMethod(opt)}
                      disabled={opt.disabled}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                        opt.disabled
                          ? 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
                          : shippingMethod?.id === opt.id
                            ? 'border-gold bg-gold/8 shadow-lg shadow-gold/5'
                            : 'border-white/8 bg-white/3 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            shippingMethod?.id === opt.id ? 'border-gold' : 'border-white/20'
                          }`}>
                            {shippingMethod?.id === opt.id && <div className="w-2 h-2 rounded-full bg-gold" />}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm flex items-center gap-2">
                              {opt.name}
                              {opt.disabled && <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 text-white/40 px-2 py-0.5 rounded-full">Soon</span>}
                            </p>
                            <p className="text-white/40 text-xs mt-0.5">{opt.time}</p>
                          </div>
                        </div>
                        <p className="text-gold font-bold text-sm">
                          {opt.disabled ? '—' : opt.price === 0 ? (opt.id === 'pickup' ? 'Free' : 'TBD') : `GHS ${opt.price}`}
                        </p>
                      </div>
                    </button>
                  ))}

                  <div className="mt-4">
                    <Field label="Order notes (optional)">
                      <textarea
                        name="orderNotes"
                        value={formData.orderNotes}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Special delivery instructions..."
                        className="w-full bg-white/5 border border-white/10 focus:border-gold rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all resize-none placeholder:text-white/20"
                      />
                    </Field>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — PAYMENT */}
            {step === 4 && (
              <motion.div key="s4-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {renderMoMoOverlay()}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Footer ────────────────────────────────── */}
        {(step < 4 || (step === 4 && momoStage === 'select')) && (
          <div className="px-6 pb-6 pt-4 border-t border-white/6 flex-shrink-0">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && cartItems.length === 0) ||
                    (step === 3 && !shippingMethod)
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gold text-black font-bold text-sm hover:bg-gold-light transition-all shadow-lg shadow-gold/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                // Step 4 select stage — show "Proceed to Pay"
                <button
                  onClick={paymentMethod === 'Paystack' ? handlePaystackCheckout : () => setMomoStage('instructions')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gold text-black font-bold text-sm hover:bg-gold-light transition-all shadow-lg shadow-gold/20 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Proceed to Pay · GHS {total.toFixed(2)} <ChevronRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-center text-white/20 text-xs mt-3 flex items-center justify-center gap-1.5">
              <Lock size={12} /> Secure checkout · SSL encrypted
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
