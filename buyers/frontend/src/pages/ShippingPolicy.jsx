import React from 'react';
import { motion } from 'framer-motion';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-base-200/40 pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-base-content tracking-tight mb-4 text-center">Shipping <span className="text-primary font-serif italic">& Delivery</span>.</h1>
            <p className="text-base-content/60 max-w-xl mx-auto font-medium text-base sm:text-lg leading-relaxed">Understanding our fulfillment timeline and policies so you get your products transparently.</p>
          </div>
          
          <div className="bg-base-100 p-6 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-base-200 space-y-10 sm:space-y-12">
            
            <section>
              <h3 className="text-base-content font-extrabold text-xl sm:text-2xl mb-3 sm:mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-black flex-shrink-0">1</div> 
                Delivery Schedule
              </h3>
              <p className="text-base-content/70 font-medium text-base sm:text-lg mb-3 sm:mb-4">We believe in timely service. Our standard delivery days are:</p>
              <ul className="list-disc ml-6 space-y-2 sm:space-y-3 text-base-content/60 font-medium text-sm sm:text-base">
                <li><strong className="text-base-content">Mondays, Wednesdays, and Fridays</strong></li>
                <li>Orders placed before 11:00 AM on these days will be dispatched the same day.</li>
                <li>Friday is our exclusive pickup day for customers in Accra.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base-content font-extrabold text-xl sm:text-2xl mb-3 sm:mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-black flex-shrink-0">2</div> 
                Delivery Fees
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className="p-5 sm:p-8 bg-base-200 rounded-2xl border border-base-300">
                  <h4 className="font-extrabold text-lg sm:text-xl text-base-content mb-2">Inside Accra</h4>
                  <p className="text-base-content/60 font-medium text-sm sm:text-base">Delivery fees are paid directly to the dispatch rider upon delivery to your doorstep.</p>
                </div>
                <div className="p-5 sm:p-8 bg-base-200 rounded-2xl border border-base-300">
                  <h4 className="font-extrabold text-lg sm:text-xl text-base-content mb-2">Outside Accra</h4>
                  <p className="text-base-content/60 font-medium text-sm sm:text-base">A flat rate of <span className="text-primary font-bold">GHS 35</span> is charged for the rider to deliver to the station. Rest is paid manually.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base-content font-extrabold text-xl sm:text-2xl mb-3 sm:mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-black flex-shrink-0">3</div> 
                Pick-up Location
              </h3>
              <p className="text-base-content/70 font-medium text-base sm:text-lg">Pick-ups are only allowed on <strong className="text-base-content">Fridays</strong> at our East Legon hub. Please ensure your order has been confirmed before arrival.</p>
            </section>

            <div className="pt-6 sm:pt-8 border-t border-base-200 text-center font-bold text-base-content/30 text-xs sm:text-sm uppercase tracking-widest mt-8 sm:mt-12">
              Note: No walk-ins allowed. All sales are processed online.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
