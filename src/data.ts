export interface Place {
  id: number;
  name_en: string;
  name_zh: string;
  address: string;
  lat: number;
  lng: number;
  category: 'food' | 'services' | 'spiritual' | 'fun' | 'academic';
  subcategory: string;
  need_stage: 'just_arrived' | 'settling_in' | 'living_here' | 'working_here';
  languages: string[];
  zone: 'SGV' | 'USC' | 'DTLA';
  transit_accessible: boolean;
  nearest_transit: string | null;
  cultural_corridor: string | null;
  metadata: Record<string, any>;
  last_verified: string;
  status: string;
}

export interface Corridor {
  id: string;
  name_en: string;
  name_zh: string;
  route_number: string;
  description_en: string;
  description_zh: string;
  zones_connected: string[];
  color: string;
  coordinates: [number, number][];
}

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#EF4444',      // red
  services: '#3B82F6',  // blue
  spiritual: '#8B5CF6', // purple
  fun: '#22C55E',       // green
  academic: '#F97316',  // orange
};

// Transit corridors data
export const corridors: Corridor[] = [
  {
    id: 'metro-a',
    name_en: 'Metro A Line (Gold)',
    name_zh: '地铁A线（金线）',
    route_number: 'A Line',
    description_en: 'Connects Pasadena through DTLA to East LA. Key stops: Union Station, Chinatown, Little Tokyo.',
    description_zh: '连接帕萨迪纳经市中心到东洛杉矶。重要站点：联合车站、中国城、小东京。',
    zones_connected: ['SGV', 'DTLA'],
    color: '#D4A843',
    coordinates: [
      [34.1478, -118.1445], // APU/Citrus College
      [34.1369, -118.1275], // Azusa Downtown
      [34.1084, -118.1060], // Duarte
      [34.0855, -118.0812], // Arcadia
      [34.0628, -118.0723], // Sierra Madre Villa
      [34.0518, -118.0833], // Allen
      [34.0435, -118.0910], // Lake
      [34.0400, -118.1063], // Memorial Park
      [34.0489, -118.1338], // Del Mar
      [34.0561, -118.1537], // Fillmore
      [34.0624, -118.1660], // South Pasadena
      [34.0613, -118.1877], // Highland Park
      [34.0670, -118.2100], // Lincoln Heights / Cypress Park
      [34.0561, -118.2356], // Chinatown
      [34.0560, -118.2340], // Union Station
    ]
  },
  {
    id: 'bus-770',
    name_en: '770 Bus — SGV Express',
    name_zh: '770路公交 — 圣谷快线',
    route_number: '770',
    description_en: 'Runs along Valley Blvd through the heart of SGV. ~35 min from El Monte to DTLA, every 15 min.',
    description_zh: '沿Valley大道穿越圣谷核心地带。从El Monte到市中心约35分钟，每15分钟一班。',
    zones_connected: ['SGV', 'DTLA'],
    color: '#EA580C',
    coordinates: [
      [34.0735, -117.9380], // El Monte
      [34.0622, -118.0030], // Rosemead
      [34.0500, -118.0340], // San Gabriel
      [34.0475, -118.0590], // Alhambra
      [34.0560, -118.2356], // DTLA
    ]
  },
  {
    id: 'metro-e',
    name_en: 'Metro E Line (Expo)',
    name_zh: '地铁E线（博览线）',
    route_number: 'E Line',
    description_en: 'Connects DTLA to USC, Culver City, and Santa Monica. Key stop: Expo Park/USC.',
    description_zh: '连接市中心到USC、Culver City和圣莫尼卡。重要站点：博览公园/USC。',
    zones_connected: ['DTLA', 'USC'],
    color: '#22C55E',
    coordinates: [
      [34.0560, -118.2340], // Union Station / 7th Metro
      [34.0180, -118.2860], // Expo Park / USC
      [34.0260, -118.3410], // Culver City
      [34.0127, -118.4695], // Santa Monica
    ]
  },
];

// Seed data — embedded directly for v1 (no backend needed)
let placesData: Place[] = [];

export function setPlaces(data: Place[]): void {
  placesData = data;
}

export function getPlaces(): Place[] {
  return placesData;
}

export function filterPlaces(filters: {
  categories?: string[];
  stages?: string[];
  languages?: string[];
  zones?: string[];
  search?: string;
}): Place[] {
  return placesData.filter(place => {
    if (filters.categories?.length && !filters.categories.includes(place.category)) return false;
    if (filters.stages?.length && !filters.stages.includes(place.need_stage)) return false;
    if (filters.languages?.length) {
      const hasLang = filters.languages.some(lang => place.languages.includes(lang));
      if (!hasLang) return false;
    }
    if (filters.zones?.length && !filters.zones.includes(place.zone)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const metaStr = place.metadata ? JSON.stringify(place.metadata).toLowerCase() : '';
      const match = place.name_en.toLowerCase().includes(q)
        || place.name_zh.includes(q)
        || place.address.toLowerCase().includes(q)
        || place.subcategory.toLowerCase().includes(q)
        || metaStr.includes(q);
      if (!match) return false;
    }
    return true;
  });
}
