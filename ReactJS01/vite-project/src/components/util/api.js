import axios from './axios.customize';

const createUserApi = (name, email, password) => {
  const URL_API = "/register";
  const data = {
    name, email, password
  };
  return axios.post(URL_API, data);
};

const loginApi = (email, password) => {
  const URL_API = "/login";
  const data = {
    email, password
  };
  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = "/user";
  return axios.get(URL_API);
};

// Enhanced getProducts with fuzzy search and multiple filters
const getProducts = (
    page = 1, 
    limit = 12, 
    search = '', 
    categoryId = '', 
    minPrice = '', 
    maxPrice = '', 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    brand = '',
    minRating = '',
    isOnSale = '',
    isFeatured = '',
    minViews = '',
    fuzzyThreshold = 0.3
) => {
    let url = `/products?page=${page}&limit=${limit}`;
    
    if (search && search.trim() !== '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
    }
    
    if (categoryId && categoryId.trim() !== '') {
        url += `&categoryId=${categoryId}`;
    }
    
    if (minPrice && minPrice !== '') {
        url += `&minPrice=${minPrice}`;
    }
    
    if (maxPrice && maxPrice !== '') {
        url += `&maxPrice=${maxPrice}`;
    }
    
    if (sortBy) {
        url += `&sortBy=${sortBy}`;
    }
    
    if (sortOrder) {
        url += `&sortOrder=${sortOrder}`;
    }
    
    if (brand && brand.trim() !== '') {
        url += `&brand=${encodeURIComponent(brand)}`;
    }
    
    if (minRating && minRating !== '') {
        url += `&minRating=${minRating}`;
    }
    
    if (isOnSale && isOnSale !== '') {
        url += `&isOnSale=${isOnSale}`;
    }
    
    if (isFeatured && isFeatured !== '') {
        url += `&isFeatured=${isFeatured}`;
    }
    
    if (minViews && minViews !== '') {
        url += `&minViews=${minViews}`;
    }
    
    if (fuzzyThreshold && fuzzyThreshold !== 0.3) {
        url += `&fuzzyThreshold=${fuzzyThreshold}`;
    }
    
    return axios.get(url);
};

const getProductById = (productId) => {
    return axios.get(`/products/${productId}`);
};

const incrementProductViews = (productId) => {
    return axios.post(`/products/${productId}/view`);
};

const getSearchSuggestions = (query) => {
    return axios.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
};

const getFilterOptions = () => {
    return axios.get('/products/filter-options'); // Thay đổi từ '/products/filters' thành '/products/filter-options'
};

const getCategories = () => {
    return axios.get('/categories');
};

export {
  createUserApi, 
  loginApi, 
  getUserApi, 
  getProducts, 
  getProductById,
  incrementProductViews,
  getSearchSuggestions,
  getFilterOptions,
  getCategories
};