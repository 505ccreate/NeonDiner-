import { useState, useCallback } from 'react';
import { Menu } from './components/Menu';
import { Cart, CartItem } from './components/Cart';
import { LiveAgent } from './components/LiveAgent';
import { FeedbackForm } from './components/FeedbackForm';
import { VoiceHUD } from './components/VoiceHUD';
import { useLiveAPI } from './hooks/useLiveAPI';

const MENU_PRICES: Record<string, number> = {
  'Neon Noodles': 14.99,
  'Cyber-Burger': 18.50,
  'Quantum Cola': 5.00,
};

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const handleTriggerManagerAlert = useCallback(() => {
    setIsAlarmActive(true);
    
    // Play alarm sound
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    
    const now = ctx.currentTime;
    // Siren effect
    for (let i = 0; i < 10; i++) {
      osc.frequency.setValueAtTime(800, now + i * 0.4);
      osc.frequency.linearRampToValueAtTime(1200, now + i * 0.4 + 0.2);
      osc.frequency.linearRampToValueAtTime(800, now + i * 0.4 + 0.4);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 4);
    osc.stop(now + 4);

    setTimeout(() => {
      setIsAlarmActive(false);
    }, 4000);
  }, []);

  const handleAddToCart = useCallback((itemName: string, quantity: number) => {
    if (!MENU_PRICES[itemName]) {
      throw new Error(`Item '${itemName}' is not on the menu.`);
    }
    setCartItems(prev => {
      const existingItem = prev.find(item => item.name === itemName);
      if (existingItem) {
        return prev.map(item => 
          item.name === itemName 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      const price = MENU_PRICES[itemName];
      return [...prev, { id: Math.random().toString(36).substr(2, 9), name: itemName, quantity, price }];
    });
  }, []);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleRemoveItemByName = useCallback((itemName: string) => {
    setCartItems(prev => {
      const exists = prev.some(item => item.name === itemName);
      if (!exists) {
        throw new Error(`Item '${itemName}' is not in the cart.`);
      }
      return prev.filter(item => item.name !== itemName);
    });
  }, []);

  const { connect, disconnect, connected, isSpeaking, transcription, session } = useLiveAPI(handleAddToCart, handleRemoveItemByName, handleTriggerManagerAlert);

  const handleFeedbackSubmit = useCallback(async (data: { name: string; rating: number; comments: string }) => {
    console.log('Submitting feedback to Google Script:', data);
    
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzcsyo5R_yu-KICgWGrdUq9BRWVIDm0MAw2I3QeKHBRcNPuGg62alEc3Jt0peLVGlSD3g/exec';

    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Since mode is no-cors, we can't check response.ok, but if fetch didn't throw, we assume success
      console.log('Feedback transmission successful');

      // Notify Karen via tool call if session is active
      if (session) {
        session.sendToolResponse({
          functionResponses: [{
            id: "feedback_" + Date.now(),
            name: "submitFeedback",
            response: { 
              result: "success", 
              message: `User submitted feedback with a ${data.rating}-star rating. Transmission logged.` 
            }
          }]
        });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error; // Re-throw so FeedbackForm knows it failed
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-charcoal text-zinc-400 font-sans selection:bg-accent/30 overflow-x-hidden">
      {/* Neon Glow Effects */}
      <div className="neon-glow-cyan" />
      <div className="neon-glow-magenta" />
      
      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <VoiceHUD text={transcription} connected={connected} />
      
      {isAlarmActive && (
        <div className="fixed inset-0 bg-red-600/20 pointer-events-none z-[100] animate-pulse flex items-center justify-center">
          <h1 className="text-6xl md:text-8xl font-black text-red-500 tracking-widest uppercase text-center drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">
            Manager Summoned
          </h1>
        </div>
      )}

      <header className="border-b border-white/5 bg-charcoal/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,255,157,0.4)]">
              <span className="font-bold text-charcoal font-mono text-xl">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-[0.2em] text-white leading-none">
                NEON<span className="text-accent">NOIR</span>
              </h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Diner OS v2.0</p>
            </div>
          </div>
          <div className="hidden md:block text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
            Sector 7G // Tokyo-3
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content - Menu & Feedback */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-px flex-1 bg-white/5" />
                  <h2 className="text-sm font-mono text-accent uppercase tracking-[0.4em]">Synthetic Menu</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <p className="text-center text-zinc-500 text-xs uppercase tracking-widest">Nutrient-dense bio-matter for the discerning cyborg.</p>
              </div>
              <Menu />
            </section>

            <section>
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-px flex-1 bg-white/5" />
                  <h2 className="text-sm font-mono text-accent uppercase tracking-[0.4em]">Transmission Terminal</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
              </div>
              <FeedbackForm onSubmit={handleFeedbackSubmit} />
            </section>
          </div>

          {/* Sidebar - Live Agent & Cart */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-28 space-y-8">
              <LiveAgent 
                connected={connected} 
                isSpeaking={isSpeaking} 
                onConnect={connect} 
                onDisconnect={disconnect} 
              />
              <Cart items={cartItems} onRemove={handleRemoveFromCart} />
            </div>
          </div>

        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em]">© 2084 Neon-Noir Enterprises</p>
          <div className="flex gap-8">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Privacy Protocol</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Service Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
