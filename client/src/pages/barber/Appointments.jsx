import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Appointments = () => {
  const { api } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/barber?date=${selectedDate}`);
      setAppointments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      setUpdatingId(appointmentId);
      await api.put(`/bookings/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: Clock },
      confirmed: { class: 'badge-info', icon: CheckCircle },
      completed: { class: 'badge-success', icon: CheckCircle },
      cancelled: { class: 'badge-danger', icon: XCircle },
    };
    return badges[status] || { class: 'badge-info', icon: Clock };
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
          My Appointments
        </h1>
        <p className="text-primary-600">
          Manage your schedule and appointments
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="luxury-input"
            />
          </div>
        </div>

        <div className="flex space-x-1 bg-primary-100 p-1 rounded-xl">
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

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="luxury-card p-8 text-center">
          <Calendar className="mx-auto text-primary-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-primary-900 mb-2">
            No appointments found
          </h3>
          <p className="text-primary-600">
            {filter === 'all' 
              ? 'No appointments scheduled for this date'
              : `No ${filter} appointments for this date`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const statusBadge = getStatusBadge(appointment.status);
            const StatusIcon = statusBadge.icon;

            return (
              <motion.div
                key={appointment._id}
                className="luxury-card p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                          <User className="text-accent-600" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-primary-900">
                            {appointment.customer?.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-primary-600">
                            <div className="flex items-center">
                              <Phone size={14} className="mr-1" />
                              {appointment.customer?.phone}
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {appointment.slot?.startTime} - {appointment.slot?.endTime}
                            </div>
                          </div>
                        </div>
                      </div>

                      <span className={statusBadge.class}>
                        <StatusIcon size={14} className="mr-1" />
                        {appointment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Services */}
                      <div>
                        <h4 className="text-sm font-medium text-primary-700 mb-2">Services:</h4>
                        <div className="space-y-1">
                          {appointment.services?.map((serviceItem, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-primary-600">{serviceItem.service?.name}</span>
                              <span className="font-medium">₹{serviceItem.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Notes */}
                      {appointment.customerNotes && (
                        <div>
                          <h4 className="text-sm font-medium text-primary-700 mb-2">Customer Notes:</h4>
                          <p className="text-sm text-primary-600 italic">
                            "{appointment.customerNotes}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-accent-600">
                          ₹{appointment.totalAmount}
                        </div>
                        <div className="text-sm text-primary-500">
                          Total Amount
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4 lg:mt-0 lg:ml-6">
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          loading={updatingId === appointment._id}
                          disabled={updatingId === appointment._id}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          loading={updatingId === appointment._id}
                          disabled={updatingId === appointment._id}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {appointment.status === 'confirmed' && (
                      <>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                          loading={updatingId === appointment._id}
                          disabled={updatingId === appointment._id}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          loading={updatingId === appointment._id}
                          disabled={updatingId === appointment._id}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Appointments;
