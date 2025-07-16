const { validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const User = require('../models/User');
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
            .populate('owner', 'name email')
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
            .populate('owner', 'name email phone');
        
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

// @desc    Create new shop
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
    
    console.log('🏪 Creating shop for user:', req.user.id, 'Role:', req.user.role);
    
    // Check if user already has a shop (barbers can only have one shop)
    if (req.user.role === 'barber') {
        const existingShop = await Shop.findOne({ owner: req.user.id, isActive: true });
        
        if (existingShop) {
            console.log('❌ User already has shop:', existingShop._id);
            return res.status(400).json({
                success: false,
                message: 'You already have a shop registered',
                data: {
                    existingShop: {
                        id: existingShop._id,
                        name: existingShop.name,
                        createdAt: existingShop.createdAt
                    }
                }
            });
        }
    }
    
    // Add owner to shop data
    req.body.owner = req.user.id;
    
    console.log('✅ Creating new shop...');
    const shop = await Shop.create(req.body);
    
    // Update user's shop reference
    await User.findByIdAndUpdate(req.user.id, { shop: shop._id });
    console.log('✅ Updated user shop reference');
    
    try {
        const populatedShop = await Shop.findById(shop._id)
            .populate('owner', 'name email');
        
        res.status(201).json({
            success: true,
            message: 'Shop created successfully',
            data: populatedShop
        });
    } catch (error) {
        // If population fails, still return the basic shop
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
    const shop = await Shop.findOne({ owner: req.user.id, isActive: true })
        .populate('owner', 'name email phone');
    
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
    
    console.log('Shop Owner ID:', shop.owner.toString());
    console.log('Owner Match:', shop.owner.toString() === req.user.id);
    console.log('Is Admin:', req.user.role === 'admin');
    
    // Check if user is owner or admin
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        console.log('❌ Authorization failed');
        return next(new ErrorResponse('Not authorized to update this shop', 403));
    }
    
    console.log('✅ Authorization passed');
    
    // Remove fields that shouldn't be updated
    delete req.body.owner;
    delete req.body.rating;
    
    shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    try {
        const populatedShop = await shop.populate('owner', 'name email');
        
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
    
    // Check if user is owner or admin
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete this shop', 403));
    }
    
    // Soft delete - set isActive to false
    await Shop.findByIdAndUpdate(req.params.id, { isActive: false });
    
    // Remove shop reference from user
    await User.findByIdAndUpdate(shop.owner, { $unset: { shop: 1 } });
    
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
                path: 'owner',
                select: 'name'
            }
        });
    
    res.status(200).json({
        success: true,
        count: user.favoriteShops.length,
        data: user.favoriteShops
    });
});

module.exports = {
    getShops,
    getShop,
    createShop,
    updateShop,
    deleteShop,
    addToFavorites,
    removeFromFavorites,
    getFavoriteShops,
    getMyShop
};
