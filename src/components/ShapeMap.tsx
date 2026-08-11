import React from 'react';
import {
  TabMode,
  StatusMode,
  ContinentFilter,
  KoreaFilter,
  CountryData,
  KoreaRegionData,
  TravelRecord,
  PhotoMeta
} from '../types';
import { Check, Star, Camera, Plus, Minus } from 'lucide-react';

interface ShapeMapProps {
  tabMode: TabMode;
  statusMode: StatusMode;
  continentFilter: ContinentFilter;
  koreaFilter: KoreaFilter;
  countries: CountryData[];
  koreaRegions: KoreaRegionData[];
  travelRecords: Record<string, TravelRecord>;
  photoRecords: Record<string, PhotoMeta[]>;
  selectedCode: string | null;
  onSelectTarget: (code: string, type: 'country' | 'region') => void;
  onSetStatus: (code: string, type: 'country' | 'region', action: 'visited' | 'wishlist' | 'clear') => void;
  onUpdateVisitCount: (code: string, type: 'country' | 'region', delta: number) => void;
  searchQuery?: string;
  isDetailedKorea?: boolean;
}

/**
 * ShapeMap Component (도형/타일 형태 클릭 테스트용 샘플 지도)
 * 
 * [실제 지도 적용 안내]:
 * 현재는 직관적인 영역 클릭 테스트를 위한 도형 grid 샘플 카드를 사용하고 있습니다.
 * 향후 실제 인터랙티브 지도 데이터로 교체할 경우, 이 컴포넌트를 실제 지도 API(Naver/Kakao Maps, Leaflet, Google Maps 등)의
 * 커스텀 Polygon/Marker 레이어 또는 SVG/GeoJSON 캔버스 컴포넌트로 교체하면 됩니다.
 * 예: // 실제 지도 적용 시 이 부분을 실제 지도 데이터/API로 교체
 */
