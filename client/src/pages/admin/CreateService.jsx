import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const categories = ['Hair', 'Beard', 'Styling', 'Treatment', 'Package'];

const CreateService = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({
    shopId: '',
    name: '',
    description: '',
    category: '',
    price: '',
    duration: ''
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
      await api.post('/services', formData);
      toast.success('Service created successfully!');
      setFormData({
        shopId: '',
        name: '',
        description: '',
        category: '',
        price: '',
        duration: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/80 border border-amber-400/20 rounded-2xl p-10 shadow-luxury backdrop-blur-xl">
          <h1 className="text-2xl font-black text-white font-display mb-6">Create New Service</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-amber-400 mb-1">Shop</label>
              <select
                name="shopId"
                value={formData.shopId}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-zinc-900/60 border border-amber-400/30 rounded-xl text-white"
                required
              >
                <option value="">Select a shop</option>
                {shops.map(shop => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name} - {shop.address.city}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Service Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-bold text-amber-400 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-zinc-900/60 border border-amber-400/30 rounded-xl text-white"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Input
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <Input
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              required
            />
            <div className="flex justify-end">
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
              