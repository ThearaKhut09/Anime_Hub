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

// Auto-update header profile widget when logged in
document.addEventListener('DOMContentLoaded', () => {
    const user = API.auth.getUser();
    const profileLink = document.querySelector('.header__right a[href*="login.html"]');
    
    if (user && profileLink) {
        profileLink.setAttribute('title', `Logged in as ${user.username}`);
        profileLink.innerHTML = `<span class="icon_profile" style="color: #e53637;"></span>`;
    }
});

window.API = API;
