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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none';
  
  const variants = {
    primary: 'h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-amber-500/20',
    secondary: 'h-12 px-6 bg-white border border-slate-200 text-slate-700 shadow-md hover:shadow-lg focus:ring-4 focus:ring-slate-200',
    ghost: 'h-10 px-4 text-slate-600 hover:bg-slate-100',
    danger: 'h-12 px-6 bg-red-500 text-white shadow-lg hover:bg-red-600 focus:ring-4 focus:ring-red-500/20',
  };

  const sizes = {
    small: 'h-10 px-4 text-sm',
    default: 'h-14 px-8',
    large: 'h-16 px-10 text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${isDisabled ? 'opacity-60 cursor-not-allowed transform-none hover:scale-100' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && <LoadingSpinner size="small" className="mr-2" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
