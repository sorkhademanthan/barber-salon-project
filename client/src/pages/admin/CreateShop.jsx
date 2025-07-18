import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const CreateShop = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    workingHours: {
      monday: { start: '09:00', end: '18:00', isOpen: true },
      tuesday: { start: '09:00', end: '18:00', isOpen: true },
      wednesday: { start: '09:00', end: '18:00', isOpen: true },
      thursday: { start: '09:00', end: '18:00', isOpen: true },
      friday: { start: '09:00', end: '18:00', isOpen: true },
      saturday: { start: '09:00', end: '17:00', isOpen: true },
      sunday: { start: '10:00', end: '16:00', isOpen: false }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/shops', formData);
      toast.success('Shop created successfully!');
      console.log('Created shop:', response.data);
      
      // Reset form
      setFormData({
        name: '',
        address: { street: '', city: '', state: '', zipCode: '' },
        contact: { phone: '', email: '', website: '' },
        workingHours: {
          monday: { start: '09:00', end: '18:00', isOpen: true },
          tuesday: { start: '09:00', end: '18:00', isOpen: true },
          wednesday: { start: '09:00', end: '18:00', isOpen: true },
          thursday: { start: '09:00', end: '18:00', isOpen: true },
          friday: { start: '09:00', end: '18:00', isOpen: true },
          saturday: { start: '09:00', end: '17:00', isOpen: true },
          sunday: { start: '10:00', end: '16:00', isOpen: false }
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create shop');
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
              <Building className="text-amber-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Create New Shop</h1>
              <p className="text-slate-600">Add a new barber shop to your network</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Shop Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Elite Barber Shop"
              icon={Building}
              required
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  icon={MapPin}
                  required
                />
                <Input
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  required
                />
                <Input
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  required
                />
                <Input
                  label="ZIP Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="400001"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Phone"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  icon={Phone}
                  required
                />
                <Input
                  label="Email"
                  name="contact.email"
                  type="email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  placeholder="shop@example.com"
                  icon={Mail}
                />
                <Input
                  label="Website"
                  name="contact.website"
                  value={formData.contact.website}
                  onChange={handleChange}
                  placeholder="https://shop.com"
                  icon={Globe}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" loading={loading}>
                Create Shop
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateShop;
        