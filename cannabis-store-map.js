/**
 * Cannabis Store Map - Embeddable Version
 * A simple way to add an interactive store locator to your website
 * 
 * Usage:
 * 1. Include this script in your HTML
 * 2. Call: CannabisStoreMap.create('container-id', storesData, options)
 * 
 * @version 1.1.0
 */

(function(window, document) {
    'use strict';
    
    // Translation dictionaries
    const translations = {
        en: {
            // UI Controls
            searchPlaceholder: 'Search stores by name...',
            searchButton: 'Search',
            clearButton: 'Clear',
            locateButton: 'Find My Location',
            lightMode: 'Light Mode',
            darkMode: 'Dark Mode',
            
            // Store information
            storesFound: 'stores found',
            filteredBy: 'filtered by',
            productsAvailable: 'products available',
            moreProducts: 'more products',
            visitStore: 'Visit Store',
            yourLocation: 'Your Location',
            
            // Loading and error messages
            loadingMap: 'Loading map...',
            locationError: 'Unable to get your location: ',
            geolocationNotSupported: 'Geolocation is not supported by this browser.',
            failedToLoadData: 'Failed to load store data. Please try again later.',
            
            // Default titles
            defaultTitle: 'Store Locator',
            poweredBy: 'Powered by',
            weedCrawlerTitle: 'Weed Crawler - Cannabis Data Provider'
        },
        fr: {
            // UI Controls
            searchPlaceholder: 'Rechercher des magasins par nom...',
            searchButton: 'Rechercher',
            clearButton: 'Effacer',
            locateButton: 'Trouver ma position',
            lightMode: 'Mode clair',
            darkMode: 'Mode sombre',
            
            // Store information
            storesFound: 'magasins trouvés',
            filteredBy: 'filtré par',
            productsAvailable: 'produits disponibles',
            moreProducts: 'produits supplémentaires',
            visitStore: 'Visiter le magasin',
            yourLocation: 'Votre position',
            
            // Loading and error messages
            loadingMap: 'Chargement de la carte...',
            locationError: 'Impossible d\'obtenir votre position : ',
            geolocationNotSupported: 'La géolocalisation n\'est pas prise en charge par ce navigateur.',
            failedToLoadData: 'Échec du chargement des données. Veuillez réessayer plus tard.',
            
            // Default titles
            defaultTitle: 'Localisateur de magasins',
            poweredBy: 'Propulsé par',
            weedCrawlerTitle: 'Weed Crawler - Fournisseur de données sur le cannabis'
        }
    };
    
    // Helper function to get translation
    function t(lang, key) {
        const langDict = translations[lang] || translations.en;
        return langDict[key] || translations.en[key] || key;
    }
    
    // Inject required CSS
    function injectCSS() {
        const css = `
            :root {
                /* Light theme variables (default) */
                --csm-bg-color: #f5f5f5;
                --csm-text-color: #333;
                --csm-border-color: #ddd;
                --csm-input-bg: #fff;
                --csm-popup-bg: #fff;
                --csm-popup-text: #333;
                --csm-popup-border: #eee;
                --csm-secondary-text: #666;
                --csm-link-color: #4CAF50;
                --csm-link-hover-bg: #f0f8f0;
                --csm-shadow: 0 2px 10px rgba(0,0,0,0.1);
                --csm-loading-bg: #f5f5f5;
                --csm-loading-text: #666;
            }

            .cannabis-store-map.dark-theme {
                /* Dark theme variables */
                --csm-bg-color: #1a1a1a;
                --csm-text-color: #ffffff;
                --csm-border-color: #444;
                --csm-input-bg: #2d2d2d;
                --csm-popup-bg: #2d2d2d;
                --csm-popup-text: #ffffff;
                --csm-popup-border: #444;
                --csm-secondary-text: #aaa;
                --csm-link-color: #66bb6a;
                --csm-link-hover-bg: #1e2e1e;
                --csm-shadow: 0 2px 10px rgba(0,0,0,0.3);
                --csm-loading-bg: #1a1a1a;
                --csm-loading-text: #aaa;
            }

            .cannabis-store-map {
                font-family: Arial, sans-serif;
                margin: 20px 0;
                background-color: var(--csm-bg-color);
                color: var(--csm-text-color);
                transition: background-color 0.3s ease, color 0.3s ease;
            }
            
            .cannabis-store-map .map-controls {
                margin-bottom: 15px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
            }
            
            .cannabis-store-map .search-input {
                padding: 8px 12px;
                border: 1px solid var(--csm-border-color);
                border-radius: 4px;
                font-size: 14px;
                min-width: 200px;
                background-color: var(--csm-input-bg);
                color: var(--csm-text-color);
                transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
            }
            
            .cannabis-store-map .search-input:focus {
                outline: none;
                border-color: var(--csm-link-color);
                box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
            }
            
            .cannabis-store-map .btn {
                padding: 8px 16px;
                background: var(--csm-link-color);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.3s;
            }
            
            .cannabis-store-map .btn:hover {
                background: #45a049;
            }
            
            .cannabis-store-map .btn-secondary {
                background: #2196F3;
            }
            
            .cannabis-store-map .btn-secondary:hover {
                background: #1976D2;
            }

            .cannabis-store-map .btn-theme {
                background: #6c757d;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .cannabis-store-map .btn-theme:hover {
                background: #5a6268;
            }
            
            .cannabis-store-map .store-count {
                font-size: 14px;
                color: var(--csm-secondary-text);
                margin-left: 10px;
            }
            
            .cannabis-store-map .map-container {
                height: 600px;
                width: 100%;
                border-radius: 8px;
                box-shadow: var(--csm-shadow);
                position: relative;
                transition: box-shadow 0.3s ease;
                min-height: 400px;
            }
            
            /* Ensure the cannabis-store-map container can handle 100% height */
            .cannabis-store-map {
                height: auto;
                min-height: 600px;
            }
            
            .cannabis-store-map .custom-popup {
                font-family: Arial, sans-serif;
                max-width: 350px;
                min-width: 300px;
                background-color: var(--csm-popup-bg);
                color: var(--csm-popup-text);
                border: none;
                border-radius: 4px;
                padding: 12px;
                transition: background-color 0.3s ease, color 0.3s ease;
            }
            
            .cannabis-store-map .popup-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: var(--csm-popup-text);
                font-size: 14px;
            }
            
            .cannabis-store-map .popup-link {
                color: var(--csm-link-color);
                text-decoration: none;
                font-size: 14px;
                display: inline-block;
                margin-top: 8px;
                padding: 4px 8px;
                background: var(--csm-bg-color);
                border-radius: 3px;
                transition: background-color 0.2s;
            }
            
            .cannabis-store-map .popup-link:hover {
                background: var(--csm-link-hover-bg);
                text-decoration: none;
            }
            
            .cannabis-store-map .products-preview {
                scrollbar-width: thin;
                scrollbar-color: var(--csm-border-color) transparent;
                overflow-x: hidden;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            
            .cannabis-store-map .products-preview::-webkit-scrollbar {
                width: 4px;
            }
            
            .cannabis-store-map .products-preview::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .cannabis-store-map .products-preview::-webkit-scrollbar-thumb {
                background: var(--csm-border-color);
                border-radius: 2px;
            }
            
            .cannabis-store-map .products-preview a {
                transition: background-color 0.2s;
                border-radius: 3px;
                padding: 2px 4px;
                margin: -2px -4px;
            }
            
            .cannabis-store-map .products-preview a:hover {
                background-color: var(--csm-link-hover-bg);
            }
            
            .cannabis-store-map .custom-marker {
                background: var(--csm-link-color);
                border: 2px solid #fff;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                color: white;
                font-size: 16px;
            }
            
            .cannabis-store-map .user-marker {
                background: #2196F3;
                border: 2px solid #fff;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                color: white;
                font-size: 14px;
            }
            
            .cannabis-store-map .loading {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 600px;
                background: var(--csm-loading-bg);
                border-radius: 8px;
                color: var(--csm-loading-text);
                font-size: 18px;
                transition: background-color 0.3s ease, color 0.3s ease;
            }
            
            .cannabis-store-map .powered-by {
                text-align: right;
                margin-top: 8px;
                font-size: 12px;
                color: var(--csm-secondary-text);
            }
            
            .cannabis-store-map .powered-by a {
                color: var(--csm-link-color);
                text-decoration: none;
                font-weight: 500;
            }
            
            .cannabis-store-map .powered-by a:hover {
                text-decoration: underline;
            }
            
            /* Dark mode overrides for Leaflet popup elements */
            .cannabis-store-map.dark-theme .leaflet-popup-content-wrapper {
                background-color: var(--csm-popup-bg) !important;
                color: var(--csm-popup-text) !important;
                border: 1px solid var(--csm-popup-border) !important;
            }
            
            .cannabis-store-map.dark-theme .leaflet-popup-content {
                color: var(--csm-popup-text) !important;
            }
            
            .cannabis-store-map.dark-theme .leaflet-popup-tip {
                background-color: var(--csm-popup-bg) !important;
            }
            
            .cannabis-store-map.dark-theme .leaflet-popup-close-button {
                color: var(--csm-popup-text) !important;
            }
            
            .cannabis-store-map.dark-theme .leaflet-popup-close-button:hover {
                color: var(--csm-link-color) !important;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    // Main CannabisStoreMap class
    class CannabisStoreMap {
        constructor(containerId, storesData = [], options = {}) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            this.storesData = storesData;
            this.options = {
                center: [39.8283, -98.5795], // Center of US
                zoom: 4,
                minZoom: 3,
                maxZoom: 18,
                showControls: true,
                showTitle: true,
                title: options.title || t(options.language || 'en', 'defaultTitle'),
                height: '600px',
                showAttribution: true,
                provinces: [], // Array of province codes to filter by (e.g., ['BC', 'ON'])
                theme: 'light', // 'light' or 'dark'
                showThemeToggle: true, // Show theme toggle button
                language: 'en', // 'en' or 'fr'
                ...options
            };
            
            this.map = null;
            this.markers = [];
            this.allStores = [];
            this.currentPopup = null;
            this.uniqueId = 'csm_' + Date.now();
            this.currentTheme = this.options.theme;
            
            if (!this.container) {
                console.error('Container element not found:', containerId);
                return;
            }
            
            this.init();
        }
        
        init() {
            // Load dependencies
            loadFontAwesome();
            injectCSS();
            
            this.createHTML();
            this.loadLeafletAndInit();
        }
        
        createHTML() {
            const themeToggleHTML = this.options.showThemeToggle ? `
                <button id="${this.uniqueId}_themeBtn" class="btn btn-theme">
                    <i class="fa-solid fa-${this.currentTheme === 'dark' ? 'sun' : 'moon'}"></i>
                    ${t(this.options.language, this.currentTheme === 'dark' ? 'lightMode' : 'darkMode')}
                </button>
            ` : '';
            
            const controlsHTML = this.options.showControls ? `
                <div class="map-controls">
                    <input type="text" id="${this.uniqueId}_search" class="search-input" placeholder="${t(this.options.language, 'searchPlaceholder')}">
                    <button id="${this.uniqueId}_searchBtn" class="btn">${t(this.options.language, 'searchButton')}</button>
                    <button id="${this.uniqueId}_clearBtn" class="btn btn-secondary">${t(this.options.language, 'clearButton')}</button>
                    <button id="${this.uniqueId}_locateBtn" class="btn btn-secondary">${t(this.options.language, 'locateButton')}</button>
                    ${themeToggleHTML}
                    <span id="${this.uniqueId}_count" class="store-count"></span>
                </div>
            ` : '';
            
            const titleHTML = this.options.showTitle ? `<h2>${this.options.title}</h2>` : '';
            
            const attributionHTML = this.options.showAttribution ? `
                <div class="powered-by">
                    ${t(this.options.language, 'poweredBy')} <a href="https://weedcrawler.ca" target="_blank" rel="noopener">${t(this.options.language, 'weedCrawlerTitle')}</a>
                </div>
            ` : '';
            
            this.container.innerHTML = `
                <div class="cannabis-store-map ${this.currentTheme === 'dark' ? 'dark-theme' : ''}">
                    ${titleHTML}
                    ${controlsHTML}
                    <div id="${this.uniqueId}_map" class="map-container" style="height: ${this.options.height};">
                        <div class="loading">${t(this.options.language, 'loadingMap')}</div>
                    </div>
                    ${attributionHTML}
                </div>
            `;
        }
        
        loadLeafletAndInit() {
            loadLeaflet(() => {
                this.initMap();
                this.setupEventListeners();
                this.loadStores(this.storesData);
            });
        }
        
        initMap() {
            const mapElement = document.getElementById(this.uniqueId + '_map');
            mapElement.innerHTML = ''; // Clear loading message
            
            // Ensure the map container has proper dimensions
            if (mapElement.offsetHeight === 0 || mapElement.offsetHeight < 400) {
                mapElement.style.height = '600px';
            }
            
            // If height is set to 100%, ensure parent has proper height
            if (this.options.height === '100%') {
                const parentContainer = this.container;
                if (parentContainer.offsetHeight === 0) {
                    parentContainer.style.height = '100vh';
                }
            }
            
            this.map = L.map(this.uniqueId + '_map', {
                center: this.options.center,
                zoom: this.options.zoom,
                minZoom: this.options.minZoom,
                maxZoom: this.options.maxZoom
            });
            
            // Add initial tile layer
            this.addTileLayer();
            
            // Force map refresh after a short delay
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 500);
        }
        
        setupEventListeners() {
            if (!this.options.showControls) return;
            
            const searchBtn = document.getElementById(this.uniqueId + '_searchBtn');
            const clearBtn = document.getElementById(this.uniqueId + '_clearBtn');
            const locateBtn = document.getElementById(this.uniqueId + '_locateBtn');
            const searchInput = document.getElementById(this.uniqueId + '_search');
            const themeBtn = document.getElementById(this.uniqueId + '_themeBtn');
            
            if (searchBtn) {
                searchBtn.addEventListener('click', () => this.searchStores());
            }
            
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearSearch());
            }
            
            if (locateBtn) {
                locateBtn.addEventListener('click', () => this.locateUser());
            }
            
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchStores();
                    }
                });
            }
            
            if (themeBtn) {
                themeBtn.addEventListener('click', () => this.toggleTheme());
            }
        }
        
        toggleTheme() {
            this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
        }
        
        setTheme(theme) {
            if (theme !== 'light' && theme !== 'dark') {
                console.warn('Invalid theme. Must be "light" or "dark"');
                return;
            }
            
            this.currentTheme = theme;
            
            // Update the container class
            const container = this.container.querySelector('.cannabis-store-map');
            if (container) {
                container.classList.toggle('dark-theme', this.currentTheme === 'dark');
            }
            
            // Update the theme button
            const themeBtn = document.getElementById(this.uniqueId + '_themeBtn');
            if (themeBtn) {
                if (this.currentTheme === 'dark') {
                    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i> ' + t(this.options.language, 'lightMode');
                } else {
                    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i> ' + t(this.options.language, 'darkMode');
                }
            }
            
            // Update map tiles
            this.updateMapTiles();
        }
        
        addTileLayer() {
            if (!this.map) {
                return;
            }
            
            // Remove existing tile layer
            if (this.currentTileLayer) {
                this.map.removeLayer(this.currentTileLayer);
            }
            
            // Add new tile layer based on theme
            const tileUrl = this.currentTheme === 'dark' 
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            
            const attribution = this.currentTheme === 'dark'
                ? '© CartoDB'
                : '© OpenStreetMap contributors';
            
            try {
                const tileLayer = L.tileLayer(tileUrl, {
                    attribution: attribution,
                    subdomains: this.currentTheme === 'dark' ? 'abcd' : 'abc'
                });
                
                tileLayer.addTo(this.map);
                
                // Store reference to current tile layer
                this.currentTileLayer = tileLayer;
                
                // Force map refresh
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
                
            } catch (error) {
                // Fallback to default OpenStreetMap tiles
                const fallbackLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                });
                fallbackLayer.addTo(this.map);
                this.currentTileLayer = fallbackLayer;
            }
        }
        
        updateMapTiles() {
            this.addTileLayer();
        }
        
        loadStores(storesData) {
            this.allStores = storesData;
            
            // Apply province filter if specified
            let filteredStores = storesData;
            if (this.options.provinces.length > 0) {
                filteredStores = this.filterStoresByProvinces(storesData, this.options.provinces);
            }
            
            this.clearMarkers();
            this.addMarkers(filteredStores);
            this.updateStoreCount(filteredStores.length);
            
            if (filteredStores.length > 0) {
                const group = new L.featureGroup(this.markers);
                this.map.fitBounds(group.getBounds().pad(0.1));
            }
        }
        
        addMarkers(stores) {
            stores.forEach(store => {
                // Skip stores with missing or invalid coordinates
                if (store.lat === undefined || store.lat === null || store.lat === 0 ||
                    store.lng === undefined || store.lng === null || store.lng === 0) {
                    console.warn(`Skipping store "${store.name}" - missing or invalid coordinates (lat: ${store.lat}, lng: ${store.lng})`);
                    return;
                }
                
                const customIcon = L.divIcon({
                    html: '<div class="custom-marker"><i class="fa-solid fa-store"></i></div>',
                    className: 'custom-div-icon',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                    popupAnchor: [0, -20]
                });
                
                const marker = L.marker([store.lat, store.lng], { icon: customIcon })
                    .bindPopup(this.createPopupContent(store))
                    .addTo(this.map);
                
                this.markers.push(marker);
            });
        }
        
        createPopupContent(store) {
            let popupHTML = `
                <div class="custom-popup">
                    <div class="popup-title">${store.name}</div>
                    ${store.address ? `<div style="margin-bottom: 8px; font-size: 13px; color: var(--csm-secondary-text);">${store.address}</div>` : ''}
            `;
            
            // Add products section if products exist
            if (store.products && store.products.length > 0) {
                popupHTML += `
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 12px; color: var(--csm-link-color); font-weight: bold; margin-bottom: 6px;">
                            ${store.products.length} ${t(this.options.language, 'productsAvailable')}
                        </div>
                        <div class="products-preview" style="max-height: 120px; overflow-y: auto; overflow-x: hidden; border-top: 1px solid var(--csm-popup-border); padding-top: 6px; width: 100%;">
                `;
                
                // Show first 3 products as a preview
                const previewProducts = store.products.slice(0, 3);
                previewProducts.forEach(product => {
                    const productContent = `
                        <div style="font-size: 11px; margin-bottom: 4px; padding: 2px 0; word-wrap: break-word; overflow-wrap: break-word; width: 100%; box-sizing: border-box;">
                            <div style="font-weight: 500; color: var(--csm-popup-text); word-break: break-word; line-height: 1.3;">${product.name}</div>
                            <div style="color: var(--csm-secondary-text); font-size: 10px; word-break: break-word; line-height: 1.2;">
                                ${product.brand} • ${product.title} • $${parseFloat(product.price).toFixed(2)}
                            </div>
                        </div>
                    `;
                    
                    // Make product clickable if URL is available
                    if (product.url) {
                        popupHTML += `
                            <a href="${product.url}" target="_blank" style="text-decoration: none; display: block; word-wrap: break-word; width: 100%; box-sizing: border-box;">
                                ${productContent}
                            </a>
                        `;
                    } else {
                        popupHTML += productContent;
                    }
                });
                
                // If there are more products, show a "view more" indicator
                if (store.products.length > 3) {
                    popupHTML += `
                        <div style="font-size: 10px; color: var(--csm-link-color); font-style: italic; margin-top: 4px;">
                            +${store.products.length - 3} ${t(this.options.language, 'moreProducts')}
                        </div>
                    `;
                }
                
                popupHTML += `
                        </div>
                    </div>
                `;
            }
            
            // Add store link
            if (store.url) {
                popupHTML += `<a href="${store.url}" target="_blank" class="popup-link">${t(this.options.language, 'visitStore')}</a>`;
            }
            
            popupHTML += `</div>`;
            return popupHTML;
        }
        
        searchStores() {
            const searchInput = document.getElementById(this.uniqueId + '_search');
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (!searchTerm) {
                this.clearSearch();
                return;
            }
            
            // First apply province filter, then search within filtered results
            let baseStores = this.allStores;
            if (this.options.provinces.length > 0) {
                baseStores = this.filterStoresByProvinces(this.allStores, this.options.provinces);
            }
            
            const filteredStores = baseStores.filter(store => 
                store.name.toLowerCase().includes(searchTerm) ||
                (store.address && store.address.toLowerCase().includes(searchTerm))
            );
            
            this.clearMarkers();
            this.addMarkers(filteredStores);
            this.updateStoreCount(filteredStores.length, searchTerm);
            
            if (filteredStores.length > 0) {
                const group = new L.featureGroup(this.markers);
                this.map.fitBounds(group.getBounds().pad(0.1));
            }
        }
        
        clearSearch() {
            const searchInput = document.getElementById(this.uniqueId + '_search');
            searchInput.value = '';
            
            // Apply province filter when clearing search
            let filteredStores = this.allStores;
            if (this.options.provinces.length > 0) {
                filteredStores = this.filterStoresByProvinces(this.allStores, this.options.provinces);
            }
            
            this.clearMarkers();
            this.addMarkers(filteredStores);
            this.updateStoreCount(filteredStores.length);
            
            if (filteredStores.length > 0) {
                const group = new L.featureGroup(this.markers);
                this.map.fitBounds(group.getBounds().pad(0.1));
            }
        }
        
        filterStoresByProvinces(stores, provinces) {
            if (!provinces || provinces.length === 0) {
                return stores;
            }
            
            return stores.filter(store => 
                store.province_code && provinces.includes(store.province_code)
            );
        }
        
        clearMarkers() {
            this.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.markers = [];
        }
        
        updateStoreCount(count, searchTerm = '') {
            const countElement = document.getElementById(this.uniqueId + '_count');
            if (countElement) {
                const searchText = searchTerm ? ` ${t(this.options.language, 'filteredBy')} "${searchTerm}"` : '';
                countElement.textContent = `${count} ${t(this.options.language, 'storesFound')}${searchText}`;
            }
        }
        
        locateUser() {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        this.map.setView([lat, lng], 12);
                        
                        const userIcon = L.divIcon({
                            html: '<div class="user-marker"><i class="fa-solid fa-location-dot"></i></div>',
                            className: 'custom-div-icon',
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                            popupAnchor: [0, -16]
                        });
                        
                        const userMarker = L.marker([lat, lng], { icon: userIcon })
                            .bindPopup(t(this.options.language, 'yourLocation'))
                            .addTo(this.map);
                    },
                    (error) => {
                        alert(`${t(this.options.language, 'locationError')}${error.message}`);
                    }
                );
            } else {
                alert(t(this.options.language, 'geolocationNotSupported'));
            }
        }
        
        // Public API methods
        updateStores(storesData) {
            this.loadStores(storesData);
        }
        
        // Theme management
        getTheme() {
            return this.currentTheme;
        }
        
        // Language management
        setLanguage(lang) {
            if (lang !== 'en' && lang !== 'fr') {
                console.warn('Invalid language. Must be "en" or "fr"');
                return;
            }
            
            this.options.language = lang;
            this.refreshUI();
        }
        
        getLanguage() {
            return this.options.language;
        }
        
        refreshUI() {
            // Recreate HTML with new language
            this.createHTML();
            
            // Update existing elements
            this.updateStoreCount(this.allStores.length);
            
            // Update theme button
            const themeBtn = document.getElementById(this.uniqueId + '_themeBtn');
            if (themeBtn) {
                if (this.currentTheme === 'dark') {
                    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i> ' + t(this.options.language, 'lightMode');
                } else {
                    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i> ' + t(this.options.language, 'darkMode');
                }
            }
            
            // Update search input placeholder
            const searchInput = document.getElementById(this.uniqueId + '_search');
            if (searchInput) {
                searchInput.placeholder = t(this.options.language, 'searchPlaceholder');
            }
            
            // Update buttons
            const searchBtn = document.getElementById(this.uniqueId + '_searchBtn');
            if (searchBtn) {
                searchBtn.textContent = t(this.options.language, 'searchButton');
            }
            
            const clearBtn = document.getElementById(this.uniqueId + '_clearBtn');
            if (clearBtn) {
                clearBtn.textContent = t(this.options.language, 'clearButton');
            }
            
            const locateBtn = document.getElementById(this.uniqueId + '_locateBtn');
            if (locateBtn) {
                locateBtn.textContent = t(this.options.language, 'locateButton');
            }
            
            // Update attribution
            const poweredBy = this.container.querySelector('.powered-by');
            if (poweredBy) {
                poweredBy.innerHTML = `
                    ${t(this.options.language, 'poweredBy')} <a href="https://weedcrawler.ca" target="_blank" rel="noopener">${t(this.options.language, 'weedCrawlerTitle')}</a>
                `;
            }
        }
        
        async fetchFromAPI(apiUrl) {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Transform WeedCrawler API format to expected format
                const transformedStores = this.transformAPIData(data);
                this.loadStores(transformedStores);
                
                return transformedStores;
            } catch (error) {
                console.error('Error fetching store data:', error);
                this.showError(t(this.options.language, 'failedToLoadData'));
                return [];
            }
        }
        
        transformAPIData(apiResponse) {
            // Handle WeedCrawler API response format
            if (!apiResponse || !apiResponse.data || !Array.isArray(apiResponse.data)) {
                console.warn('Invalid API response format');
                return [];
            }
            
            return apiResponse.data.map(store => ({
                id: store.id,
                name: store.name,
                lat: store.lng, // Note: API has lat/lng swapped compared to standard
                lng: store.lat, // Note: API has lat/lng swapped compared to standard  
                address: store.address,
                province_code: store.province_code,
                url: store.url,
                products: store.products || []
            }));
        }
        
        showError(message) {
            const mapElement = document.getElementById(this.uniqueId + '_map');
            if (mapElement) {
                mapElement.innerHTML = `
                    <div class="loading" style="color: #e74c3c;">
                        <i class="fa-solid fa-exclamation-triangle" style="margin-right: 10px;"></i>
                        ${message}
                    </div>
                `;
            }
        }
        
        resize() {
            if (this.map) {
                this.map.invalidateSize();
            }
        }
        
        destroy() {
            if (this.map) {
                this.map.remove();
            }
            this.container.innerHTML = '';
        }
    }
    
    // Static factory methods
    CannabisStoreMap.create = function(containerId, storesData = [], options = {}) {
        // Create and return new instance
        return new CannabisStoreMap(containerId, storesData, options);
    };
    
    CannabisStoreMap.createFromAPI = function(containerId, apiUrl, options = {}) {
        // Create instance and fetch data from API
        const instance = new CannabisStoreMap(containerId, [], options);
        
        // Fetch data after map is initialized
        setTimeout(() => {
            instance.fetchFromAPI(apiUrl);
        }, 100);
        
        return instance;
    };
    
    // Make it globally available
    window.CannabisStoreMap = CannabisStoreMap;
    
})(window, document);