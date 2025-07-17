import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
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

        <motion.div
          className="text-center pt-6 border-t border-slate-200/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-slate-600 font-medium">Don't have an account? </span>
          <Link
            to="/register"
            className="font-bold text-amber-600 hover:text-amber-700 transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
          >
            Sign up
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
};

export default Login;
