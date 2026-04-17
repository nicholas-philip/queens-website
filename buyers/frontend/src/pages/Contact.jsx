import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock, Globe } from 'lucide-react';

const ContactItem = ({ icon: Icon, title, value, detail }) => (
  <div className="flex items-start gap-4 p-6 bg-base-100 rounded-[2rem] border border-base-200 shadow-sm hover:border-primary/30 transition-all group">
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/30 mb-1">{title}</h4>
      <p className="text-base font-black text-base-content mb-1">{value}</p>
      {detail && <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">{detail}</p>}
    </div>
  </div>
);

const Contact = () => {
  const [formState, setFormState] = useState('idle'); // idle, loading, success
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setFormState('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-base-100 pt-32 pb-20 font-sans">
      
      {/* ── Header ── */}
      <section className="px-4 md:px-8 mb-20 text-center">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
              <Globe size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Global Concierge</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-base-content tracking-tighter leading-[0.9] uppercase mb-8">
              At Your <br/> <span className="text-primary">Service.</span>
            </h1>
            <p className="max-w-xl mx-auto text-base-content/60 text-lg font-medium leading-relaxed">
              Whether you're inquiring about our latest drops or need bespoke style assistance, our team is ready to connect.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Grid ── */}
      <section className="px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left: Info Cards (5 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <ContactItem 
                icon={Phone} 
                title="WhatsApp Support" 
                value="+233 053 647 9169" 
                detail="Available 9AM - 8PM GMT"
              />
              <ContactItem 
                icon={Mail} 
                title="General Inquiries" 
                value="nyarkopriscilla240@gmail.com" 
                detail="Responses within 24 hours"
              />
              <ContactItem 
                icon={MapPin} 
                title="Grand Atelier" 
                value="Accra, Ghana" 
                detail="Flagship Showroom"
              />
              <ContactItem 
                icon={Clock} 
                title="Boutique Hours" 
                value="Mon - Sat" 
                detail="10:00 AM - 08:30 PM"
              />
            </motion.div>
          </div>

          {/* Right: Form (7 cols) */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-base-200/50 backdrop-blur-xl p-8 sm:p-14 rounded-[3rem] border border-base-300 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />

              <AnimatePresence mode="wait">
                {formState === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 text-center"
                  >
                    <div className="w-20 h-20 bg-primary text-primary-content rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-base-content mb-4 uppercase tracking-tight">Transmission Received</h2>
                    <p className="text-base-content/60 font-medium max-w-sm mx-auto leading-relaxed">
                      Your message is being analyzed by our concierge team. We will respond shortly via your provided frequency.
                    </p>
                    <button 
                      onClick={() => setFormState('idle')}
                      className="mt-10 text-xs font-black uppercase tracking-[0.3em] text-primary hover:underline underline-offset-8"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/40 ml-2">Your Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="EX: NICHOLAS PHILIP"
                          className="w-full bg-base-100 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 outline-none font-black text-sm transition-all focus:bg-base-100 placeholder:opacity-20 uppercase tracking-widest"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/40 ml-2">Email Identity</label>
                        <input 
                          type="email" 
                          required
                          placeholder="YOUR@IDENTITY.COM"
                          className="w-full bg-base-100 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 outline-none font-black text-sm transition-all focus:bg-base-100 placeholder:opacity-20 uppercase tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/40 ml-2">Inquiry Topic</label>
                      <select className="appearance-none w-full bg-base-100 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 outline-none font-black text-sm transition-all focus:bg-base-100 uppercase tracking-widest cursor-pointer">
                        <option>General Inquiry</option>
                        <option>Product Authentication</option>
                        <option>Wholesale/B2B</option>
                        <option>Bespoke Style Consultation</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/40 ml-2">Your Message</label>
                      <textarea 
                        rows="5"
                        required
                        placeholder="HOW CAN OUR CONCIERGE ASSIST YOU TODAY?"
                        className="w-full bg-base-100 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-6 outline-none font-black text-sm transition-all focus:bg-base-100 placeholder:opacity-20 uppercase tracking-widest resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#050505] text-primary font-black px-10 py-6 rounded-2xl shadow-2xl shadow-primary/20 hover:brightness-125 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 group"
                    >
                      {loading ? (
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="flex items-center gap-4 text-xs tracking-[0.4em] uppercase">
                          Transmit Message <Send size={20} className="group-hover:translate-x-2 transition-transform" />
                        </span>
                      )}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
