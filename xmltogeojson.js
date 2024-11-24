export function XMLtoGeoJSON(xmlString) {
  const result = { "type": "FeatureCollection", "features": [] };
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const root = xmlDoc.getElementsByTagName("GetFeatureInfoResponse");

  if (root && root.length) {
    const layers = root[0].getElementsByTagName("Layer");
    const layerInfo = {};
    for (var i = 0; i < layers.length; i++) {
      layerInfo.name = layers[i].getAttribute('name');
      const features = layers[i].getElementsByTagName('Feature');
      if (features && features.length) {
        for (let j = 0; j < features.length; j++) {
          const featureInfo = {};
          featureInfo.properties = {};
          const attributes = features[j].getElementsByTagName('Attribute');
          if (attributes && attributes.length) {
            for (let k = 0; k < attributes.length; k++) {
              const attrName = attributes[k].getAttribute('name');
              if (attrName != 'geometry') {
                featureInfo.properties[attrName] = attributes[k].getAttribute('value');
              } else {
                let geometryString = attributes[k].getAttribute('value');
                const endPos = geometryString.indexOf('(');
                const type = geometryString.substring(0, endPos).trim();
                geometryString = geometryString.substring(endPos).split(',').map(function (pair) { return "[" + pair.trim().replace(" ", ",") + "]" }).join(",").replace(/\(/g, "[").replace(/\)/g, "]");
                featureInfo.geometry = { "type": type, "coordinates": JSON.parse(geometryString) };
              }
            }
          }

          const featureObject = { "type": "Feature", "properties": featureInfo.properties, "geometry": featureInfo.geometry, "layername": layerInfo.name };

          const bBoxInfo = {};
          const boundingBox = features[j].getElementsByTagName('BoundingBox');
          if (boundingBox && boundingBox.length) {
            bBoxInfo.left = boundingBox[0].getAttribute('minx');
            bBoxInfo.right = boundingBox[0].getAttribute('maxx');
            bBoxInfo.top = boundingBox[0].getAttribute('maxy');
            bBoxInfo.bottom = boundingBox[0].getAttribute('miny');
            bBoxInfo.srs = boundingBox[0].getAttribute('SRS');
            featureObject.bbox = [parseFloat(bBoxInfo.left), parseFloat(bBoxInfo.bottom), parseFloat(bBoxInfo.right), parseFloat(bBoxInfo.top)];
          }

          if (result.srs) {
            if (bBoxInfo.srs != result.srs) {
              // set deviating feature srs
              featureObject.srs = bBoxInfo.srs;
            }
          } else {
            if (bBoxInfo.srs) {
              // set global GeoJSON srs
              result.srs = bBoxInfo.srs;
            }
          }
          result.features.push(featureObject);
        }
      }
    }
  } else {
    const gmlInfo = xmlDoc.getElementsByTagNameNS("http://www.opengis.net/gml", "featureMember");
    if (gmlInfo.length) {
      const xmlDoc2 = parser.parseFromString(gmlInfo[0].innerHTML, "text/xml");
      const attrs = [].slice.call(xmlDoc2.children[0].children).map(attr => [attr.tagName.split(':')[1], attr.textContent]);
      const featureInfo = {};

      featureInfo.properties = attrs.reduce((result, attr) => {
        if (attr[0] != 'geometry') {
          result[attr[0]] = attr[1];
        }
        return result;
      },
        {});
      featureInfo.geometry = null; /* todo: GML geometry parser */
      result.features.push(featureInfo);
    } else {
      const mapserverGmlInfo = xmlDoc.getElementsByTagNameNS("http://www.opengis.net/gml", "boundedBy");
      if (mapserverGmlInfo.length && mapserverGmlInfo[0].parentElement) {
        const attrs = [].slice.call(mapserverGmlInfo[0].parentElement.children).map(attr => [attr.tagName, attr.textContent]);
        const featureInfo = {};
        featureInfo.properties = attrs.reduce((result, attr) => {
          if (attr[0] != 'gml:boundedBy') {
            result[attr[0]] = attr[1];
          }
          return result;
        },
          {});
        featureInfo.geometry = null;
        result.features.push(featureInfo);
      } else {
        // unknown xml format or not xml?
      }
    }
  }
  return result;
}
