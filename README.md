# WMS getFeatureInfo for maplibre and mapbox
This project provides a simple implementation of the WMS `getFeatureInfo` functionality for use with MapLibre, Mapbox, and other map viewers. It demonstrates how to query feature information from a WMS service given a latitude, longitude and zoomLevel (maplibre/mapbox). The code assumes the WMS server supports webmercator (EPSG:3857), but other projections can also be used.

## requirements
nodejs (includes npm)

## install
```bash
git clone this_repository
cd this_repository
npm install
```

## run
```bash
npm start
```
now point your browser to http://localhost:5173 and click the button to getFeatureInfo for the Dom tower in Utrecht

### Notes and Known Issues:
- **Code Quality:** The implementation is somewhat hacky but functional, and it serves as a reference for integrating WMS getFeatureInfo.
- **Browser Dependency:** The code relies on a `DOMParser`, which is natively available in most modern browsers.
- **Projections File Size:** The `proj4defs.js` file is large. To optimize, remove unnecessary projections to save bandwidth.
- **WMS Version:** The code assumes WMS version 1.1.1. Support for version 1.3.0 is currently limited.
- **CORS Requirements:** Some WMS servers lack CORS headers, preventing browsers from accessing their responses. You can address this by setting up a CORS-enabled proxy server.

