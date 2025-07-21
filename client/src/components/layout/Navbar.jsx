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
  Users,
  Building
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
      { name: 'Create Shop', href: '/create-shop', icon: Building },
      { name: 'Create Barber', href: '/create-barber', icon: Scissors },
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
    <nav className="bg-gradient-to-br from-black via-zinc-900 to-black/80 border-b border-zinc-800 shadow-luxury sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              className="p-2 bg-amber-400 rounded-xl shadow-luxury"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Scissors size={24} className="text-black" />
            </motion.div>
            <span className="text-xl font-display font-black text-white group-hover:text-amber-400 transition-colors">
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
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-zinc-300 hover:text-amber-400 hover:bg-amber-400/10'
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
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-zinc-800/60 transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border-2 border-amber-400 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 bg-amber-400 text-black font-bold flex items-center justify-center rounded-full text-lg border-2 border-amber-400">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-bold text-white">{user?.name}</div>
                  <div className="text-xs text-amber-400 capitalize font-semibold">{user?.role}</div>
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-52 bg-gradient-to-br from-black via-zinc-900 to-black/90 rounded-xl shadow-luxury border border-zinc-800 py-2 z-50"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-zinc-200 hover:bg-zinc-800 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-zinc-200 hover:bg-zinc-800 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-zinc-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-zinc-800 transition-colors w-full text-left"
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
              className="p-2 rounded-lg text-amber-400 hover:text-white hover:bg-amber-400/10 transition-colors"
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
              className="md:hidden py-4 border-t border-zinc-800 bg-gradient-to-br from-black via-zinc-900 to-black/90 rounded-b-2xl shadow-luxury"
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
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-zinc-300 hover:text-amber-400 hover:bg-amber-400/10'
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <hr className="my-4 border-zinc-700" />

                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-zinc-200 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-zinc-800 rounded-lg transition-colors w-full text-left"
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
