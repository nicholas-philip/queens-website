// =====================================================
// pages/BeautyQuiz.jsx  —  RESPONSIVE + THEME-AWARE
// =====================================================

import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import ProductCard from '../components/ProductCard';

const getSessionId = () => {
  let id = sessionStorage.getItem('queens_quiz_session');
  if (!id) {
    id = `qs-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('queens_quiz_session', id);
  }
  return id;
};

const QUESTIONS = [
  {
    id: 'skinType',
    title: 'How would you describe your skin?',
    options: ['Oily', 'Combination', 'Dry', 'Sensitive', 'Normal'],
  },
  {
    id: 'skinConcerns',
    title: 'What are your main beauty concerns?',
    multi: true,
    options: ['Acne & Blemishes', 'Anti-Aging', 'Hydration', 'Dark Spots', 'Radiance', 'Even Skin Tone'],
  },
  {
    id: 'makeupStyle',
    title: 'Which best describes your makeup style?',
    options: ['No-Makeup Look', 'Glam & Bold', 'Natural Glow', 'Minimal', 'Full Coverage'],
  },
  {
    id: 'budget',
    title: 'What is your budget range?',
    options: [
      { label: 'Under GHS 50', value: 'under-5000' },
      { label: 'GHS 50 – 150', value: '5000-15000' },
      { label: 'GHS 150+',     value: '15000-plus' },
    ],
  },
];

const BeautyQuiz = () => {
  const [step, setStep]               = useState(1);
  const [answers, setAnswers]         = useState({ skinConcerns: [] });
  const [recommendations, setRecs]    = useState(null);
  const [loading, setLoading]         = useState(false);
  const [email, setEmail]             = useState('');
  const [subscribeNewsletter, setSub] = useState(false);
  const sessionId = useRef(getSessionId()).current;

  const question = QUESTIONS[step - 1];

  const handleSelect = (option) => {
    const value = option.value ?? option;

    if (question.multi) {
      const current = answers.skinConcerns || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers(p => ({ ...p, skinConcerns: next }));
    } else {
      const nextAnswers = { ...answers, [question.id]: value };
      setAnswers(nextAnswers);
      if (step < QUESTIONS.length) {
        setTimeout(() => setStep(s => s + 1), 280);
      } else {
        submitQuiz(nextAnswers);
      }
    }
  };

  const handleMultiNext = () => {
    if (step < QUESTIONS.length) {
      setStep(s => s + 1);
    } else {
      submitQuiz(answers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/submit', {
        answers: {
          skinType:     finalAnswers.skinType     || '',
          skinTone:     finalAnswers.skinTone     || '',
          skinConcerns: finalAnswers.skinConcerns || [],
          makeupStyle:  finalAnswers.makeupStyle  || '',
          budget:       finalAnswers.budget       || '',
        },
        sessionId,
        email:               email || null,
        subscribeNewsletter: subscribeNewsletter,
      });
      setRecs(data.recommendations || []);
    } catch (err) {
      console.error('Quiz error:', err);
      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setAnswers({ skinConcerns: [] });
    setRecs(null);
    setLoading(false);
    setEmail('');
    setSub(false);
  };

  return (
    <div className="min-h-screen bg-base-200/40 pt-28 sm:pt-32 pb-16 sm:pb-24 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="w-12 sm:w-14 h-12 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4 sm:mb-5">
            <Sparkles size={26} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-base-content tracking-tight mb-3">
            The Routine <span className="text-primary italic font-serif">Quiz</span>.
          </h1>
          <p className="text-base-content/60 font-medium text-base sm:text-lg">
            Answer {QUESTIONS.length} quick questions and we'll curate your perfect routine.
          </p>
        </div>

        {/* Quiz panel */}
        {!recommendations && !loading && (
          <div className="bg-base-100 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-sm border border-base-200 relative overflow-hidden">
            {/* Progress */}
            <div className="flex justify-between items-center mb-8 sm:mb-10">
              <span className="text-primary font-black tracking-widest text-xs uppercase">
                Step {step} of {QUESTIONS.length}
              </span>
              <div className="flex gap-1.5 sm:gap-2">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 <= step ? 'bg-primary w-8 sm:w-10' : 'bg-base-200 w-5 sm:w-6'
                    }`}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-base-content mb-5 sm:mb-7">
                  {question.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {question.options.map((opt) => {
                    const label = opt.label ?? opt;
                    const value = opt.value ?? opt;
                    const isSelected = question.multi
                      ? (answers.skinConcerns || []).includes(value)
                      : answers[question.id] === value;

                    return (
                      <button
                        key={value}
                        onClick={() => handleSelect(opt)}
                        className={`py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl border-2 text-left font-bold transition-all duration-200 text-sm sm:text-base ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-base-200 bg-base-100 text-base-content/70 hover:border-base-300 hover:bg-base-200/50'
                        }`}
                      >
                        <span className={`inline-block w-4 h-4 rounded border-2 mr-2 align-middle transition-all ${
                          isSelected ? 'bg-primary border-primary' : 'border-base-300'
                        }`} />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {question.multi && (
                  <button
                    onClick={handleMultiNext}
                    className="mt-5 sm:mt-6 w-full py-4 btn btn-primary rounded-2xl font-extrabold flex items-center justify-center gap-2"
                  >
                    {step < QUESTIONS.length ? 'Next' : 'Get my picks'}
                    <ArrowRight size={18} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Newsletter opt-in */}
            {step === QUESTIONS.length && !question.multi && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-base-200 space-y-3"
              >
                <p className="text-sm font-bold text-base-content/70">Get your results + beauty tips in your inbox?</p>
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-base-200 border border-base-300 rounded-xl px-4 py-3 text-base-content text-sm outline-none focus:border-primary transition-all placeholder:text-base-content/30"
                />
                <label className="flex items-center gap-2 text-sm text-base-content/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={e => setSub(e.target.checked)}
                    className="rounded"
                  />
                  Subscribe to the Queens newsletter
                </label>
              </motion.div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="w-12 sm:w-14 h-12 sm:h-14 border-4 border-base-200 border-t-primary rounded-full animate-spin mb-5" />
            <h3 className="text-xl sm:text-2xl font-extrabold text-base-content">Curating your picks...</h3>
            <p className="text-base-content/60 mt-2 text-sm sm:text-base">Matching products to your unique profile.</p>
          </div>
        )}

        {/* Results */}
        {recommendations && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8 sm:mb-10 border-b border-base-200 pb-8 sm:pb-10">
              <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full font-bold text-sm tracking-wide mb-4 sm:mb-5">
                <CheckCircle2 size={15} /> Match Complete
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content">Your Signature Routine</h2>
              <p className="text-base-content/60 mt-2 sm:mt-3 max-w-lg mx-auto text-sm sm:text-base">
                Based on your answers, we picked these essentials for optimal results.
              </p>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
                {recommendations.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-base-content/40 font-medium">
                  No direct matches found — browse our full collection!
                </p>
              </div>
            )}

            <div className="text-center mt-8 sm:mt-10">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-base-content/40 font-bold hover:text-primary uppercase tracking-widest text-sm transition-colors"
              >
                <RotateCcw size={14} /> Retake quiz
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BeautyQuiz;