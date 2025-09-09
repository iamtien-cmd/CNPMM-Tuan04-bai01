const Product = require('../models/product');
const Category = require('../models/category');
const { fuzzyMatch, createFuzzyRegex, generateSearchSuggestions } = require('../services/fuzzySearchService');

const getProducts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            search = '',
            categoryId, 
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            brand,
            minRating,
            isOnSale,
            isFeatured,
            minViews,
            fuzzyThreshold = 0.3
        } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {};
        
        // Category filter
        if (categoryId && categoryId !== '') {
            query.category = categoryId;
        }
        
        // Brand filter
        if (brand && brand !== '') {
            query.brand = brand;
        }
        
        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        
        // Rating filter
        if (minRating && minRating !== '') {
            query.rating = { $gte: parseFloat(minRating) };
        }
        
        // Sale filter
        if (isOnSale !== '') {
            query.isOnSale = isOnSale === 'true';
        }
        
        // Featured filter
        if (isFeatured !== '') {
            query.isFeatured = isFeatured === 'true';
        }
        
        // Views filter
        if (minViews && minViews !== '') {
            query.views = { $gte: parseInt(minViews) };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        let products;

        // Search functionality
        if (search && search.trim() !== '') {
            // MongoDB text search first (faster)
            const textSearchQuery = {
                ...query,
                $text: { $search: search }
            };

            // Try text search first
            const textSearchProducts = await Product.find(textSearchQuery)
                .populate('category', 'name')
                .sort({ score: { $meta: 'textScore' }, ...sort })
                .limit(parseInt(limit) * 2) // Get more for fuzzy filtering
                .lean();

            // If text search doesn't return enough results, do fuzzy search
            if (textSearchProducts.length < parseInt(limit)) {
                // Get all products for fuzzy search
                const allProducts = await Product.find(query)
                    .populate('category', 'name')
                    .lean();

                // Apply fuzzy search
                const fuzzyResults = allProducts.filter(product => {
                    const nameScore = fuzzyMatch(search, product.name, parseFloat(fuzzyThreshold));
                    const descScore = fuzzyMatch(search, product.description || '', parseFloat(fuzzyThreshold));
                    const brandScore = fuzzyMatch(search, product.brand || '', parseFloat(fuzzyThreshold));
                    const tagsScore = product.tags ? 
                        fuzzyMatch(search, product.tags.join(' '), parseFloat(fuzzyThreshold)) : 0;

                    const maxScore = Math.max(nameScore, descScore, brandScore, tagsScore);
                    
                    if (maxScore > 0) {
                        product._fuzzyScore = maxScore;
                        return true;
                    }
                    return false;
                });

                // Combine and deduplicate results
                const combinedResults = [...textSearchProducts];
                const existingIds = new Set(textSearchProducts.map(p => p._id.toString()));

                fuzzyResults.forEach(product => {
                    if (!existingIds.has(product._id.toString())) {
                        combinedResults.push(product);
                    }
                });

                // Sort by relevance score
                combinedResults.sort((a, b) => {
                    const scoreA = a._fuzzyScore || a.score || 0;
                    const scoreB = b._fuzzyScore || b.score || 0;
                    return scoreB - scoreA;
                });

                // Apply pagination
                products = combinedResults.slice(skip, skip + parseInt(limit));
            } else {
                // Use text search results with pagination
                products = textSearchProducts.slice(skip, skip + parseInt(limit));
            }
        } else {
            // No search, regular query
            products = await Product.find(query)
                .populate('category', 'name')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
        }

        // Get total count for pagination
        let totalItems;
        if (search && search.trim() !== '') {
            // For search, we need to count all matching products
            const countQuery = { ...query };
            if (search) {
                // Use text search for count as well
                countQuery.$text = { $search: search };
            }
            totalItems = await Product.countDocuments(countQuery);
        } else {
            totalItems = await Product.countDocuments(query);
        }

        const totalPages = Math.ceil(totalItems / parseInt(limit));
        const hasMore = parseInt(page) < totalPages;

        res.status(200).json({
            success: true,
            totalItems,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit),
            hasMore,
            searchTerm: search,
            fuzzyThreshold: parseFloat(fuzzyThreshold),
            products: products.map(product => ({
                ...product,
                id: product._id,
                _fuzzyScore: undefined // Remove internal score from response
            }))
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching products', 
            error: error.message 
        });
    }
};

const getSearchSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(200).json({
                success: true,
                suggestions: []
            });
        }

        // Get products for generating suggestions
        const products = await Product.find({})
            .select('name brand tags')
            .limit(1000)
            .lean();

        const suggestions = generateSearchSuggestions(q, products, 8);

        res.status(200).json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('Error getting search suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting search suggestions',
            error: error.message
        });
    }
};

const getFilterOptions = async (req, res) => {
    try {
        // Get unique brands
        const brands = await Product.distinct('brand');
        
        // Get price range
        const priceStats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        // Get rating stats
        const ratingStats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    minRating: { $min: '$rating' },
                    maxRating: { $max: '$rating' },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            filterOptions: {
                brands: brands.filter(Boolean).sort(),
                priceRange: {
                    minPrice: priceStats[0]?.minPrice || 0,
                    maxPrice: priceStats[0]?.maxPrice || 1000,
                    avgPrice: priceStats[0]?.avgPrice || 100
                },
                ratingStats: {
                    minRating: ratingStats[0]?.minRating || 0,
                    maxRating: ratingStats[0]?.maxRating || 5,
                    avgRating: ratingStats[0]?.avgRating || 0
                }
            }
        });
    } catch (error) {
        console.error('Error getting filter options:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting filter options',
            error: error.message
        });
    }
};

const incrementProductViews = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Product.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Views incremented'
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
        res.status(500).json({
            success: false,
            message: 'Error incrementing views',
            error: error.message
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean();
        
        res.status(200).json(
            categories.map(category => ({
                ...category,
                id: category._id
            }))
        );
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching categories', 
            error: error.message 
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id)
            .populate('category', 'name')
            .lean();
            
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product: {
                ...product,
                id: product._id
            }
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching product', 
            error: error.message 
        });
    }
};

module.exports = {
    getProducts,
    getCategories,
    getProductById,
    getSearchSuggestions,
    getFilterOptions,
    incrementProductViews
};