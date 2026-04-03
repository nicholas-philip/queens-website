import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, ShoppingBag, Heart } from 'lucide-react';

const FAQItem = ({ question, answer, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-base-200 rounded-2xl overflow-hidden bg-base-100 mb-4 shadow-sm transition-colors duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left transition-colors hover:bg-base-200/50"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
          <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
            <Icon size={18} />
          </div>
          <span className="font-extrabold text-base-content text-sm sm:text-base md:text-lg">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-base-content/40 flex-shrink-0"
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
            className="px-4 sm:px-6 pb-5 sm:pb-6 text-base-content/60 font-medium leading-relaxed pt-2 ml-10 sm:ml-14 text-sm md:text-base"
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
    <div className="min-h-screen bg-base-200/40 pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-base-content tracking-tight mb-4 text-center">Frequently Asked <span className="text-primary font-serif italic">Questions</span>.</h1>
            <p className="text-base-content/60 font-medium text-base sm:text-lg">Everything you need to know about shopping with Queens.</p>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>

          <div className="mt-12 sm:mt-16 bg-base-100 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-base-200 shadow-sm text-center">
            <h3 className="text-xl sm:text-2xl font-extrabold text-base-content mb-2">Still have questions?</h3>
            <p className="text-base-content/60 font-medium text-base sm:text-lg mb-6 sm:mb-8">Our concierge team is here to assist you.</p>
            <a
              href="https://wa.me/233245709324" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 sm:px-8 py-4 sm:py-5 bg-primary text-primary-content font-extrabold rounded-xl hover:brightness-110 transition-colors shadow-lg active:scale-[0.98] text-sm sm:text-base"
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
