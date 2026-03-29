import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, ShoppingBag, Heart } from 'lucide-react';

const FAQItem = ({ question, answer, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white mb-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-700">
            <Icon size={20} />
          </div>
          <span className="font-extrabold text-gray-900 text-lg">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-400"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-6 text-gray-500 font-medium leading-relaxed pt-2 ml-14"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "What are your delivery days?",
      answer: "We deliver on Mondays, Wednesdays, and Fridays. Orders must be placed before 11:00 AM on these days to be dispatched the same day. Pickup is available only on Fridays at East Legon.",
      icon: Truck
    },
    {
      question: "Do you have a physical store for walk-ins?",
      answer: "No, we do not allow walk-ins. We are an exclusive online storefront to ensure we reach every Queen wherever they are. Pickups are strictly by appointment on Fridays.",
      icon: ShoppingBag
    },
    {
      question: "How can I trust your brand?",
      answer: "We understand that and that's why we say to all new Queens to check our Instagram and TikTok. We post daily videos of our products, orders, and customer reviews. Only buy when you are fully convinced by our consistency and community!",
      icon: ShieldCheck
    },
    {
      question: "Do you offer refunds or exchanges?",
      answer: "Due to hygiene reasons regarding beauty and jewelry products, all sales are final. Please read the descriptions carefully. If an item is damaged upon delivery, please contact us within 24 hours.",
      icon: Heart
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major Mobile Money (MoMo) networks in Ghana and Credit/Debit cards via our secure Paystack integration.",
      icon: HelpCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 text-center">Frequently Asked <span className="text-green-700 font-serif italic">Questions</span>.</h1>
            <p className="text-gray-500 font-medium text-lg">Everything you need to know about shopping with Queens.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>

          <div className="mt-16 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-500 font-medium md:text-lg mb-8">Our concierge team is here to assist you.</p>
            <a
              href="https://wa.me/233245709324" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-5 bg-green-700 text-white font-extrabold rounded-xl hover:bg-green-800 transition-colors shadow-lg active:scale-[0.98]"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
