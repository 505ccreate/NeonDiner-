import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface CartProps {
  items: CartItem[];
  onRemove: (id: string) => void;
}

export function Cart({ items, onRemove }: CartProps) {
  const [isCheckout, setIsCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', table: '', amount: '' });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="glass-panel p-6 flex flex-col h-full relative overflow-hidden min-h-[400px]">
      <AnimatePresence mode="wait">
        {!isCheckout ? (
          <motion.div 
            key="cart" 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -20, opacity: 0 }} 
            className="flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="text-accent w-5 h-5" />
              <h2 className="text-lg font-bold text-white font-mono tracking-tighter uppercase">Order Queue</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4 opacity-20">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-mono">Queue Empty // Awaiting Input</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 group hover:border-white/10 transition-colors"
                  >
                    <div>
                      <p className="text-zinc-200 font-bold text-xs font-mono uppercase tracking-tight">{item.name}</p>
                      <p className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest mt-0.5">{item.quantity} units @ ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-accent font-mono text-xs">${(item.quantity * item.price).toFixed(2)}</span>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="text-zinc-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Total Credits</span>
                  <span className="text-xl font-bold text-accent font-mono tracking-tighter">${total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setIsCheckout(true)}
                  className="w-full bg-accent hover:bg-accent/80 text-charcoal font-bold py-3 rounded-xl transition-all font-mono uppercase tracking-[0.2em] text-xs shadow-[0_0_15px_rgba(0,255,157,0.2)]"
                >
                  Authorize Payment
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="checkout" 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 20, opacity: 0 }} 
            className="flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setIsCheckout(false)} className="text-zinc-600 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-white font-mono tracking-tighter uppercase">Payment Protocol</h2>
            </div>

            <div className="flex-1 space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1.5 uppercase tracking-widest">Subject Identity</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-accent/50 transition-all font-mono text-sm placeholder:text-zinc-800"
                  placeholder="DECKARD_R"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1.5 uppercase tracking-widest">Station ID</label>
                <input 
                  type="text" 
                  value={formData.table}
                  onChange={e => setFormData({...formData, table: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-accent/50 transition-all font-mono text-sm placeholder:text-zinc-800"
                  placeholder="SECTOR_7G"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1.5 uppercase tracking-widest">Credit Allocation</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 font-mono text-sm">$</span>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-8 pr-4 py-3 text-zinc-200 focus:outline-none focus:border-accent/50 transition-all font-mono text-sm placeholder:text-zinc-800"
                    placeholder={total.toFixed(2)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <button 
                onClick={() => {
                  console.log(`Payment of $${formData.amount || total.toFixed(2)} processed for ${formData.name || 'Guest'} at Table ${formData.table || 'Unknown'}.`);
                  setIsCheckout(false);
                }}
                className="w-full bg-accent hover:bg-accent/80 text-charcoal font-bold py-4 rounded-xl transition-all font-mono uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(0,255,157,0.2)] flex items-center justify-center gap-3"
              >
                <CreditCard className="w-4 h-4" />
                Execute Transfer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
