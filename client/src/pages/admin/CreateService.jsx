import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const CreateService = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    shopId: ''
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
      
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category,
        shop: formData.shopId
      };
      
      await api.post('/services', serviceData);
      toast.success('Service created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        shopId: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service');
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
              <h1 className="text-2xl font-bold text-slate-800">Create Service</h1>
              <p className="text-slate-600">Add a new service to your shop</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Service Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Haircut"
                icon={Scissors}
                required
              />
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
            </div>

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Professional haircut with styling"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Price (₹)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="500"
                icon={DollarSign}
                required
              />
              <Input
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                placeholder="30"
                icon={Clock}
                required
              />
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Hair"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" loading={loading}>
                Create Service
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateService;
