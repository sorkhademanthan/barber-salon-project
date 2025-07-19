import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  className = '',
  icon: Icon,
  autoComplete,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Icon size={18} className={isFocused ? 'text-amber-400' : 'text-zinc-500'} />
          </div>
        )}

        {/* Compact Input */}
        <input
          ref={ref}
          type={inputType}
          autoComplete={autoComplete}
          className={`
            w-full h-12 px-4 ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}
            bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg
            text-white placeholder:text-zinc-500 font-medium text-sm
            focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20
            transition-all duration-300
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          placeholder={label}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-amber-400 transition-colors duration-300 z-10"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Compact Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-red-400 text-xs font-medium"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
});

Input.displayName = 'Input';

export default Input;