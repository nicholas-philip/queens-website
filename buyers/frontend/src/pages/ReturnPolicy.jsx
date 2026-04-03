import React from 'react';
import { motion } from 'framer-motion';

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-base-200/40 pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-base-content/70 leading-relaxed font-medium">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-base-content tracking-tight mb-4 text-center">Return & <span className="text-primary font-serif italic">Exchange</span>.</h1>
            <p className="text-base-content/60 max-w-xl mx-auto font-medium text-base sm:text-lg leading-relaxed">Understanding our commitment to hygiene and product authenticity.</p>
          </div>
          
          <div className="bg-base-100 p-6 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-base-200 space-y-10 sm:space-y-12">
            
            <section className="bg-error/10 border-l-4 border-error p-5 sm:p-8 rounded-2xl">
              <h3 className="text-error font-extrabold text-lg sm:text-xl mb-2 sm:mb-3 flex items-center gap-2">Strict No-Refund Policy</h3>
              <p className="text-error/80 font-medium text-sm sm:text-base">
                At <strong className="font-extrabold">Queens</strong>, we prioritize hygiene and the high quality of our beauty and jewelry products. 
                Because of this, <strong>all orders are final and are not refundable</strong> once they have been dispatched.
              </p>
            </section>

            <section>
              <h3 className="text-base-content font-extrabold text-xl sm:text-2xl mb-3 sm:mb-4">Read Before You Buy</h3>
              <p className="text-sm sm:text-base md:text-lg">
                We urge every customer to carefully read the product descriptions, sizing, and details before 
                proceeding with a purchase. By completing your order, you agree to these terms.
              </p>
            </section>

            <section>
              <h3 className="text-base-content font-extrabold text-xl sm:text-2xl mb-3 sm:mb-4">Damaged Items</h3>
              <p className="text-sm sm:text-base md:text-lg">
                In the unlikely event that your item arrives significantly damaged or the wrong product was sent, 
                please contact us within <strong className="text-base-content font-extrabold">24 hours</strong> of delivery with photographic proof. 
                We will evaluate the situation and offer a replacement if necessary. You may use our <a href="/returns" className="text-primary font-bold hover:underline">RMA Form</a>.
              </p>
            </section>

            <div className="pt-6 sm:pt-10 border-t border-base-200 text-center font-bold text-base-content/30 text-xs sm:text-sm uppercase tracking-widest mt-8 sm:mt-12">
              Thank you for choosing Queens and supporting our commitment to quality.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
