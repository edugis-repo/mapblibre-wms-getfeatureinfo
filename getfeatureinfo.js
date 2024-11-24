import proj4 from 'proj4';
import defs from './proj4defs.js';
import { jsonToGeoJSON } from './jsontogeojson.js';
import { XMLtoGeoJSON } from './xmltogeojson.js';

const epsgDefs = defs.map(def=>[`EPSG:${def[0]}`, def[1]]).filter(def=>def[1] !== "");
proj4.defs(epsgDefs);

const coordProject = (coord, fromEPSG, toEPSG) => {
  if (fromEPSG && toEPSG && proj4.defs(fromEPSG) && proj4.defs(toEPSG)) {
      return proj4(fromEPSG, toEPSG).forward(coord);
  }
  return undefined;
}

function projectLngLat(lngLat, srs)
{
    if (!srs) {
        srs = 'EPSG:3857';
    }
    var p = coordProject([lngLat.lng, lngLat.lat], 'EPSG:4326', srs);

    lngLat.x = p[0];
    lngLat.y = p[1];
    return lngLat;
}

export async function queryWMSFeatures(lngLat, zoomLevel, getFeatureInfoUrl, getFeatureInfoFormat, featureinfoproxy) {
  const featureInfoFormat = getFeatureInfoFormat ? getFeatureInfoFormat : 'text/xml';
  const wmtsResolution = (2 * 20037508.342789244) / (256 * Math.pow(2, (Math.round(zoomLevel+1))));
  // get webmercator coordinates for clicked point
  const clickedPointMercator = projectLngLat(lngLat);
  // create 3 x 3 pixel bounding box in webmercator coordinates
  const leftbottom = {x: clickedPointMercator.x - 1.5 * wmtsResolution, y: clickedPointMercator.y - 1.5 * wmtsResolution};
  const righttop = {x: clickedPointMercator.x + 1.5 * wmtsResolution, y: clickedPointMercator.y + 1.5 * wmtsResolution};
  // getFeatureinfo url for center pixel of 3x3 pixel area
  let srs = 'EPSG:3857';
  const params = `&width=3&height=3&x=1&y=1&crs=${srs}&srs=${srs}&info_format=${featureInfoFormat}&bbox=`;
  let url=getFeatureInfoUrl+params+(leftbottom.x)+","+(leftbottom.y)+","+(righttop.x)+","+(righttop.y);
  if (featureinfoproxy) {
    url = featureinfoproxy + encodeURIComponent(url);
  }
  const response = await fetch(url);
  if (response.ok) {
      if (featureInfoFormat === 'application/json') {
        const json = await response.json();
        return jsonToGeoJSON(json);
      }
      const text = await response.text();
      return XMLtoGeoJSON(text)
  }
}
