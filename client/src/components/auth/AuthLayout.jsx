import { motion } from 'framer-motion';
import { Scissors, Sparkles } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-primary flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-luxury relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 text-white/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Scissors size={60} />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 right-20 text-white/20"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Sparkles size={40} />
        </motion.div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-accent-500 rounded-xl">
                <Scissors size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-display font-bold">BarberShop</h1>
            </div>
            
            <h2 className="text-4xl font-display font-bold mb-6 leading-tight">
              Premium Grooming<br />
              <span className="text-accent-400">Experience</span>
            </h2>
            
            <p className="text-xl text-white/80 leading-relaxed">
              Book appointments with the finest barbers in town. 
              Experience luxury grooming like never before.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">500+</div>
              <div className="text-sm text-white/60">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">50+</div>
              <div className="text-sm text-white/60">Expert Barbers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">4.9</div>
              <div className="text-sm text-white/60">Rating</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="luxury-card p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl font-display font-bold text-primary-900 mb-2">
                  {title}
                </h2>
                <p className="text-primary-600">{subtitle}</p>
              </motion.div>
            </div>

            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
