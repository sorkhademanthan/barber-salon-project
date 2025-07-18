import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const isDisabled = disabled || loading;

  const variants = {
    primary: `
      relative h-12 px-6 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 
      text-black font-bold text-sm rounded-lg shadow-xl shadow-amber-500/25
      hover:shadow-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30
      transition-all duration-300 overflow-hidden
    `,
    secondary: `
      h-12 px-6 bg-zinc-800 border border-zinc-700 text-white font-bold text-sm rounded-lg
      hover:bg-zinc-700 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600/30
      transition-all duration-300
    `,
  };

  return (
    <motion.button
      ref={ref}
      className={`${variants[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Shimmer Effect */}
      {variant === 'primary' && !isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut"
          }}
          style={{ transform: 'skewX(-45deg)' }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center">
        {loading && (
          <div className="mr-3">
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          </div>
        )}
        {children}
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
