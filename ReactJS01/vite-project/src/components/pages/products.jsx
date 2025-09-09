import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    getProducts, 
    getCategories, 
    getSearchSuggestions, 
    getFilterOptions,
    incrementProductViews 
} from '../util/api';
import './products.css';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        brands: [],
        priceRange: { minPrice: 0, maxPrice: 1000 },
        ratingStats: { avgRating: 0, maxRating: 5 }
    });
    
    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [minRating, setMinRating] = useState('');
    const [isOnSale, setIsOnSale] = useState('');
    const [isFeatured, setIsFeatured] = useState('');
    const [minViews, setMinViews] = useState('');
    const [fuzzyThreshold, setFuzzyThreshold] = useState(0.3);
    
    // Pagination and Loading States
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMode, setLoadingMode] = useState('lazy');
    
    // Sorting
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Refs
    const searchInputRef = useRef(null);
    const suggestionTimeoutRef = useRef(null);

    // Fetch products with all filters
    const fetchProducts = useCallback(async (pageNum = page, isNewSearch = false) => {
        if (loading) return;
        
        setLoading(true);
        try {
            const response = await getProducts(
                pageNum,
                12,
                searchQuery,
                selectedCategory,
                priceRange.min,
                priceRange.max,
                sortBy,
                sortOrder,
                selectedBrand,
                minRating,
                isOnSale,
                isFeatured,
                minViews,
                fuzzyThreshold
            );
            
            console.log('API Response:', response);
            
            if (response && response.products) {
                if (isNewSearch || pageNum === 1) {
                    setProducts(response.products);
                } else {
                    setProducts(prevProducts => [...prevProducts, ...response.products]);
                }
                
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalItems || 0);
                setHasMore(pageNum < (response.totalPages || 1));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
        setLoading(false);
    }, [
        page, searchQuery, selectedCategory, priceRange, sortBy, sortOrder,
        selectedBrand, minRating, isOnSale, isFeatured, minViews, fuzzyThreshold, loading
    ]);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, filtersRes] = await Promise.all([
                    getCategories(),
                    getFilterOptions()
                ]);
                
                setCategories(categoriesRes || []);
                if (filtersRes && filtersRes.filterOptions) {
                    setFilterOptions(filtersRes.filterOptions);
                    setPriceRange({
                        min: '',
                        max: filtersRes.filterOptions.priceRange.maxPrice
                    });
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        
        fetchInitialData();
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts(1, true);
        setPage(1);
        setHasMore(true);
    }, [
        searchQuery, selectedCategory, priceRange, sortBy, sortOrder,
        selectedBrand, minRating, isOnSale, isFeatured, minViews, fuzzyThreshold
    ]);

    // Search suggestions
    const handleSearchInputChange = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }
        
        if (value.trim().length >= 2) {
            suggestionTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await getSearchSuggestions(value);
                    setSearchSuggestions(response.suggestions || []);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            }, 300);
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        setSearchSuggestions([]);
    };

    const handleProductClick = async (product) => {
        try {
            await incrementProductViews(product._id);
            // Here you could navigate to product detail page
            console.log('Viewing product:', product.name);
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedBrand('');
        setPriceRange({ min: '', max: '' });
        setMinRating('');
        setIsOnSale('');
        setIsFeatured('');
        setMinViews('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setFuzzyThreshold(0.3);
    };

    // Load more for lazy loading
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage, false);
        }
    };

    // Pagination
    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchProducts(newPage, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Lazy Loading scroll handler
    const handleScroll = useCallback(() => {
        if (loadingMode !== 'lazy' || loading || !hasMore) return;
        
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            handleLoadMore();
        }
    }, [loading, hasMore, loadingMode]);

    useEffect(() => {
        if (loadingMode === 'lazy') {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, loadingMode]);
    
const handleCategoryChange = (e) => {
    const categoryValue = e.target.value;
    setSelectedCategory(categoryValue);
    setPage(1); // Reset về trang đầu khi thay đổi filter
    // Fetch products with new filter will be triggered by useEffect
};

    // Pagination component
    const renderPagination = () => {
        if (loadingMode !== 'pagination' || totalPages <= 1) return null;

        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={`page-${i}`}
                    className={`pagination-btn ${i === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                    disabled={loading}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                >
                    ‹ Trước
                </button>
                {startPage > 1 && (
                    <>
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(1)}
                            disabled={loading}
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="pagination-dots">...</span>}
                    </>
                )}
                {pages}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={loading}
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || loading}
                >
                    Sau ›
                </button>
            </div>
        );
    };

    return (
        <div className="products-page">
            <div className="products-header">
                <h1>Danh sách sản phẩm</h1>
                <div className="products-info">
                    Tổng: {totalItems} sản phẩm | Trang {page}/{totalPages}
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <div className="search-box">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="search-input"
                    />
                    {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="suggestions-dropdown">
                            {searchSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="filters">
                <div className="filter-row">
                    {/* Category Filter */}
                    <div className="filter-group">
                        <label htmlFor="category-select">Danh mục:</label>
                        <select 
                            id="category-select"
                            onChange={handleCategoryChange} 
                            value={selectedCategory}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(category => (
                                <option key={`category-${category._id}`} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Brand Filter */}
                    <div className="filter-group">
                        <label htmlFor="brand-select">Thương hiệu:</label>
                        <select 
                            id="brand-select"
                            value={selectedBrand} 
                            onChange={(e) => setSelectedBrand(e.target.value)}
                        >
                            <option value="">Tất cả thương hiệu</option>
                            {filterOptions.brands.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="filter-group">
                        <label>Khoảng giá:</label>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Giá từ"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                                className="price-input"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Giá đến"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                                className="price-input"
                            />
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-group">
                        <label htmlFor="rating-select">Đánh giá từ:</label>
                        <select 
                            id="rating-select"
                            value={minRating} 
                            onChange={(e) => setMinRating(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="1">1 sao trở lên</option>
                            <option value="2">2 sao trở lên</option>
                            <option value="3">3 sao trở lên</option>
                            <option value="4">4 sao trở lên</option>
                            <option value="5">5 sao</option>
                        </select>
                    </div>
                </div>

                <div className="filter-row">
                    {/* Special Filters */}
                    <div className="filter-group">
                        <label htmlFor="sale-filter">Sản phẩm sale:</label>
                        <select 
                            id="sale-filter"
                            value={isOnSale} 
                            onChange={(e) => setIsOnSale(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="true">Đang sale</option>
                            <option value="false">Không sale</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="featured-filter">Sản phẩm nổi bật:</label>
                        <select 
                            id="featured-filter"
                            value={isFeatured} 
                            onChange={(e) => setIsFeatured(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="true">Nổi bật</option>
                            <option value="false">Thường</option>
                        </select>
                    </div>

                    {/* Sort Options */}
                    <div className="filter-group">
                        <label htmlFor="sort-select">Sắp xếp:</label>
                        <select 
                            id="sort-select"
                            value={`${sortBy}-${sortOrder}`} 
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortOrder(newSortOrder);
                            }}
                        >
                            <option value="createdAt-desc">Mới nhất</option>
                            <option value="createdAt-asc">Cũ nhất</option>
                            <option value="price-asc">Giá thấp đến cao</option>
                            <option value="price-desc">Giá cao đến thấp</option>
                            <option value="rating-desc">Đánh giá cao nhất</option>
                            <option value="views-desc">Xem nhiều nhất</option>
                            <option value="name-asc">Tên A-Z</option>
                            <option value="name-desc">Tên Z-A</option>
                        </select>
                    </div>

                    {/* Loading Mode */}
                    <div className="filter-group">
                        <label htmlFor="loading-mode">Chế độ tải:</label>
                        <select 
                            id="loading-mode"
                            value={loadingMode} 
                            onChange={(e) => setLoadingMode(e.target.value)}
                        >
                            <option value="lazy">Lazy Loading</option>
                            <option value="pagination">Phân trang</option>
                        </select>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="filter-row advanced-filters">
                    <div className="filter-group">
                        <label htmlFor="min-views">Lượt xem tối thiểu:</label>
                        <input
                            id="min-views"
                            type="number"
                            placeholder="0"
                            value={minViews}
                            onChange={(e) => setMinViews(e.target.value)}
                            className="number-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="fuzzy-threshold">Độ chính xác tìm kiếm:</label>
                        <select 
                            id="fuzzy-threshold"
                            value={fuzzyThreshold} 
                            onChange={(e) => setFuzzyThreshold(parseFloat(e.target.value))}
                        >
                            <option value="0.1">Rất lỏng lẻo (0.1)</option>
                            <option value="0.3">Vừa phải (0.3)</option>
                            <option value="0.5">Chính xác (0.5)</option>
                            <option value="0.8">Rất chính xác (0.8)</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <button className="clear-filters-btn" onClick={clearAllFilters}>
                            🗑️ Xóa tất cả filter
                        </button>
                    </div>
                </div>
            </div>

            <div className="product-list">
                {products.map((product, index) => (
                    <div key={`product-${product._id}-${index}`} className="product-card">
                        <div className="product-image">
                            <img 
                                src={product.imageUrl || 'https://via.placeholder.com/250x200?text=No+Image'} 
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/250x200?text=No+Image';
                                }}
                            />
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>
                            <div className="product-footer">
                                <p className="product-price">${product.price}</p>
                                {product.category && (
                                    <span className="product-category">{product.category.name}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !loading && (
                <div className="no-products">
                    <p>Không tìm thấy sản phẩm nào.</p>
                </div>
            )}

            {/* Lazy Loading - Load More Button */}
            {loadingMode === 'lazy' && hasMore && !loading && (
                <div className="load-more-container">
                    <button className="load-more-btn" onClick={handleLoadMore}>
                        Tải thêm sản phẩm
                    </button>
                </div>
            )}

            {/* Pagination */}
            {renderPagination()}

            {/* Loading indicator */}
            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải sản phẩm...</p>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;