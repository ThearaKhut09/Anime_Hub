/**
 * Anime Hub Frontend API Client
 */

const API_BASE_URL = (window.location.port === '5000')
    ? '/api'
    : `http://${window.location.hostname || 'localhost'}:5000/api`;

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
        async getByAnime(animeId) {
            const response = await fetch(`${API_BASE_URL}/reviews/${animeId}`);
            return await response.json();
        },
        async add(animeId, comment, rating) {
            const token = API.auth.getToken();
            if (!token) throw new Error('Please login to post a review.');

            const response = await fetch(`${API_BASE_URL}/reviews/${animeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ comment, rating: parseInt(rating, 10) || 5 })
            });
            return await response.json();
        }
    },

    // Watchlist API
    watchlist: {
        async toggle(animeId) {
            const token = API.auth.getToken();
            if (!token) throw new Error('Please login to save to your watchlist.');

            const response = await fetch(`${API_BASE_URL}/watchlist/${animeId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        },
        async getAll() {
            const token = API.auth.getToken();
            if (!token) return { success: false, data: [] };

            const response = await fetch(`${API_BASE_URL}/watchlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        },
        async check(animeId) {
            const token = API.auth.getToken();
            if (!token) return { success: false, inWatchlist: false };

            const response = await fetch(`${API_BASE_URL}/watchlist/check/${animeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

// Theme Manager (Dark / Light Mode)
const Theme = {
    STORAGE_KEY: 'anime_hub_theme',
    getTheme() {
        return localStorage.getItem(this.STORAGE_KEY) || 'dark';
    },
    setTheme(theme) {
        localStorage.setItem(this.STORAGE_KEY, theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
            if (document.body) document.body.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
            if (document.body) document.body.classList.remove('light-mode');
        }
        this.updateButtons(theme);
    },
    toggle() {
        const next = this.getTheme() === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
        return next;
    },
    updateButtons(theme) {
        const iconClass = theme === 'light' ? 'fa-moon-o' : 'fa-sun-o';
        const title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.innerHTML = `<i class="fa ${iconClass}"></i>`;
            btn.title = title;
            btn.setAttribute('aria-label', title);
        });

        const mobileBadge = document.getElementById('mobile-theme-badge');
        if (mobileBadge) {
            mobileBadge.textContent = theme.toUpperCase();
            mobileBadge.innerHTML = `<i class="fa ${iconClass}"></i> ${theme.toUpperCase()}`;
        }
    },
    init() {
        const saved = this.getTheme();
        if (saved === 'light') {
            document.documentElement.classList.add('light-mode');
            if (document.body) document.body.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
            if (document.body) document.body.classList.remove('light-mode');
        }
    }
};

// Immediate Theme Initialization to prevent flicker
Theme.init();

// Auto-update header profile widget and auth state when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Re-apply theme state
    Theme.init();

    // Inject Theme Toggle Button in Desktop Header Right
    const headerRight = document.querySelector('.header__right');
    if (headerRight && !document.getElementById('desktop-theme-toggle')) {
        const currentTheme = Theme.getTheme();
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'theme-toggle-btn';
        toggleBtn.id = 'desktop-theme-toggle';
        toggleBtn.title = currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        toggleBtn.innerHTML = `<i class="fa ${currentTheme === 'light' ? 'fa-moon-o' : 'fa-sun-o'}"></i>`;
        
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Theme.toggle();
        });

        const searchSwitch = headerRight.querySelector('.search-switch');
        if (searchSwitch) {
            headerRight.insertBefore(toggleBtn, searchSwitch);
        } else {
            headerRight.prepend(toggleBtn);
        }
    }

    const user = API.auth.getUser();

    // Desktop Header User Widget
    if (headerRight && user) {
        const oldProfileLink = headerRight.querySelector('a[href*="login.html"], .user-profile-menu');
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
                        <li><a href="categories.html?type=watchlist"><i class="fa fa-heart"></i> My Watchlist</a></li>
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

        // Click listener for desktop logout
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

    // Sync user state and theme toggle with Mobile SlickNav Menu
    const syncMobileMenu = () => {
        const slicknavNav = document.querySelector('.slicknav_nav');
        if (slicknavNav && !slicknavNav.querySelector('.mobile-auth-section')) {
            const currentTheme = Theme.getTheme();
            const iconClass = currentTheme === 'light' ? 'fa-moon-o' : 'fa-sun-o';

            let mobileHtml = '';
            if (user) {
                const firstLetter = (user.username || 'U').charAt(0).toUpperCase();
                const roleName = user.role === 'admin' ? 'Admin' : 'VIP Member';
                mobileHtml = `
                    <li class="mobile-auth-section" style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                        <div class="mobile-user-card">
                            <span class="user-avatar-circle">${firstLetter}</span>
                            <div class="mobile-user-info">
                                <strong>${user.username}</strong>
                                <span>${roleName}</span>
                            </div>
                        </div>
                    </li>
                    <li><a href="javascript:void(0)" id="mobile-nav-logout" style="color: #ff6b6b !important;"><i class="fa fa-sign-out"></i> Log Out</a></li>
                `;
            } else {
                mobileHtml = `
                    <li class="mobile-auth-section" style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                        <a href="login.html"><i class="fa fa-sign-in"></i> Login</a>
                    </li>
                    <li><a href="signup.html" style="color: #e53637 !important;"><i class="fa fa-user-plus"></i> Register</a></li>
                `;
            }

            // Append Theme Mode Switcher in Mobile Menu
            mobileHtml += `
                <li class="mobile-theme-item" style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 8px; padding-top: 4px;">
                    <a href="javascript:void(0)" id="mobile-theme-btn" style="display: flex; align-items: center; justify-content: space-between;">
                        <span>Theme Mode</span>
                        <span id="mobile-theme-badge" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: rgba(229,54,55,0.2); color: #e53637; font-weight: 700;">
                            <i class="fa ${iconClass}"></i> ${currentTheme.toUpperCase()}
                        </span>
                    </a>
                </li>
            `;

            slicknavNav.insertAdjacentHTML('beforeend', mobileHtml);

            const mobileLogout = document.getElementById('mobile-nav-logout');
            if (mobileLogout) {
                mobileLogout.addEventListener('click', (e) => {
                    e.preventDefault();
                    API.auth.logout();
                });
            }

            const mobileThemeBtn = document.getElementById('mobile-theme-btn');
            if (mobileThemeBtn) {
                mobileThemeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    Theme.toggle();
                });
            }
        }
    };

    syncMobileMenu();
    setTimeout(syncMobileMenu, 250);
    setTimeout(syncMobileMenu, 800);

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

    // Initialize Real-Time Live Search Engine
    const initLiveSearch = () => {
        const searchInput = document.getElementById('search-input');
        const searchForm = document.querySelector('.search-model-form');
        if (!searchInput || !searchForm) return;

        let resultsBox = document.getElementById('search-live-results');
        if (!resultsBox) {
            resultsBox = document.createElement('div');
            resultsBox.id = 'search-live-results';
            resultsBox.className = 'search-live-results';
            searchForm.appendChild(resultsBox);
        }

        let debounceTimer = null;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (!query || query.length < 2) {
                resultsBox.innerHTML = '';
                resultsBox.style.display = 'none';
                return;
            }

            resultsBox.style.display = 'block';
            resultsBox.innerHTML = `
                <div class="search-live-loading">
                    <i class="fa fa-spinner fa-spin"></i> Searching anime for "<strong>${query}</strong>"...
                </div>
            `;

            debounceTimer = setTimeout(async () => {
                try {
                    const res = await API.anime.getAll({ q: query, limit: 6 });
                    if (res.success && res.data && res.data.length > 0) {
                        resultsBox.innerHTML = res.data.map(anime => `
                            <a href="anime-details.html?id=${anime.id}" class="search-live-item">
                                <img src="${anime.poster_url}" alt="${anime.title}" class="search-live-thumb" onerror="this.src='img/trending/trend-1.jpg'">
                                <div class="search-live-info">
                                    <h6 class="search-live-title">${anime.title}</h6>
                                    <p class="search-live-native">${anime.native_title || ''}</p>
                                    <div class="search-live-meta">
                                        <span class="search-live-type">${anime.type || 'Anime'}</span>
                                        <span class="search-live-rating"><i class="fa fa-star"></i> ${anime.rating || '9.0'}</span>
                                        <span class="search-live-genre">${anime.genre ? anime.genre.split(',').slice(0, 2).join(', ') : ''}</span>
                                    </div>
                                </div>
                            </a>
                        `).join('');
                    } else {
                        resultsBox.innerHTML = `
                            <div class="search-live-empty">
                                <i class="fa fa-film"></i> No anime found matching "<strong>${query}</strong>"
                            </div>
                        `;
                    }
                } catch (err) {
                    resultsBox.innerHTML = `
                        <div class="search-live-empty text-danger">
                            <i class="fa fa-exclamation-circle"></i> Error fetching search results.
                        </div>
                    `;
                }
            }, 250);
        });

        // Close results when clicking close switch
        const closeSwitch = document.querySelector('.search-close-switch');
        if (closeSwitch) {
            closeSwitch.addEventListener('click', () => {
                resultsBox.innerHTML = '';
                resultsBox.style.display = 'none';
            });
        }
    };

    initLiveSearch();

    // Smooth Sticky Header Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }
});

window.API = API;
window.Theme = Theme;
