import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your grooming journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          icon={Mail}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          icon={Lock}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between pt-2">
          <motion.label 
            className="flex items-center group cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <input
              type="checkbox"
              className="w-5 h-5 text-amber-500 border-2 border-slate-300 rounded-lg focus:ring-amber-500 focus:ring-2 bg-white/50 transition-all duration-200"
            />
            <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
              Remember me
            </span>
          </motion.label>
          
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full mt-8"
          loading={loading}
          disabled={loading}
        >
          Sign In
        </Button>

        <div className="text-center pt-6 border-t border-zinc-700">
          <span className="text-zinc-400">Don't have an account? </span>
          <Link
            to="/register"
            className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </form>

      {/* Premium Shop Owner CTA Section (outside the form) */}
      <motion.div
        className="mt-4 relative"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="relative bg-zinc-800/60 rounded-xl p-3 border border-amber-500/20">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg"
              whileHover={{ rotate: 8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Crown size={16} className="text-black" />
            </motion.div>
            
            <div className="flex-1 text-left">
              <h3 className="text-sm font-black text-white">Ready to Rule?</h3>
              <p className="text-zinc-400 text-xs">Transform your business</p>
            </div>
            
            <Link to="/shop-register">
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Empire 👑
              </motion.button>
            </Link>
          </div>
          
          <div className="flex-1 text-left mt-3">
            <h3 className="text-lg font-black text-white mb-2">
              Ready to Rule the Industry?
            </h3>
            <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
              Join elite shop owners who've transformed their businesses into luxury destinations. 
              Premium tools, unlimited growth, extraordinary results.
            </p>
            
            <Link to="/shop-register">
              <motion.button
                className="w-full h-10 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>Start Your Empire</span>
                  <motion.span
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    👑
                  </motion.span>
                </span>
              </motion.button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center space-x-8 mt-4 pt-3 border-t border-zinc-800">
            <div className="text-center">
              <div className="text-base font-black text-amber-400">24h</div>
              <div className="text-xs text-zinc-500">Setup</div>
            </div>
            <div className="text-center">
              <div className="text-base font-black text-amber-400">∞</div>
              <div className="text-xs text-zinc-500">Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-base font-black text-amber-400">100%</div>
              <div className="text-xs text-zinc-500">Growth</div>
            </div>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
