import { FeatureCollection, Feature, Geometry } from 'geojson';
import { WORLD_COUNTRIES } from './country-data';

/**
 * World GeoJSON Generator
 * 
 * [실제 지도 적용 안내]:
 * 향후 실제 데이터베이스 연동 및 초고해상도 지도 데이터/API 적용 시,
 * 이 파일의 간이 GeoJSON 생성 로직 대신 Natural Earth, World Bank GeoJSON 또는
 * 외부 Vector Map API (Google Maps, Leaflet GeoJSON 등)에서 제공하는
 * 1:10m Scale 정밀 GeoJSON 파일로 교체하세요.
 * 예: // 실제 지도 적용 시 이 부분을 실제 지도 데이터/API로 교체
 */

// Approximate center coordinates [longitude, latitude] and radius/shape generator for fallback / simplified boundaries
const COUNTRY_CENTERS: Record<string, { lon: number; lat: number; r?: number }> = {
  // Asia
  KOR: { lon: 127.8, lat: 35.9, r: 1.8 },
  JPN: { lon: 138.2, lat: 36.2, r: 4.5 },
  CHN: { lon: 104.2, lat: 35.8, r: 18.0 },
  TWN: { lon: 120.9, lat: 23.7, r: 1.5 },
  HKG: { lon: 114.1, lat: 22.3, r: 0.8 },
  MAC: { lon: 113.5, lat: 22.2, r: 0.6 },
  VNM: { lon: 108.2, lat: 14.0, r: 3.5 },
  THA: { lon: 100.5, lat: 15.8, r: 4.2 },
  PHL: { lon: 121.7, lat: 12.8, r: 3.8 },
  SGP: { lon: 103.8, lat: 1.35, r: 0.7 },
  MYS: { lon: 101.9, lat: 4.2, r: 4.0 },
  IDN: { lon: 113.9, lat: -0.7, r: 10.0 },
  IND: { lon: 78.9, lat: 20.5, r: 12.0 },
  MNG: { lon: 103.8, lat: 46.8, r: 10.0 },
  LAO: { lon: 102.4, lat: 19.8, r: 3.0 },
  KHM: { lon: 104.9, lat: 12.5, r: 2.8 },
  MMR: { lon: 95.9, lat: 21.9, r: 5.0 },
  NPL: { lon: 84.1, lat: 28.3, r: 2.5 },
  LKA: { lon: 80.7, lat: 7.8, r: 1.8 },
  MDV: { lon: 73.5, lat: 3.2, r: 1.0 },
  PAK: { lon: 69.3, lat: 30.3, r: 6.5 },
  BGD: { lon: 90.3, lat: 23.6, r: 2.2 },
  BTN: { lon: 90.4, lat: 27.5, r: 1.2 },
  KAZ: { lon: 66.9, lat: 48.0, r: 14.0 },
  UZB: { lon: 64.5, lat: 41.3, r: 5.5 },
  KGZ: { lon: 74.7, lat: 41.2, r: 3.5 },
  TJK: { lon: 71.2, lat: 38.8, r: 2.8 },
  TKM: { lon: 59.5, lat: 38.9, r: 4.5 },
  TUR: { lon: 35.2, lat: 38.9, r: 6.5 },
  ARE: { lon: 53.8, lat: 23.4, r: 2.5 },
  SAU: { lon: 45.0, lat: 23.8, r: 11.0 },
  QAT: { lon: 51.1, lat: 25.3, r: 1.0 },
  ISR: { lon: 34.8, lat: 31.0, r: 1.2 },
  JOR: { lon: 36.2, lat: 30.5, r: 2.0 },
  LBN: { lon: 35.8, lat: 33.8, r: 0.9 },
  OMN: { lon: 55.9, lat: 21.5, r: 3.8 },
  KWT: { lon: 47.4, lat: 29.3, r: 1.2 },
  BHR: { lon: 50.5, lat: 26.0, r: 0.8 },
  GEO: { lon: 43.3, lat: 42.3, r: 1.8 },
  ARM: { lon: 45.0, lat: 40.0, r: 1.2 },
  AZE: { lon: 47.5, lat: 40.1, r: 2.0 },
  IRQ: { lon: 43.6, lat: 33.2, r: 4.5 },
  IRN: { lon: 53.6, lat: 32.4, r: 9.0 },
  BRN: { lon: 114.7, lat: 4.5, r: 0.8 },
  TLS: { lon: 125.7, lat: -8.8, r: 1.0 },
  AFG: { lon: 67.7, lat: 33.9, r: 5.0 },
  SYR: { lon: 38.9, lat: 34.8, r: 2.8 },
  YEM: { lon: 48.5, lat: 15.5, r: 4.0 },

  // Europe
  FRA: { lon: 2.2, lat: 46.2, r: 5.0 },
  GBR: { lon: -3.4, lat: 55.3, r: 4.2 },
  DEU: { lon: 10.4, lat: 51.1, r: 4.5 },
  ITA: { lon: 12.5, lat: 41.8, r: 4.8 },
  ESP: { lon: -3.7, lat: 40.4, r: 5.5 },
  CHE: { lon: 8.2, lat: 46.8, r: 1.8 },
  AUT: { lon: 14.5, lat: 47.5, r: 2.2 },
  NLD: { lon: 5.2, lat: 52.1, r: 1.6 },
  BEL: { lon: 4.4, lat: 50.5, r: 1.4 },
  PRT: { lon: -8.2, lat: 39.3, r: 2.2 },
  CZE: { lon: 15.4, lat: 49.8, r: 2.2 },
  HUN: { lon: 19.5, lat: 47.1, r: 2.4 },
  POL: { lon: 19.1, lat: 51.9, r: 4.5 },
  GRC: { lon: 21.8, lat: 39.0, r: 3.2 },
  HRV: { lon: 15.2, lat: 45.1, r: 2.0 },
  SWE: { lon: 18.6, lat: 60.1, r: 6.5 },
  NOR: { lon: 8.4, lat: 60.4, r: 6.0 },
  DNK: { lon: 9.5, lat: 56.2, r: 2.0 },
  FIN: { lon: 25.7, lat: 61.9, r: 5.5 },
  ISL: { lon: -19.0, lat: 64.9, r: 3.0 },
  IRL: { lon: -8.2, lat: 53.4, r: 2.2 },
  ROU: { lon: 24.9, lat: 45.9, r: 3.8 },
  BGR: { lon: 25.4, lat: 42.7, r: 2.5 },
  SVK: { lon: 19.6, lat: 48.6, r: 1.8 },
  SVN: { lon: 14.9, lat: 46.1, r: 1.2 },
  EST: { lon: 25.0, lat: 58.5, r: 1.8 },
  LVA: { lon: 24.6, lat: 56.8, r: 2.0 },
  LTU: { lon: 23.8, lat: 55.1, r: 2.2 },
  LUX: { lon: 6.1, lat: 49.8, r: 0.8 },
  MLT: { lon: 14.3, lat: 35.9, r: 0.6 },
  CYP: { lon: 33.4, lat: 35.1, r: 1.0 },
  RUS: { lon: 105.3, lat: 61.5, r: 32.0 },
  UKR: { lon: 31.1, lat: 48.3, r: 6.5 },
  BLR: { lon: 27.9, lat: 53.7, r: 3.2 },
  SRB: { lon: 21.0, lat: 44.0, r: 2.0 },
  BIH: { lon: 17.6, lat: 43.9, r: 1.5 },
  MNE: { lon: 19.2, lat: 42.7, r: 0.9 },
  ALB: { lon: 20.1, lat: 41.1, r: 1.2 },
  MKD: { lon: 21.7, lat: 41.6, r: 1.1 },
  MDA: { lon: 28.3, lat: 47.4, r: 1.4 },
  AND: { lon: 1.5, lat: 42.5, r: 0.5 },
  MCO: { lon: 7.4, lat: 43.7, r: 0.4 },
  SMR: { lon: 12.4, lat: 43.9, r: 0.4 },
  VAT: { lon: 12.4, lat: 41.9, r: 0.3 },
  LIE: { lon: 9.5, lat: 47.1, r: 0.4 },

  // North America
  USA: { lon: -95.7, lat: 37.0, r: 18.0 },
  CAN: { lon: -106.3, lat: 56.1, r: 22.0 },
  MEX: { lon: -102.5, lat: 23.6, r: 9.0 },
  CUB: { lon: -77.7, lat: 21.5, r: 3.5 },
  JAM: { lon: -77.2, lat: 18.1, r: 1.0 },
  DOM: { lon: -70.1, lat: 18.7, r: 1.5 },
  HTI: { lon: -72.2, lat: 18.9, r: 1.2 },
  GTM: { lon: -90.2, lat: 15.7, r: 1.8 },
  CRI: { lon: -83.7, lat: 9.7, r: 1.5 },
  PAN: { lon: -80.7, lat: 8.5, r: 1.8 },
  BHS: { lon: -77.3, lat: 25.0, r: 1.2 },
  BLZ: { lon: -88.4, lat: 17.1, r: 1.0 },
  SLV: { lon: -88.8, lat: 13.7, r: 1.0 },
  HND: { lon: -86.2, lat: 15.2, r: 1.8 },
  NIC: { lon: -85.2, lat: 12.8, r: 2.0 },
  BRB: { lon: -59.5, lat: 13.1, r: 0.5 },
  TTO: { lon: -61.2, lat: 10.6, r: 0.8 },

  // South America
  BRA: { lon: -51.9, lat: -14.2, r: 16.0 },
  ARG: { lon: -63.6, lat: -38.4, r: 11.0 },
  CHL: { lon: -71.5, lat: -35.6, r: 7.0 },
  PER: { lon: -75.0, lat: -9.1, r: 6.5 },
  COL: { lon: -74.2, lat: 4.5, r: 5.5 },
  VEN: { lon: -66.5, lat: 6.4, r: 5.0 },
  ECU: { lon: -78.1, lat: -1.8, r: 2.5 },
  BOL: { lon: -63.5, lat: -16.2, r: 5.5 },
  PRY: { lon: -58.4, lat: -23.4, r: 3.5 },
  URY: { lon: -55.7, lat: -32.5, r: 2.5 },
  GUY: { lon: -58.9, lat: 4.8, r: 2.5 },
  SUR: { lon: -56.0, lat: 3.9, r: 2.2 },

  // Oceania
  AUS: { lon: 133.7, lat: -25.2, r: 16.0 },
  NZL: { lon: 174.8, lat: -40.9, r: 5.0 },
  FJI: { lon: 178.0, lat: -17.7, r: 1.5 },
  PNG: { lon: 143.9, lat: -6.3, r: 4.5 },
  GUM: { lon: 144.7, lat: 13.4, r: 0.6 },
  PLW: { lon: 134.5, lat: 7.5, r: 0.6 },
  WSM: { lon: -172.1, lat: -13.7, r: 0.8 },
  TON: { lon: -175.1, lat: -21.1, r: 0.8 },
  VUT: { lon: 166.9, lat: -15.3, r: 1.2 },
  SLB: { lon: 160.1, lat: -9.6, r: 2.0 },
  FSM: { lon: 158.2, lat: 6.8, r: 1.0 },
  MHL: { lon: 171.1, lat: 7.1, r: 0.8 },

  // Africa
  EGY: { lon: 30.8, lat: 26.8, r: 6.0 },
  ZAF: { lon: 22.9, lat: -30.5, r: 7.0 },
  MAR: { lon: -7.0, lat: 31.7, r: 4.5 },
  KEN: { lon: 37.9, lat: -0.02, r: 4.5 },
  TZA: { lon: 34.8, lat: -6.3, r: 5.0 },
  ETH: { lon: 40.4, lat: 9.1, r: 5.5 },
  NGA: { lon: 8.6, lat: 9.0, r: 5.0 },
  GHA: { lon: -1.0, lat: 7.9, r: 2.5 },
  SEN: { lon: -14.4, lat: 14.4, r: 2.2 },
  TUN: { lon: 9.5, lat: 33.8, r: 2.5 },
  DZA: { lon: 1.6, lat: 28.0, r: 9.0 },
  MDG: { lon: 46.8, lat: -18.7, r: 6.0 },
  MUS: { lon: 57.5, lat: -20.3, r: 0.8 },
  SYC: { lon: 55.4, lat: -4.6, r: 0.6 },
  RWA: { lon: 29.8, lat: -1.9, r: 1.2 },
  UGA: { lon: 32.2, lat: 1.37, r: 2.5 },
  NAM: { lon: 18.4, lat: -22.9, r: 5.5 },
  BWA: { lon: 24.6, lat: -22.3, r: 4.5 },
  ZWE: { lon: 29.1, lat: -19.0, r: 3.2 },
  ZMB: { lon: 27.8, lat: -13.1, r: 4.5 },
  MOZ: { lon: 35.5, lat: -18.6, r: 5.5 },
  AGO: { lon: 17.8, lat: -11.2, r: 6.0 },
  CMR: { lon: 12.3, lat: 7.3, r: 3.8 },
  CIV: { lon: -5.5, lat: 7.5, r: 3.0 },
  COD: { lon: 23.6, lat: -2.8, r: 8.5 },
  SDN: { lon: 30.2, lat: 12.8, r: 7.0 },
  LBY: { lon: 17.2, lat: 26.3, r: 7.5 },
  MLI: { lon: -3.9, lat: 17.5, r: 6.5 },
  NER: { lon: 8.0, lat: 17.6, r: 6.5 },
  TCD: { lon: 18.7, lat: 15.4, r: 6.5 },
  MRT: { lon: -10.9, lat: 21.0, r: 6.0 },
  SOM: { lon: 46.1, lat: 5.1, r: 4.5 },
  MWI: { lon: 34.3, lat: -13.2, r: 2.0 },
  BEN: { lon: 2.3, lat: 9.3, r: 1.8 },
  TGO: { lon: 0.8, lat: 8.6, r: 1.5 },
  BFA: { lon: -1.5, lat: 12.2, r: 2.8 },
  GIN: { lon: -9.6, lat: 9.9, r: 2.5 },
  GMB: { lon: -15.3, lat: 13.4, r: 1.0 },
  LBR: { lon: -9.4, lat: 6.4, r: 1.8 },
  SLE: { lon: -11.7, lat: 8.4, r: 1.5 },
  GNB: { lon: -15.1, lat: 11.8, r: 1.2 },
  CPV: { lon: -24.0, lat: 16.0, r: 0.8 },
  GQG: { lon: 10.2, lat: 1.6, r: 1.0 },
  STP: { lon: 6.6, lat: 0.1, r: 0.6 },
  COG: { lon: 15.8, lat: -0.2, r: 3.5 },
  GAB: { lon: 11.6, lat: -0.8, r: 3.0 },
  CAF: { lon: 20.9, lat: 6.6, r: 4.0 },
  ERI: { lon: 39.7, lat: 15.1, r: 2.2 },
  DJI: { lon: 42.5, lat: 11.8, r: 1.0 },
  BDI: { lon: 29.9, lat: -3.3, r: 1.1 },
  LSO: { lon: 28.2, lat: -29.6, r: 1.0 },
  SWZ: { lon: 31.4, lat: -26.5, r: 0.8 },
  COM: { lon: 43.3, lat: -11.8, r: 0.6 },
  SSD: { lon: 31.3, lat: 6.8, r: 4.0 }
};

