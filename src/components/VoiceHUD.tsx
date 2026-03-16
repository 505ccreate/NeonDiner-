import { motion, AnimatePresence } from 'motion/react';

interface VoiceHUDProps {
  text: string;
  connected: boolean;
}

export function VoiceHUD({ text, connected }: VoiceHUDProps) {
  if (!connected) return null;

  return (
    <div className="sticky top-0 z-[100] w-full bg-zinc-950/90 backdrop-blur-md border-b border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-3">
        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <AnimatePresence>
          <motion.p
            key={text || 'empty'}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.1 }}
            className="text-emerald-400 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-center drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"
          >
            {text ? text : "Diner Mic Active... Listening."}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
