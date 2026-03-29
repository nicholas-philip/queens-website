import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto text-gray-600 leading-relaxed font-medium">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 text-center">Privacy <span className="text-green-700 font-serif italic">Policy</span>.</h1>
            <p className="text-gray-500 max-w-xl mx-auto font-medium text-lg leading-relaxed">How we protect your data while you glow.</p>
          </div>
          
          <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-12">
            
            <p className="text-2xl font-extrabold text-gray-900 leading-tight">
              At Queens, we value your trust as much as your elegance. This policy explains how we secure your data.
            </p>

            <section>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4">Data Collection</h3>
              <p className="text-lg">
                When you shop with us, we collect necessary information to process your order: your name, WhatsApp number, email, 
                and delivery address. This information is used strictly for fulfilling your purchase and providing delivery updates.
              </p>
            </section>

            <section>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4">Secure Payments</h3>
              <p className="text-lg">
                Payments are processed through <strong className="text-gray-900 font-extrabold">Paystack</strong>, a world-class, PCI-compliant payment gateway. 
                We do not store your credit card or Mobile Money PIN information whatsoever.
              </p>
            </section>

            <section>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4">No Third-Party Sharing</h3>
              <p className="text-lg">
                We simply do not sell, trade, or share your personal data with third parties. Your information is 
                safe within the Queens kingdom.
              </p>
            </section>

            <div className="pt-10 border-t border-gray-100 text-center font-bold text-gray-400 text-sm tracking-widest mt-12">
              <p className="uppercase mb-2">Last Updated: March 2026.</p>
              <p>Questions? <a href="mailto:concierge@queens.com" className="text-green-700 hover:underline">concierge@queens.com</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
