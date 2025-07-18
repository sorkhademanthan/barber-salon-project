import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Building, MapPin } from 'lucide-react';
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
  
  const { api } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.shopName) newErrors.shopName = 'Shop name is required';
    if (!formData.street) newErrors.street = 'Street address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
      title="Launch Your Empire"
      subtitle="Transform your vision into the ultimate luxury destination"
    >
      <div className="space-y-8">
        {/* Epic Progress Indicator */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            {['Vision', 'Details', 'Launch'].map((step, index) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {index + 1}
                </motion.div>
                <span className="ml-3 text-sm font-bold text-zinc-400">{step}</span>
                {index < 2 && <div className="w-16 h-1 bg-zinc-800 mx-4 rounded-full" />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Owner Section */}
          <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />
            <div className="relative bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl">
                  <Crown size={20} className="text-black" />
                </div>
                <h3 className="text-xl font-bold text-white">Your Royal Details</h3>
              </div>
              
              <div className="space-y-6">
                <Input
                  label="Your Name"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="John Empire"
                  error={errors.ownerName}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@empire.com"
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    error={errors.phone}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ultra secure password"
                    error={errors.password}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword}
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shop Section */}
          <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
            <div className="relative bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl">
                  <Building size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Your Empire Details</h3>
              </div>
              
              <div className="space-y-6">
                <Input
                  label="Shop Name"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Royal Cuts Empire"
                  error={errors.shopName}
                  required
                />

                <Input
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="123 Luxury Boulevard"
                  error={errors.street}
                  required
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New York"
                    error={errors.city}
                    required
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="NY"
                    error={errors.state}
                    required
                  />
                  <Input
                    label="ZIP"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                    error={errors.zipCode}
                    required
                  />
                  <Input
                    label="Shop Phone"
                    name="shopPhone"
                    value={formData.shopPhone}
                    onChange={handleChange}
                    placeholder="Shop number"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Epic Launch Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-xl" />
            <Button
              type="submit"
              className="w-full h-16 text-xl relative"
              loading={loading}
              disabled={loading}
            >
              🚀 Launch Your Empire
            </Button>
          </motion.div>
        </form>

        <div className="text-center pt-4 border-t border-slate-200">
          <span className="text-slate-600 text-sm">Already have an account? </span>
          <Link
            to="/login"
            className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ShopOwnerRegister;
