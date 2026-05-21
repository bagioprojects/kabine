const fs = require('fs');
const path = require('path');

const geojsonPath = path.join(__dirname, '../apps/web-user/src/data/turkiye-ilceler-geojson.json');
const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Standard Turkey plate numbers mapping
const PLATE_MAP = {
  'Adana': 1, 'Adıyaman': 2, 'Afyonkarahisar': 3, 'Ağrı': 4, 'Amasya': 5,
  'Ankara': 6, 'Antalya': 7, 'Artvin': 8, 'Aydın': 9, 'Balıkesir': 10,
  'Bilecik': 11, 'Bingöl': 12, 'Bitlis': 13, 'Bolu': 14, 'Burdur': 15,
  'Bursa': 16, 'Çanakkale': 17, 'Çankırı': 18, 'Çorum': 19, 'Denizli': 20,
  'Diyarbakır': 21, 'Edirne': 22, 'Elazığ': 23, 'Erzincan': 24, 'Erzurum': 25,
  'Eskişehir': 26, 'Gaziantep': 27, 'Giresun': 28, 'Gümüşhane': 29, 'Hakkari': 30,
  'Hatay': 31, 'Isparta': 32, 'Mersin': 33, 'İstanbul': 34, 'İzmir': 35,
  'Kars': 36, 'Kastamonu': 37, 'Kayseri': 38, 'Kırklareli': 39, 'Kırşehir': 40,
  'Kocaeli': 41, 'Konya': 42, 'Kütahya': 43, 'Malatya': 44, 'Manisa': 45,
  'Kahramanmaraş': 46, 'Mardin': 47, 'Muğla': 48, 'Muş': 49, 'Nevşehir': 50,
  'Niğde': 51, 'Ordu': 52, 'Rize': 53, 'Sakarya': 54, 'Samsun': 55,
  'Siirt': 56, 'Sinop': 57, 'Sivas': 58, 'Tekirdağ': 59, 'Tokat': 60,
  'Trabzon': 61, 'Tunceli': 62, 'Şanlıurfa': 63, 'Uşak': 64, 'Van': 65,
  'Yozgat': 66, 'Zonguldak': 67, 'Aksaray': 68, 'Bayburt': 69, 'Karaman': 70,
  'Kırıkkale': 71, 'Batman': 72, 'Şırnak': 73, 'Bartın': 74, 'Ardahan': 75,
  'Iğdır': 76, 'Yalova': 77, 'Karabük': 78, 'Kilis': 79, 'Osmaniye': 80,
  'Düzce': 81
};

// Check for any typo in our plate map keys
const geoProvinces = new Set();
data.features.forEach(f => {
  let name = f.properties.province;
  // Handle Mersin / İçel or similar if needed
  if (name === 'İçel') name = 'Mersin';
  geoProvinces.add(name);
});

console.log('GeoJSON Province Names not in plate map:', Array.from(geoProvinces).filter(p => !PLATE_MAP[p]));

// Let's gather all districts grouped by province
const provinceDistricts = {};
data.features.forEach(f => {
  let provName = f.properties.province ? f.properties.province.trim() : '';
  if (provName === 'İçel') provName = 'Mersin';
  const distName = f.properties.district ? f.properties.district.trim() : '';
  if (!provName || !distName) return;
  if (!provinceDistricts[provName]) {
    provinceDistricts[provName] = new Set();
  }
  provinceDistricts[provName].add(distName);
});

// Generate districts list with IDs
const provincesList = Object.keys(PLATE_MAP).sort((a, b) => PLATE_MAP[a] - PLATE_MAP[b]);
const districtsList = [];
let districtIdCounter = 1;

provincesList.forEach(provName => {
  const provId = PLATE_MAP[provName];
  const distSet = provinceDistricts[provName] || new Set();
  const sortedDists = Array.from(distSet).sort((a, b) => a.localeCompare(b, 'tr'));
  
  sortedDists.forEach(distName => {
    districtsList.push({
      id: districtIdCounter++,
      name: distName,
      provinceId: provId
    });
  });
});

console.log(`Generated ${districtIdCounter - 1} districts.`);

// Now let's generate locationData.ts content
const tsContent = `// Automatically generated location data for Turkey's 81 Provinces and 923 Districts

export interface Province {
  id: number;
  name: string;
  republicName: string;
}

export interface District {
  id: number;
  name: string;
  provinceId: number;
}

export const PROVINCES: Province[] = [
${provincesList.map(name => {
  const id = PLATE_MAP[name];
  return `  { id: ${id}, name: '${name}', republicName: '${name} Cumhuriyeti' }`;
}).join(',\n')}
];

export const DISTRICTS: District[] = [
${districtsList.map(d => {
  return `  { id: ${d.id}, name: '${d.name}', provinceId: ${d.provinceId} }`;
}).join(',\n')}
];

export const PROVINCE_LOOKUP: Record<number, string> = {
${provincesList.map(name => {
  const id = PLATE_MAP[name];
  return `  ${id}: '${name}'`;
}).join(',\n')}
};

export const DISTRICT_LOOKUP: Record<number, string> = {
${districtsList.map(d => {
  return `  ${d.id}: '${d.name}'`;
}).join(',\n')}
};

export const DISTRICT_TO_PROVINCE: Record<number, number> = {
${districtsList.map(d => {
  return `  ${d.id}: ${d.provinceId}`;
}).join(',\n')}
};
`;

// Save to shared location
const outputPath = path.join(__dirname, 'locationData.ts');
fs.writeFileSync(outputPath, tsContent, 'utf8');
console.log(`Generated locationData.ts at ${outputPath}`);
