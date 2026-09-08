/**
 * Cannabis Store Map - Embeddable Version
 * A simple way to add an interactive store locator to your website
 * 
 * Usage:
 * 1. Include this script in your HTML
 * 2. Call: CannabisStoreMap.create('container-id', storesData, options)
 * 
 * @version 1.3.0
 */

(function(window, document) {
    'use strict';
    
    // Basemap configuration.
    // Vector tiles from OpenFreeMap (free, no API key, commercial use allowed) rendered by
    // MapLibre GL through the Leaflet bridge. Attribution is mandatory and must stay visible.
    // The raster fallback is only used when WebGL or the MapLibre scripts are unavailable.
    const BASEMAP = {
        styles: {
            light: 'https://tiles.openfreemap.org/styles/positron',
            dark: 'https://tiles.openfreemap.org/styles/dark'
        },
        attribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> '
            + '© <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> '
            + 'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        rasterFallback: {
            light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles © Esri, HERE, Garmin, © OpenStreetMap contributors',
            maxNativeZoom: 16
        },
        cdn: {
            maplibreJS: 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/5.24.0/maplibre-gl.js',
            maplibreCSS: 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/5.24.0/maplibre-gl.css',
            leafletBridgeJS: 'https://cdn.jsdelivr.net/npm/@maplibre/maplibre-gl-leaflet@0.1.4/leaflet-maplibre-gl.min.js'
        }
    };
    
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
    
    // Check if Leaflet is loaded, if not, load it
    function loadLeaflet(callback) {
        if (typeof L !== 'undefined') {
            callback();
            return;
        }
        
        // Load Leaflet CSS
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(leafletCSS);
        
        // Load Leaflet JS
        const leafletJS = document.createElement('script');
        leafletJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        leafletJS.onload = callback;
        document.head.appendChild(leafletJS);
    }
    
    // Load Leaflet.markercluster plugin after Leaflet is available
    function loadMarkerCluster(callback) {
        if (typeof L !== 'undefined' && typeof L.markerClusterGroup === 'function') {
            callback();
            return;
        }
        
        const clusterCSS = document.createElement('link');
        clusterCSS.rel = 'stylesheet';
        clusterCSS.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
        document.head.appendChild(clusterCSS);
        
        const clusterDefaultCSS = document.createElement('link');
        clusterDefaultCSS.rel = 'stylesheet';
        clusterDefaultCSS.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
        document.head.appendChild(clusterDefaultCSS);
        
        const clusterJS = document.createElement('script');
        clusterJS.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
        clusterJS.onload = callback;
        document.head.appendChild(clusterJS);
    }
    
    // Load MapLibre GL and the Leaflet bridge once per page. Resolves to true when
    // L.maplibreGL is usable, false when a script failed to load (raster fallback).
    let mapLibrePromise = null;
    function loadMapLibre() {
        if (mapLibrePromise) {
            return mapLibrePromise;
        }
        
        mapLibrePromise = new Promise((resolve) => {
            if (typeof L !== 'undefined' && typeof L.maplibreGL === 'function') {
                resolve(true);
                return;
            }
            
            if (!document.querySelector('link[href="' + BASEMAP.cdn.maplibreCSS + '"]')) {
                const maplibreCSS = document.createElement('link');
                maplibreCSS.rel = 'stylesheet';
                maplibreCSS.href = BASEMAP.cdn.maplibreCSS;
                document.head.appendChild(maplibreCSS);
            }
            
            const fail = () => {
                console.warn('CannabisStoreMap: MapLibre GL could not be loaded, using the raster basemap fallback');
                resolve(false);
            };
            const loadScript = (src, onload) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = onload;
                script.onerror = fail;
                document.head.appendChild(script);
            };
            const loadBridge = () => loadScript(BASEMAP.cdn.leafletBridgeJS, () => {
                resolve(typeof L.maplibreGL === 'function');
            });
            
            if (typeof maplibregl !== 'undefined') {
                loadBridge();
            } else {
                loadScript(BASEMAP.cdn.maplibreJS, loadBridge);
            }
        });
        
        return mapLibrePromise;
    }
    
    function webglSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
        } catch (error) {
            return false;
        }
    }
    
    // Load Font Awesome if not already loaded
    function loadFontAwesome() {
        if (document.querySelector('link[href*="font-awesome"]')) {
            return; // Already loaded
        }
        
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
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
            
            /* Marker cluster icons */
            .csm-custom-cluster-icon {
                background: transparent;
            }
            
            .csm-cluster-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-weight: 600;
                color: white;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
                transition: transform 0.2s ease;
                cursor: pointer;
            }
            
            .csm-cluster-icon:hover {
                transform: scale(1.1);
            }
            
            .csm-cluster-icon span {
                font-size: 14px;
                font-family: Arial, sans-serif;
            }
            
            .csm-cluster-small {
                width: 36px;
                height: 36px;
                background: var(--csm-link-color, #4CAF50);
                border: 3px solid white;
            }
            
            .csm-cluster-medium {
                width: 44px;
                height: 44px;
                background: var(--csm-link-color, #4CAF50);
                border: 3px solid white;
            }
            
            .csm-cluster-medium span {
                font-size: 15px;
            }
            
            .csm-cluster-large {
                width: 52px;
                height: 52px;
                background: #388E3C;
                border: 4px solid white;
            }
            
            .csm-cluster-large span {
                font-size: 16px;
            }
            
            .cannabis-store-map.dark-theme .csm-cluster-large {
                background: #2E7D32;
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
                clustering: true,
                clusterRadius: 50,
                disableClusteringAtZoom: 15,
                spiderfyOnMaxZoom: true,
                ...options
            };
            
            this.map = null;
            this.markers = [];
            this.markerClusterGroup = null;
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
                const afterDeps = () => {
                    this.initMap();
                    this.setupEventListeners();
                    this.loadStores(this.storesData);
                };
                const afterCluster = () => {
                    loadMapLibre().then((available) => {
                        this.vectorBasemap = available && webglSupported();
                        afterDeps();
                    });
                };
                
                if (this.options.clustering) {
                    loadMarkerCluster(afterCluster);
                } else {
                    afterCluster();
                }
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
            
            const theme = this.currentTheme === 'dark' ? 'dark' : 'light';
            
            // Theme switch on an existing vector layer: swap the style, keep the WebGL context
            if (this.currentTileLayer && typeof this.currentTileLayer.getMaplibreMap === 'function') {
                this.currentTileLayer.getMaplibreMap().setStyle(BASEMAP.styles[theme]);
                return;
            }
            
            if (this.currentTileLayer) {
                this.map.removeLayer(this.currentTileLayer);
                this.currentTileLayer = null;
            }
            
            let layer = null;
            if (this.vectorBasemap) {
                try {
                    layer = L.maplibreGL({
                        style: BASEMAP.styles[theme],
                        attributionControl: { customAttribution: BASEMAP.attribution }
                    });
                } catch (error) {
                    console.warn('CannabisStoreMap: vector basemap failed, using the raster fallback', error);
                    this.vectorBasemap = false;
                }
            }
            if (!layer) {
                layer = L.tileLayer(BASEMAP.rasterFallback[theme], {
                    attribution: BASEMAP.rasterFallback.attribution,
                    maxNativeZoom: BASEMAP.rasterFallback.maxNativeZoom
                });
            }
            
            layer.addTo(this.map);
            this.currentTileLayer = layer;
            
            // Force map refresh
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 100);
        }
        
        updateMapTiles() {
            this.addTileLayer();
        }
        
        loadStores(storesData) {
            this.allStores = storesData;
            
            // Data can arrive (e.g. from the API) before the map dependencies finished
            // loading; keep it and let loadLeafletAndInit replay this call once ready.
            if (!this.map) {
                this.storesData = storesData;
                return;
            }
            
            // Apply province filter if specified
            let filteredStores = storesData;
            if (this.options.provinces.length > 0) {
                filteredStores = this.filterStoresByProvinces(storesData, this.options.provinces);
            }
            
            this.clearMarkers();
            this.addMarkers(filteredStores);
            this.updateStoreCount(filteredStores.length);
            
            if (filteredStores.length > 0) {
                this.fitMapToMarkers();
            }
        }
        
        addMarkers(stores) {
            if (this.options.clustering && typeof L.markerClusterGroup === 'function') {
                this.markerClusterGroup = L.markerClusterGroup({
                    maxClusterRadius: this.options.clusterRadius,
                    spiderfyOnMaxZoom: this.options.spiderfyOnMaxZoom,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: true,
                    disableClusteringAtZoom: this.options.disableClusteringAtZoom,
                    iconCreateFunction: (cluster) => {
                        const count = cluster.getChildCount();
                        let size = 'small';
                        if (count > 20) size = 'large';
                        else if (count > 10) size = 'medium';
                        
                        return L.divIcon({
                            html: `<div class="csm-cluster-icon csm-cluster-${size}"><span>${count}</span></div>`,
                            className: 'csm-custom-cluster-icon',
                            iconSize: L.point(40, 40)
                        });
                    }
                });
            }
            
            stores.forEach(store => {
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
                    .bindPopup(this.createPopupContent(store));
                
                if (this.markerClusterGroup) {
                    this.markerClusterGroup.addLayer(marker);
                } else {
                    marker.addTo(this.map);
                }
                
                this.markers.push(marker);
            });
            
            if (this.markerClusterGroup) {
                this.map.addLayer(this.markerClusterGroup);
            }
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
                this.fitMapToMarkers();
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
                this.fitMapToMarkers();
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
            if (this.markerClusterGroup) {
                this.map.removeLayer(this.markerClusterGroup);
                this.markerClusterGroup.clearLayers();
                this.markerClusterGroup = null;
            }
            this.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.markers = [];
        }
        
        fitMapToMarkers() {
            if (this.markerClusterGroup && this.markerClusterGroup.getLayers().length > 0) {
                this.map.fitBounds(this.markerClusterGroup.getBounds().pad(0.1));
            } else if (this.markers.length > 0) {
                const group = new L.featureGroup(this.markers);
                this.map.fitBounds(group.getBounds().pad(0.1));
            }
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