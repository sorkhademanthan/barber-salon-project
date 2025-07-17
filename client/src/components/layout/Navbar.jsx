import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Clock,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = {
    customer: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Book Appointment', href: '/book', icon: Calendar },
      { name: 'My Bookings', href: '/bookings', icon: Clock },
    ],
    barber: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Appointments', href: '/appointments', icon: Calendar },
      { name: 'Availability', href: '/availability', icon: Clock },
    ],
    admin: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Users', href: '/users', icon: Users },
      { name: 'All Bookings', href: '/all-bookings', icon: Calendar },
    ],
  };

  const currentNav = navigationItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              className="p-2 bg-accent-500 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Scissors size={24} className="text-white" />
            </motion.div>
            <span className="text-xl font-display font-bold text-primary-900 group-hover:text-accent-600 transition-colors">
              BarberShop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all
                    ${isActive(item.href)
                      ? 'text-accent-600 bg-accent-50'
                      : 'text-primary-600 hover:text-accent-600 hover:bg-accent-50'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-primary-50 transition-colors"
              >
                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-primary-900">{user?.name}</div>
                  <div className="text-xs text-primary-500 capitalize">{user?.role}</div>
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-luxury border border-white/20 py-2"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-primary-700 hover:bg-primary-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-primary-700 hover:bg-primary-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-primary-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-danger-600 hover:bg-danger-50 transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-primary-600 hover:text-accent-600 hover:bg-accent-50 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-primary-100"
            >
              <div className="space-y-2">
                {currentNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all
                        ${isActive(item.href)
                          ? 'text-accent-600 bg-accent-50'
                          : 'text-primary-600 hover:text-accent-600 hover:bg-accent-50'
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                <hr className="my-4 border-primary-100" />
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-primary-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
