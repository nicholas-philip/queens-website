// =====================================================
// pages/BeautyQuiz.jsx  —  FIXED
//
// Fixes:
//   1. Was posting { skinType, concern, routine } but backend quizController
//      expects { answers: { skinType, skinTone, ... }, sessionId }.
//      The controller was always returning fallback best-sellers because
//      `answers` was undefined — quiz personalisation was completely broken.
//   2. Added sessionId (stable per browser session via sessionStorage).
//   3. Added newsletter opt-in that wires to backend subscribeNewsletter flag.
//   4. UI: improved answer selection feedback, better loading state.
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import ProductCard from '../components/ProductCard';

// Stable session ID — persists for the browser session
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
    id: 'skinConcerns', // now an array — matches backend answers.skinConcerns
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
      { label: 'Under GHS 50',       value: 'under-5000' },
      { label: 'GHS 50 – 150',       value: '5000-15000' },
      { label: 'GHS 150+',           value: '15000-plus' },
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
      // Toggle multi-select
      const current = answers.skinConcerns || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers(p => ({ ...p, skinConcerns: next }));
    } else {
      const nextAnswers = { ...answers, [question.id]: value };
      setAnswers(nextAnswers);

      // Auto-advance on single-select
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
          skinType:      finalAnswers.skinType      || '',
          skinTone:      finalAnswers.skinTone      || '',
          skinConcerns:  finalAnswers.skinConcerns  || [],
          makeupStyle:   finalAnswers.makeupStyle   || '',
          budget:        finalAnswers.budget        || '',
        },
        sessionId,
        email:                email || null,
        subscribeNewsletter:  subscribeNewsletter,
      });
      setRecs(data.recommendations || []);
    } catch (err) {
      console.error('Quiz error:', err);
      setRecs([]); // show fallback
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
    <div className="min-h-screen bg-[#FDFDFC] pt-32 pb-24 font-sans">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-700 mx-auto mb-5">
            <Sparkles size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            The Routine <span className="text-green-700 italic font-serif">Quiz</span>.
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Answer {QUESTIONS.length} quick questions and we'll curate your perfect routine.
          </p>
        </div>

        {/* Quiz panel */}
        {!recommendations && !loading && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Progress */}
            <div className="flex justify-between items-center mb-10">
              <span className="text-green-700 font-black tracking-widest text-xs uppercase">
                Step {step} of {QUESTIONS.length}
              </span>
              <div className="flex gap-2">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 <= step ? 'bg-green-700 w-10' : 'bg-gray-100 w-6'
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
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-7">
                  {question.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        className={`py-4 px-5 rounded-2xl border-2 text-left font-bold transition-all duration-200 ${
                          isSelected
                            ? 'border-green-700 bg-green-50 text-green-700 shadow-sm'
                            : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`inline-block w-4 h-4 rounded border-2 mr-2 align-middle transition-all ${
                          isSelected ? 'bg-green-700 border-green-700' : 'border-gray-300'
                        }`} />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Multi-select next button */}
                {question.multi && (
                  <button
                    onClick={handleMultiNext}
                    className="mt-6 w-full py-4 bg-green-700 text-white font-extrabold rounded-2xl hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {step < QUESTIONS.length ? 'Next' : 'Get my picks'}
                    <ArrowRight size={18} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Newsletter opt-in — only show on last step */}
            {step === QUESTIONS.length && !question.multi && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 pt-8 border-t border-gray-100 space-y-3"
              >
                <p className="text-sm font-bold text-gray-700">Get your results + beauty tips in your inbox?</p>
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-green-700 transition-all placeholder:text-gray-400"
                />
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 border-4 border-gray-100 border-t-green-700 rounded-full animate-spin mb-5" />
            <h3 className="text-2xl font-extrabold text-gray-900">Curating your picks...</h3>
            <p className="text-gray-500 mt-2">Matching products to your unique profile.</p>
          </div>
        )}

        {/* Results */}
        {recommendations && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10 border-b border-gray-100 pb-10">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-bold text-sm tracking-wide mb-5">
                <CheckCircle2 size={15} /> Match Complete
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Your Signature Routine</h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">
                Based on your answers, we picked these essentials for optimal results.
              </p>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-2 gap-5 max-w-4xl mx-auto">
                {recommendations.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 font-medium">
                  No direct matches found — browse our full collection!
                </p>
              </div>
            )}

            <div className="text-center mt-10">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-green-700 uppercase tracking-widest text-sm transition-colors"
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