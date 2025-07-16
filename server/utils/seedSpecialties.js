const Specialty = require('../models/Specialty');

const defaultSpecialties = [
    {
        name: 'Hair Cut',
        description: 'Professional hair cutting and styling',
        icon: '✂️'
    },
    {
        name: 'Beard Trim',
        description: 'Beard trimming and shaping',
        icon: '🧔'
    },
    {
        name: 'Shave',
        description: 'Traditional wet shave service',
        icon: '🪒'
    },
    {
        name: 'Hair Styling',
        description: 'Hair styling and grooming',
        icon: '💇‍♂️'
    },
    {
        name: 'Hair Coloring',
        description: 'Hair coloring and highlighting',
        icon: '🎨'
    },
    {
        name: 'Facial',
        description: 'Facial treatment and skincare',
        icon: '😊'
    }
];

const seedSpecialties = async () => {
    try {
        const count = await Specialty.countDocuments();
        
        if (count === 0) {
            await Specialty.insertMany(defaultSpecialties);
            console.log('✅ Default specialties seeded successfully');
        } else {
            console.log('📋 Specialties already exist, skipping seed');
        }
    } catch (error) {
        console.error('❌ Error seeding specialties:', error);
    }
};

module.exports = seedSpecialties;
