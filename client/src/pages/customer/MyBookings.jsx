import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const { api } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/customer');
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancellingId(bookingToCancel._id);
      await api.delete(`/bookings/${bookingToCancel._id}`, {
        data: { reason: cancelReason }
      });
      toast.success('Booking cancelled successfully');
      fetchBookings();
      setShowCancelModal(false);
      setBookingToCancel(null);
      setCancelReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-amber-400/10 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold', icon: Clock },
      confirmed: { class: 'bg-blue-400/10 text-blue-400 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold', icon: CheckCircle },
      completed: { class: 'bg-green-400/10 text-green-400 border border-green-400/30 px-3 py-1 rounded-full text-xs font-bold', icon: CheckCircle },
      cancelled: { class: 'bg-red-400/10 text-red-400 border border-red-400/30 px-3 py-1 rounded-full text-xs font-bold', icon: X },
    };
    return badges[status] || { class: 'bg-zinc-700/10 text-zinc-400 border border-zinc-700/30 px-3 py-1 rounded-full text-xs font-bold', icon: Clock };
  };

  const canCancelBooking = (booking) => {
    return ['pending', 'confirmed'].includes(booking.status);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-black via-zinc-900 to-black">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black font-display text-white mb-2">
                My Bookings
              </h1>
              <p className="text-lg text-zinc-400">
                Manage your appointments and booking history
              </p>
            </div>
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-zinc-900/60 p-1 rounded-xl mt-4 sm:mt-0">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                    filter === tab.key
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-zinc-300 hover:text-amber-400 hover:bg-amber-400/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-10 text-center shadow-luxury"
            >
              <Calendar className="mx-auto text-amber-400 mb-4" size={64} />
              <h3 className="text-lg font-bold text-white mb-2">
                {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
              </h3>
              <p className="text-zinc-400 mb-6">
                {filter === 'all' 
                  ? 'Book your first appointment to get started' 
                  : `You don't have any ${filter} bookings`}
              </p>
              {filter === 'all' && (
                <Button onClick={() => window.location.href = '/book'}>
                  Book Appointment
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => {
                const statusBadge = getStatusBadge(booking.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <motion.div
                    key={booking._id}
                    className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/40 rounded-2xl p-8 shadow-luxury hover:border-amber-400/30 transition-all duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {booking.shop?.name}
                          </h3>
                          <span className={statusBadge.class + " flex items-center gap-1"}>
                            <StatusIcon size={14} />
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-2">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {booking.barber?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(booking.slot?.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTime(booking.slot?.startTime)} - {formatTime(booking.slot?.endTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {booking.shop?.address?.city}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {booking.services?.map((serviceItem, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/30"
                            >
                              {serviceItem.service?.name || 'Service'}
                            </span>
                          ))}
                        </div>
                        {booking.customerNotes && (
                          <div className="mb-2">
                            <span className="text-xs text-zinc-400 italic">"{booking.customerNotes}"</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-2xl font-bold text-amber-400 mb-1">
                          ₹{booking.totalAmount}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {booking.services?.length} service{booking.services?.length !== 1 ? 's' : ''}
                        </div>
                        {canCancelBooking(booking) && (
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => {
                              setBookingToCancel(booking);
                              setShowCancelModal(true);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Cancel Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50 rounded-2xl p-8 w-full max-w-md shadow-luxury"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-danger-100 rounded-lg">
                    <AlertCircle className="text-danger-600" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Cancel Booking
                  </h3>
                </div>
                <p className="text-zinc-400 mb-4">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Reason for cancellation
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason..."
                    className="w-full h-20 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-400 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-200 resize-none"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowCancelModal(false);
                      setBookingToCancel(null);
                      setCancelReason('');
                    }}
                    className="flex-1"
                  >
                    Keep Booking
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCancelBooking}
                    loading={cancellingId === bookingToCancel?._id}
                    disabled={!cancelReason.trim()}
                    className="flex-1"
                  >
                    Cancel Booking
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyBookings;
