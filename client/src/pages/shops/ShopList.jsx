import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Scissors, Search } from 'lucide-react';

const ShopList = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-luxury">
              <Scissors className="text-black" size={28} />
            </div>
            <h1 className="text-4xl font-black font-display text-white">
              Find Barber Shops
            </h1>
          </div>
          <p className="text-lg text-zinc-400 mb-4">
            Discover premium barber shops near you. Book instantly and skip the queue.
          </p>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2 w-full max-w-md">
              <Search className="text-amber-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search by city, shop name, or service..."
                className="bg-transparent text-white w-full outline-none placeholder:text-zinc-400"
                disabled
              />
            </div>
            <button
              className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold px-6 py-2 rounded-xl shadow-luxury"
              disabled
            >
              Search
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-10 text-center shadow-luxury"
        >
          <MapPin className="mx-auto text-amber-400 mb-4" size={48} />
          <h2 className="text-2xl font-black text-white mb-2 font-display">
            Shop listing page coming soon!
          </h2>
          <p className="text-zinc-400 mb-4">
            This will show nearby barber shops with live queue status.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopList;
