// convert returned featureInfo json to standard GeoJSON
export function jsonToGeoJSON(json) {
  if (json.type === "FeatureCollection") {
    return json;
  }
  if (json.type === "Feature") {
    return {type: "FeatureCollection", features: [json]};
  }
  if (Array.isArray(json)) {
    return {
      "type": "FeatureCollection", 
      "features": json.map(item=>{
        return {
          "type":"Feature",
          "geometry": {"type": "Point", "coords": item.point.coords},
          "properties": item
        }
      })
    }
  } else {
    // convert other forms of json to geojson
  }
  return {type: "FeatureCollection", features: []};
}