# WeedCrawler Cannabis Store Map

🌿 An interactive, responsive cannabis store locator map with dark/light mode support and internationalization (English/French), built for easy integration into any website.

## Features

- **Interactive Store Locator**: Find cannabis stores near you with an intuitive map interface
- **Dark/Light Mode**: Toggle between themes with automatic UI adaptation
- **Internationalization**: Full English and French language support
- **Responsive Design**: Mobile-first approach with touch-optimized controls
- **Marker Clustering**: Automatically groups nearby markers when zoomed out for cleaner map display
- **Province Filtering**: Filter stores by Canadian provinces
- **Theme Persistence**: Theme preference is maintained during the session
- **Easy Integration**: Simple JavaScript API for quick setup
- **CDN Ready**: Available via CDN for instant deployment

## Quick Start

### Using CDN (Recommended)

The easiest way to integrate the map is using our CDN:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Cannabis Store Locator</title>
</head>
<body>
    <div id="map-container" style="width: 100%; height: 500px;"></div>
    
    <script src="https://cdn.jsdelivr.net/gh/voyera/weedcrawler_map@1.3.0/cannabis-store-map.min.js"></script>
    <script>
        const map = CannabisStoreMap.createFromAPI(
            'map-container',
            'https://api.weedcrawler.ca/map/3f84ee30001a0a00f99945627b604bab0383abee5232f732',
            {
                title: 'Find Cannabis Stores',
                height: '100%',
                zoom: 6,
                provinces: ['ON'],
                theme: 'light',
                showThemeToggle: true,
                language: 'en' // 'en' for English, 'fr' for French
            }
        );
    </script>
</body>
</html>
```

### Local Installation

1. Download the `cannabis-store-map.js` file
2. Include it in your HTML:

```html
<script src="cannabis-store-map.js"></script>
```

## API Reference

### CannabisStoreMap.createFromAPI(containerId, apiUrl, options)

Creates a new map instance with store data from the WeedCrawler API.

#### Parameters

- `containerId` (string): The ID of the HTML element that will contain the map
- `apiUrl` (string): The WeedCrawler API endpoint URL
- `options` (object): Configuration options

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | Auto-translated | Map title displayed in the header |
| `height` | string | '400px' | Map container height |
| `zoom` | number | 6 | Initial zoom level |
| `provinces` | array | ['ON'] | Array of province codes to filter stores |
| `center` | array | [43.6532, -79.3832] | Initial map center coordinates [lat, lng] |
| `theme` | string | 'light' | Initial theme ('light' or 'dark') |
| `showThemeToggle` | boolean | true | Whether to show the theme toggle button |
| `language` | string | 'en' | Interface language ('en' for English, 'fr' for French) |
| `clustering` | boolean | true | Enable marker clustering (groups nearby markers when zoomed out) |
| `clusterRadius` | number | 50 | Pixel radius for grouping markers into clusters |
| `disableClusteringAtZoom` | number | 15 | Zoom level at which individual markers always show |
| `spiderfyOnMaxZoom` | boolean | true | Spread overlapping markers in a spiral at max zoom |

### Map Instance Methods

#### Theme Management

```javascript
// Set specific theme
map.setTheme('dark'); // or 'light'

// Toggle theme
map.toggleTheme();

// Get current theme
const theme = map.getTheme(); // returns 'light' or 'dark'
```

#### Language Management

```javascript
// Set language
map.setLanguage('fr'); // or 'en'

// Get current language
const language = map.getLanguage(); // returns 'en' or 'fr'
```

## Examples

### Basic Integration

```html
<div id="my-map" style="width: 100%; height: 600px;"></div>

<script src="https://cdn.jsdelivr.net/gh/voyera/weedcrawler_map@1.3.0/cannabis-store-map.min.js"></script>
<script>
    const map = CannabisStoreMap.createFromAPI(
        'my-map',
        'https://api.weedcrawler.ca/map/3f84ee30001a0a00f99945627b604bab0383abee5232f732',
        {
            title: 'My Cannabis Store Map',
            zoom: 8,
            provinces: ['ON', 'BC'],
            theme: 'dark',
            language: 'fr'
        }
    );
</script>
```

### Programmatic Language Control

```javascript
// Set specific language
map.setLanguage('fr');

// Get current language
const language = map.getLanguage();
console.log('Current language:', language);

// Set specific theme
map.setTheme('dark');

// Toggle theme
map.toggleTheme();

// Get current theme
const theme = map.getTheme();
console.log('Current theme:', theme);
```

### French Language Example

```html
<div id="french-map" style="width: 100%; height: 600px;"></div>

<script src="https://cdn.jsdelivr.net/gh/voyera/weedcrawler_map@1.3.0/cannabis-store-map.min.js"></script>
<script>
    const frenchMap = CannabisStoreMap.createFromAPI(
        'french-map',
        'https://api.weedcrawler.ca/map/3f84ee30001a0a00f99945627b604bab0383abee5232f732',
        {
            title: 'Localisateur de Magasins de Cannabis',
            language: 'fr',
            provinces: ['QC', 'ON'],
            theme: 'light'
        }
    );
</script>
```

## Supported Languages

### English (en)
- Default language
- All UI elements, buttons, and messages in English
- Default titles and placeholders

### French (fr)
- Complete French translation
- All UI elements, buttons, and messages in French
- French-specific titles and placeholders

## Demo

Check out the interactive demo to see all features in action:

- **Main Demo**: Open `demo.html` in your browser
- **Simple Example**: Open `index.html` for a basic implementation

## Basemap

Since 1.3.0 the map uses [OpenFreeMap](https://openfreemap.org) vector tiles (Positron for the light theme, Dark for the dark theme) rendered with MapLibre GL through the Leaflet bridge. No API key, no registration and no request limits, free for commercial use.

- The "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" attribution is required and is shown in the map corner. Do not hide it.
- WebGL is required for vector rendering. When WebGL or the MapLibre scripts are unavailable the map falls back to keyless Esri raster tiles.
- All dependencies (Leaflet 1.9.4, Leaflet.markercluster 1.5.3, MapLibre GL 5.24.0, maplibre-gl-leaflet 0.1.4, Font Awesome) are loaded on demand from cdnjs/jsDelivr when they are not already present on the page.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Mobile Support

The map is fully optimized for mobile devices with:
- Touch-friendly controls
- Responsive design
- Mobile-optimized UI elements
- Prevented zoom on input focus (iOS)

## License

This project is licensed under the MIT License.

## Support

For questions or support, please visit [WeedCrawler](https://weedcrawler.ca) or open an issue in this repository.

---

**CDN Link**: `https://cdn.jsdelivr.net/gh/voyera/weedcrawler_map@1.3.0/cannabis-store-map.min.js` 