export const ShapeMap: React.FC<ShapeMapProps> = ({
  tabMode,
  statusMode,
  continentFilter,
  koreaFilter,
  countries,
  koreaRegions,
  travelRecords,
  photoRecords,
  selectedCode,
  onSelectTarget,
  onSetStatus,
  onUpdateVisitCount,
  searchQuery = '',
  isDetailedKorea = true
}) => {
  // Filter items
  const filteredCountries = countries.filter(c => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q);
    const matchesContinent = continentFilter === '전체' || c.continent === continentFilter;
    return matchesSearch && matchesContinent;
  });

  const filteredRegions = koreaRegions.filter(r => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || r.name.toLowerCase().includes(q);
    const matchesGroup = koreaFilter === '전체' || r.group === koreaFilter;
    return matchesSearch && matchesGroup;
  });

  // Helper for background color
  const getTileStyle = (code: string) => {
    const rec = travelRecords[code];
    if (!rec) return 'bg-[#CBD3C8] text-[#2A3B24] border-white/80 hover:bg-[#b8c2b5]';

    if (rec.visited) {
      switch (Math.min(5, rec.visitCount)) {
        case 1:
          return 'bg-[#A8B7A1] text-white border-[#8BA184] shadow-xs hover:bg-[#97a790]';
        case 2:
          return 'bg-[#8BA184] text-white border-[#6B8364] shadow-xs hover:bg-[#7a9073]';
        case 3:
          return 'bg-[#6B8364] text-white border-[#4B5E40] shadow-sm hover:bg-[#5b7254]';
        case 4:
          return 'bg-[#4B5E40] text-white border-[#36472D] shadow-sm hover:bg-[#3d4d34]';
        case 5:
        default:
          return 'bg-[#36472D] text-white border-[#23311c] shadow-md hover:bg-[#283620]';
      }
    }

    if (rec.wishlist) {
      return 'bg-[#D4A373] text-white border-[#c29161] shadow-xs hover:bg-[#c29161]';
    }

    return 'bg-[#CBD3C8] text-[#2A3B24] border-white/80 hover:bg-[#b8c2b5]';
  };

  return (
    <div className="w-full h-full min-h-[520px] bg-[#E6E8E3] overflow-y-auto p-6 flex flex-col justify-between select-none">
      
      {/* Header Info Banner */}
      <div className="flex items-center justify-between mb-4 bg-white/80 backdrop-blur px-4 py-2.5 rounded-xl border border-[#E5E2D9] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#4B5E40] animate-pulse"></span>
          <span className="text-xs font-bold text-[#3A3A3A]">
            📐 {tabMode === 'overseas' ? '해외 국가 도형 샘플 지도' : '국내 세부 지역 도형 샘플 지도'}
          </span>
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            (각 도형 영역을 바로 클릭하여 방문 여부, 횟수, 사진을 테스트하세요)
          </span>
        </div>

        <div className="text-xs font-semibold text-[#4B5E40] bg-[#F0EFEC] px-3 py-1 rounded-full border border-[#E5E2D9]">
          총 {tabMode === 'overseas' ? filteredCountries.length : filteredRegions.length}개 영역
        </div>
      </div>

      {/* Grid Layout of Tiles */}
      <div className="flex-1 overflow-y-auto pr-1">
        {tabMode === 'overseas' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredCountries.map(country => {
              const rec = travelRecords[country.code] || { visited: false, visitCount: 0, wishlist: false };
              const photos = photoRecords[country.code] || [];
              const isSelected = selectedCode === country.code;
              const styleClass = getTileStyle(country.code);

              return (
                <div
                  key={country.code}
                  onClick={() => {
                    onSelectTarget(country.code, 'country');
                    if (statusMode === 'visited') {
                      if (!rec.visited) {
                        onSetStatus(country.code, 'country', 'visited');
                      }
                    } else if (statusMode === 'wishlist') {
                      onSetStatus(country.code, 'country', rec.wishlist ? 'clear' : 'wishlist');
                    }
                  }}
                  className={`relative cursor-pointer rounded-2xl p-3.5 border-2 transition-all transform hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[105px] ${styleClass} ${
                    isSelected ? 'ring-4 ring-[#4B5E40] ring-offset-2 scale-102 z-10' : ''
                  }`}
                >
                  {/* Top Flag & Status Badges */}
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-2xl drop-shadow-xs">{country.flag}</span>
                    
                    <div className="flex items-center gap-1">
                      {photos.length > 0 && (
                        <span className="inline-flex items-center text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                          <Camera className="w-2.5 h-2.5 mr-0.5" /> {photos.length}
                        </span>
                      )}
                      {rec.visited && (
                        <span className="text-[10px] font-extrabold bg-white/25 backdrop-blur px-1.5 py-0.5 rounded-full text-white border border-white/40">
                          ✓ {rec.visitCount}회
                        </span>
                      )}
                      {rec.wishlist && (
                        <span className="text-[10px] font-extrabold bg-white/30 backdrop-blur px-1.5 py-0.5 rounded-full text-white border border-white/40">
                          ★ 위시
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mt-1">
                    <div className="font-bold text-xs leading-tight truncate">{country.name}</div>
                    <div className="text-[10px] opacity-80 truncate font-mono">{country.nameEn}</div>
                  </div>

                  {/* Visit Counter Buttons on Hover/Selection if visited */}
                  {rec.visited && (
                    <div
                      className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-xs"
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="text-[10px] opacity-90 font-medium">방문 횟수</span>
                      <div className="flex items-center bg-black/20 rounded-lg px-1 py-0.5">
                        <button
                          title="방문 횟수 감소"
                          onClick={() => onUpdateVisitCount(country.code, 'country', -1)}
                          className="hover:bg-white/20 text-white w-4 h-4 flex items-center justify-center rounded font-bold text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 font-bold text-xs">{rec.visitCount}</span>
                        <button
                          title="방문 횟수 증가"
                          onClick={() => onUpdateVisitCount(country.code, 'country', 1)}
                          className="hover:bg-white/20 text-white w-4 h-4 flex items-center justify-center rounded font-bold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Domestic Regions Shape Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredRegions.map(region => {
              const rec = travelRecords[region.code] || { visited: false, visitCount: 0, wishlist: false };
              const photos = photoRecords[region.code] || [];
              const isSelected = selectedCode === region.code;
              const styleClass = getTileStyle(region.code);

              return (
                <div
                  key={region.code}
                  onClick={() => {
                    onSelectTarget(region.code, 'region');
                    if (statusMode === 'visited') {
                      if (!rec.visited) {
                        onSetStatus(region.code, 'region', 'visited');
                      }
                    } else if (statusMode === 'wishlist') {
                      onSetStatus(region.code, 'region', rec.wishlist ? 'clear' : 'wishlist');
                    }
                  }}
                  className={`relative cursor-pointer rounded-2xl p-3.5 border-2 transition-all transform hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[105px] ${styleClass} ${
                    isSelected ? 'ring-4 ring-[#4B5E40] ring-offset-2 scale-102 z-10' : ''
                  }`}
                >
                  {/* Top Badge & Status */}
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur border border-white/30 truncate max-w-[80px]">
                      {region.group}
                    </span>

                    <div className="flex items-center gap-1">
                      {photos.length > 0 && (
                        <span className="inline-flex items-center text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                          <Camera className="w-2.5 h-2.5 mr-0.5" /> {photos.length}
                        </span>
                      )}
                      {rec.visited && (
                        <span className="text-[10px] font-extrabold bg-white/25 backdrop-blur px-1.5 py-0.5 rounded-full text-white border border-white/40">
                          ✓ {rec.visitCount}회
                        </span>
                      )}
                      {rec.wishlist && (
                        <span className="text-[10px] font-extrabold bg-white/30 backdrop-blur px-1.5 py-0.5 rounded-full text-white border border-white/40">
                          ★ 위시
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mt-1">
                    <div className="font-bold text-xs leading-tight truncate">{region.name}</div>
                    {region.subDistricts && region.subDistricts.length > 0 && (
                      <div className="text-[10px] opacity-80 truncate">
                        {region.subDistricts.length}개 세부 지역
                      </div>
                    )}
                  </div>

                  {/* Visit Counter Buttons on Hover/Selection if visited */}
                  {rec.visited && (
                    <div
                      className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-xs"
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="text-[10px] opacity-90 font-medium">방문 횟수</span>
                      <div className="flex items-center bg-black/20 rounded-lg px-1 py-0.5">
                        <button
                          title="방문 횟수 감소"
                          onClick={() => onUpdateVisitCount(region.code, 'region', -1)}
                          className="hover:bg-white/20 text-white w-4 h-4 flex items-center justify-center rounded font-bold text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 font-bold text-xs">{rec.visitCount}</span>
                        <button
                          title="방문 횟수 증가"
                          onClick={() => onUpdateVisitCount(region.code, 'region', 1)}
                          className="hover:bg-white/20 text-white w-4 h-4 flex items-center justify-center rounded font-bold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Map Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-white/60 shadow-xs text-xs text-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#CBD3C8] rounded-xs border border-white"></div>
          <span className="text-[11px] text-gray-600 font-medium">미방문</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#A8B7A1] rounded-xs"></div>
          <div className="w-3 h-3 bg-[#8BA184] rounded-xs"></div>
          <div className="w-3 h-3 bg-[#4B5E40] rounded-xs"></div>
          <span className="text-[11px] text-gray-600 font-medium ml-1">방문 완료 (색상이 진할수록 다수 방문)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#D4A373] rounded-xs"></div>
          <span className="text-[11px] text-gray-600 font-medium">위시리스트</span>
        </div>
      </div>

    </div>
  );
};
