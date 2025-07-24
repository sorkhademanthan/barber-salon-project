const { validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Service = require('../models/Service');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, city, search } = req.query;
    
    let query = { isActive: true };
    
    // Add city filter if provided
    if (city) {
        query['address.city'] = new RegExp(city, 'i');
    }
    
    // Add search filter if provided
    if (search) {
        query.$or = [
            { name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
        ];
    }
    
    try {
        const shops = await Shop.find(query)
            .populate('ownerId', 'name email')
            .populate('barbers.user', 'name specialties experience')
            .sort({ 'rating.average': -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Shop.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: shops.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: shops
        });
    } catch (error) {
        console.error('Get shops error:', error);
        return next(new ErrorResponse('Failed to fetch shops', 500));
    }
});

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
const getShop = asyncHandler(async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id)
            .populate('ownerId', 'name email phone');
        
        if (!shop || !shop.isActive) {
            return next(new ErrorResponse('Shop not found', 404));
        }
        
        res.status(200).json({
            success: true,
            data: shop
        });
    } catch (error) {
        console.error('Get shop error:', error);
        if (error.name === 'CastError') {
            return next(new ErrorResponse('Shop not found', 404));
        }
        return next(new ErrorResponse('Failed to fetch shop', 500));
    }
});

// @desc    Create new shop (with barbers and services)
// @route   POST /api/shops
// @access  Private (Barber/Admin only)
const createShop = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    // Accept barbers and services arrays in request body
    const { barbers, services, ...shopData } = req.body;
    shopData.ownerId = req.user.id;

    // Create shop
    const shop = await Shop.create(shopData);

    // Create barbers and link to shop
    if (Array.isArray(barbers) && barbers.length > 0) {
        const User = require('../models/User');
        const createdBarbers = await Promise.all(barbers.map(async (barber) => {
            const user = new User({
                name: barber.name,
                email: barber.email,
                phone: barber.phone,
                password: barber.password,
                role: 'barber'
            });
            await user.save();
            return {
                user: user._id,
                isActive: true,
                specialties: barber.specialties || [],
                experience: barber.experience || 0
            };
        }));
        shop.barbers = createdBarbers;
    }

    // Create services and link to shop
    if (Array.isArray(services) && services.length > 0) {
        const Service = require('../models/Service');
        const createdServices = await Promise.all(services.map(service =>
            Service.create({
                ...service,
                shopId: shop._id
            })
        ));
        shop.services = createdServices.map(service => service._id);
    }

    await shop.save();

    // Update user's shop reference
    await User.findByIdAndUpdate(req.user.id, { shop: shop._id });

    try {
        const populatedShop = await Shop.findById(shop._id)
            .populate('ownerId', 'name email')
            .populate('services')
            .populate('barbers.user', 'name email phone');
        res.status(201).json({
            success: true,
            message: 'Shop created successfully',
            data: populatedShop
        });
    } catch (error) {
        res.status(201).json({
            success: true,
            message: 'Shop created successfully',
            data: shop
        });
    }
});

// @desc    Get current user's shop
// @route   GET /api/shops/my-shop
// @access  Private (Barber only)
const getMyShop = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findOne({ ownerId: req.user.id, isActive: true })
        .populate('ownerId', 'name email phone');
    
    if (!shop) {
        return next(new ErrorResponse('You do not have a shop registered', 404));
    }
    
    res.status(200).json({
        success: true,
        data: shop
    });
});

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (Owner/Admin only)
const updateShop = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    console.log('🔍 UPDATE SHOP DEBUG:');
    console.log('Shop ID:', req.params.id);
    console.log('Current User ID:', req.user.id);
    console.log('Current User Role:', req.user.role);
    
    let shop = await Shop.findById(req.params.id);
    
    if (!shop) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    
    console.log('Shop Owner ID:', shop.ownerId.toString());
    console.log('Owner Match:', shop.ownerId.toString() === req.user.id);
    console.log('Is Admin:', req.user.role === 'admin');
    
    // Check if user is ownerId or admin
    if (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        console.log('❌ Authorization failed');
        return next(new ErrorResponse('Not authorized to update this shop', 403));
    }
    
    console.log('✅ Authorization passed');
    
    // Remove fields that shouldn't be updated
    delete req.body.ownerId;
    delete req.body.rating;
    
    shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    try {
        const populatedShop = await shop.populate('ownerId', 'name email');
        
        res.status(200).json({
            success: true,
            message: 'Shop updated successfully',
            data: populatedShop
        });
    } catch (error) {
        // If population fails, still return the basic shop
        res.status(200).json({
            success: true,
            message: 'Shop updated successfully',
            data: shop
        });
    }
});

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private (Owner/Admin only)
const deleteShop = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    
    // Check if user is ownerId or admin
    if (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete this shop', 403));
    }
    
    // Soft delete - set isActive to false
    await Shop.findByIdAndUpdate(req.params.id, { isActive: false });
    
    // Remove shop reference from user
    await User.findByIdAndUpdate(shop.ownerId, { $unset: { shop: 1 } });
    
    res.status(200).json({
        success: true,
        message: 'Shop deleted successfully'
    });
});

