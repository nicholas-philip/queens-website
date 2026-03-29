import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, Instagram, MapPin } from 'lucide-react';
import api from '../api';

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
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-32 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 pt-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">Get In <span className="text-green-700 italic font-serif">Touch</span>.</h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium text-lg leading-relaxed">Have a question about an order or want to collaborate? Our concierge team is here to assist you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
          {/* Info Side */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 flex flex-col gap-10">
               <div className="flex gap-6 items-center group">
                  <div className="p-5 bg-white shadow-sm text-green-700 rounded-2xl group-hover:scale-105 group-hover:shadow-md transition-all duration-300"><Phone size={24}/></div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Call / WhatsApp</p>
                    <p className="text-xl font-extrabold text-gray-900">+233 24 570 9324</p>
                  </div>
               </div>
               <div className="flex gap-6 items-center group">
                  <div className="p-5 bg-white shadow-sm text-green-700 rounded-2xl group-hover:scale-105 group-hover:shadow-md transition-all duration-300"><Mail size={24}/></div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email Us</p>
                    <p className="text-xl font-extrabold text-gray-900">concierge@queens.com</p>
                  </div>
               </div>
               <div className="flex gap-6 items-center group">
                  <div className="p-5 bg-white shadow-sm text-green-700 rounded-2xl group-hover:scale-105 group-hover:shadow-md transition-all duration-300"><Instagram size={24}/></div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Instagram</p>
                    <p className="text-xl font-extrabold text-gray-900">@QueensStorefront</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10">
              {sent ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 bg-green-50 text-green-700 rounded-full flex items-center justify-center mb-6 shadow-sm"><Send size={40}/></div>
                  <h3 className="text-3xl font-extrabold mb-4 text-gray-900">Message Received!</h3>
                  <p className="text-gray-500 font-medium mb-8">Your inquiry has been routed to our concierge team. We will respond within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="text-gray-400 font-bold hover:text-green-700 uppercase tracking-widest text-sm transition-colors border-b-2 border-transparent hover:border-green-700 pb-1">
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-8">Send a Message</h3>
                  <input 
                    placeholder="Your Full Name" 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-bold focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="email" 
                    required
                    placeholder="Email Address" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-bold focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <textarea 
                    rows="5" 
                    required
                    placeholder="How can we assist you?" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-bold focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400 resize-none"
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                  <button 
                    disabled={loading}
                    className="w-full mt-8 bg-gray-900 text-white font-extrabold px-8 py-5 rounded-xl hover:bg-black transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {loading ? 'Sending...' : <>Submit Inquiry <Send size={20}/></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
