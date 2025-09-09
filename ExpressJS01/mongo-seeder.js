require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');
const Category = require('./models/category');

const categories = [
    { name: 'Electronics' },
    { name: 'Books' },
    { name: 'Clothing' },
    { name: 'Home & Garden' },
    { name: 'Sports' },
    { name: 'Beauty' }
];

const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Dell', 'HP', 'Zara', 'H&M', 'IKEA', 'Philips', 'Dyson'];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Cleared existing data');

        const createdCategories = await Category.insertMany(categories);
        console.log('Categories seeded');

        const products = [
            // Electronics
            { 
                name: 'MacBook Pro 16"', 
                description: 'Apple MacBook Pro with M2 chip, 16GB RAM, 512GB SSD', 
                price: 2499, 
                originalPrice: 2799,
                brand: 'Apple',
                rating: 4.8,
                views: 1250,
                isOnSale: true,
                isFeatured: true,
                tags: ['laptop', 'apple', 'macbook', 'computer'],
                category: createdCategories[0]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500' 
            },
            { 
                name: 'iPhone 15 Pro', 
                description: 'Latest iPhone with advanced camera system', 
                price: 999, 
                brand: 'Apple',
                rating: 4.7,
                views: 2100,
                isFeatured: true,
                tags: ['smartphone', 'apple', 'iphone', 'phone'],
                category: createdCategories[0]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500' 
            },
            { 
                name: 'Samsung Galaxy S24', 
                description: 'Android flagship with AI features', 
                price: 899, 
                originalPrice: 999,
                brand: 'Samsung',
                rating: 4.6,
                views: 1800,
                isOnSale: true,
                tags: ['smartphone', 'samsung', 'galaxy', 'android'],
                category: createdCategories[0]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500' 
            },
            { 
                name: 'Dell XPS 13', 
                description: 'Ultrabook with Intel Core i7, 16GB RAM', 
                price: 1299, 
                brand: 'Dell',
                rating: 4.5,
                views: 950,
                tags: ['laptop', 'dell', 'ultrabook', 'computer'],
                category: createdCategories[0]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500' 
            },
            { 
                name: 'iPad Air', 
                description: 'Powerful tablet for creativity and productivity', 
                price: 599, 
                brand: 'Apple',
                rating: 4.4,
                views: 1100,
                tags: ['tablet', 'apple', 'ipad', 'creativity'],
                category: createdCategories[0]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500' 
            },
            { 
                name: 'Sony WH-1000XM5', 
                description: 'Wireless noise-canceling headphones', 
                price: 399, 
                originalPrice: 449,
                brand: 'Sony',
                rating: 4.9,
                views: 1600,
                isOnSale: true,
                isFeatured: true,
                tags: ['headphones', 'sony', 'wireless', 'noise-canceling'],
                category: createdCategories[0]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' 
            },

            // Books
            { 
                name: 'The Great Gatsby', 
                description: 'F. Scott Fitzgerald classic novel', 
                price: 15, 
                rating: 4.3,
                views: 850,
                tags: ['novel', 'classic', 'literature', 'fiction'],
                category: createdCategories[1]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500' 
            },
            { 
                name: 'JavaScript: The Good Parts', 
                description: 'Douglas Crockford programming guide', 
                price: 25, 
                rating: 4.2,
                views: 1200,
                isFeatured: true,
                tags: ['programming', 'javascript', 'coding', 'technical'],
                category: createdCategories[1]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500' 
            },

            // Clothing
            { 
                name: 'Nike Air Force 1', 
                description: 'Iconic white sneakers', 
                price: 90, 
                originalPrice: 110,
                brand: 'Nike',
                rating: 4.5,
                views: 2200,
                isOnSale: true,
                isFeatured: true,
                tags: ['sneakers', 'nike', 'shoes', 'white'],
                category: createdCategories[2]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500' 
            },
            { 
                name: 'Adidas Hoodie', 
                description: 'Comfortable cotton blend hoodie', 
                price: 65, 
                brand: 'Adidas',
                rating: 4.1,
                views: 800,
                tags: ['hoodie', 'adidas', 'comfortable', 'cotton'],
                category: createdCategories[2]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500' 
            },

            // Home & Garden
            { 
                name: 'IKEA Office Chair', 
                description: 'Ergonomic office chair with lumbar support', 
                price: 150, 
                brand: 'IKEA',
                rating: 4.0,
                views: 650,
                tags: ['chair', 'office', 'ikea', 'ergonomic'],
                category: createdCategories[3]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500' 
            },
            { 
                name: 'Philips Air Fryer', 
                description: 'Healthy cooking with hot air technology', 
                price: 89, 
                originalPrice: 120,
                brand: 'Philips',
                rating: 4.6,
                views: 1350,
                isOnSale: true,
                tags: ['airfryer', 'philips', 'cooking', 'healthy'],
                category: createdCategories[3]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500' 
            },

            // Sports
            { 
                name: 'Nike Running Shoes', 
                description: 'Lightweight running shoes with cushioning', 
                price: 130, 
                brand: 'Nike',
                rating: 4.4,
                views: 1850,
                isFeatured: true,
                tags: ['running', 'nike', 'shoes', 'lightweight'],
                category: createdCategories[4]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' 
            },
            { 
                name: 'Yoga Mat', 
                description: 'Non-slip exercise mat', 
                price: 35, 
                rating: 4.2,
                views: 750,
                tags: ['yoga', 'mat', 'exercise', 'non-slip'],
                category: createdCategories[4]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500' 
            },

            // Beauty
            { 
                name: 'Skincare Set', 
                description: 'Complete daily skincare routine', 
                price: 75, 
                originalPrice: 95,
                rating: 4.3,
                views: 920,
                isOnSale: true,
                tags: ['skincare', 'beauty', 'routine', 'daily'],
                category: createdCategories[5]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500' 
            },
            { 
                name: 'Professional Hair Dryer', 
                description: 'Professional ionic hair dryer', 
                price: 65, 
                rating: 4.1,
                views: 680,
                tags: ['hairdryer', 'professional', 'ionic', 'beauty'],
                category: createdCategories[5]._id, 
                imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500' 
            }
        ];

        await Product.insertMany(products);
        console.log('Products seeded');

        console.log(`✅ Database seeded successfully!`);
        console.log(`📊 Created ${categories.length} categories and ${products.length} products`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
    }
};

seedDatabase();