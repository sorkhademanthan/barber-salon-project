const Specialty = require('../models/Specialty');

const seedSpecialties = async () => {
    try {
        const count = await Specialty.countDocuments();
        
        if (count > 0) {
            console.log('📋 Specialties already exist, skipping seed');
            return;
        }
        
        const specialties = [
            {
                name: 'Haircut',
                description: 'Professional hair cutting services',
                category: 'Hair',
                isActive: true
            },
            {
                name: 'Beard Styling',
                description: 'Beard trimming and styling',
                category: 'Beard',
                isActive: true
            },
            {
                name: 'Hair Washing',
                description: 'Hair washing and conditioning',
                category: 'Hair',
                isActive: true
            }
        ];
        
        await Specialty.insertMany(specialties);
        console.log('📋 Default specialties seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding specialties:', error);
    }
};

module.exports = seedSpecialties;
