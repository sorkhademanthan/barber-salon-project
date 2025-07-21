import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Heart,
  Bell,
  MapPin,
  CalendarPlus,
  History,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CustomerDashboard = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    totalBookings: 0,
    favoriteShops: 0,
    reviews: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
      ]);
      const bookings = bookingsRes.data.data;

      setStats({
        upcomingBookings: bookings.filter(b =>
          ['pending', 'confirmed'].includes(b.status)
        ).length,
        totalBookings: bookings.length,
        favoriteShops: user.favoriteShops?.length || 0,
        reviews: user.reviews?.length || 0,
        notifications: user.notifications?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-black">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Hero Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black font-display text-white mb-2 leading-tight">
                Welcome,{' '}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0]}
                </span>
              </h1>
              <p className="text-lg text-zinc-400 font-medium">
                Your premium grooming journey starts here.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/notifications" className="relative">
                <Bell className="text-amber-400" size={32} />
                {stats.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {stats.notifications}
                  </span>
                )}
              </Link>
              <Link to="/profile">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-luxury"
                  />
                ) : (
                  <div className="w-12 h-12 bg-amber-400 text-black font-black flex items-center justify-center rounded-full text-xl border-2 border-amber-400 shadow-luxury">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          <Link to="/book">
            <motion.div
              className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-8 flex items-center justify-between shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-1 font-display">Book New Appointment</h3>
                <p className="text-zinc-400 text-base">Schedule your next grooming session</p>
              </div>
              <div className="p-4 bg-amber-400/20 rounded-xl">
                <CalendarPlus className="text-amber-400" size={32} />
              </div>
            </motion.div>
          </Link>
          <Link to="/bookings">
            <motion.div
              className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 flex items-center justify-between shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-1 font-display">My Bookings</h3>
                <p className="text-zinc-400 text-base">View and manage your appointments</p>
              </div>
              <div className="p-4 bg-zinc-700/30 rounded-xl">
                <History className="text-amber-400" size={32} />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-8 flex items-center shadow-luxury"
          >
            <div className="p-4 bg-amber-400/20 rounded-xl">
              <Calendar className="text-amber-400" size={32} />
            </div>
            <div className="ml-6">
              <p className="text-4xl font-black text-white">{stats.upcomingBookings}</p>
              <p className="text-zinc-400 text-lg">Upcoming Bookings</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 flex items-center shadow-luxury"
          >
            <div className="p-4 bg-zinc-700/30 rounded-xl">
              <Clock className="text-amber-400" size={32} />
            </div>
            <div className="ml-6">
              <p className="text-4xl font-black text-white">{stats.totalBookings}</p>
              <p className="text-zinc-400 text-lg">Total Appointments</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 flex items-center shadow-luxury"
          >
            <div className="p-4 bg-zinc-700/30 rounded-xl">
              <Heart className="text-amber-400" size={32} />
            </div>
            <div className="ml-6">
              <p className="text-4xl font-black text-white">{stats.favoriteShops}</p>
              <p className="text-zinc-400 text-lg">Favorite Shops</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Recommendations (Shops Near Me) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-3xl p-10 shadow-luxury">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white font-display">Shops Near Me</h2>
              <span className="text-xs text-zinc-400">Enable location for better suggestions</span>
            </div>
            <div className="text-center py-12">
              <MapPin className="mx-auto text-amber-400 mb-6" size={56} />
              <p className="text-zinc-400 text-lg mb-4">
                Location-based recommendations coming soon!
              </p>
              <Button variant="primary" disabled>
                Enable Location
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
         
       