import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  Check,
  Award,
  DollarSign,
  Phone,
  MessageSquare,
  Coffee,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { api } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchServices(selectedShop._id);
      fetchBarbers(selectedShop._id); // Always fetch from backend
    }
  }, [selectedShop]);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedBarber, selectedDate]);

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops');
      setShops(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch shops');
    }
  };

  const fetchServices = async (shopId) => {
    try {
      const response = await api.get(`/services?shop=${shopId}`);
      setServices(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    }
  };

  // Replace the fetchBarbers function to always fetch from the backend endpoint
  const fetchBarbers = async (shopId) => {
    try {
      const response = await api.get(`/shops/${shopId}/barbers`);
      setBarbers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch barbers');
      setBarbers([]);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/slots/available/${selectedBarber.user._id}/${selectedDate}`);
      setAvailableSlots(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s._id === service._id);
      if (exists) {
        return prev.filter(s => s._id !== service._id);
      } else {
        return [...prev, service];
      }
    });
  };

  const getTotalAmount = () => {
    return selectedServices.reduce((sum, service) => sum + service.price, 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((sum, service) => sum + service.duration, 0);
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      
      const bookingData = {
        slotId: selectedSlot._id,
        services: selectedServices.map(service => ({
          serviceId: service._id
        })),
        customerNotes
      };

      await api.post('/bookings', bookingData);
      
      // Success notification with better styling
      toast.success(
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="text-white" size={16} />
          </div>
          <div>
            <div className="font-bold">Booking Confirmed! 🎉</div>
            <div className="text-sm text-gray-600">Your appointment has been scheduled</div>
          </div>
        </div>,
        {
          duration: 5000,
          style: {
            background: 'linear-gradient(to right, #10b981, #059669)',
            color: 'white',
            border: 'none',
          }
        }
      );
      
      // Reset form with smooth transition
      setTimeout(() => {
        setStep(1);
        setSelectedShop(null);
        setSelectedBarber(null);
        setSelectedDate('');
        setSelectedSlot(null);
        setSelectedServices([]);
        setCustomerNotes('');
      }, 1500);
      
    } catch (error) {
      toast.error(
        <div className="flex items-center space-x-2">
          <div className="text-red-500">❌</div>
          <div>
            <div className="font-bold">Booking Failed</div>
            <div className="text-sm">{error.response?.data?.message || 'Please try again'}</div>
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1: return selectedShop && selectedServices.length > 0;
      case 2: return selectedBarber;
      case 3: return selectedDate;
      case 4: return selectedSlot;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-2 mb-4"
              >
                <Sparkles className="text-amber-400" size={16} />
                <span className="text-amber-400 font-medium text-sm">Premium Experience Awaits</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Choose Your <span className="text-amber-400">Destination</span>
              </h2>
              <p className="text-zinc-400 text-lg">
                Select a barbershop and the services you desire
              </p>
            </div>

            {/* Shop Selection */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <MapPin className="text-amber-400 mr-2" size={20} />
                Select Your Shop
              </h3>
              <div className="grid gap-6">
                {shops.map((shop, index) => (
                  <motion.div
                    key={shop._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative overflow-hidden bg-zinc-800/50 backdrop-blur-sm border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      selectedShop?._id === shop._id 
                        ? 'border-amber-400 bg-amber-400/5 shadow-xl shadow-amber-400/20' 
                        : 'border-zinc-700 hover:border-amber-400/50'
                    }`}
                    onClick={() => setSelectedShop(shop)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selectedShop?._id === shop._id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center"
                      >
                        <Check className="text-black" size={16} />
                      </motion.div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-xl">
                        <Scissors className="text-amber-400" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-2">{shop.name}</h4>
                        <div className="flex items-center text-zinc-400 mb-2">
                          <MapPin size={16} className="mr-2" />
                          {shop.address?.street}, {shop.address?.city}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Star size={16} className="text-amber-400 mr-1" />
                            <span className="text-amber-400 font-medium">
                              {shop.rating?.average?.toFixed(1) || '4.8'}
                            </span>
                            <span className="text-zinc-400 ml-1">
                              ({shop.rating?.count || 127} reviews)
                            </span>
                          </div>
                          <div className="flex items-center text-zinc-400">
                            <Phone size={14} className="mr-1" />
                            {shop.contact?.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Services Selection */}
            <AnimatePresence>
              {selectedShop && services.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Scissors className="text-amber-400 mr-2" size={20} />
                    Choose Your Services
                  </h3>
                  <div className="grid gap-4">
                    {services.map((service, index) => {
                      const isSelected = selectedServices.find(s => s._id === service._id);
                      return (
                        <motion.div
                          key={service._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`relative overflow-hidden bg-zinc-800/30 backdrop-blur-sm border rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'border-amber-400 bg-amber-400/5 shadow-lg shadow-amber-400/10' 
                              : 'border-zinc-700 hover:border-amber-400/50 hover:bg-zinc-800/50'
                          }`}
                          onClick={() => handleServiceToggle(service)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"
                            >
                              <Check className="text-black" size={12} />
                            </motion.div>
                          )}
                          
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-white mb-1">{service.name}</h4>
                              <p className="text-zinc-400 mb-3 leading-relaxed">{service.description}</p>
                              <div className="flex items-center space-x-6">
                                <div className="flex items-center">
                                  <DollarSign className="text-amber-400 mr-1" size={16} />
                                  <span className="text-amber-400 font-bold text-lg">₹{service.price}</span>
                                </div>
                                <div className="flex items-center text-zinc-400">
                                  <Clock className="mr-1" size={16} />
                                  <span>{service.duration} minutes</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {selectedServices.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-amber-400/10 to-yellow-500/10 border border-amber-400/30 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold mb-1">Service Summary</h4>
                          <p className="text-zinc-400 text-sm">{selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-amber-400">₹{getTotalAmount()}</div>
                          <div className="text-zinc-400 text-sm">{getTotalDuration()} minutes total</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-2 mb-4"
              >
                <Award className="text-amber-400" size={16} />
                <span className="text-amber-400 font-medium text-sm">Expert Professionals</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Choose Your <span className="text-amber-400">Master Barber</span>
              </h2>
              <p className="text-zinc-400 text-lg">
                Select from our skilled professionals who will craft your perfect look
              </p>
            </div>

            {/* Barber Selection */}
            <div className="max-w-md mx-auto">
              <label className="block text-lg font-bold text-amber-400 mb-3">
                Select Your Barber
              </label>
              <select
                className="w-full h-12 px-4 bg-zinc-900/60 border border-amber-400/30 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                value={selectedBarber ? selectedBarber.user._id : ''}
                onChange={e => {
                  const barber = barbers.find(b => b.user._id === e.target.value);
                  setSelectedBarber(barber || null);
                }}
                required
              >
                <option value="">Select a barber</option>
                {barbers.map(barber => (
                  <option key={barber.user._id} value={barber.user._id}>
                    {barber.user.name} ({barber.experience} yrs)
                  </option>
                ))}
              </select>
              {/* Optionally show details of selected barber below */}
              {selectedBarber && (
                <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                  <h4 className="text-white font-bold">{selectedBarber.user.name}</h4>
                  <div className="text-zinc-400 text-sm">
                    Experience: {selectedBarber.experience} years
                    {selectedBarber.specialties?.length > 0 && (
                      <span> | Specialties: {selectedBarber.specialties.join(', ')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-2 mb-4"
              >
                <Calendar className="text-amber-400" size={16} />
                <span className="text-amber-400 font-medium text-sm">Perfect Timing</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Select Your <span className="text-amber-400">Appointment Date</span>
              </h2>
              <p className="text-zinc-400 text-lg">
                Choose the perfect day for your grooming session
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full h-12 px-4 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all duration-300"
                />
                <p className="text-zinc-400 text-sm mt-2">
                  Available for bookings up to 30 days in advance
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-2 mb-4"
              >
                <Clock className="text-amber-400" size={16} />
                <span className="text-amber-400 font-medium text-sm">Available Times</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Choose Your <span className="text-amber-400">Time Slot</span>
              </h2>
              <p className="text-zinc-400 text-lg">
                Select the perfect time for your appointment
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="large" />
                <p className="text-zinc-400 mt-4">Finding available slots...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-zinc-400" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Available Slots</h3>
                <p className="text-zinc-400 mb-4">
                  Unfortunately, there are no available time slots for this date.
                </p>
                <p className="text-zinc-500 text-sm">
                  Please try selecting a different date or barber.
                </p>
              </motion.div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <p className="text-zinc-400">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableSlots.map((slot, index) => (
                    <motion.button
                      key={slot._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        selectedSlot?._id === slot._id
                          ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20'
                          : 'border-zinc-700 hover:border-amber-400/50 bg-zinc-800/30 hover:bg-zinc-800/50'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selectedSlot?._id === slot._id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"
                        >
                          <Check className="text-black" size={12} />
                        </motion.div>
                      )}
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-white mb-1">{slot.startTime}</div>
                        <div className="text-sm text-zinc-400">
                          {slot.estimatedDuration || getTotalDuration()} min
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-2 mb-4"
              >
                <Sparkles className="text-amber-400" size={16} />
                <span className="text-amber-400 font-medium text-sm">Almost There</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Confirm Your <span className="text-amber-400">Appointment</span>
              </h2>
              <p className="text-zinc-400 text-lg">
                Review your booking details before confirming
              </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Coffee className="text-amber-400 mr-2" size={20} />
                Appointment Summary
              </h3>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between py-3 border-b border-zinc-700/50">
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-amber-400" size={18} />
                    <span className="text-zinc-400">Shop</span>
                  </div>
                  <span className="font-medium text-white">{selectedShop?.name}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-zinc-700/50">
                  <div className="flex items-center space-x-3">
                    <User className="text-amber-400" size={18} />
                    <span className="text-zinc-400">Barber</span>
                  </div>
                  <span className="font-medium text-white">{selectedBarber?.user.name}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-zinc-700/50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-amber-400" size={18} />
                    <span className="text-zinc-400">Date & Time</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-amber-400 font-bold">{selectedSlot?.startTime}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Scissors className="text-amber-400 mr-2" size={16} />
                  Selected Services
                </h4>
                <div className="space-y-3">
                  {selectedServices.map((service) => (
                    <div key={service._id} className="flex justify-between items-center">
                      <div>
                        <span className="text-white">{service.name}</span>
                        <span className="text-zinc-400 text-sm ml-2">({service.duration} min)</span>
                      </div>
                      <span className="font-medium text-amber-400">₹{service.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-700 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total Amount</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">₹{getTotalAmount()}</div>
                    <div className="text-zinc-400 text-sm">{getTotalDuration()} minutes total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
              <label className="block text-sm font-medium text-zinc-300 mb-3 flex items-center">
                <MessageSquare className="text-amber-400 mr-2" size={16} />
                Special Instructions (Optional)
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special requests, preferred style, or notes for your barber..."
                className="w-full h-24 px-4 py-3 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 font-medium resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all duration-300"
              />
              <p className="text-zinc-500 text-xs mt-2">
                Help your barber understand exactly what you're looking for
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            Book Your <span className="text-amber-400">Appointment</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Experience premium grooming with just a few clicks
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { num: 1, label: 'Shop & Services' },
              { num: 2, label: 'Barber' },
              { num: 3, label: 'Date' },
              { num: 4, label: 'Time' },
              { num: 5, label: 'Confirm' }
            ].map((stepData, index) => (
              <div key={stepData.num} className="flex items-center">
                <motion.div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= stepData.num
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-400/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                  animate={{ 
                    scale: step === stepData.num ? 1.1 : 1,
                    boxShadow: step === stepData.num ? '0 0 20px rgba(251, 191, 36, 0.5)' : '0 0 0px rgba(251, 191, 36, 0)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step > stepData.num ? (
                    <Check size={16} />
                  ) : (
                    stepData.num
                  )}
                  
                  {step === stepData.num && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-amber-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                {index < 4 && (
                  <motion.div
                    className={`w-16 md:w-24 h-1 mx-2 rounded-full transition-all duration-500 ${
                      step > stepData.num ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-zinc-800'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: step > stepData.num ? 1 : 0.3 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 text-xs md:text-sm text-zinc-400 max-w-4xl mx-auto px-2">
            <span className={step >= 1 ? 'text-amber-400 font-medium' : ''}>Shop & Services</span>
            <span className={step >= 2 ? 'text-amber-400 font-medium' : ''}>Barber</span>
            <span className={step >= 3 ? 'text-amber-400 font-medium' : ''}>Date</span>
            <span className={step >= 4 ? 'text-amber-400 font-medium' : ''}>Time</span>
            <span className={step >= 5 ? 'text-amber-400 font-medium' : ''}>Confirm</span>
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-between items-center max-w-2xl mx-auto"
        >
          <Button
            variant="secondary"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className={`flex items-center space-x-2 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </Button>
          
          <div className="flex items-center space-x-2 text-zinc-400 text-sm">
            <span>Step {step} of 5</span>
          </div>
          
          <div className="flex space-x-3">
            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceedToNextStep()}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-400"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleBooking}
                loading={loading}
                disabled={loading}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 font-bold px-8"
              >
                {loading ? 'Booking...' : 'Confirm Booking ✨'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookAppointment;
           