// @desc    Add shop to favorites
// @route   POST /api/shops/:id/favorite
// @access  Private (Customer only)
const addToFavorites = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop || !shop.isActive) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if already in favorites
    if (user.favoriteShops.includes(req.params.id)) {
        return next(new ErrorResponse('Shop already in favorites', 400));
    }
    
    user.favoriteShops.push(req.params.id);
    await user.save();
    
    res.status(200).json({
        success: true,
        message: 'Shop added to favorites'
    });
});

// @desc    Remove shop from favorites
// @route   DELETE /api/shops/:id/favorite
// @access  Private (Customer only)
const removeFromFavorites = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    // Check if shop is in favorites
    if (!user.favoriteShops.includes(req.params.id)) {
        return next(new ErrorResponse('Shop not in favorites', 400));
    }
    
    user.favoriteShops = user.favoriteShops.filter(
        shopId => shopId.toString() !== req.params.id
    );
    await user.save();
    
    res.status(200).json({
        success: true,
        message: 'Shop removed from favorites'
    });
});

// @desc    Get user's favorite shops
// @route   GET /api/shops/favorites
// @access  Private (Customer only)
const getFavoriteShops = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .populate({
            path: 'favoriteShops',
            match: { isActive: true },
            select: 'name address rating images contact workingHours',
            populate: {
                path: 'ownerId',
                select: 'name'
            }
        });
    
    res.status(200).json({
        success: true,
        count: user.favoriteShops.length,
        data: user.favoriteShops
    });
});

// @desc    Get shop services
// @route   GET /api/shops/:id/services
// @access  Public
const getShopServices = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop || !shop.isActive) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    
    const services = await Service.find({ 
        shopId: req.params.id, 
        isActive: true 
    }).sort({ category: 1, name: 1 });
    
    res.status(200).json({
        success: true,
        count: services.length,
        data: services
    });
});

// @desc    Add service to shop
// @route   POST /api/shops/:id/services
// @access  Private (Shop Owner/Admin only)
const addShopService = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    
    // Check if user is shop owner or admin
    if (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to add services to this shop', 403));
    }
    
    const serviceData = {
        ...req.body,
        shopId: req.params.id
    };
    
    const service = await Service.create(serviceData);
    
    // Add service reference to shop
    shop.services.push(service._id);
    await shop.save();
    
    res.status(201).json({
        success: true,
        message: 'Service added successfully',
        data: service
    });
});

// @desc    Update shop service
// @route   PUT /api/shops/:shopId/services/:serviceId
// @access  Private (Shop Owner/Admin only)
const updateShopService = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.shopId);
    
    if (!shop) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    
    // Check if user is shop owner or admin
    if (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update services for this shop', 403));
    }
    
    const service = await Service.findOneAndUpdate(
        { _id: req.params.serviceId, shopId: req.params.shopId },
        req.body,
        { new: true, runValidators: true }
    );
    
    if (!service) {
        return next(new ErrorResponse('Service not found', 404));
    }
    
    res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: service
    });
});

// @desc    Delete shop service
// @route   DELETE /api/shops/:shopId/services/:serviceId
// @access  Private (Shop Owner/Admin only)
const deleteShopService = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.shopId);
    
    if (!shop) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    
    // Check if user is shop owner or admin
    if (shop.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete services from this shop', 403));
    }
    
    // Soft delete - set isActive to false
    const service = await Service.findOneAndUpdate(
        { _id: req.params.serviceId, shopId: req.params.shopId },
        { isActive: false },
        { new: true }
    );
    
    if (!service) {
        return next(new ErrorResponse('Service not found', 404));
    }
    
    // Remove service reference from shop
    shop.services = shop.services.filter(
        serviceId => serviceId.toString() !== req.params.serviceId
    );
    await shop.save();
    
    res.status(200).json({
        success: true,
        message: 'Service deleted successfully'
    });
});

// @desc    Get barbers for a shop
// @route   GET /api/shops/:id/barbers
// @access  Public
const getShopBarbers = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id)
        .populate({
            path: 'barbers.user',
            select: 'name email phone avatar experience specialties role isActive'
        });
    if (!shop || !shop.isActive) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    // Return only active barbers
    const activeBarbers = (shop.barbers || []).filter(b => b.isActive && b.user);
    res.status(200).json({
        success: true,
        count: activeBarbers.length,
        data: activeBarbers
    });
});

// Utility function to add a barber to a shop
const addBarberToShop = async ({ shopId, name, email, phone, password, specialties, experience }) => {
    const User = require('../models/User');
    // Create barber user
    const user = new User({
        name,
        email,
        phone,
        password,
        role: 'barber'
    });
    await user.save();

    // Add barber to shop's barbers array
    const shop = await Shop.findById(shopId);
    if (!shop) throw new Error('Shop not found');
    shop.barbers.push({
        user: user._id,
        isActive: true,
        specialties: specialties || [],
        experience: experience || 0
    });
    await shop.save();
    return user;
};

module.exports = {
    getShops,
    getShop,
    createShop,
    updateShop,
    deleteShop,
    addToFavorites,
    removeFromFavorites,
    getFavoriteShops,
    getMyShop,
    getShopServices,
    addShopService,
    updateShopService,
    deleteShopService,
    getShopBarbers,
    addBarberToShop
};
