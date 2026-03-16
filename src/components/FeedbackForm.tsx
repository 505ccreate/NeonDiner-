import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackFormProps {
  onSubmit: (data: { name: string; rating: number; comments: string }) => void;
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, rating, comments });
      setSubmitted(true);
      setName('');
      setRating(5);
      setComments('');
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
  };

  return (
    <section className="glass-panel p-8 relative overflow-hidden">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2 font-mono tracking-widest uppercase">Customer Feedback</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest">Transmission logged via secure uplink.</p>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity duration-300 ${submitted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">Subject Name</label>
            <input 
              type="text" 
              required
              disabled={isSubmitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-accent/50 transition-all font-mono text-sm placeholder:text-zinc-700 disabled:opacity-50"
              placeholder="DECKARD_R"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">Satisfaction Index</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setRating(num)}
                  className={`flex-1 py-3 rounded-xl border transition-all font-mono text-sm ${
                    rating === num 
                      ? 'bg-accent border-accent text-charcoal font-bold shadow-[0_0_15px_rgba(0,255,157,0.3)]' 
                      : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/10'
                  } disabled:opacity-50`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">Transmission Data</label>
          <textarea 
            required
            disabled={isSubmitting}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-accent/50 transition-all font-mono text-sm min-h-[120px] resize-none placeholder:text-zinc-700 disabled:opacity-50"
            placeholder="ENCRYPTED_MESSAGE_HERE..."
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent/80 text-charcoal font-bold py-4 rounded-xl transition-all font-mono uppercase tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(0,255,157,0.2)] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
              Transmitting...
            </>
          ) : 'Initiate Transmission'}
        </button>
      </form>

      <AnimatePresence>
        {submitted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 bg-charcoal/95 flex flex-col items-center justify-center text-accent p-8 text-center z-10"
          >
            <div className="w-20 h-20 rounded-full border border-accent flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,157,0.2)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-[0.2em] mb-2 text-white">Transmission Logged</h3>
            <p className="font-mono text-[10px] text-zinc-500 mb-8 max-w-xs uppercase tracking-widest">Data archived in Sector 7G. Karen has been notified.</p>
            
            <button
              onClick={handleReset}
              className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/50 px-10 py-3 rounded-full font-mono text-[10px] uppercase tracking-[0.3em] transition-all"
            >
              New Transmission
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
