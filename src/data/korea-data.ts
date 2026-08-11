import { KoreaRegionData } from '../types';

// 1. 17 Major Provinces (17개 광역시·도)
export const KOREA_PROVINCES: KoreaRegionData[] = [
  {
    code: 'SEOUL',
    name: '서울특별시',
    group: '서울특별시',
    subDistricts: [
      { code: 'SEOUL_GANGNAM', name: '강남구' },
      { code: 'SEOUL_MAPO', name: '마포구' },
      { code: 'SEOUL_JONGNO', name: '종로구' },
      { code: 'SEOUL_YONGSAN', name: '용산구' },
      { code: 'SEOUL_SEONGDONG', name: '성동구' },
      { code: 'SEOUL_SONGPA', name: '송파구' },
      { code: 'SEOUL_SEOCHO', name: '서초구' },
      { code: 'SEOUL_YEONGDEUNGPO', name: '영등포구' },
    ]
  },
  {
    code: 'BUSAN',
    name: '부산광역시',
    group: '부산',
    subDistricts: [
      { code: 'BUSAN_HAEUNDAE', name: '해운대구' },
      { code: 'BUSAN_BUSANJIN', name: '부산진구' },
      { code: 'BUSAN_JUNG', name: '중구' },
      { code: 'BUSAN_NAM', name: '남구' },
      { code: 'BUSAN_SUYEONG', name: '수영구' },
      { code: 'BUSAN_GIJANG', name: '기장군' },
    ]
  },
  {
    code: 'DAEGU',
    name: '대구광역시',
    group: '경상도',
    subDistricts: [
      { code: 'DAEGU_JUNG', name: '중구' },
      { code: 'DAEGU_SUSEONG', name: '수성구' },
      { code: 'DAEGU_DALSEO', name: '달서구' },
    ]
  },
  {
    code: 'INCHEON',
    name: '인천광역시',
    group: '경기도',
    subDistricts: [
      { code: 'INCHEON_JUNG', name: '중구' },
      { code: 'INCHEON_YEONSU', name: '연수구(송도)' },
      { code: 'INCHEON_NAMDONG', name: '남동구' },
      { code: 'INCHEON_GANGHWA', name: '강화군' },
    ]
  },
  {
    code: 'GWANGJU',
    name: '광주광역시',
    group: '전라도',
    subDistricts: [
      { code: 'GWANGJU_DONG', name: '동구' },
      { code: 'GWANGJU_SEO', name: '서구' },
      { code: 'GWANGJU_GWANGSAN', name: '광산구' },
    ]
  },
  {
    code: 'DAEJEON',
    name: '대전광역시',
    group: '충청도',
    subDistricts: [
      { code: 'DAEJEON_YUSEONG', name: '유성구' },
      { code: 'DAEJEON_SEO', name: '서구' },
      { code: 'DAEJEON_JUNG', name: '중구' },
    ]
  },
  {
    code: 'ULSAN',
    name: '울산광역시',
    group: '경상도',
    subDistricts: [
      { code: 'ULSAN_NAM', name: '남구' },
      { code: 'ULSAN_DONG', name: '동구' },
      { code: 'ULSAN_ULJU', name: '울주군' },
    ]
  },
  {
    code: 'SEJONG',
    name: '세종특별자치시',
    group: '충청도',
    subDistricts: [
      { code: 'SEJONG_MAIN', name: '세종시' }
    ]
  },
  {
    code: 'GYEONGGI',
    name: '경기도',
    group: '경기도',
    subDistricts: [
      { code: 'GYEONGGI_SUWON', name: '수원시' },
      { code: 'GYEONGGI_SEONGNAM', name: '성남시(분당)' },
      { code: 'GYEONGGI_GOYANG', name: '고양시(일산)' },
      { code: 'GYEONGGI_YONGIN', name: '용인시' },
      { code: 'GYEONGGI_PAJU', name: '파주시' },
      { code: 'GYEONGGI_GAPYEONG', name: '가평군' },
      { code: 'GYEONGGI_YANGPYEONG', name: '양평군' },
    ]
  },
  {
    code: 'GANGWON',
    name: '강원특별자치도',
    group: '강원도',
    subDistricts: [
      { code: 'GANGWON_GANGNEUNG', name: '강릉시' },
      { code: 'GANGWON_SOKCHO', name: '속초시' },
      { code: 'GANGWON_CHUNCHEON', name: '춘천시' },
      { code: 'GANGWON_PYEONGCHANG', name: '평창군' },
      { code: 'GANGWON_YANGYANG', name: '양양군' },
      { code: 'GANGWON_WONJU', name: '원주시' },
    ]
  },
  {
    code: 'CHUNGBUK',
    name: '충청북도',
    group: '충청도',
    subDistricts: [
      { code: 'CHUNGBUK_CHEONGJU', name: '청주시' },
      { code: 'CHUNGBUK_CHUNGJU', name: '충주시' },
      { code: 'CHUNGBUK_DANYANG', name: '단양군' },
      { code: 'CHUNGBUK_JEONCHON', name: '제천시' },
    ]
  },
  {
    code: 'CHUNGNAM',
    name: '충청남도',
    group: '충청도',
    subDistricts: [
      { code: 'CHUNGNAM_CHEONAN', name: '천안시' },
      { code: 'CHUNGNAM_ASAN', name: '아산시' },
      { code: 'CHUNGNAM_TAEAN', name: '태안군(안면도)' },
      { code: 'CHUNGNAM_BUYEO', name: '부여군' },
      { code: 'CHUNGNAM_GONCJU', name: '공주시' },
    ]
  },
  {
    code: 'JEONBUK',
    name: '전북특별자치도',
    group: '전라도',
    subDistricts: [
      { code: 'JEONBUK_JEONJU', name: '전주시' },
      { code: 'JEONBUK_GUNSAN', name: '군산시' },
      { code: 'JEONBUK_IMSIL', name: '임실군' },
      { code: 'JEONBUK_NAMWON', name: '남원시' },
      { code: 'JEONBUK_BUAN', name: '부안군' },
    ]
  },
  {
    code: 'JEONNAM',
    name: '전라남도',
    group: '전라도',
    subDistricts: [
      { code: 'JEONNAM_YEOSU', name: '여수시' },
      { code: 'JEONNAM_SUNCHEON', name: '순천시' },
      { code: 'JEONNAM_MOKPO', name: '목포시' },
      { code: 'JEONNAM_DAMYANG', name: '담양군' },
      { code: 'JEONNAM_SINAN', name: '신안군' },
    ]
  },
  {
    code: 'GYEONGBUK',
    name: '경상북도',
    group: '경상도',
    subDistricts: [
      { code: 'GYEONGBUK_GYEONGJU', name: '경주시' },
      { code: 'GYEONGBUK_POHANG', name: '포항시' },
      { code: 'GYEONGBUK_ANDONG', name: '안동시' },
      { code: 'GYEONGBUK_ULLEUNG', name: '울릉군(독도)' },
    ]
  },
  {
    code: 'GYEONGNAM',
    name: '경상남도',
    group: '경상도',
    subDistricts: [
      { code: 'GYEONGNAM_CHANGWON', name: '창원시' },
      { code: 'GYEONGNAM_TONGYEONG', name: '통영시' },
      { code: 'GYEONGNAM_GEOJE', name: '거제시' },
      { code: 'GYEONGNAM_NAMHAE', name: '남해군' },
      { code: 'GYEONGNAM_JINJU', name: '진주시' },
    ]
  },
  {
    code: 'JEJU',
    name: '제주특별자치도',
    group: '제주도',
    subDistricts: [
      { code: 'JEJU_CITY', name: '제주시' },
      { code: 'JEJU_SEOGWIPO', name: '서귀포시' },
      { code: 'JEJU_UDO', name: '우도' },
    ]
  }
];

