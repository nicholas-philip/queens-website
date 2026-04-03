import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, Mail, Instagram, MapPin, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import api from '../api';

const ContactInfo = ({ icon: Icon, label, value, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="group flex items-center gap-6 p-6 rounded-[2rem] bg-base-100 border border-base-200 transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
  >
    <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content transition-all duration-500 shadow-inner">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-base-content/30 mb-1.5">{label}</p>
      <p className="text-base sm:text-lg font-black text-base-content truncate group-hover:text-primary transition-colors">{value}</p>
    </div>
  </a>
);

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact/send', formData);
      setSent(true);
    } catch (err) {
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-primary-content">
      
      {/* ── Editorial Header ────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-neutral text-neutral-content">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 block">Concierge & Support</span>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8">
                Request Our <br />
                <span className="text-primary font-serif italic">Attention.</span>
              </h1>
              <p className="text-neutral-content/50 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                Whether it's a sizing inquiry, an update on your order, or a simple greeting — our concierge team is at your disposal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────── */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
          
          {/* Left: Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <ContactInfo 
                icon={Phone} 
                label="Direct Line" 
                value="+233 24 570 9324" 
                href="tel:+233245709324" 
              />
              <ContactInfo 
                icon={MessageSquare} 
                label="WhatsApp" 
                value="Queens Concierge" 
                href="https://wa.me/233245709324" 
              />
              <ContactInfo 
                icon={Mail} 
                label="Electronic Mail" 
                value="concierge@queens.com" 
                href="mailto:concierge@queens.com" 
              />
              <ContactInfo 
                icon={Instagram} 
                label="Digital Presence" 
                value="@QueensOfficial" 
                href="https://instagram.com/queens_ghana" 
              />
              
              <div className="p-8 rounded-[2.5rem] bg-base-200/50 border border-base-200 mt-12">
                 <div className="flex items-center gap-3 mb-4">
                    <Clock size={18} className="text-primary" />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em]">Response Registry</h4>
                 </div>
                 <p className="text-sm font-medium text-base-content/60 leading-relaxed">
                   Our team reviews inquiries on <b className="text-base-content font-black">Mon, Wed & Fri (9AM - 6PM GMT)</b>. 
                   Outside of these hours, we will reach out within the next business window.
                 </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Modern Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-base-100 rounded-[3rem] p-8 md:p-16 border border-base-200 shadow-2xl shadow-primary/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <CheckCircle2 size={48} className="text-primary" strokeWidth={1} />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-4 text-base-content uppercase">Awaiting Registry.</h2>
                    <p className="text-base-content/50 font-medium mb-12 max-w-sm mx-auto">
                      Your inquiry has been successfully transmitted. One of our specialists will be in touch shortly.
                    </p>
                    <button 
                      onClick={() => setSent(false)}
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:tracking-[0.5em] transition-all"
                    >
                      New Inquiry
                    </button>
                  </motion.div>
                ) : (
                  <form key="form" onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black text-base-content tracking-tight uppercase">Inquiry Form</h3>
                       <p className="text-base-content/40 font-medium text-sm">Please provide your details below.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="relative group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30 ml-4 mb-2 block group-focus-within:text-primary transition-colors">Identification</label>
                        <input 
                          required
                          placeholder="Your full name"
                          className="w-full bg-base-200 border border-base-300 rounded-2xl px-6 py-5 text-base-content font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/20"
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>

                      <div className="relative group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30 ml-4 mb-2 block group-focus-within:text-primary transition-colors">Digital Handle</label>
                        <input 
                          type="email" 
                          required
                          placeholder="Email address"
                          className="w-full bg-base-200 border border-base-300 rounded-2xl px-6 py-5 text-base-content font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/20"
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>

                      <div className="relative group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30 ml-4 mb-2 block group-focus-within:text-primary transition-colors">The Message</label>
                        <textarea 
                          rows="6" 
                          required
                          placeholder="How can we assist your journey today?"
                          className="w-full bg-base-200 border border-base-300 rounded-2xl px-6 py-5 text-base-content font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/20 resize-none"
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                      </div>
                    </div>

                    <button 
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

