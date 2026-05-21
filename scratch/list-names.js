const fs = require('fs');
const path = require('path');

const geojsonPath = path.join(__dirname, '../apps/web-user/src/data/turkiye-ilceler-geojson.json');
const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

const provinces = new Set();
data.features.forEach(f => {
  provinces.add(f.properties.province);
});

console.log(Array.from(provinces).sort((a, b) => a.localeCompare(b, 'tr')).join(', '));
