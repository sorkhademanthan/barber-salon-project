import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  MapPin,
  Star,
  ChevronRight
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

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchServices(selectedShop._id);
      fetchBarbers(selectedShop._id);
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

  const fetchBarbers = async (shopId) => {
    try {
      const shop = shops.find(s => s._id === shopId);
      if (shop?.barbers) {
        setBarbers(shop.barbers.filter(b => b.isActive));
      }
    } catch (error) {
      toast.error('Failed to fetch barbers');
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
      toast.success('Appointment booked successfully!');
      
      // Reset form
      setStep(1);
      setSelectedShop(null);
      setSelectedBarber(null);
      setSelectedDate('');
      setSelectedSlot(null);
      setSelectedServices([]);
      setCustomerNotes('');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
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
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                Choose Shop & Services
              </h2>
              <p className="text-primary-600">
                Select a barbershop and the services you want
              </p>
            </div>

            {/* Shop Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary-900">Select Shop</h3>
              <div className="grid gap-4">
                {shops.map((shop) => (
                  <motion.div
                    key={shop._id}
                    className={`luxury-card p-4 cursor-pointer ${
                      selectedShop?._id === shop._id ? 'ring-2 ring-accent-400' : ''
                    }`}
                    onClick={() => setSelectedShop(shop)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-accent-100 rounded-lg">
                          <Scissors className="text-accent-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-primary-900">{shop.name}</h4>
                          <div className="flex items-center text-sm text-primary-600">
                            <MapPin size={14} className="mr-1" />
                            {shop.address?.city}
                          </div>
                          <div className="flex items-center text-sm text-primary-600">
                            <Star size={14} className="mr-1 text-accent-500" />
                            {shop.rating?.average?.toFixed(1) || '4.5'} ({shop.rating?.count || 0} reviews)
                          </div>
                        </div>
                      </div>
                      {selectedShop?._id === shop._id && (
                        <div className="p-1 bg-accent-500 rounded-full">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Services Selection */}
            {selectedShop && services.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary-900">Select Services</h3>
                <div className="grid gap-3">
                  {services.map((service) => {
                    const isSelected = selectedServices.find(s => s._id === service._id);
                    return (
                      <motion.div
                        key={service._id}
                        className={`luxury-card p-4 cursor-pointer ${
                          isSelected ? 'ring-2 ring-accent-400 bg-accent-50' : ''
                        }`}
                        onClick={() => handleServiceToggle(service)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-primary-900">{service.name}</h4>
                            <p className="text-sm text-primary-600">{service.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-accent-600 font-medium">
                                ₹{service.price}
                              </span>
                              <span className="text-sm text-primary-500">
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="p-1 bg-accent-500 rounded-full">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {selectedServices.length > 0 && (
                  <div className="bg-accent-50 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-primary-900">Total</span>
                      <div className="text-right">
                        <div className="font-semibold text-accent-600">₹{getTotalAmount()}</div>
                        <div className="text-sm text-primary-600">{getTotalDuration()} minutes</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                Choose Your Barber
              </h2>
              <p className="text-primary-600">
                Select from our skilled professionals
              </p>
            </div>

            <div className="grid gap-4">
              {barbers.map((barber) => (
                <motion.div
                  key={barber.user._id}
                  className={`luxury-card p-4 cursor-pointer ${
                    selectedBarber?.user._id === barber.user._id ? 'ring-2 ring-accent-400' : ''
                  }`}
                  onClick={() => setSelectedBarber(barber)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                        <User className="text-accent-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-900">{barber.user.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-primary-600">
                          <span>{barber.experience} years experience</span>
                          {barber.specialties?.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{barber.specialties.join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedBarber?.user._id === barber.user._id && (
                      <div className="p-1 bg-accent-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                Select Date
              </h2>
              <p className="text-primary-600">
                Choose your preferred appointment date
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Appointment Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="luxury-input"
              />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                Available Time Slots
              </h2>
              <p className="text-primary-600">
                Choose your preferred time slot
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="large" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto text-primary-300 mb-4" size={48} />
                <p className="text-primary-600">No available slots for this date</p>
                <p className="text-sm text-primary-500">Please try a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSlots.map((slot) => (
                  <motion.button
                    key={slot._id}
                    className={`p-3 rounded-xl border transition-all ${
                      selectedSlot?._id === slot._id
                        ? 'border-accent-400 bg-accent-50 text-accent-700'
                        : 'border-primary-200 hover:border-accent-300 hover:bg-accent-50'
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="font-medium">{slot.startTime}</div>
                      <div className="text-sm text-primary-500">
                        {slot.estimatedDuration} min
                      </div>
                    </div>
                  </motion.button>
                ))}
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
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                Confirm Booking
              </h2>
              <p className="text-primary-600">
                Review your appointment details
              </p>
            </div>

            {/* Booking Summary */}
            <div className="luxury-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-primary-600">Shop</span>
                <span className="font-medium text-primary-900">{selectedShop?.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-primary-600">Barber</span>
                <span className="font-medium text-primary-900">{selectedBarber?.user.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-primary-600">Date & Time</span>
                <span className="font-medium text-primary-900">
                  {new Date(selectedDate).toLocaleDateString()} at {selectedSlot?.startTime}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="space-y-2">
                  {selectedServices.map((service) => (
                    <div key={service._id} className="flex justify-between">
                      <span className="text-primary-600">{service.name}</span>
                      <span className="font-medium text-primary-900">₹{service.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between">
                  <span className="font-medium text-primary-900">Total</span>
                  <span className="font-semibold text-accent-600">₹{getTotalAmount()}</span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special requests or notes for your barber..."
                className="luxury-input h-20 resize-none"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum
                    ? 'bg-accent-500 text-white'
                    : 'bg-primary-200 text-primary-600'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 5 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-accent-500' : 'bg-primary-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-2 text-sm text-primary-600">
          <span>Shop & Services</span>
          <span>Barber</span>
          <span>Date</span>
          <span>Time</span>
          <span>Confirm</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="luxury-card p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Previous
        </Button>
        
        <div className="flex space-x-3">
          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceedToNextStep()}
              className="inline-flex items-center"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleBooking}
              loading={loading}
              disabled={loading}
            >
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
