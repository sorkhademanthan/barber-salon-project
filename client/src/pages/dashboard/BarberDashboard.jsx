import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
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
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      setStats({
        todayBookings: todayBookings.length,
        upcomingBookings: todayBookings.filter(b => 
          ['pending', 'confirmed'].includes(b.status)
        ).length,
        completedToday: todayBookings.filter(b => b.status === 'completed').length,
        totalEarnings: todayBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.totalAmount, 0),
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
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge-info';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
            Good morning, {user?.name}! ✂️
          </h1>
          <p className="text-primary-600">
            Here's what's happening in your schedule today
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/appointments">
            <motion.div
              className="luxury-card p-6 cursor-pointer group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    View All Appointments
                  </h3>
                  <p className="text-primary-600 text-sm">
                    Manage your schedule and appointments
                  </p>
                </div>
                <div className="p-3 bg-accent-100 rounded-xl group-hover:bg-accent-200 transition-colors">
                  <Calendar className="text-accent-600" size={24} />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/availability">
            <motion.div
              className="luxury-card p-6 cursor-pointer group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    Set Availability
                  </h3>
                  <p className="text-primary-600 text-sm">
                    Update your working hours and schedule
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                  <Clock className="text-primary-600" size={24} />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-xl">
              <Calendar className="text-accent-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.todayBookings}
              </p>
              <p className="text-primary-600 text-sm">Today's Bookings</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Clock className="text-primary-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.upcomingBookings}
              </p>
              <p className="text-primary-600 text-sm">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-xl">
              <CheckCircle className="text-success-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.completedToday}
              </p>
              <p className="text-primary-600 text-sm">Completed Today</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-danger-100 rounded-xl">
              <TrendingUp className="text-danger-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                ₹{stats.totalEarnings}
              </p>
              <p className="text-primary-600 text-sm">Today's Earnings</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-primary-900">
              Today's Appointments
            </h2>
            <Link 
              to="/appointments"
              className="text-accent-600 hover:text-accent-700 transition-colors text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-primary-300 mb-4" size={48} />
              <p className="text-primary-600">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center justify-between p-4 bg-primary-50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                      <Users className="text-accent-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-primary-900">
                        {appointment.customer?.name}
                      </p>
                      <p className="text-sm text-primary-600">
                        {appointment.slot?.startTime} - {appointment.slot?.endTime}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={getStatusBadge(appointment.status)}>
                          {appointment.status}
                        </span>
                        <span className="text-xs text-primary-500">
                          {appointment.services?.map(s => s.service?.name).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-primary-900">
                      ₹{appointment.totalAmount}
                    </span>
                    
                    {appointment.status === 'pending' && (
                      <Button
                        size="small"
                        onClick={() => updateBookingStatus(appointment._id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => updateBookingStatus(appointment._id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BarberDashboard;
