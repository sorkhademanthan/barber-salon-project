import React from 'react';
import { motion } from 'framer-motion';
import { Scissors, MapPin, Calendar } from 'lucide-react';

const ShopDetail = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-luxury">
              <Scissors className="text-black" size={28} />
            </div>
            <h1 className="text-4xl font-black font-display text-white">
              Shop Details
            </h1>
          </div>
          <p className="text-lg text-zinc-400 mb-4">
            Explore shop details, services, and booking options.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-10 text-center shadow-luxury"
        >
          <MapPin className="mx-auto text-amber-400 mb-4" size={48} />
          <h2 className="text-2xl font-black text-white mb-2 font-display">
            🚧 Shop details page coming soon! 🚧
          </h2>
          <p className="text-zinc-400 mb-4">
            This will show shop details, services, and booking options.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-luxury"
              disabled
            >
              Book Now
            </button>
            <button
              className="bg-zinc-900 border border-zinc-700 text-white font-bold px-6 py-3 rounded-xl shadow-luxury"
              disabled
            >
              View Services
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopDetail;
