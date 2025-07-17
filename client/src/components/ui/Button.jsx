import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'default', 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'px-6 py-3 bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-400/20 shadow-luxury hover:shadow-luxury-lg',
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    default: 'px-6 py-3',
    large: 'px-8 py-4 text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && <LoadingSpinner size="small" className="mr-2" />}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
