import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus, HelpCircle, Sparkles } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-base-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 sm:py-8 text-left group gap-4"
      >
        <span className={`text-lg sm:text-xl font-black transition-colors ${isOpen ? 'text-primary' : 'text-base-content group-hover:text-primary/70'}`}>
          {question}
        </span>
        <div className={`p-2 rounded-xl transition-all ${isOpen ? 'bg-primary text-primary-content rotate-180' : 'bg-base-200 text-base-content group-hover:bg-primary/10'}`}>
          <ChevronDown size={18} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-base-content/60 font-medium leading-[1.8] text-base sm:text-lg">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "Are your sneakers and apparel authentic?",
      answer: "Absolutely. Authenticity is the cornerstone of Queens Fashion Store. Every item is thoroughly inspected by our internal experts and vetted for production standards, serial matching, and material quality before it joins our collection."
    },
    {
      question: "What is your delivery timeframe in Accra?",
      answer: "For locations within Accra, we offer same-day or next-day delivery depending on the time of order placement. Orders placed before 12:00 PM GMT are typically delivered by 6:00 PM the same day."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to style enthusiasts worldwide. International shipping rates and times vary by destination. Typically, global orders are delivered within 5-10 business days via our premium courier partners."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for items in original, unworn condition with all tags and security seals intact. Please note that for hygiene reasons, certain items like swimwear and opened beauty products are not eligible for return."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is dispatched, you'll receive a notification via WhatsApp or Email with a tracking link. You can also use our dedicated 'Track Order' page on the website by entering your Order ID."
    },
    {
      question: "Do you offer bespoke styling consultations?",
      answer: "Indeed. We offer private digital and in-person styling sessions to help you curate the perfect wardrobe. Please contact our concierge team via the Contact page to book a session."
    }
  ];

  return (
    <div className="min-h-screen bg-base-100 pt-32 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16 sm:mb-24">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
              <HelpCircle size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Support & Guidance</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-base-content tracking-tighter leading-[0.9] uppercase mb-8">
              Frequently <br/> <span className="text-primary">Asked.</span>
            </h1>
            <p className="max-w-xl mx-auto text-base-content/60 text-lg font-medium leading-relaxed">
              Find immediate clarity on our services, products, and logistics.
            </p>
          </div>

          <div className="bg-base-200/30 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-14 border border-base-200 backdrop-blur-3xl shadow-sm">
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
