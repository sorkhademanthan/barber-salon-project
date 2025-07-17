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
      pending: { class: 'badge-warning', icon: Clock },
      confirmed: { class: 'badge-info', icon: CheckCircle },
      completed: { class: 'badge-success', icon: CheckCircle },
      cancelled: { class: 'badge-danger', icon: X },
    };
    return badges[status] || { class: 'badge-info', icon: Clock };
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
              My Bookings
            </h1>
            <p className="text-primary-600">
              Manage your appointments and booking history
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-primary-100 p-1 rounded-xl mt-4 sm:mt-0">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  filter === tab.key
                    ? 'bg-white text-accent-600 shadow-sm'
                    : 'text-primary-600 hover:text-accent-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="luxury-card p-8 text-center">
            <Calendar className="mx-auto text-primary-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-primary-900 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-primary-600 mb-6">
              {filter === 'all' 
                ? 'Book your first appointment to get started' 
                : `You don't have any ${filter} bookings`}
            </p>
            {filter === 'all' && (
              <Button onClick={() => window.location.href = '/book'}>
                Book Appointment
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusBadge = getStatusBadge(booking.status);
              const StatusIcon = statusBadge.icon;

              return (
                <motion.div
                  key={booking._id}
                  className="luxury-card p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-primary-900">
                              {booking.shop?.name}
                            </h3>
                            <span className={statusBadge.class}>
                              <StatusIcon size={14} className="mr-1" />
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-primary-600">
                            <div className="flex items-center">
                              <User size={14} className="mr-2" />
                              {booking.barber?.name}
                            </div>
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-2" />
                              {formatDate(booking.slot?.date)}
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-2" />
                              {formatTime(booking.slot?.startTime)} - {formatTime(booking.slot?.endTime)}
                            </div>
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-2" />
                              {booking.shop?.address?.city}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold text-accent-600">
                            ₹{booking.totalAmount}
                          </div>
                          <div className="text-sm text-primary-500">
                            {booking.services?.length} service{booking.services?.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-primary-700 mb-2">Services:</h4>
                        <div className="flex flex-wrap gap-2">
                          {booking.services?.map((serviceItem, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                            >
                              {serviceItem.service?.name || 'Service'}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Customer Notes */}
                      {booking.customerNotes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-primary-700 mb-1">Notes:</h4>
                          <p className="text-sm text-primary-600 italic">"{booking.customerNotes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 mt-4 lg:mt-0 lg:ml-6">
                      {canCancelBooking(booking) && (
                        <Button
                          variant="danger"
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
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <AlertCircle className="text-danger-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-primary-900">
                  Cancel Booking
                </h3>
              </div>

              <p className="text-primary-600 mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Reason for cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  className="luxury-input h-20 resize-none"
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
                  variant="danger"
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
  );
};

export default MyBookings;
