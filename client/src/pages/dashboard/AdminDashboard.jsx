import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Building, 
  TrendingUp,
  UserCheck,
  Scissors,
  Clock,
  Star
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
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // This would typically come from admin-specific endpoints
      // For now, we'll simulate the data
      const [bookingsRes] = await Promise.all([
        api.get('/bookings/barber'), // This would be admin endpoint
      ]);

      const bookings = bookingsRes.data.data;
      
      setStats({
        totalUsers: 150, // Mock data - would come from admin API
        totalBarbers: 25,
        totalCustomers: 125,
        totalBookings: bookings.length,
        todayBookings: bookings.filter(b => 
          new Date(b.createdAt).toDateString() === new Date().toDateString()
        ).length,
        totalRevenue: bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.totalAmount, 0),
      });

      setRecentActivity(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
            Admin Dashboard 👑
          </h1>
          <p className="text-primary-600">
            Overview of your barber shop management system
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/users">
            <motion.div
              className="luxury-card p-6 cursor-pointer group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    Manage Users
                  </h3>
                  <p className="text-primary-600 text-sm">
                    View and manage all users
                  </p>
                </div>
                <div className="p-3 bg-accent-100 rounded-xl group-hover:bg-accent-200 transition-colors">
                  <Users className="text-accent-600" size={24} />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/all-bookings">
            <motion.div
              className="luxury-card p-6 cursor-pointer group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    All Bookings
                  </h3>
                  <p className="text-primary-600 text-sm">
                    Monitor all appointments
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                  <Calendar className="text-primary-600" size={24} />
                </div>
              </div>
            </motion.div>
          </Link>

          <div className="luxury-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                  System Health
                </h3>
                <p className="text-primary-600 text-sm">
                  All systems operational
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-xl">
                <UserCheck className="text-success-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-xl">
              <Users className="text-accent-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.totalUsers}
              </p>
              <p className="text-primary-600 text-sm">Total Users</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Scissors className="text-primary-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.totalBarbers}
              </p>
              <p className="text-primary-600 text-sm">Active Barbers</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-xl">
              <UserCheck className="text-success-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.totalCustomers}
              </p>
              <p className="text-primary-600 text-sm">Customers</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-danger-100 rounded-xl">
              <Calendar className="text-danger-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                {stats.totalBookings}
              </p>
              <p className="text-primary-600 text-sm">Total Bookings</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-xl">
              <Clock className="text-accent-600" size={24} />
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
            <div className="p-3 bg-success-100 rounded-xl">
              <TrendingUp className="text-success-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-primary-900">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-primary-600 text-sm">Total Revenue</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-primary-900">
              Recent Activity
            </h2>
            <Link 
              to="/all-bookings"
              className="text-accent-600 hover:text-accent-700 transition-colors text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-primary-300 mb-4" size={48} />
              <p className="text-primary-600">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center justify-between p-4 bg-primary-50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                      <Calendar className="text-accent-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-primary-900">
                        New booking by {activity.customer?.name}
                      </p>
                      <p className="text-sm text-primary-600">
                        with {activity.barber?.name} • {activity.slot?.startTime}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-primary-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-accent-600">
                          ₹{activity.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`badge-${
                    activity.status === 'completed' ? 'success' : 
                    activity.status === 'confirmed' ? 'info' : 
                    activity.status === 'cancelled' ? 'danger' : 'warning'
                  }`}>
                    {activity.status}
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

export default AdminDashboard;
