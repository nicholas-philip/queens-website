import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 text-center">Our <span className="text-green-700 font-serif italic">Story</span>.</h1>
            <p className="text-gray-500 max-w-xl mx-auto font-medium text-lg leading-relaxed">Elevating everyday moments with curated luxury beauty and signature craftsmanship.</p>
          </div>
          
          <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8 text-gray-600 leading-relaxed font-medium text-lg">
            <p className="text-xl font-bold text-gray-900 leading-normal">
              Welcome to <span className="text-green-700">Queens</span>, where elegance meets convenience. 
              We curated a lifestyle collection for the modern woman who values style, quality, and refreshing experiences.
            </p>
            
            <p>
              From our hand-picked jewelry like delicate waist beads and 18k gold plated bracelets, to our premium beauty essentials 
              like high-shine glosses and radiant body oils—every product is selected to make you feel like the Queen you are.
            </p>

            <p>
              Our mission is to bring the "Glossy Look" to everyone, everywhere. We believe that self-care and style 
              should be accessible, professional, and undeniably beautiful.
            </p>

            <div className="pt-10 mt-10 border-t border-gray-100 flex flex-col items-center">
              <div className="w-12 h-12 bg-green-700 flex items-center justify-center rounded-xl shadow-sm mb-6">
                 <span className="text-white font-black text-2xl font-serif italic">Q</span>
              </div>
              <h3 className="text-gray-900 font-extrabold text-2xl mb-2">Elevate Your Style</h3>
              <p className="font-bold text-green-700 tracking-widest uppercase text-sm">#QueensGlow #GlossyKiss</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
