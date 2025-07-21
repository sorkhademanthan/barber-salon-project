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
  Scissors,
  DollarSign,
  BarChart3,
  Target,
  Award,
  Sparkles,
  Timer,
  ChevronRight,
  Settings,
  User,
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
  const [selectedTab, setSelectedTab] = useState('today');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold ${config.color}`}>
        <config.icon size={14} />
        {config.label}
      </span>
    );
  };

  const getNextAppointment = () => {
    const upcoming = todayAppointments
      .filter(apt => ['pending', 'confirmed'].includes(apt.status))
      .sort((a, b) => a.slot?.startTime?.localeCompare(b.slot?.startTime))[0];
    return upcoming;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter appointments for tabs and search
  const filteredAppointments = (
    selectedTab === 'today'
      ? todayAppointments
      : todayAppointments.filter(b => ['pending', 'confirmed'].includes(b.status) && b.status !== 'completed')
  ).filter(apt =>
    !search ||
    (apt.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      apt.services?.some(s => s.service?.name?.toLowerCase().includes(search.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const nextAppointment = getNextAppointment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <motion.h1
                className="text-4xl md:text-5xl font-black font-display text-white mb-2"
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

        {/* Floating Create Appointment Button */}
        <Link to="/appointments" className="fixed bottom-8 right-8 z-40">
          <Button className="shadow-luxury-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold px-6 py-3 rounded-full text-lg flex items-center gap-2">
            <Calendar size={20} />
            Create Appointment
          </Button>
        </Link>

        {/* Next Appointment Alert */}
        <AnimatePresence>
          {nextAppointment && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-6 backdrop-blur-sm shadow-luxury">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link to="/appointments">
            <motion.div
              className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-6 flex items-center justify-between shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-1 font-display">Appointments</h3>
                <p className="text-zinc-400 text-sm">Manage your schedule</p>
              </div>
              <div className="p-3 bg-amber-400/20 rounded-xl">
                <Calendar className="text-amber-400" size={24} />
              </div>
            </motion.div>
          </Link>
          <Link to="/availability">
            <motion.div
              className="bg-gradient-to-br from-blue-400/10 to-cyan-500/10 border border-blue-400/30 rounded-2xl p-6 flex items-center justify-between shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-1 font-display">Availability</h3>
                <p className="text-zinc-400 text-sm">Set working hours</p>
              </div>
              <div className="p-3 bg-blue-400/20 rounded-xl">
                <Clock className="text-blue-400" size={24} />
              </div>
            </motion.div>
          </Link>
          <motion.div
            className="bg-gradient-to-br from-green-400/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 flex items-center justify-between shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-1 font-display">Analytics</h3>
              <p className="text-zinc-400 text-sm">View performance</p>
            </div>
            <div className="p-3 bg-green-400/20 rounded-xl">
              <BarChart3 className="text-green-400" size={24} />
            </div>
          </motion.div>
          <motion.div
            className="bg-gradient-to-br from-purple-400/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6 flex items-center justify-between shadow-luxury hover:shadow-luxury-lg transition-all cursor-pointer"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-1 font-display">Settings</h3>
              <p className="text-zinc-400 text-sm">Customize profile</p>
            </div>
            <div className="p-3 bg-purple-400/20 rounded-xl">
              <Settings className="text-purple-400" size={24} />
            </div>
          </motion.div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-400/20 rounded-xl">
                <DollarSign className="text-amber-400" size={28} />
              </div>
              <TrendingUp className="text-amber-400" size={20} />
            </div>
            <div className="mb-2">
              <div className="text-3xl font-black text-white mb-1">
                ₹{stats.totalEarnings?.toLocaleString() || '0'}
              </div>
              <div className="text-zinc-400 text-sm">Total Earnings</div>
            </div>
            <div className="flex items-center text-green-400 text-sm">
              <span>+{stats.weeklyEarnings?.toLocaleString() || '0'} this week</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-zinc-700/30 rounded-xl">
                <Users className="text-blue-400" size={28} />
              </div>
              <Calendar className="text-blue-400" size={20} />
            </div>
            <div className="mb-2">
              <div className="text-3xl font-black text-white mb-1">
                {stats.todayBookings || 0}
              </div>
              <div className="text-zinc-400 text-sm">Today's Appointments</div>
            </div>
            <div className="flex items-center text-blue-400 text-sm">
              <Clock size={16} className="mr-1" />
              <span>{stats.upcomingBookings || 0} upcoming</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-400/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-400/20 rounded-xl">
                <Star className="text-green-400" size={28} />
              </div>
              <Award className="text-green-400" size={20} />
            </div>
            <div className="mb-2">
              <div className="text-3xl font-black text-white mb-1">
                {stats.averageRating || '0.0'}
              </div>
              <div className="text-zinc-400 text-sm">Average Rating</div>
            </div>
            <div className="flex items-center text-yellow-400 text-sm">
              <Star size={16} className="mr-1 fill-current" />
              <span>4.8/5</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-400/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-400/20 rounded-xl">
                <TrendingUp className="text-purple-400" size={28} />
              </div>
              <Target className="text-purple-400" size={20} />
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
          </div>
        </div>

        {/* Appointments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl overflow-hidden shadow-luxury"
        >
          {/* Section Header */}
          <div className="border-b border-zinc-700/40 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-lg">
                <Scissors className="text-amber-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white font-display">Your Appointments</h2>
                <p className="text-zinc-400">Manage your daily schedule</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              {/* Search bar */}
              <input
                type="text"
                placeholder="Search by customer or service"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ml-4 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-200"
                style={{ minWidth: 220 }}
              />
            </div>
          </div>

          {/* Appointments List */}
          <div className="p-6">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-6 hover:border-amber-400/50 hover:shadow-luxury-lg transition-all duration-300"
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
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400/10 to-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Scissors className="text-amber-400" size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">No appointments yet</h3>
                <p className="text-zinc-400 mb-6">
                  Your schedule is clear for {selectedTab === 'today' ? 'today' : 'the upcoming days'}
                </p>
                <Link to="/appointments">
                  <Button>
                    <Calendar className="mr-2" size={18} />
                    Create Appointment
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BarberDashboard;
