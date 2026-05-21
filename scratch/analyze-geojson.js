const fs = require('fs');
const path = require('path');

const geojsonPath = path.join(__dirname, '../apps/web-user/src/data/turkiye-ilceler-geojson.json');
const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

const provinces = {};
data.features.forEach(f => {
  const prov = f.properties.province;
  const dist = f.properties.district;
  if (!provinces[prov]) {
    provinces[prov] = new Set();
  }
  provinces[prov].add(dist);
});

console.log(`Total Provinces: ${Object.keys(provinces).length}`);
let totalDistricts = 0;
const provinceList = Object.keys(provinces).sort((a,b) => a.localeCompare(b, 'tr'));

const output = [];
provinceList.forEach((prov, index) => {
  const dists = Array.from(provinces[prov]).sort((a,b) => a.localeCompare(b, 'tr'));
  totalDistricts += dists.length;
  output.push({
    id: index + 1,
    name: prov,
    districtsCount: dists.length,
    districts: dists
  });
});

console.log(`Total Districts: ${totalDistricts}`);
fs.writeFileSync(path.join(__dirname, 'geojson-analysis.json'), JSON.stringify(output, null, 2), 'utf8');
console.log('Analysis written to geojson-analysis.json');
