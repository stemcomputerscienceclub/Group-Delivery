// Application state
let currentUser = null;
let currentView = 'orders';
let orders = [];
let restaurants = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Authentication functions
async function checkAuth() {
    const token = getToken();
    if (!token) {
        showLogin();
        return;
    }

    try {
        const response = await authAPI.getProfile();
        currentUser = response.data.user;
        showApp();
        loadInitialData();
    } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
        showLogin();
    }
}

async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('loginError');

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    errorDiv.style.display = 'none';

    try {
        const response = await authAPI.login(username, password);
        setToken(response.data.token);
        currentUser = response.data.user;
        showApp();
        loadInitialData();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

async function register(event) {
    event.preventDefault();
    
    const userData = {
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        name: document.getElementById('regName').value,
        phoneNumber: document.getElementById('regPhone').value,
        roomNumber: document.getElementById('regRoom').value
    };
    
    const registerBtn = document.getElementById('registerBtn');
    const errorDiv = document.getElementById('registerError');

    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    errorDiv.style.display = 'none';

    try {
        await authAPI.register(userData);
        alert('Registration successful! Please log in with your credentials.');
        showLogin();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    } finally {
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register';
    }
}

function logout() {
    removeToken();
    currentUser = null;
    showLogin();
}

// UI Navigation functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('appContent').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('appContent').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
}

function showApp() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    document.getElementById('navbar').style.display = 'block';
    
    // Update navbar with user info
    document.getElementById('userName').textContent = currentUser.name;
    
    // Show admin nav if user is admin
    if (currentUser.isAdmin) {
        document.getElementById('adminNav').style.display = 'block';
    }
    
    showOrders();
}

function showOrders() {
    hideAllViews();
    document.getElementById('ordersView').style.display = 'block';
    currentView = 'orders';
    loadOrders();
}

function showRestaurants() {
    hideAllViews();
    document.getElementById('restaurantsView').style.display = 'block';
    currentView = 'restaurants';
    loadRestaurants();
}

function showAdmin() {
    if (!currentUser.isAdmin) return;
    
    hideAllViews();
    document.getElementById('adminView').style.display = 'block';
    currentView = 'admin';
    loadAdminDashboard();
}

function hideAllViews() {
    document.querySelectorAll('.content-view').forEach(view => {
        view.style.display = 'none';
    });
}

// Data loading functions
async function loadInitialData() {
    await Promise.all([
        loadRestaurantsForSelect(),
        loadOrders()
    ]);
}

async function loadOrders() {
    try {
        showLoading();
        const response = await ordersAPI.getOrders({ limit: 20 });
        orders = response.data.orders;
        renderOrders();
    } catch (error) {
        console.error('Failed to load orders:', error);
        showError('Failed to load orders');
    } finally {
        hideLoading();
    }
}

async function loadRestaurants() {
    try {
        showLoading();
        const response = await restaurantsAPI.getRestaurants();
        restaurants = response.data.restaurants;
        renderRestaurants();
    } catch (error) {
        console.error('Failed to load restaurants:', error);
        showError('Failed to load restaurants');
    } finally {
        hideLoading();
    }
}