// 2. Granular Granulated Municipalities & Sub-Districts (80+ 세부 시·군·구 단위)
export const KOREA_DETAILED_REGIONS: KoreaRegionData[] = [
  // --- 서울특별시 (Seoul Districts) ---
  { code: 'SEOUL_GANGNAM', name: '서울 강남구', group: '서울특별시' },
  { code: 'SEOUL_MAPO', name: '서울 마포구(홍대)', group: '서울특별시' },
  { code: 'SEOUL_JONGNO', name: '서울 종로구(경복궁)', group: '서울특별시' },
  { code: 'SEOUL_YONGSAN', name: '서울 용산구(이태원)', group: '서울특별시' },
  { code: 'SEOUL_SEONGDONG', name: '서울 성동구(성수동)', group: '서울특별시' },
  { code: 'SEOUL_SONGPA', name: '서울 송파구(잠실)', group: '서울특별시' },
  { code: 'SEOUL_SEOCHO', name: '서울 서초구(강남)', group: '서울특별시' },
  { code: 'SEOUL_YEONGDEUNGPO', name: '서울 영등포구(여의도)', group: '서울특별시' },
  { code: 'SEOUL_JUNG', name: '서울 중구(명동)', group: '서울특별시' },
  { code: 'SEOUL_SEODAEMUN', name: '서울 서대문구(신촌)', group: '서울특별시' },
  { code: 'SEOUL_GWANAK', name: '서울 관악구(샤로수길)', group: '서울특별시' },
  { code: 'SEOUL_GANGDONG', name: '서울 강동구', group: '서울특별시' },

  // --- 경기도 (Gyeonggi Municipalities) ---
  { code: 'GYEONGGI_SUWON', name: '경기 수원시(행궁동)', group: '경기도' },
  { code: 'GYEONGGI_SEONGNAM', name: '경기 성남시(분당/판교)', group: '경기도' },
  { code: 'GYEONGGI_GOYANG', name: '경기 고양시(일산)', group: '경기도' },
  { code: 'GYEONGGI_YONGIN', name: '경기 용인시(에버랜드)', group: '경기도' },
  { code: 'GYEONGGI_PAJU', name: '경기 파주시(헤이리)', group: '경기도' },
  { code: 'GYEONGGI_GAPYEONG', name: '경기 가평군(남이섬)', group: '경기도' },
  { code: 'GYEONGGI_YANGPYEONG', name: '경기 양평군(두물머리)', group: '경기도' },
  { code: 'GYEONGGI_BUCHEON', name: '경기 부천시', group: '경기도' },
  { code: 'GYEONGGI_ANSAN', name: '경기 안산시(대부도)', group: '경기도' },
  { code: 'GYEONGGI_HWASEONG', name: '경기 화성시(제부도)', group: '경기도' },
  { code: 'GYEONGGI_NAMYANGJU', name: '경기 남양주시', group: '경기도' },

  // --- 인천광역시 (Incheon Districts) ---
  { code: 'INCHEON_JUNG', name: '인천 중구(월미도/차이나타운)', group: '경기도' },
  { code: 'INCHEON_YEONSU', name: '인천 연수구(송도국제도시)', group: '경기도' },
  { code: 'INCHEON_GANGHWA', name: '인천 강화군(강화도)', group: '경기도' },
  { code: 'INCHEON_ONGJIN', name: '인천 옹진군(영종도/서해섬)', group: '경기도' },

  // --- 강원특별자치도 (Gangwon Cities) ---
  { code: 'GANGWON_GANGNEUNG', name: '강원 강릉시(경포대)', group: '강원도' },
  { code: 'GANGWON_SOKCHO', name: '강원 속초시(아바이마을)', group: '강원도' },
  { code: 'GANGWON_CHUNCHEON', name: '강원 춘천시(남이섬)', group: '강원도' },
  { code: 'GANGWON_PYEONGCHANG', name: '강원 평창군(대관령)', group: '강원도' },
  { code: 'GANGWON_YANGYANG', name: '강원 양양군(서피비치)', group: '강원도' },
  { code: 'GANGWON_WONJU', name: '강원 원주시', group: '강원도' },
  { code: 'GANGWON_GOSONG', name: '강원 고성군(화진포)', group: '강원도' },
  { code: 'GANGWON_JEONGSEON', name: '강원 정선군(하이원)', group: '강원도' },
  { code: 'GANGWON_DONGHAE', name: '강원 동해시(추암)', group: '강원도' },

  // --- 부산광역시 (Busan Districts) ---
  { code: 'BUSAN_HAEUNDAE', name: '부산 해운대구', group: '부산' },
  { code: 'BUSAN_SUYEONG', name: '부산 수영구(광안리)', group: '부산' },
  { code: 'BUSAN_BUSANJIN', name: '부산 부산진구(서면)', group: '부산' },
  { code: 'BUSAN_JUNG', name: '부산 중구(남포동/자갈치)', group: '부산' },
  { code: 'BUSAN_GIJANG', name: '부산 기장군(오시리아)', group: '부산' },
  { code: 'BUSAN_SAHA', name: '부산 사하구(감천문화마을)', group: '부산' },

  // --- 경상북도 (Gyeongbuk) ---
  { code: 'GYEONGBUK_GYEONGJU', name: '경북 경주시(황리단길)', group: '경상도' },
  { code: 'GYEONGBUK_POHANG', name: '경북 포항시(호미곶)', group: '경상도' },
  { code: 'GYEONGBUK_ANDONG', name: '경북 안동시(하회마을)', group: '경상도' },
  { code: 'GYEONGBUK_ULLEUNG', name: '경북 울릉군(독도)', group: '경상도' },

  // --- 경상남도 (Gyeongnam) ---
  { code: 'GYEONGNAM_TONGYEONG', name: '경남 통영시(동피랑)', group: '경상도' },
  { code: 'GYEONGNAM_GEOJE', name: '경남 거제시(바람의언덕)', group: '경상도' },
  { code: 'GYEONGNAM_NAMHAE', name: '경남 남해군(독일마을)', group: '경상도' },
  { code: 'GYEONGNAM_CHANGWON', name: '경남 창원시(진해군항제)', group: '경상도' },
  { code: 'GYEONGNAM_JINJU', name: '경남 진주시(유등축제)', group: '경상도' },

  // --- 대구/울산 ---
  { code: 'DAEGU_JUNG', name: '대구 중구(동성로)', group: '경상도' },
  { code: 'DAEGU_SUSEONG', name: '대구 수성구(수성못)', group: '경상도' },
  { code: 'ULSAN_NAM', name: '울산 남구(태화강)', group: '경상도' },

  // --- 전라남도 (Jeonnam) ---
  { code: 'JEONNAM_YEOSU', name: '전남 여수시(돌산도)', group: '전라도' },
  { code: 'JEONNAM_SUNCHEON', name: '전남 순천시(순천만)', group: '전라도' },
  { code: 'JEONNAM_MOKPO', name: '전남 목포시', group: '전라도' },
  { code: 'JEONNAM_DAMYANG', name: '전남 담양군(죽녹원)', group: '전라도' },
  { code: 'JEONNAM_SINAN', name: '전남 신안군(퍼플섬)', group: '전라도' },

  // --- 전북특별자치도 (Jeonbuk) ---
  { code: 'JEONBUK_JEONJU', name: '전북 전주시(한옥마을)', group: '전라도' },
  { code: 'JEONBUK_GUNSAN', name: '전북 군산시(선유도)', group: '전라도' },
  { code: 'JEONBUK_BUAN', name: '전북 부안군(채석강)', group: '전라도' },
  { code: 'JEONBUK_NAMWON', name: '전북 남원시(광한루)', group: '전라도' },

  // --- 광주광역시 ---
  { code: 'GWANGJU_DONG', name: '광주 동구(무등산)', group: '전라도' },

  // --- 충청남도/대전/세종 (Chungnam/Daejeon/Sejong) ---
  { code: 'CHUNGNAM_TAEAN', name: '충남 태안군(안면도)', group: '충청도' },
  { code: 'CHUNGNAM_CHEONAN', name: '충남 천안시', group: '충청도' },
  { code: 'CHUNGNAM_BUYEO', name: '충남 부여군(백제유적)', group: '충청도' },
  { code: 'CHUNGNAM_GONGJU', name: '충남 공주시', group: '충청도' },
  { code: 'DAEJEON_YUSEONG', name: '대전 유성구(온천)', group: '충청도' },
  { code: 'SEJONG_MAIN', name: '세종 특별자치시', group: '충청도' },

  // --- 충청북도 (Chungbuk) ---
  { code: 'CHUNGBUK_CHEONGJU', name: '충북 청주시', group: '충청도' },
  { code: 'CHUNGBUK_DANYANG', name: '충북 단양군(도담삼봉)', group: '충청도' },
  { code: 'CHUNGBUK_JEONCHON', name: '충북 제천시(청풍호)', group: '충청도' },

  // --- 제주특별자치도 (Jeju) ---
  { code: 'JEJU_CITY', name: '제주 제주시(애월/함덕)', group: '제주도' },
  { code: 'JEJU_SEOGWIPO', name: '제주 서귀포시(중문/성산)', group: '제주도' },
  { code: 'JEJU_UDO', name: '제주 우도', group: '제주도' },
  { code: 'JEJU_CHUJA', name: '제주 추자도', group: '제주도' },
];

export const KOREA_REGIONS = KOREA_DETAILED_REGIONS;

export const TOTAL_KOREA_PROVINCES_COUNT = KOREA_PROVINCES.length; // 17
export const TOTAL_KOREA_DETAILED_COUNT = KOREA_DETAILED_REGIONS.length; // 80+

export function getKoreaRegionByCode(code: string): KoreaRegionData | undefined {
  return (
    KOREA_DETAILED_REGIONS.find(r => r.code === code) ||
    KOREA_PROVINCES.find(r => r.code === code)
  );
}
