import { motion } from 'motion/react';

const MENU_ITEMS = [
  {
    id: 'neon-noodles',
    name: 'Neon Noodles',
    description: 'Bioluminescent udon in a savory synthetic miso broth, topped with digital-grown scallions and a perfectly soft-boiled quantum egg.',
    price: 14.99,
    imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 'cyber-burger',
    name: 'Cyber-Burger',
    description: 'A high-protein synth-beef patty layered with sharp cheddar-alg, holographic pickles, and our signature binary sauce on a toasted brioche-carbon bun.',
    price: 18.50,
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 'quantum-cola',
    name: 'Quantum Cola',
    description: 'A refreshing, zero-gravity beverage that shifts flavors with every sip. Served ice-cold in a containment vessel.',
    price: 5.00,
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800",
  }
];

export function Menu() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MENU_ITEMS.map((item, index) => (
        <motion.div 
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-panel group overflow-hidden"
        >
          <div className="h-40 overflow-hidden relative bg-zinc-800">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700 opacity-60 group-hover:opacity-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent opacity-60" />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-white font-mono tracking-tighter group-hover:text-accent transition-colors">{item.name}</h3>
              <span className="text-accent font-mono text-sm">${item.price.toFixed(2)}</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
