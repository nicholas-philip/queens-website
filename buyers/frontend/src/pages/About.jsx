import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Star, Truck, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const values = [
  {
    icon: Heart,
    title: 'Curated with Love',
    desc: 'Every product is handpicked by our team to ensure it meets the Queens standard of luxury and quality.',
  },
  {
    icon: ShieldCheck,
    title: 'Authentic Guarantee',
    desc: 'We only stock genuine, verified products. If it bears the Queens name, it\'s the real deal.',
  },
  {
    icon: Truck,
    title: 'Swift Delivery',
    desc: 'We partner with reliable couriers to get your order to you fast — because you shouldn\'t have to wait.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    desc: 'From our 18k gold-plated jewellery to our signature perfumes, quality is never a compromise.',
  },
  {
    icon: Star,
    title: 'Customer First',
    desc: 'Our concierge team is available around the clock to make your shopping experience seamless.',
  },
  {
    icon: Users,
    title: 'Built for Queens',
    desc: 'We celebrate women in all their glory — our catalogue is designed to make every woman feel seen.',
  },
];

const About = () => {
  return (
    <div className="bg-base-100 min-h-screen font-sans text-base-content transition-colors duration-300">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-neutral text-neutral-content py-24 md:py-32 px-4 md:px-8">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeUp>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-4 block">Our Story</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              Elevating Style.<br />
              <span className="text-primary font-serif italic">Empowering Queens.</span>
            </h1>
            <p className="text-neutral-content/60 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              We started with a simple belief: every woman deserves to look and feel extraordinary — without compromise.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Story Section ─────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="bg-base-200/40 border border-base-200 rounded-[2rem] p-8 sm:p-12 md:p-16 space-y-6 text-base-content/70 leading-relaxed font-medium text-base sm:text-lg">
              <p className="text-xl sm:text-2xl font-black text-base-content leading-normal">
                Welcome to <span className="text-primary">Queens</span> — where elegance meets everyday life.
              </p>

              <p>
                We curated a lifestyle collection for the modern woman who values style, quality, and refreshing experiences.
                From hand-picked jewellery — delicate waist beads and 18k gold-plated bracelets — to premium beauty essentials
                like high-shine glosses and radiant body oils, every product is selected to make you feel like the Queen you are.
              </p>

              <p>
                Our mission is to bring the <em className="text-primary font-black not-italic">"Glossy Look"</em> to everyone, everywhere.
                We believe self-care and style should be accessible, professional, and undeniably beautiful.
                Based in Accra, serving Queens worldwide.
              </p>

              <div className="pt-8 border-t border-base-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-primary rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-content font-black text-3xl font-serif italic">Q</span>
                </div>
                <div>
                  <h3 className="text-base-content font-black text-xl mb-1">Elevate Your Style</h3>
                  <p className="font-black text-primary tracking-widest uppercase text-xs">#QueensGlow #GlossyKiss</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Values Grid ────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-base-200/50 border-y border-base-200 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-3 block">What We Stand For</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Our Values</h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.08}>
                <div className="bg-base-100 border border-base-200 rounded-2xl p-6 sm:p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group h-full">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-black text-base-content text-lg mb-2">{title}</h3>
                  <p className="text-base-content/60 text-sm leading-relaxed font-medium">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 md:px-8 text-center">
        <FadeUp>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Ready to Shop the <span className="text-primary">Collection?</span>
          </h2>
          <p className="text-base-content/50 text-base font-medium mb-8 max-w-md mx-auto">
            Discover luxury fashion, beauty, and accessories curated just for you.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-content font-black text-sm uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Shop Now
          </Link>
        </FadeUp>
      </section>

    </div>
  );
};

export default About;
