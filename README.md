# WMS getFeatureInfo for maplibre and mapbox

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
now point your browser to http://localhost:5173 to getFeatureInfo for the Dom tower in Utrecht

## some remarks
* a bit hacky code, but it works, use as reference
* the code expects a DOMParser to be available (standard in browsers)
* proj4defs.js is quite a large file, optionally remove unneeded projections to save on download bytes
* code assumes WMS version 1.1.1 to be available (most WMS servers support this version), version 1.3.0 does not seem to work


