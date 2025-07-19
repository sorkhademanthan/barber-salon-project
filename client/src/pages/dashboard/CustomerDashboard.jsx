import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Star,
  ArrowRight,
  CalendarPlus,
  History
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
  });
  const [recentBookings, setRecentBookings] = useState([]);
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
      });

      setRecentBookings(bookings.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-primary-600">
            Ready for your next grooming session?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/book">
            <motion.div
              className="luxury-card p-6 cursor-pointer group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    Book New Appointment
                  </h3>
                  <p className="text-primary-600 text-sm">
                    Schedule your next grooming session
                  </p>
                </div>
                <div className="p-3 bg-accent-100 rounded-xl group-hover:bg-accent-200 transition-colors">
                  <CalendarPlus className="text-accent-600" size={24} />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/bookings">
            <motion.div
              className="luxury-card p-6 cursor-pointer group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    My Bookings
                  </h3>
                  <p className="text-primary-600 text-sm">
                    View and manage your appointments
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                  <History className="text-primary-600" size={24} />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
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
                {stats.upcomingBookings}
              </p>
              <p className="text-primary-600 text-sm">Upcoming Bookings</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-xl">
              <Clock className="text-success-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.totalBookings}
              </p>
              <p className="text-primary-600 text-sm">Total Appointments</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-danger-100 rounded-xl">
              <Star className="text-danger-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.favoriteShops}
              </p>
              <p className="text-primary-600 text-sm">Favorite Shops</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-primary-900">
              Recent Bookings
            </h2>
            <Link 
              to="/bookings"
              className="flex items-center text-accent-600 hover:text-accent-700 transition-colors"
            >
              View All
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-primary-300 mb-4" size={48} />
              <p className="text-primary-600 mb-4">No bookings yet</p>
              <Link to="/book">
                <Button>Book Your First Appointment</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 bg-primary-50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-lg">
                      <User className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-primary-900">
                        {booking.barber?.name}
                      </p>
                      <p className="text-sm text-primary-600">
                        {booking.shop?.name}
                      </p>
                      <p className="text-xs text-primary-500">
                        {formatDate(booking.slot?.date)} at {booking.slot?.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                    <p className="text-sm font-medium text-primary-900 mt-1">
                      ₹{booking.totalAmount}
                    </p>
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

export default CustomerDashboard;
