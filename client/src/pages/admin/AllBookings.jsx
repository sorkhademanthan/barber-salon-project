import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const AllBookings = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="luxury-card p-8">
          <Calendar className="mx-auto text-primary-300 mb-4" size={64} />
          <h1 className="text-2xl font-display font-bold text-primary-900 mb-2">
            All Bookings
          </h1>
          <p className="text-primary-600 mb-4">
            This page is coming soon. You'll be able to view all bookings here.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AllBookings;
