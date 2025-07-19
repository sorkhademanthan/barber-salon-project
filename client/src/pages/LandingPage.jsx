import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Scissors, 
  Crown, 
  Star, 
  Clock, 
  Users, 
  Calendar,
  ArrowRight,
  CheckCircle,
  Smartphone,
  MapPin,
  Award,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Booking",
      description: "Book appointments instantly with real-time availability"
    },
    {
      icon: Clock,
      title: "Queue Management",
      description: "Skip the wait with intelligent queue tracking"
    },
    {
      icon: Users,
      title: "Multi-Shop Network",
      description: "Access multiple barber shops in your area"
    },
    {
      icon: Star,
      title: "Premium Experience",
      description: "Luxury grooming with top-rated professionals"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Choose Your Service",
      description: "Browse local shops and select your preferred barber"
    },
    {
      step: "2",
      title: "Book Instantly",
      description: "Pick your time slot and confirm your appointment"
    },
    {
      step: "3",
      title: "Get Groomed",
      description: "Arrive on time and enjoy premium grooming service"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-6 py-3 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Crown className="text-amber-400" size={20} />
              <span className="text-amber-400 font-bold text-sm">Premium Grooming Platform</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Your Next 
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                {" "}Haircut{" "}
              </span>
              Awaits
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Skip the wait, book instantly, and experience premium grooming 
              with the best barbers in your city. Your time is valuable.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            {/* Customer Get Started */}
            <Link to="/register">
              <motion.button
                className="group relative overflow-hidden bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold py-4 px-8 rounded-xl text-lg min-w-[200px] shadow-2xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <Scissors size={20} />
                  <span>Get Started</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </motion.button>
            </Link>

            {/* Shop Owner CTA */}
            <Link to="/shop-register">
              <motion.button
                className="group relative overflow-hidden border-2 border-amber-400 text-amber-400 hover:text-black font-bold py-4 px-8 rounded-xl text-lg min-w-[200px] transition-all duration-300 hover:bg-amber-400"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <Crown size={20} />
                  <span>I'm a Shop Owner</span>
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-black text-amber-400">500+</div>
              <div className="text-zinc-400 text-sm">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-amber-400">50+</div>
              <div className="text-zinc-400 text-sm">Partner Shops</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-amber-400">4.9★</div>
              <div className="text-zinc-400 text-sm">Average Rating</div>
            </div>
          </motion.div>
        </div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute top-6 right-6"
        >
          <Link
            to="/login"
            className="flex items-center space-x-2 text-zinc-300 hover:text-amber-400 transition-colors font-medium"
          >
            <span>Already have an account?</span>
            <span className="text-amber-400 font-bold">Sign In</span>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Why Choose <span className="text-amber-400">BarberQueue</span>?
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              We're revolutionizing the grooming industry with smart technology 
              and premium service standards.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-amber-400/50 transition-all duration-300"
              >
                <div className="bg-amber-400/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-amber-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              How It <span className="text-amber-400">Works</span>
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              Get your perfect haircut in just three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {/* Step Number */}
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-2xl w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.step}
                </div>
                
                {/* Connector Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-amber-400/30 z-0"></div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-zinc-400 text-lg">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                About <span className="text-amber-400">BarberQueue</span>
              </h2>
              <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
                We're transforming the traditional barbershop experience with cutting-edge 
                technology. No more waiting in line, no more uncertainty - just premium 
                grooming on your schedule.
              </p>
              
              <div className="space-y-4">
                {[
                  "Real-time appointment booking",
                  "Verified professional barbers",
                  "Secure payment processing",
                  "24/7 customer support"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="text-amber-400" size={20} />
                    <span className="text-zinc-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-2xl p-8 backdrop-blur-sm border border-amber-400/30">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Zap className="text-amber-400 mx-auto mb-2" size={32} />
                    <div className="text-2xl font-bold text-white">Instant</div>
                    <div className="text-zinc-400 text-sm">Booking</div>
                  </div>
                  <div className="text-center">
                    <Award className="text-amber-400 mx-auto mb-2" size={32} />
                    <div className="text-2xl font-bold text-white">Premium</div>
                    <div className="text-zinc-400 text-sm">Quality</div>
                  </div>
                  <div className="text-center">
                    <MapPin className="text-amber-400 mx-auto mb-2" size={32} />
                    <div className="text-2xl font-bold text-white">Local</div>
                    <div className="text-zinc-400 text-sm">Network</div>
                  </div>
                  <div className="text-center">
                    <Smartphone className="text-amber-400 mx-auto mb-2" size={32} />
                    <div className="text-2xl font-bold text-white">Mobile</div>
                    <div className="text-zinc-400 text-sm">First</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-400/10 to-yellow-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Transform Your <span className="text-amber-400">Grooming Experience</span>?
            </h2>
            <p className="text-xl text-zinc-300 mb-12">
              Join thousands of satisfied customers who've made the switch to smart grooming.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <motion.button
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold py-4 px-8 rounded-xl text-lg min-w-[200px] shadow-2xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Now
                </motion.button>
              </Link>
              
              <Link to="/login">
                <motion.button
                  className="border-2 border-amber-400 text-amber-400 hover:text-black font-bold py-4 px-8 rounded-xl text-lg min-w-[200px] transition-all duration-300 hover:bg-amber-400"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="text-amber-400" size={24} />
            <span className="text-white font-bold text-xl">BarberQueue</span>
          </div>
          <p className="text-zinc-400">
            © 2025 BarberQueue. All rights reserved. Premium grooming made simple.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
