// API Configuration and utilities
const API_BASE = '/api';

// Token management
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function getAuthHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers
        },
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Authentication API
const authAPI = {
    async login(username, password) {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: { username, password }
        });
    },

    async register(userData) {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: userData
        });
    },

    async getProfile() {
        return apiRequest('/auth/profile');
    }
};

// Orders API
const ordersAPI = {
    async getOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/orders${queryString ? '?' + queryString : ''}`);
    },

    async createOrder(orderData) {
        return apiRequest('/orders', {
            method: 'POST',
            body: orderData
        });
    },

    async joinOrder(orderId, orderData) {
        return apiRequest(`/orders/${orderId}/join`, {
            method: 'POST',
            body: orderData
        });
    }
};

// Restaurants API
const restaurantsAPI = {
    async getRestaurants(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/restaurants${queryString ? '?' + queryString : ''}`);
    },

    async getRestaurant(id) {
        return apiRequest(`/restaurants/${id}`);
    }
};

// Admin API
const adminAPI = {
    async getDashboard() {
        return apiRequest('/admin/dashboard');
    }
};
