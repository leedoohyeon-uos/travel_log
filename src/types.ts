export type TabMode = 'overseas' | 'domestic';

export type StatusMode = 'visited' | 'wishlist' | 'all' | 'photo';

export type ContinentFilter = '전체' | '아시아' | '유럽' | '북아메리카' | '남아메리카' | '오세아니아' | '아프리카';

export type KoreaFilter = '전체' | '강원도' | '서울특별시' | '전라도' | '충청도' | '제주도' | '부산' | '경상도' | '경기도';

export interface CountryData {
  code: string;       // ISO 3-letter code e.g. "JPN"
  name: string;       // Korean name e.g. "일본"
  nameEn: string;     // English name e.g. "Japan"
  flag: string;       // Emoji flag e.g. "🇯🇵"
  continent: ContinentFilter;
}

export interface KoreaSubDistrict {
  code: string;
  name: string;
}

export interface KoreaRegionData {
  code: string;       // e.g. "SEOUL"
  name: string;       // e.g. "서울특별시"
  group: KoreaFilter; // e.g. "서울특별시"
  subDistricts?: KoreaSubDistrict[];
}

export interface TravelRecord {
  visited: boolean;
  visitCount: number;
  wishlist: boolean;
  updatedAt?: number;
}

export interface PhotoMeta {
  photoId: string;
  storagePath: string;
  downloadURL: string;
  createdAt: number;
  targetCode: string;
  targetType: 'country' | 'region';
}

export interface MapTooltipData {
  code: string;
  name: string;
  flag?: string;
  visitCount: number;
  wishlist: boolean;
  visited: boolean;
  photosCount: number;
  x: number;
  y: number;
}
