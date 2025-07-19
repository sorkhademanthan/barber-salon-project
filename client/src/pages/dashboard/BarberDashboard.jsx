import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scissors,
  DollarSign,
  Eye,
  BarChart3,
  Target,
  Award,
  Zap,
  Coffee,
  Sparkles,
  Timer,
  MapPin,
  Phone,
  MessageSquare,
  Settings,
  Bell,
  ChevronRight,
  Activity,
  ThumbsUp,
  Gift
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const BarberDashboard = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState({
    todayBookings: 0,
    upcomingBookings: 0,
    completedToday: 0,
    totalEarnings: 0,
    weeklyEarnings: 0,
    averageRating: 4.8,
    totalClients: 0,
    completionRate: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const getCurrentGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [bookingsRes] = await Promise.all([
        api.get(`/bookings/barber?date=${today}`),
      ]);

      const todayBookings = bookingsRes.data.data;
      const completedBookings = todayBookings.filter(b => b.status === 'completed');
      
      setStats({
        todayBookings: todayBookings.length,
        upcomingBookings: todayBookings.filter(b => 
          ['pending', 'confirmed'].includes(b.status)
        ).length,
        completedToday: completedBookings.length,
        totalEarnings: completedBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        weeklyEarnings: completedBookings.reduce((sum, b) => sum + b.totalAmount, 0) * 6, // Mock weekly
        averageRating: 4.8,
        totalClients: 127, // Mock data
        completionRate: todayBookings.length > 0 ? Math.round((completedBookings.length / todayBookings.length) * 100) : 0,
      });

      setTodayAppointments(todayBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-amber-400/10 text-amber-400 border-amber-400/20', 
        icon: Clock,
        label: 'Pending'
      },
      confirmed: { 
        color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', 
        icon: CheckCircle,
        label: 'Confirmed'
      },
      completed: { 
        color: 'bg-green-400/10 text-green-400 border-green-400/20', 
        icon: CheckCircle,
        label: 'Completed'
      },
      cancelled: { 
        color: 'bg-red-400/10 text-red-400 border-red-400/20', 
        icon: XCircle,
        label: 'Cancelled'
      },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getNextAppointment = () => {
    const upcoming = todayAppointments
      .filter(apt => ['pending', 'confirmed'].includes(apt.status))
      .sort((a, b) => a.slot?.startTime?.localeCompare(b.slot?.startTime))[0];
    return upcoming;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-zinc-400 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const nextAppointment = getNextAppointment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <motion.h1 
                className="text-4xl md:text-5xl font-black text-white mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {getCurrentGreeting()}, <span className="text-amber-400">{user?.name?.split(' ')[0]}</span>! 
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="inline-block ml-2"
                >
                  ✂️
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-zinc-400 text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Ready to make some magic happen today?
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-4 mt-4 lg:mt-0"
            >
              <div className="text-right">
                <div className="text-white font-semibold">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-amber-400 font-bold text-lg">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Sparkles className="text-black" size={24} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Next Appointment Alert */}
        <AnimatePresence>
          {nextAppointment && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center">
                      <Timer className="text-amber-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Next Appointment</h3>
                      <p className="text-zinc-300">
                        <span className="text-amber-400 font-semibold">{nextAppointment.customer?.name}</span> at{' '}
                        <span className="text-amber-400 font-semibold">{nextAppointment.slot?.startTime}</span>
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {nextAppointment.services?.map(s => s.service?.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">₹{nextAppointment.totalAmount}</div>
                    <div className="text-zinc-400 text-sm">Total Amount</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Link to="/appointments">
            <motion.div
              className="group bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/5"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-xl group-hover:from-amber-400/30 group-hover:to-yellow-500/30 transition-all duration-300">
                  <Calendar className="text-amber-400" size={24} />
                </div>
                <ChevronRight className="text-zinc-400 group-hover:text-amber-400 transition-colors" size={20} />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Appointments</h3>
              <p className="text-zinc-400 text-sm">Manage your schedule</p>
            </motion.div>
          </Link>

          <Link to="/availability">
            <motion.div
              className="group bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-400/50 hover:bg-blue-400/5"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-xl group-hover:from-blue-400/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <Clock className="text-blue-400" size={24} />
                </div>
                <ChevronRight className="text-zinc-400 group-hover:text-blue-400 transition-colors" size={20} />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Availability</h3>
              <p className="text-zinc-400 text-sm">Set working hours</p>
            </motion.div>
          </Link>

          <motion.div
            className="group bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-green-400/50 hover:bg-green-400/5"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-300">
                <BarChart3 className="text-green-400" size={24} />
              </div>
              <ChevronRight className="text-zinc-400 group-hover:text-green-400 transition-colors" size={20} />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Analytics</h3>
            <p className="text-zinc-400 text-sm">View performance</p>
          </motion.div>

          <motion.div
            className="group bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-400/5"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl group-hover:from-purple-400/30 group-hover:to-pink-500/30 transition-all duration-300">
                <Settings className="text-purple-400" size={24} />
              </div>
              <ChevronRight className="text-zinc-400 group-hover:text-purple-400 transition-colors" size={20} />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Settings</h3>
            <p className="text-zinc-400 text-sm">Customize profile</p>
          </motion.div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-xl">
                <DollarSign className="text-amber-400" size={28} />
              </div>
              <motion.div
                className="text-amber-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp size={20} />
              </motion.div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-black text-white mb-1">
                ₹{stats.totalEarnings?.toLocaleString() || '0'}
              </div>
              <div className="text-zinc-400 text-sm">Total Earnings</div>
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUp size={16} className="mr-1" />
              <span>+{stats.weeklyEarnings?.toLocaleString() || '0'} this week</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-xl">
                <Users className="text-blue-400" size={28} />
              </div>
              <div className="text-blue-400">
                <Calendar size={20} />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-black text-white mb-1">
                {stats.totalAppointments || 0}
              </div>
              <div className="text-zinc-400 text-sm">Total Appointments</div>
            </div>
            <div className="flex items-center text-blue-400 text-sm">
              <Clock size={16} className="mr-1" />
              <span>{stats.todayAppointments || 0} today</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl">
                <Star className="text-green-400" size={28} />
              </div>
              <div className="text-green-400">
                <Award size={20} />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-black text-white mb-1">
                {stats.averageRating || '0.0'}
              </div>
              <div className="text-zinc-400 text-sm">Average Rating</div>
            </div>
            <div className="flex items-center text-yellow-400 text-sm">
              <Star size={16} className="mr-1 fill-current" />
              <span>{stats.totalReviews || 0} reviews</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl">
                <TrendingUp className="text-purple-400" size={28} />
              </div>
              <div className="text-purple-400">
                <Target size={20} />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-black text-white mb-1">
                {stats.completionRate || '0'}%
              </div>
              <div className="text-zinc-400 text-sm">Completion Rate</div>
            </div>
            <div className="flex items-center text-purple-400 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>Professional</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Appointments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl overflow-hidden"
        >
          {/* Section Header */}
          <div className="border-b border-zinc-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-lg">
                  <Scissors className="text-amber-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Your Appointments</h2>
                  <p className="text-zinc-400">Manage your daily schedule</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedTab === 'today'
                      ? 'bg-amber-400 text-black'
                      : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50'
                  }`}
                  onClick={() => setSelectedTab('today')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Today
                </motion.button>
                <motion.button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedTab === 'upcoming'
                      ? 'bg-amber-400 text-black'
                      : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50'
                  }`}
                  onClick={() => setSelectedTab('upcoming')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upcoming
                </motion.button>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="p-6">
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-zinc-700/30 backdrop-blur-sm border border-zinc-600/30 rounded-xl p-6 hover:border-amber-400/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full flex items-center justify-center">
                          <User className="text-amber-400" size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">
                            {appointment.customer?.name || 'Unknown Customer'}
                          </h3>
                          <p className="text-zinc-400">
                            {appointment.services?.map(s => s.service?.name).join(', ')}
                          </p>
                          <div className="flex items-center text-zinc-500 text-sm mt-1">
                            <Clock size={14} className="mr-1" />
                            <span>
                              {appointment.slot?.startTime} - {appointment.slot?.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-400 mb-1">
                          ₹{appointment.totalAmount}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-zinc-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scissors className="text-zinc-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-zinc-400 mb-2">No appointments yet</h3>
                <p className="text-zinc-500">
                  Your schedule is clear for {selectedTab === 'today' ? 'today' : 'the upcoming days'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BarberDashboard;
