/**
 * Anime Hub Frontend API Client
 */

const API_BASE_URL = window.location.origin.includes('5000') 
    ? '/api' 
    : 'http://localhost:5000/api';

const API = {
    // Auth Helpers
    auth: {
        getToken() {
            return localStorage.getItem('anime_hub_token');
        },
        setToken(token) {
            localStorage.setItem('anime_hub_token', token);
        },
        getUser() {
            const userStr = localStorage.getItem('anime_hub_user');
            return userStr ? JSON.parse(userStr) : null;
        },
        setUser(user) {
            localStorage.setItem('anime_hub_user', JSON.stringify(user));
        },
        logout() {
            localStorage.removeItem('anime_hub_token');
            localStorage.removeItem('anime_hub_user');
            window.location.href = 'login.html';
        },
        isLoggedIn() {
            return !!localStorage.getItem('anime_hub_token');
        },
        async register(username, email, password) {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (data.success && data.token) {
                API.auth.setToken(data.token);
                API.auth.setUser(data.user);
            }
            return data;
        },
        async login(email, password) {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success && data.token) {
                API.auth.setToken(data.token);
                API.auth.setUser(data.user);
            }
            return data;
        },
        async getMe() {
            const token = API.auth.getToken();
            if (!token) return null;

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                API.auth.setUser(data.user);
                return data.user;
            }
            return null;
        }
    },

    // Anime API
    anime: {
        async getAll(params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/anime?${queryString}`);
            return await response.json();
        },
        async getById(id) {
            const response = await fetch(`${API_BASE_URL}/anime/${id}`);
            return await response.json();
        }
    },

    // Reviews API
    reviews: {
        async add(animeId, comment, rating) {
            const token = API.auth.getToken();
            if (!token) throw new Error('Please login to post a review.');

            const response = await fetch(`${API_BASE_URL}/reviews/${animeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ comment, rating })
            });
            return await response.json();
        }
    },

    // Contacts API
    contacts: {
        async send(name, email, message) {
            const response = await fetch(`${API_BASE_URL}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });
            return await response.json();
        }
    }
};

// Auto-update header profile widget and auth state when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const user = API.auth.getUser();
    const headerRight = document.querySelector('.header__right');
    
    if (headerRight) {
        const oldProfileLink = headerRight.querySelector('a[href*="login.html"], .user-profile-menu');
        
        if (user) {
            const firstLetter = (user.username || 'U').charAt(0).toUpperCase();
            const roleName = user.role === 'admin' ? 'Admin' : 'VIP Member';
            
            const profileMenuHtml = `
                <div class="user-profile-menu" id="user-profile-menu">
                    <button class="user-profile-btn" id="user-profile-toggle" type="button">
                        <span class="user-avatar-circle">${firstLetter}</span>
                        <span class="user-profile-name">${user.username}</span>
                        <span class="arrow_carrot-down" style="font-size: 12px;"></span>
                    </button>
                    <div class="user-dropdown-card">
                        <div class="user-dropdown-header">
                            <div class="user-avatar-circle">${firstLetter}</div>
                            <div class="user-dropdown-info">
                                <h5 class="user-dropdown-name">${user.username}</h5>
                                <p class="user-dropdown-email">${user.email}</p>
                                <span class="user-role-badge">${roleName}</span>
                            </div>
                        </div>
                        <ul class="user-dropdown-links">
                            <li><a href="categories.html"><i class="fa fa-film"></i> Anime Catalog</a></li>
                            <li><a href="contacts.html"><i class="fa fa-envelope"></i> Contact Support</a></li>
                            <li><a href="javascript:void(0)" class="logout-link" id="header-logout-btn"><i class="fa fa-sign-out"></i> Log Out</a></li>
                        </ul>
                    </div>
                </div>
            `;
            
            if (oldProfileLink) {
                oldProfileLink.outerHTML = profileMenuHtml;
            } else {
                headerRight.insertAdjacentHTML('beforeend', profileMenuHtml);
            }

            // Click listener for logout
            const logoutBtn = document.getElementById('header-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    API.auth.logout();
                });
            }

            // Click toggle on mobile/touch
            const menuToggle = document.getElementById('user-profile-toggle');
            const menuContainer = document.getElementById('user-profile-menu');
            if (menuToggle && menuContainer) {
                menuToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menuContainer.classList.toggle('active');
                });
                document.addEventListener('click', (e) => {
                    if (!menuContainer.contains(e.target)) {
                        menuContainer.classList.remove('active');
                    }
                });
            }
        }
    }

    // Handle Already Logged In State on login.html and signup.html
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    if (isAuthPage && user) {
        const loginContainer = document.querySelector('.login.spad .container, .signup.spad .container');
        if (loginContainer) {
            const firstLetter = (user.username || 'U').charAt(0).toUpperCase();
            loginContainer.innerHTML = `
                <div class="row justify-content-center">
                    <div class="col-lg-6">
                        <div class="already-logged-card">
                            <div class="already-logged-avatar">${firstLetter}</div>
                            <h4>Welcome back, ${user.username}!</h4>
                            <p>You are currently signed in with <strong>${user.email}</strong>.</p>
                            <div class="already-logged-actions">
                                <a href="index.html" class="primary-btn"><i class="fa fa-home"></i> Go to Homepage</a>
                                <a href="categories.html" class="site-btn" style="background: #00bcd4;"><i class="fa fa-film"></i> Browse Anime</a>
                                <button type="button" class="site-btn" id="page-logout-btn" style="background: #e53637;"><i class="fa fa-sign-out"></i> Log Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const pageLogoutBtn = document.getElementById('page-logout-btn');
            if (pageLogoutBtn) {
                pageLogoutBtn.addEventListener('click', () => {
                    API.auth.logout();
                });
            }
        }
    }
});

window.API = API;

