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
import { Search, Plus, Minus, Check, Star, Camera, ChevronRight } from 'lucide-react';

interface SidebarProps {
  tabMode: TabMode;
  statusMode: StatusMode;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  continentFilter: ContinentFilter;
  setContinentFilter: (c: ContinentFilter) => void;
  koreaFilter: KoreaFilter;
  setKoreaFilter: (k: KoreaFilter) => void;
  countries: CountryData[];
  koreaRegions: KoreaRegionData[];
  travelRecords: Record<string, TravelRecord>;
  photoRecords: Record<string, PhotoMeta[]>;
  onUpdateVisitCount: (code: string, type: 'country' | 'region', delta: number) => void;
  onSetStatus: (code: string, type: 'country' | 'region', action: 'visited' | 'wishlist' | 'clear') => void;
  onSelectTarget: (code: string, type: 'country' | 'region') => void;
  selectedCode: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tabMode,
  statusMode,
  searchQuery,
  setSearchQuery,
  continentFilter,
  setContinentFilter,
  koreaFilter,
  setKoreaFilter,
  countries,
  koreaRegions,
  travelRecords,
  photoRecords,
  onUpdateVisitCount,
  onSetStatus,
  onSelectTarget,
  selectedCode
}) => {
  const continentsList: ContinentFilter[] = [
    '전체',
    '아시아',
    '유럽',
    '북아메리카',
    '남아메리카',
    '오세아니아',
    '아프리카'
  ];

  const koreaGroupList: KoreaFilter[] = [
    '전체',
    '강원도',
    '서울특별시',
    '전라도',
    '충청도',
    '제주도',
    '부산',
    '경상도',
    '경기도'
  ];

  // Filter countries or regions
  const filteredCountries = countries.filter(c => {
    const matchesSearch =
      c.name.includes(searchQuery.trim()) ||
      c.nameEn.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesContinent =
      continentFilter === '전체' || c.continent === continentFilter;
    return matchesSearch && matchesContinent;
  });

  const filteredRegions = koreaRegions.filter(r => {
    const matchesSearch = r.name.includes(searchQuery.trim());
    const matchesGroup = koreaFilter === '전체' || r.group === koreaFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <aside className="w-full lg:w-[320px] bg-white border-r border-[#E5E2D9] text-[#1A1A1A] flex flex-col h-full overflow-hidden shrink-0">
      
      {/* 1. Search Box & Category Chips */}
      <div className="p-5 border-b border-[#E5E2D9] bg-white space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            id="sidebar-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={tabMode === 'overseas' ? "🔍 나라 검색" : "🔍 지역 검색"}
            className="w-full bg-[#F5F5F0] text-[#1A1A1A] text-xs pl-9 pr-4 py-2.5 rounded-lg border border-transparent focus:border-[#4B5E40] focus:bg-white focus:outline-none transition-all placeholder-gray-400 font-medium"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 flex-wrap">
          {tabMode === 'overseas'
            ? continentsList.map(item => (
                <button
                  key={item}
                  onClick={() => setContinentFilter(item)}
                  className={`px-3 py-1 text-[11px] rounded-full transition-colors ${
                    continentFilter === item
                      ? 'bg-[#4B5E40] text-white font-bold'
                      : 'border border-gray-200 text-gray-500 font-medium hover:border-[#4B5E40]'
                  }`}
                >
                  {item}
                </button>
              ))
            : koreaGroupList.map(item => (
                <button
                  key={item}
                  onClick={() => setKoreaFilter(item)}
                  className={`px-3 py-1 text-[11px] rounded-full transition-colors ${
                    koreaFilter === item
                      ? 'bg-[#4B5E40] text-white font-bold'
                      : 'border border-gray-200 text-gray-500 font-medium hover:border-[#4B5E40]'
                  }`}
                >
                  {item}
                </button>
              ))}
        </div>
      </div>

      {/* 2. Items List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {tabMode === 'overseas' ? (
          filteredCountries.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-8 font-medium">
              검색된 국가가 없습니다.
            </div>
          ) : (
            filteredCountries.map(country => {
              const rec = travelRecords[country.code] || { visited: false, visitCount: 0, wishlist: false };
              const photos = photoRecords[country.code] || [];
              const isSelected = selectedCode === country.code;

              return (
                <div
                  key={country.code}
                  className={`p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#F9F8F6] border border-[#E5E2D9] shadow-2xs'
                      : rec.visited
                      ? 'bg-[#F9F8F6]/70 border border-gray-200/80 hover:bg-[#F9F8F6]'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {/* Item info */}
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                    onClick={() => onSelectTarget(country.code, 'country')}
                  >
                    <span className="text-xl select-none">{country.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#1A1A1A] truncate flex items-center gap-1.5">
                        {country.name}
                        {photos.length > 0 && (
                          <span className="inline-flex items-center text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                            <Camera className="w-2.5 h-2.5 mr-0.5 inline" /> {photos.length}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate font-mono">{country.nameEn}</div>
                    </div>
                  </div>

                  {/* Actions & Visit Counter */}
                  <div className="flex items-center gap-2">
                    {/* Checkmark button for Visited */}
                    <button
                      title="방문 완료 토글"
                      onClick={() => {
                        if (rec.visited) {
                          onSetStatus(country.code, 'country', 'clear');
                        } else {
                          onSetStatus(country.code, 'country', 'visited');
                        }
                      }}
                      className={`p-1.5 rounded-md text-xs transition-colors ${
                        rec.visited
                          ? 'text-[#4B5E40] font-bold bg-[#4B5E40]/10'
                          : 'text-gray-300 hover:text-[#4B5E40]'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Star button for Wishlist */}
                    <button
                      title="위시 토글"
                      onClick={() => {
                        if (rec.wishlist) {
                          onSetStatus(country.code, 'country', 'clear');
                        } else {
                          onSetStatus(country.code, 'country', 'wishlist');
                        }
                      }}
                      className={`p-1.5 rounded-md text-xs transition-colors ${
                        rec.wishlist
                          ? 'text-[#D4A373] font-bold bg-[#D4A373]/10'
                          : 'text-gray-300 hover:text-[#D4A373]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${rec.wishlist ? 'fill-[#D4A373]' : ''}`} />
                    </button>

                    {/* Counter Controls (- number +) */}
                    {rec.visited && (
                      <div className="flex items-center bg-white rounded-md border border-gray-200 px-1 py-0.5 ml-1 shadow-2xs">
                        <button
                          title="방문 횟수 감소"
                          onClick={() => onUpdateVisitCount(country.code, 'country', -1)}
                          className="text-gray-400 hover:text-red-500 px-1 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1.5 text-[#4B5E40] min-w-[1.2rem] text-center">
                          {rec.visitCount}
                        </span>
                        <button
                          title="방문 횟수 증가"
                          onClick={() => onUpdateVisitCount(country.code, 'country', +1)}
                          className="text-gray-400 hover:text-green-600 px-1 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : filteredRegions.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-8 font-medium">
            검색된 지역이 없습니다.
          </div>
        ) : (
          filteredRegions.map(region => {
            const rec = travelRecords[region.code] || { visited: false, visitCount: 0, wishlist: false };
            const photos = photoRecords[region.code] || [];
            const isSelected = selectedCode === region.code;

            return (
              <div
                key={region.code}
                className={`p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#F9F8F6] border border-[#E5E2D9] shadow-2xs'
                    : rec.visited
                    ? 'bg-[#F9F8F6]/70 border border-gray-200/80 hover:bg-[#F9F8F6]'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                {/* Item info */}
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                  onClick={() => onSelectTarget(region.code, 'region')}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#4B5E40]/10 text-[#4B5E40] border border-[#4B5E40]/20 flex items-center justify-center font-bold text-xs shrink-0">
                    {region.name.substring(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#1A1A1A] truncate flex items-center gap-1.5">
                      {region.name}
                      {photos.length > 0 && (
                        <span className="inline-flex items-center text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                          <Camera className="w-2.5 h-2.5 mr-0.5 inline" /> {photos.length}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {region.subDistricts ? `${region.subDistricts.length}개 시·군·구` : region.group}
                    </div>
                  </div>
                </div>

                {/* Actions & Visit Counter */}
                <div className="flex items-center gap-2">
                  <button
                    title="방문 완료 토글"
                    onClick={() => {
                      if (rec.visited) {
                        onSetStatus(region.code, 'region', 'clear');
                      } else {
                        onSetStatus(region.code, 'region', 'visited');
                      }
                    }}
                    className={`p-1.5 rounded-md text-xs transition-colors ${
                      rec.visited
                        ? 'text-[#4B5E40] font-bold bg-[#4B5E40]/10'
                        : 'text-gray-300 hover:text-[#4B5E40]'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    title="위시 토글"
                    onClick={() => {
                      if (rec.wishlist) {
                        onSetStatus(region.code, 'region', 'clear');
                      } else {
                        onSetStatus(region.code, 'region', 'wishlist');
                      }
                    }}
                    className={`p-1.5 rounded-md text-xs transition-colors ${
                      rec.wishlist
                        ? 'text-[#D4A373] font-bold bg-[#D4A373]/10'
                        : 'text-gray-300 hover:text-[#D4A373]'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${rec.wishlist ? 'fill-[#D4A373]' : ''}`} />
                  </button>

                  {rec.visited && (
                    <div className="flex items-center bg-white rounded-md border border-gray-200 px-1 py-0.5 ml-1 shadow-2xs">
                      <button
                        title="방문 횟수 감소"
                        onClick={() => onUpdateVisitCount(region.code, 'region', -1)}
                        className="text-gray-400 hover:text-red-500 px-1 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold px-1.5 text-[#4B5E40] min-w-[1.2rem] text-center">
                        {rec.visitCount}
                      </span>
                      <button
                        title="방문 횟수 증가"
                        onClick={() => onUpdateVisitCount(region.code, 'region', +1)}
                        className="text-gray-400 hover:text-green-600 px-1 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </aside>
  );
};
