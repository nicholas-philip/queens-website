import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-base-200/40 pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-base-content/70 leading-relaxed font-medium">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-base-content tracking-tight mb-4 text-center">Privacy <span className="text-primary font-serif italic">Policy</span>.</h1>
            <p className="text-base-content/60 max-w-xl mx-auto font-medium text-base sm:text-lg leading-relaxed">How we protect your data while you glow.</p>
          </div>
          
          <div className="bg-base-100 p-6 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-base-200 space-y-10 sm:space-y-12">
            
            <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-base-content leading-tight">
              At Queens, we value your trust as much as your elegance. This policy explains how we secure your data.
            </p>

            <section>
              <h3 className="text-base-content font-extrabold text-xl sm:text-2xl mb-3 sm:mb-4">Data Collection</h3>
              <p className="text-sm sm:text-base md:text-lg">
                When you shop with us, we collect necessary information to process your order: your name, WhatsApp number, email, 
                and delivery address. This information is used strictly for fulfilling your purchase and providing delivery updates.
              </p>
            </section>

            <section>
              <h3 className="text-base-content font-extrabold text-xl sm:text-2xl mb-3 sm:mb-4">Secure Payments</h3>
              <p className="text-sm sm:text-base md:text-lg">
                Payments are processed through <strong className="text-base-content font-extrabold">Paystack</strong>, a world-class, PCI-compliant payment gateway. 
                We do not store your credit card or Mobile Money PIN information whatsoever.
              </p>
            </section>

            <section>
              <h3 className="text-base-content font-extrabold text-xl sm:text-2xl mb-3 sm:mb-4">No Third-Party Sharing</h3>
              <p className="text-sm sm:text-base md:text-lg">
                We simply do not sell, trade, or share your personal data with third parties. Your information is 
                safe within the Queens kingdom.
              </p>
            </section>

            <div className="pt-6 sm:pt-10 border-t border-base-200 text-center font-bold text-base-content/30 text-xs sm:text-sm tracking-widest mt-8 sm:mt-12">
              <p className="uppercase mb-2">Last Updated: March 2026.</p>
              <p>Questions? <a href="mailto:nyarkopriscilla240@gmail.com" className="text-primary hover:underline">nyarkopriscilla240@gmail.com</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
