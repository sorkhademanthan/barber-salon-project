import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, User, Mail, Phone, Plus, Trash, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const serviceCategories = ['Hair', 'Beard', 'Styling', 'Treatment', 'Package'];

const CreateBarber = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    shopId: '',
    experience: '',
    bio: ''
  });
  const [services, setServices] = useState([
    { name: '', category: '', price: '', duration: '' }
  ]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops');
      setShops(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch shops');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (idx, e) => {
    const { name, value } = e.target;
    setServices(prev =>
      prev.map((s, i) => (i === idx ? { ...s, [name]: value } : s))
    );
  };

  const addService = () => {
    setServices(prev => [...prev, { name: '', category: '', price: '', duration: '' }]);
  };

  const removeService = (idx) => {
    setServices(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // 1. Create barber user
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'barber'
      };
      const userResponse = await api.post('/auth/register', userData);
      const barberId = userResponse.data.user?._id;

      // 2. Create services for this barber and shop
      const validServices = services.filter(s => s.name && s.category && s.price && s.duration);
      for (const service of validServices) {
        await api.post('/services', {
          shopId: formData.shopId,
          name: service.name,
          category: service.category,
          price: service.price,
          duration: service.duration,
          barberId
        });
      }

      toast.success('Barber and services created successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        shopId: '',
        experience: '',
        bio: ''
      });
      setServices([{ name: '', category: '', price: '', duration: '' }]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create barber/services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/80 border border-amber-400/20 rounded-2xl p-10 shadow-luxury backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-luxury">
                <Scissors className="text-black" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white font-display">Create New Barber</h1>
                <p className="text-zinc-400">Add a new barber to your team and their services</p>
              </div>
            </div>
            {shops.length === 0 && (
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-6">
                <p className="text-amber-400 font-bold">
                  ⚠️ No shops available. Please create a shop first before adding barbers.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Barber"
                  icon={User}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  icon={Mail}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  icon={Phone}
                  required
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-amber-400 mb-1">
                    Shop
                  </label>
                  <select
                    name="shopId"
                    value={formData.shopId}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-zinc-900/60 border border-amber-400/30 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                    required
                  >
                    <option value="">Select a shop</option>
                    {shops.map((shop) => (
                      <option key={shop._id} value={shop._id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Experience (years)"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-amber-400 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about this barber..."
                  className="w-full h-24 px-4 py-3 bg-zinc-900/60 border border-amber-400/30 rounded-xl text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200 resize-none"
                />
              </div>

              {/* Improved Services Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Scissors className="text-amber-400" size={22} />
                  <h2 className="text-xl font-black text-white font-display tracking-tight">
                    Services Offered
                  </h2>
                  <span className="flex-1 h-0.5 bg-gradient-to-r from-amber-400/40 to-yellow-500/10 rounded-full ml-2" />
                </div>
                <div className="space-y-4">
                  {services.map((service, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-zinc-900/60 to-zinc-800/60 border border-amber-400/20 rounded-xl p-6 shadow-luxury flex flex-col md:flex-row md:items-center gap-4 hover:shadow-luxury-lg transition-all duration-300"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                          label="Service Name"
                          name="name"
                          value={service.name}
                          onChange={e => handleServiceChange(idx, e)}
                          required
                          className="bg-zinc-900/80"
                        />
                        <div>
                          <label className="block text-sm font-bold text-amber-400 mb-1">Category</label>
                          <select
                            name="category"
                            value={service.category}
                            onChange={e => handleServiceChange(idx, e)}
                            className="w-full h-12 px-4 bg-zinc-900/60 border border-amber-400/30 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                            required
                          >
                            <option value="">Select category</option>
                            {serviceCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Price"
                          name="price"
                          type="number"
                          value={service.price}
                          onChange={e => handleServiceChange(idx, e)}
                          required
                          icon={Scissors}
                          className="bg-zinc-900/80"
                        />
                        <Input
                          label="Duration (min)"
                          name="duration"
                          type="number"
                          value={service.duration}
                          onChange={e => handleServiceChange(idx, e)}
                          required
                          icon={Clock}
                          className="bg-zinc-900/80"
                        />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {services.length > 1 && (
                          <button
                            type="button"
                            className="text-red-400 hover:text-red-600 bg-zinc-900/70 border border-red-400/30 rounded-full p-2 transition-all duration-200"
                            onClick={() => removeService(idx)}
                            title="Remove Service"
                          >
                            <Trash size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2"
                  onClick={addService}
                >
                  <Plus size={16} className="mr-2" />
                  Add Another Service
                </Button>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="submit" loading={loading} disabled={shops.length === 0}>
                  Create Barber & Services
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateBarber;
