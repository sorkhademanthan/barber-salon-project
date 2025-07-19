import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Building, MapPin, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ShopOwnerRegister = () => {
  const [formData, setFormData] = useState({
    // Owner details
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Shop details
    shopName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    shopPhone: '',
    shopEmail: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const { api } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.shopName) newErrors.shopName = 'Shop name is required';
    if (!formData.street) newErrors.street = 'Street address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    try {
      setLoading(true);
      
      // Create the shop owner user as admin (temporary solution)
      const ownerData = {
        name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'admin' // Temporary: making shop owners admin
      };
      
      const userResponse = await api.post('/auth/register', ownerData);
      
      // Then create the shop
      const shopData = {
        name: formData.shopName,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        contact: {
          phone: formData.shopPhone || formData.phone,
          email: formData.shopEmail || formData.email
        },
        workingHours: {
          monday: { start: '09:00', end: '18:00', isOpen: true },
          tuesday: { start: '09:00', end: '18:00', isOpen: true },
          wednesday: { start: '09:00', end: '18:00', isOpen: true },
          thursday: { start: '09:00', end: '18:00', isOpen: true },
          friday: { start: '09:00', end: '18:00', isOpen: true },
          saturday: { start: '09:00', end: '17:00', isOpen: true },
          sunday: { start: '10:00', end: '16:00', isOpen: false }
        }
      };
      
      await api.post('/shops', shopData);
      
      toast.success('Shop registration successful! You can now login.');
      navigate('/login');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={currentStep === 1 ? "Launch Your Empire" : "Your Shop Details"}
      subtitle={currentStep === 1 ? "Start your journey to luxury business success" : "Complete your shop information"}
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 1 ? 'bg-amber-400 text-black' : 'bg-zinc-700 text-zinc-400'
              }`}
              animate={{ scale: currentStep === 1 ? 1.1 : 1 }}
            >
              1
            </motion.div>
            <span className="ml-2 text-sm font-medium text-zinc-400">Owner</span>
          </div>
          
          <motion.div
            className="w-12 h-0.5 bg-zinc-700 rounded-full"
            animate={{ 
              backgroundColor: currentStep >= 2 ? '#f59e0b' : '#3f3f46' 
            }}
            transition={{ duration: 0.3 }}
          />
          
          <div className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= 2 ? 'bg-amber-400 text-black' : 'bg-zinc-700 text-zinc-400'
              }`}
              animate={{ scale: currentStep === 2 ? 1.1 : 1 }}
            >
              2
            </motion.div>
            <span className="ml-2 text-sm font-medium text-zinc-400">Shop</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Owner Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Input
                label="Your Full Name"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="John Empire"
                icon={User}
                error={errors.ownerName}
                autoComplete="name"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@empire.com"
                  icon={Mail}
                  error={errors.email}
                  autoComplete="email"
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  icon={Phone}
                  error={errors.phone}
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create strong password"
                  icon={Lock}
                  error={errors.password}
                  autoComplete="new-password"
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  icon={Lock}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  required
                />
              </div>

              <motion.div
                className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-start space-x-3">
                  <Crown className="text-amber-400 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-amber-400 font-bold text-sm mb-1">Empire Benefits</h4>
                    <p className="text-zinc-300 text-xs">
                      Full dashboard access • Unlimited barbers • Custom pricing • Analytics
                    </p>
                  </div>
                </div>
              </motion.div>

              <Button
                type="button"
                onClick={handleNext}
                className="w-full mt-6"
              >
                Continue to Shop Details →
              </Button>
            </motion.div>
          )}

          {/* Step 2: Shop Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Input
                label="Shop Name"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Royal Cuts Empire"
                icon={Building}
                error={errors.shopName}
                autoComplete="organization"
                required
              />

              <Input
                label="Street Address"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="123 Luxury Boulevard"
                icon={MapPin}
                error={errors.street}
                autoComplete="street-address"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  error={errors.city}
                  autoComplete="address-level2"
                  required
                />
                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                  error={errors.state}
                  autoComplete="address-level1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                  error={errors.zipCode}
                  autoComplete="postal-code"
                  required
                />
                <Input
                  label="Shop Phone"
                  name="shopPhone"
                  value={formData.shopPhone}
                  onChange={handleChange}
                  placeholder="Shop number"
                  icon={Phone}
                  autoComplete="tel"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Shop Email (Optional)"
                  name="shopEmail"
                  type="email"
                  value={formData.shopEmail}
                  onChange={handleChange}
                  placeholder="info@royalcuts.com"
                  icon={Mail}
                  autoComplete="email"
                />
              </div>

              <div className="flex space-x-4 mt-8">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="secondary"
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="flex-1"
                >
                  🚀 Launch Empire
                </Button>
              </div>
            </motion.div>
          )}
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-zinc-700/50">
          <span className="text-zinc-400 text-sm">Already have an account? </span>
          <Link
            to="/login"
            className="text-amber-400 hover:text-amber-300 font-medium text-sm transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ShopOwnerRegister;
