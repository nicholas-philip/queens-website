// =====================================================
// pages/PaymentSuccess.jsx  —  NEW (required for Paystack callback)
//
// Paystack redirects to: /payment/success?ref=QNS-XXXXX
// after card payment. This page verifies the payment with the backend
// and shows the result to the customer.
//
// Add to your router:
//   <Route path="/payment/success" element={<PaymentSuccess />} />
// =====================================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const PaymentSuccess = () => {
  const [searchParams]  = useSearchParams();
  const reference       = searchParams.get('ref') || searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus]   = useState('verifying'); // 'verifying' | 'success' | 'failed'
  const [orderInfo, setOrder] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setError('No payment reference found.');
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.get(`/payment/verify/${reference}`);
        if (data.success) {
          setStatus('success');
          setOrder(data.order);
        } else {
          setStatus('failed');
          setError(data.message || 'Payment could not be verified.');
        }
      } catch (err) {
        setStatus('failed');
        setError(err.response?.data?.message || 'Verification failed. Please contact support.');
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-20 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 text-center"
      >
        {/* Verifying */}
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader size={36} className="text-green-700 animate-spin" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-500 font-medium">Please wait while we confirm your payment with Paystack...</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-700" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Payment Confirmed!</h2>
            <p className="text-gray-500 font-medium mb-6">
              Your order has been placed and is being prepared.
              {orderInfo?.customerDetails?.email && (
                <> A confirmation email is on its way to <strong className="text-gray-700">{orderInfo.customerDetails.email}</strong>.</>
              )}
            </p>

            {orderInfo && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Order number</span>
                  <span className="font-black text-gray-900">{orderInfo.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Amount paid</span>
                  <span className="font-black text-green-700 text-lg">GHS {orderInfo.total?.toLocaleString?.()}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {orderInfo?.orderNumber && (
                <Link
                  to={`/track?id=${orderInfo.orderNumber.replace('#', '')}`}
                  className="w-full py-4 bg-green-700 text-white font-extrabold rounded-2xl hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                >
                  Track My Order <ArrowRight size={18} />
                </Link>
              )}
              <Link
                to="/shop"
                className="w-full py-4 border border-gray-200 text-gray-700 font-extrabold rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> Continue Shopping
              </Link>
            </div>
          </>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Payment Failed</h2>
            <p className="text-gray-500 font-medium mb-6">{error || 'Something went wrong with your payment.'}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/shop"
                className="w-full py-4 bg-gray-900 text-white font-extrabold rounded-2xl hover:bg-black transition-colors"
              >
                Back to Shop
              </Link>
              <a
                href="https://wa.me/233245709324"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 font-bold hover:text-green-700 text-sm transition-colors"
              >
                Contact support on WhatsApp
              </a>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;