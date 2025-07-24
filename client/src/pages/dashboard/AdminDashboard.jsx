import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Building,
  TrendingUp,
  Scissors,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBarbers: 0,
    totalCustomers: 0,
    totalShops: 0,
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    avgRating: 4.8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo
      setStats({
        totalUsers: 156,
        totalBarbers: 24,
        totalCustomers: 132,
        totalShops: 8,
        totalBookings: 342,
        todayBookings: 12,
        totalRevenue: 45600,
        avgRating: 4.8,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
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
                Your luxury business dashboard. Every detail matters.
              </p>
            </div>
            <div className="flex items-center gap-4">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          <Link to="/create-shop">
            <motion.div
              className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-8 flex flex-col items-center justify-center shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-4 bg-amber-400/20 rounded-xl mb-4">
                <Building className="text-amber-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 font-display">Create Shop</h3>
              <p className="text-zinc-400 text-base">Add a new location</p>
            </motion.div>
          </Link>
          <Link to="/create-barber">
            <motion.div
              className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 flex flex-col items-center justify-center shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-4 bg-zinc-700/30 rounded-xl mb-4">
                <Scissors className="text-amber-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 font-display">Add Barber</h3>
              <p className="text-zinc-400 text-base">Recruit talent</p>
            </motion.div>
          </Link>
          <Link to="/users">
            <motion.div
              className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 flex flex-col items-center justify-center shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-4 bg-zinc-700/30 rounded-xl mb-4">
                <Users className="text-amber-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 font-display">Manage Users</h3>
              <p className="text-zinc-400 text-base">User oversight</p>
            </motion.div>
          </Link>
          <Link to="/all-bookings">
            <motion.div
              className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 flex flex-col items-center justify-center shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-4 bg-zinc-700/30 rounded-xl mb-4">
                <Calendar className="text-amber-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 font-display">View Bookings</h3>
              <p className="text-zinc-400 text-base">All appointments</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Section Divider */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-amber-400 font-black text-lg">Business Overview</span>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-400/40 to-yellow-500/10 rounded-full" />
        </div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-8 flex items-center shadow-luxury hover:shadow-luxury-lg transition-all duration-300"
          >
            <div className="p-4 bg-amber-400/20 rounded-xl">
              <Users className="text-amber-400" size={32} />
            </div>
            <div className="ml-6">
              <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
              <p className="text-zinc-400 text-lg">Total Users</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 flex items-center shadow-luxury hover:shadow-luxury-lg transition-all duration-300"
          >
            <div className="p-4 bg-zinc-700/30 rounded-xl">
              <Scissors className="text-amber-400" size={32} />
            </div>
            <div className="ml-6">
              <p className="text-4xl font-black text-white">{stats.totalBarbers}</p>
              <p className="text-zinc-400 text-lg">Active Barbers</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 flex items-center shadow-luxury hover:shadow-luxury-lg transition-all duration-300"
          >
            <div className="p-4 bg-zinc-700/30 rounded-xl">
              <Calendar className="text-amber-400" size={32} />
            </div>
            <div className="ml-6">
              <p className="text-4xl font-black text-white">{stats.totalBookings}</p>
              <p className="text-zinc-400 text-lg">Total Bookings</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-8 flex items-center shadow-luxury hover:shadow-luxury-lg transition-all duration-300"
          >
            <div className="p-4 bg-amber-400/20 rounded-xl">
              <TrendingUp className="text-amber-400" size={32} />
            </div>
            <div className="ml-6">
              <p className="text-4xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-zinc-400 text-lg">Total Revenue</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-3xl p-10 shadow-luxury">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white font-display">Recent Activity</h2>
              <Link to="/all-bookings" className="text-xs text-amber-400 hover:text-yellow-400 transition-colors font-bold">
                View All
              </Link>
            </div>
            <div className="text-center py-12">
              <Calendar className="mx-auto text-amber-400 mb-6 animate-bounce" size={56} />
              <p className="text-zinc-400 text-lg mb-4">
                Your business activity will appear here
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <span className="inline-block w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                <span className="inline-block w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
       