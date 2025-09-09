const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number, // Giá gốc trước khuyến mãi
        default: function() { return this.price; }
    },
    imageUrl: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brand: {
        type: String,
        default: 'Unknown'
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    specifications: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Text search index cho fuzzy search
productSchema.index({
    name: 'text',
    description: 'text',
    brand: 'text',
    tags: 'text'
});

// Compound indexes cho performance
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1, views: -1 });
productSchema.index({ isOnSale: 1, isFeatured: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;