async function loadRestaurantsForSelect() {
    try {
        const response = await restaurantsAPI.getRestaurants();
        const select = document.getElementById('orderRestaurant');
        select.innerHTML = '<option value="">Select a restaurant...</option>';
        
        response.data.restaurants.forEach(restaurant => {
            const option = document.createElement('option');
            option.value = restaurant._id;
            option.textContent = `${restaurant.name} (${restaurant.cuisine})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load restaurants for select:', error);
    }
}

async function loadAdminDashboard() {
    if (!currentUser.isAdmin) return;
    
    try {
        showLoading();
        const response = await adminAPI.getDashboard();
        renderAdminDashboard(response.data);
    } catch (error) {
        console.error('Failed to load admin dashboard:', error);
        showError('Failed to load admin dashboard');
    } finally {
        hideLoading();
    }
}

// Rendering functions
function renderOrders() {
    const container = document.getElementById('ordersList');
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No orders found</h4>
                    <p class="text-muted">Create your first order to get started!</p>
                </div>
            </div>
        `;
        return;
    }

    orders.forEach(order => {
        const statusClass = `status-${order.status}`;
        const orderCard = document.createElement('div');
        orderCard.className = 'col-md-6 col-lg-4 mb-3';
        
        orderCard.innerHTML = `
            <div class="card order-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${order.restaurant?.name || 'Restaurant'}</h5>
                        <span class="status-badge ${statusClass}">${order.status}</span>
                    </div>
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="fas fa-user"></i> ${order.createdBy?.name || 'Unknown'} (Room ${order.creatorRoom})<br>
                            <i class="fas fa-clock"></i> ${new Date(order.deliveryTime).toLocaleDateString()} ${new Date(order.deliveryTime).toLocaleTimeString()}<br>
                            <i class="fas fa-users"></i> ${order.individualOrders?.length || 0} participants<br>
                            <i class="fas fa-dollar-sign"></i> Delivery fee: $${order.deliveryFee?.toFixed(2) || '0.00'}
                        </small>
                    </p>
                    ${order.message ? `<p class="card-text"><em>"${order.message}"</em></p>` : ''}
                    <div class="d-flex gap-2">
                        ${order.status === 'open' ? `
                            <button class="btn btn-primary btn-sm" onclick="joinOrder('${order._id}')">
                                <i class="fas fa-plus"></i> Join Order
                            </button>
                        ` : ''}
                        <button class="btn btn-outline-info btn-sm" onclick="viewOrderDetails('${order._id}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(orderCard);
    });
}

function renderRestaurants() {
    const container = document.getElementById('restaurantsList');
    container.innerHTML = '';

    if (restaurants.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-store-slash fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No restaurants found</h4>
                </div>
            </div>
        `;
        return;
    }

    restaurants.forEach(restaurant => {
        const restaurantCard = document.createElement('div');
        restaurantCard.className = 'col-md-6 col-lg-4 mb-3';
        
        restaurantCard.innerHTML = `
            <div class="card restaurant-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${restaurant.name}</h5>
                    <p class="card-text">
                        <span class="badge bg-secondary mb-2">${restaurant.cuisine}</span><br>
                        <small class="text-muted">
                            <i class="fas fa-phone"></i> ${restaurant.phone}<br>
                            <i class="fas fa-map-marker-alt"></i> ${restaurant.address.street}, ${restaurant.address.city}<br>
                            <i class="fas fa-dollar-sign"></i> Delivery fee: $${restaurant.deliveryFee.toFixed(2)}
                        </small>
                    </p>
                    <button class="btn btn-primary btn-sm" onclick="viewRestaurantMenu('${restaurant._id}')">
                        <i class="fas fa-utensils"></i> View Menu
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(restaurantCard);
    });
}

function renderAdminDashboard(data) {
    const container = document.getElementById('adminContent');
    
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="card stats-card">
                    <div class="card-body text-center">
                        <div class="stats-number">${data.stats.totalUsers}</div>
                        <div>Total Users</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stats-card">
                    <div class="card-body text-center">
                        <div class="stats-number">${data.stats.totalOrders}</div>
                        <div>Total Orders</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stats-card">
                    <div class="card-body text-center">
                        <div class="stats-number">${data.stats.activeOrders}</div>
                        <div>Active Orders</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stats-card">
                    <div class="card-body text-center">
                        <div class="stats-number">${data.stats.totalRestaurants}</div>
                        <div>Restaurants</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-users"></i> Top Users</h5>
                    </div>
                    <div class="card-body">
                        ${data.stats.topUsers.map(user => `
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <strong>${user.name}</strong><br>
                                    <small class="text-muted">Room ${user.roomNumber}</small>
                                </div>
                                <div class="text-end">
                                    <div>${user.totalOrders} orders</div>
                                    <small class="text-muted">$${user.totalSpent.toFixed(2)}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-clock"></i> Recent Orders</h5>
                    </div>
                    <div class="card-body">
                        ${data.stats.recentOrders.map(order => `
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <span class="status-badge status-${order.status}">${order.status}</span>
                                </div>
                                <div class="text-end">
                                    <div>${order.participantCount} participants</div>
                                    <small class="text-muted">${new Date(order.createdAt).toLocaleDateString()}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Order management functions
function showCreateOrder() {
    const modal = new bootstrap.Modal(document.getElementById('createOrderModal'));
    modal.show();
}

async function createOrder(event) {
    event.preventDefault();
    
    const orderData = {
        restaurantId: document.getElementById('orderRestaurant').value,
        deliveryTime: document.getElementById('orderDeliveryTime').value,
        message: document.getElementById('orderMessage').value,
        deliveryFee: parseFloat(document.getElementById('orderDeliveryFee').value)
    };

    try {
        await ordersAPI.createOrder(orderData);
        bootstrap.Modal.getInstance(document.getElementById('createOrderModal')).hide();
        await loadOrders();
        showSuccess('Order created successfully!');
    } catch (error) {
        showError('Failed to create order: ' + error.message);
    }
}

// Utility functions
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showError(message) {
    // Simple alert for now - could be enhanced with toast notifications
    alert('Error: ' + message);
}

function showSuccess(message) {
    // Simple alert for now - could be enhanced with toast notifications
    alert('Success: ' + message);
}

// Placeholder functions for future implementation
function joinOrder(orderId) {
    alert('Join order functionality - to be implemented with menu selection');
}

function viewOrderDetails(orderId) {
    alert('View order details - to be implemented');
}

function viewRestaurantMenu(restaurantId) {
    alert('View restaurant menu - to be implemented');
}
