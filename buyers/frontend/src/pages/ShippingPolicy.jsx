import React from 'react';
import { motion } from 'framer-motion';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 text-center">Shipping <span className="text-green-700 font-serif italic">& Delivery</span>.</h1>
            <p className="text-gray-500 max-w-xl mx-auto font-medium text-lg leading-relaxed">Understanding our fulfillment timeline and policies so you get your products transparently.</p>
          </div>
          
          <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-12">
            
            <section>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700 text-sm">1</div> 
                Delivery Schedule
              </h3>
              <p className="text-gray-600 font-medium text-lg mb-4">We believe in timely service. Our standard delivery days are:</p>
              <ul className="list-disc ml-6 space-y-3 text-gray-500 font-medium">
                <li><strong className="text-gray-900">Mondays, Wednesdays, and Fridays</strong></li>
                <li>Orders placed before 11:00 AM on these days will be dispatched the same day.</li>
                <li>Friday is our exclusive pickup day for customers in Accra.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700 text-sm">2</div> 
                Delivery Fees
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-extrabold text-xl text-gray-900 mb-2">Inside Accra</h4>
                  <p className="text-gray-500 font-medium">Delivery fees are paid directly to the dispatch rider upon delivery to your doorstep.</p>
                </div>
                <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-extrabold text-xl text-gray-900 mb-2">Outside Accra</h4>
                  <p className="text-gray-500 font-medium">A flat rate of <span className="text-green-700 font-bold">GHS 35</span> is charged for the rider to deliver to the station. Rest is paid manually.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700 text-sm">3</div> 
                Pick-up Location
              </h3>
              <p className="text-gray-600 font-medium text-lg">Pick-ups are only allowed on <strong className="text-gray-900">Fridays</strong> at our East Legon hub. Please ensure your order has been confirmed before arrival.</p>
            </section>

            <div className="pt-8 border-t border-gray-100 text-center font-bold text-gray-400 text-sm uppercase tracking-widest mt-12">
              Note: No walk-ins allowed. All sales are processed online.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
