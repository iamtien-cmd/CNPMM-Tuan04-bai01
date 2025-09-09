const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const { 
    getProducts, 
    getCategories, 
    getProductById,
    getSearchSuggestions,
    getFilterOptions,
    incrementProductViews
} = require('../controllers/productController');
const auth = require('../src/middleware/auth');
const delay = require('../src/middleware/delay');

const routerAPI = express.Router();

// routerAPI.all("*", auth); // Tạm comment dòng này

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api");
});

// User routes
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

// Product routes

routerAPI.get("/products", getProducts);
routerAPI.get("/products/search-suggestions", getSearchSuggestions);
routerAPI.get("/products/filters", getFilterOptions); // Thay đổi từ "filter-options" thành "filters"
routerAPI.get("/products/:id", getProductById);
routerAPI.post("/products/:id/view", incrementProductViews);

// Category routes
routerAPI.get("/categories", getCategories);

module.exports = routerAPI;