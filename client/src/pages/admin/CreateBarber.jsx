import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, User, Mail, Phone, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

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
    specialties: '',
    bio: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create the barber user
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'barber'
      };
      
      const userResponse = await api.post('/auth/register', userData);
      toast.success('Barber created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        shopId: '',
        experience: '',
        specialties: '',
        bio: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create barber');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="luxury-card p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Scissors className="text-amber-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Create New Barber</h1>
              <p className="text-slate-600">Add a new barber to your team</p>
            </div>
          </div>

          {shops.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800">
                ⚠️ No shops available. Please create a shop first before adding barbers.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Shop
                </label>
                <select
                  name="shopId"
                  value={formData.shopId}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
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

            <Input
              label="Specialties (comma separated)"
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              placeholder="Haircut, Beard Trim, Hair Styling"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about this barber..."
                className="w-full h-24 px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" loading={loading} disabled={shops.length === 0}>
                Create Barber
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateBarber;
