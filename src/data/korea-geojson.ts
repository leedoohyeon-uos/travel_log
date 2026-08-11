import { FeatureCollection, Feature, Geometry } from 'geojson';
import { KOREA_REGIONS } from './korea-data';

/**
 * Korea GeoJSON Generator
 * 
 * [실제 지도 적용 안내]:
 * 향후 대한민국 행정구역(통계청/행정안전부 250여 개 시·군·구 및 읍·면·동) 정밀 지도 적용 시,
 * 아래 간이 GeoJSON 생성 함수 대신 대한민국 최신 시군구/읍면동 GeoJSON 데이터 파일 또는
 * 국내 지도 API(Naver Maps, Kakao Maps, Vworld) SDK로 교체하세요.
 * 예: // 실제 지도 적용 시 이 부분을 실제 지도 데이터/API로 교체
 */

// Centers for South Korea 17 Provinces/Cities
const PROVINCE_GEOMETRIES: Record<string, { lon: number; lat: number; rLon: number; rLat: number }> = {
  SEOUL: { lon: 126.978, lat: 37.566, rLon: 0.15, rLat: 0.12 },
  BUSAN: { lon: 129.075, lat: 35.179, rLon: 0.22, rLat: 0.18 },
  DAEGU: { lon: 128.601, lat: 35.871, rLon: 0.20, rLat: 0.18 },
  INCHEON: { lon: 126.705, lat: 37.456, rLon: 0.25, rLat: 0.22 },
  GWANGJU: { lon: 126.851, lat: 35.160, rLon: 0.18, rLat: 0.15 },
  DAEJEON: { lon: 127.384, lat: 36.350, rLon: 0.16, rLat: 0.14 },
  ULSAN: { lon: 129.311, lat: 35.538, rLon: 0.18, rLat: 0.16 },
  SEJONG: { lon: 127.289, lat: 36.480, rLon: 0.12, rLat: 0.12 },
  GYEONGGI: { lon: 127.2, lat: 37.4, rLon: 0.55, rLat: 0.50 },
  GANGWON: { lon: 128.2, lat: 37.7, rLon: 0.70, rLat: 0.65 },
  CHUNGBUK: { lon: 127.7, lat: 36.8, rLon: 0.45, rLat: 0.45 },
  CHUNGNAM: { lon: 126.8, lat: 36.5, rLon: 0.50, rLat: 0.45 },
  JEONBUK: { lon: 127.1, lat: 35.7, rLon: 0.50, rLat: 0.45 },
  JEONNAM: { lon: 126.9, lat: 34.8, rLon: 0.65, rLat: 0.55 },
  GYEONGBUK: { lon: 128.7, lat: 36.5, rLon: 0.70, rLat: 0.65 },
  GYEONGNAM: { lon: 128.2, lat: 35.3, rLon: 0.60, rLat: 0.50 },
  JEJU: { lon: 126.55, lat: 33.38, rLon: 0.40, rLat: 0.22 },
};

function createKoreaPolygon(lon: number, lat: number, rLon: number, rLat: number, seedNum: number): number[][] {
  const points: number[][] = [];
  const sides = 10;
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    const jitter = 0.8 + 0.4 * Math.sin(seedNum * 13 + i * 7);
    const pLon = lon + rLon * jitter * Math.cos(angle);
    const pLat = lat + rLat * jitter * Math.sin(angle);
    points.push([pLon, pLat]);
  }
  points.push([...points[0]]);
  return points;
}

export function getKoreaGeoJSON(): FeatureCollection {
  const features: Feature[] = KOREA_REGIONS.map((region, idx) => {
    const pos = PROVINCE_GEOMETRIES[region.code] || { lon: 127.0, lat: 36.0, rLon: 0.3, rLat: 0.3 };
    const ring = createKoreaPolygon(pos.lon, pos.lat, pos.rLon, pos.rLat, idx + 1);

    return {
      type: 'Feature',
      id: region.code,
      properties: {
        code: region.code,
        name: region.name,
        group: region.group
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
