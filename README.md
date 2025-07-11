# WeedCrawler Cannabis Store Map

🌿 An interactive, responsive cannabis store locator map with dark/light mode support, built for easy integration into any website.

## Features

- **Interactive Store Locator**: Find cannabis stores near you with an intuitive map interface
- **Dark/Light Mode**: Toggle between themes with automatic UI adaptation
- **Responsive Design**: Mobile-first approach with touch-optimized controls
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
    
    <script src="https://cdn.jsdelivr.net/gh/voyera/weedcrawler_map@1.0.0/cannabis-store-map.1.0.0.js"></script>
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
                showThemeToggle: true
            }
        );
    </script>
</body>
</html>
```

### Local Installation

1. Download the `cannabis-store-map.1.0.0.js` file
2. Include it in your HTML:

```html
<script src="cannabis-store-map.1.0.0.js"></script>
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
| `title` | string | 'Cannabis Store Locator' | Map title displayed in the header |
| `height` | string | '400px' | Map container height |
| `zoom` | number | 6 | Initial zoom level |
| `provinces` | array | ['ON'] | Array of province codes to filter stores |
| `center` | array | [43.6532, -79.3832] | Initial map center coordinates [lat, lng] |
| `theme` | string | 'light' | Initial theme ('light' or 'dark') |
| `showThemeToggle` | boolean | true | Whether to show the theme toggle button |

### Map Instance Methods

#### setTheme(theme)
Changes the map theme.

```javascript
map.setTheme('dark'); // or 'light'
```

#### toggleTheme()
Toggles between light and dark themes.

```javascript
map.toggleTheme();
```

#### getTheme()
Returns the current theme.

```javascript
const currentTheme = map.getTheme(); // returns 'light' or 'dark'
```

## Examples

### Basic Integration

```html
<div id="my-map" style="width: 100%; height: 600px;"></div>

<script src="https://cdn.jsdelivr.net/gh/voyera/weedcrawler_map@1.0.0/cannabis-store-map.1.0.0.js"></script>
<script>
    const map = CannabisStoreMap.createFromAPI(
        'my-map',
        'https://api.weedcrawler.ca/map/3f84ee30001a0a00f99945627b604bab0383abee5232f732',
        {
            title: 'My Cannabis Store Map',
            zoom: 8,
            provinces: ['ON', 'BC'],
            theme: 'dark'
        }
    );
</script>
```

### Programmatic Theme Control

```javascript
// Set specific theme
map.setTheme('dark');

// Toggle theme
map.toggleTheme();

// Get current theme
const theme = map.getTheme();
console.log('Current theme:', theme);
```

## Demo

Check out the interactive demo to see all features in action:

- **Main Demo**: Open `demo.html` in your browser
- **Simple Example**: Open `index.html` for a basic implementation

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

**CDN Link**: `https://cdn.jsdelivr.net/gh/voyera/weedcrawler_map@1.0.0/cannabis-store-map.1.0.0.js` 