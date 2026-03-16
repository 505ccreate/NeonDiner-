import { Mic, MicOff, Loader2, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveAgentProps {
  connected: boolean;
  isSpeaking: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function LiveAgent({ connected, isSpeaking, onConnect, onDisconnect }: LiveAgentProps) {
  return (
    <div className="glass-panel p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
      
      {/* Background pulse when speaking */}
      {isSpeaking && (
        <motion.div 
          className="absolute inset-0 bg-accent/5"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      <div className="relative z-10 w-full">
        <div className="flex justify-center mb-8">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center border transition-all duration-700 ${connected ? 'border-accent bg-accent/5 shadow-[0_0_30px_rgba(0,255,157,0.15)]' : 'border-white/5 bg-black/40'}`}>
            {connected ? (
              <div className="relative">
                <Radio className={`w-10 h-10 ${isSpeaking ? 'text-accent animate-pulse' : 'text-accent/40'}`} />
                {isSpeaking && (
                  <motion.div 
                    className="absolute -inset-4 border border-accent rounded-full"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </div>
            ) : (
              <MicOff className="w-10 h-10 text-zinc-800" />
            )}
          </div>
        </div>

        <h2 className="text-lg font-bold text-white font-mono mb-2 tracking-widest uppercase">
          {connected ? 'Agent Karen' : 'Offline'}
        </h2>
        
        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-8 h-10 leading-relaxed">
          {connected 
            ? (isSpeaking ? 'Analyzing subject data...' : 'Awaiting verbal input...') 
            : 'Initialize secure voice uplink to proceed.'}
        </p>

        <button
          onClick={connected ? onDisconnect : onConnect}
          className={`w-full py-4 rounded-xl font-bold font-mono uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 transition-all ${
            connected 
              ? 'bg-red-500/5 text-red-500 hover:bg-red-500/10 border border-red-500/20' 
              : 'bg-accent hover:bg-accent/80 text-charcoal shadow-[0_0_20px_rgba(0,255,157,0.2)]'
          }`}
        >
          {connected ? (
            <>
              <MicOff className="w-4 h-4" />
              Terminate Link
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Establish Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
