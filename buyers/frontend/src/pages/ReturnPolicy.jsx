import React from 'react';
import { motion } from 'framer-motion';

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto text-gray-600 leading-relaxed font-medium">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 text-center">Return & <span className="text-green-700 font-serif italic">Exchange</span>.</h1>
            <p className="text-gray-500 max-w-xl mx-auto font-medium text-lg leading-relaxed">Understanding our commitment to hygiene and product authenticity.</p>
          </div>
          
          <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-12">
            
            <section className="bg-red-50 border-l-4 border-red-500 p-8 rounded-2xl md:rounded-r-2xl">
              <h3 className="text-red-900 font-extrabold text-xl mb-3 flex items-center gap-2">Strict No-Refund Policy</h3>
              <p className="text-red-700 font-medium">
                At <strong className="font-extrabold">Queens</strong>, we prioritize hygiene and the high quality of our beauty and jewelry products. 
                Because of this, <strong>all orders are final and are not refundable</strong> once they have been dispatched.
              </p>
            </section>

            <section>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4">Read Before You Buy</h3>
              <p className="text-lg">
                We urge every customer to carefully read the product descriptions, sizing, and details before 
                proceeding with a purchase. By completing your order, you agree to these terms.
              </p>
            </section>

            <section>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4">Damaged Items</h3>
              <p className="text-lg">
                In the unlikely event that your item arrives significantly damaged or the wrong product was sent, 
                please contact us within <strong className="text-gray-900 font-extrabold">24 hours</strong> of delivery with photographic proof. 
                We will evaluate the situation and offer a replacement if necessary. You may use our <a href="/returns" className="text-green-700 font-bold hover:underline">RMA Form</a>.
              </p>
            </section>

            <div className="pt-10 border-t border-gray-100 text-center font-bold text-gray-400 text-sm uppercase tracking-widest mt-12">
              Thank you for choosing Queens and supporting our commitment to quality.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
