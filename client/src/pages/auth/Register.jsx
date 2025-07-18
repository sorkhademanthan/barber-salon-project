import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer', // Always customer for regular registration
  });
  const [errors, setErrors] = useState({});
  
  const { register, loading } = useAuth();
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
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our premium grooming community"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          icon={User}
          error={errors.name}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          icon={Mail}
          error={errors.email}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          icon={Phone}
          error={errors.phone}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          icon={Lock}
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
          icon={Lock}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          className="w-full mt-6"
          loading={loading}
          disabled={loading}
        >
          Create Account
        </Button>

        <div className="text-center pt-4 border-t border-zinc-700">
          <span className="text-zinc-400">Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Sign in
          </Link>
          
          {/* Compact Shop Owner CTA */}
          <motion.div
            className="mt-4 relative"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="relative bg-gradient-to-r from-zinc-800/60 to-zinc-900/60 backdrop-blur-sm border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg"
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown size={16} className="text-black" />
                </motion.div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-black text-white">Own a Shop?</h3>
                  <p className="text-amber-400 text-xs">Join the empire</p>
                </div>
                <Link to="/shop-register">
                  <motion.button
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Launch ✨
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