// Creates an 8-point polygon around center (lon, lat) with natural-looking organic jitter
function createOrganicPolygon(lon: number, lat: number, r: number): number[][] {
  const points: number[][] = [];
  const numSides = 10;
  // Use deterministic pseudo-random offset based on lat/lon
  const seed = Math.abs(Math.sin(lon * 100 + lat * 50));
  
  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * 2 * Math.PI;
    const jitter = 0.75 + 0.5 * Math.abs(Math.sin(seed * (i + 1) * 3));
    const pointR = r * jitter;
    // Scale longitude by cos(latitude) for geographic proportion
    const latRad = (lat * Math.PI) / 180;
    const cosLat = Math.max(0.3, Math.cos(latRad));
    
    const pLon = lon + (pointR / cosLat) * Math.cos(angle);
    const pLat = Math.max(-85, Math.min(85, lat + pointR * Math.sin(angle)));
    points.push([pLon, pLat]);
  }
  // Close polygon
  points.push([...points[0]]);
  return points;
}

export function getWorldGeoJSON(): FeatureCollection {
  const features: Feature[] = WORLD_COUNTRIES.map(country => {
    const pos = COUNTRY_CENTERS[country.code] || { lon: 0, lat: 0, r: 3.0 };
    const r = pos.r || 3.0;
    const ring = createOrganicPolygon(pos.lon, pos.lat, r);

    return {
      type: 'Feature',
      id: country.code,
      properties: {
        ISO_A3: country.code,
        code: country.code,
        name: country.name,
        nameEn: country.nameEn,
        flag: country.flag,
        continent: country.continent
      },
      geometry: {
        type: 'Polygon',
        coordinates: [ring]
      } as Geometry
    };
  });

  return {
    type: 'FeatureCollection',
    features
  };
}
