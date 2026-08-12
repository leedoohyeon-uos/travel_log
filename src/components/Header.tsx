import React from 'react';
import { TabMode, StatusMode } from '../types';
import { TOTAL_COUNTRIES_COUNT } from '../data/country-data';
import { TOTAL_KOREA_DETAILED_COUNT } from '../data/korea-data';
import { User } from 'firebase/auth';
import { UserProfileDoc } from '../services/adminService';
import { LogIn, LogOut, Globe2, MapPin, CheckCircle2, Star, Eye, Camera, Sparkles, Shield, Users } from 'lucide-react';

interface HeaderProps {
  tabMode: TabMode;
  setTabMode: (mode: TabMode) => void;
  statusMode: StatusMode;
  setStatusMode: (mode: StatusMode) => void;
  visitedCount: number;
  wishlistCount: number;
  currentUser: (User & { isGuest?: boolean }) | null;
  userRole?: 'admin' | 'trial' | 'user';
  userRegistryList?: UserProfileDoc[];
  adminSelectedUid?: string;
  onSelectAdminUser?: (uid: string) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tabMode,
  setTabMode,
  statusMode,
  setStatusMode,
  visitedCount,
  wishlistCount,
  currentUser,
  userRole = 'user',
  userRegistryList = [],
  adminSelectedUid = '',
  onSelectAdminUser,
  onOpenAuthModal,
  onLogout
}) => {
  const totalCount = tabMode === 'overseas' ? TOTAL_COUNTRIES_COUNT : TOTAL_KOREA_DETAILED_COUNT;
  const progressPercent = Math.round((visitedCount / totalCount) * 100) || 0;
  const unitLabel = tabMode === 'overseas' ? '개국' : '개 세부 지역';
  const isAdmin = userRole === 'admin';

  return (
    <header className="bg-white border-b border-[#E5E2D9] text-[#1A1A1A] px-3 sm:px-6 py-2 sm:py-3 sticky top-0 z-30 shadow-xs shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Title branding */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-gray-400 font-medium">너는 어디까지 가봤니?</span>
            <h1 className="text-lg sm:text-2xl font-serif italic text-[#3A3A3A] tracking-tight flex items-center gap-2">
              이두현의 travel log
            </h1>
          </div>

          {/* Overseas / Domestic toggle button */}
          <div className="bg-[#F5F5F0] p-0.5 sm:p-1 rounded-lg flex items-center border border-[#E5E2D9]">
            <button
              id="btn-tab-overseas"
              onClick={() => setTabMode('overseas')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                tabMode === 'overseas'
                  ? 'bg-[#4B5E40] text-white shadow-xs'
                  : 'text-[#4B5E40] hover:bg-gray-200/60'
              }`}
            >
              <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              해외
            </button>
            <button
              id="btn-tab-domestic"
              onClick={() => setTabMode('domestic')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                tabMode === 'domestic'
                  ? 'bg-[#4B5E40] text-white shadow-xs'
                  : 'text-[#4B5E40] hover:bg-gray-200/60'
              }`}
            >
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              국내<span className="hidden sm:inline"> (세부 시·군·구)</span>
            </button>
          </div>
        </div>

        {/* Status Mode Selectors */}
        <div className="flex items-center gap-1 bg-[#F0EFEC] p-1 rounded-full border border-[#E5E2D9] overflow-x-auto max-w-full w-full md:w-auto justify-start md:justify-center no-scrollbar">
          <button
            id="status-mode-visited"
            onClick={() => setStatusMode('visited')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusMode === 'visited'
                ? 'bg-white text-[#1A1A1A] shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:bg-white/50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${statusMode === 'visited' ? 'text-[#4B5E40]' : 'text-gray-400'}`} />
            방문 완료
          </button>

          <button
            id="status-mode-wishlist"
            onClick={() => setStatusMode('wishlist')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusMode === 'wishlist'
                ? 'bg-white text-[#1A1A1A] shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:bg-white/50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${statusMode === 'wishlist' ? 'text-[#D4A373] fill-[#D4A373]' : 'text-gray-400'}`} />
            위시
          </button>

          <button
            id="status-mode-all"
            onClick={() => setStatusMode('all')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusMode === 'all'
                ? 'bg-white text-[#1A1A1A] shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:bg-white/50'
            }`}
          >
            <Eye className={`w-3.5 h-3.5 ${statusMode === 'all' ? 'text-[#4B5E40]' : 'text-gray-400'}`} />
            전체 보기
          </button>

          <button
            id="status-mode-photo"
            onClick={() => setStatusMode('photo')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusMode === 'photo'
                ? 'bg-white text-[#1A1A1A] shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:bg-white/50'
            }`}
          >
            <Camera className={`w-3.5 h-3.5 ${statusMode === 'photo' ? 'text-[#4B5E40]' : 'text-gray-400'}`} />
            📷 사진
          </button>
        </div>

        {/* Progress Display & Account Control */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#E5E2D9] pt-2 md:pt-0">
          
          {/* Admin User Selector */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 p-1 px-2.5 rounded-xl border border-amber-300 font-bold text-xs shadow-2xs">
              <Users className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="shrink-0 text-amber-800">사용자:</span>
              <select
                id="select-admin-user"
                value={adminSelectedUid}
                onChange={(e) => onSelectAdminUser?.(e.target.value)}
                className="bg-white text-gray-900 font-bold border border-amber-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[170px] truncate"
              >
                {userRegistryList.map(u => (
                  <option key={u.uid} value={u.uid}>
                    {u.email} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col text-right">
            <div className="text-xs font-bold text-gray-700 flex items-center justify-end gap-2">
              <span className="text-[#4B5E40]">✓ {visitedCount} / {totalCount}{unitLabel}</span>
              <span className="text-gray-400 text-[11px] font-medium">({progressPercent}%)</span>
              <span className="text-[#D4A373] text-xs font-medium ml-1">★ {wishlistCount}</span>
            </div>
            {/* Horizontal progress bar */}
            <div className="w-36 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden border border-gray-200">
              <div
                className="h-full bg-[#4B5E40] transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* User Auth Info */}
          <div>
            {currentUser ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-red-100 text-red-800 font-bold px-2 py-1 rounded-md border border-red-300">
                    <Shield className="w-3 h-3 text-red-600" /> 관리자 모드
                  </span>
                ) : userRole === 'trial' || currentUser.isGuest ? (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded-md border border-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-600" /> 체험 계정
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 max-w-[120px] truncate hidden sm:inline" title={currentUser.email || ''}>
                    {currentUser.email}
                  </span>
                )}
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1 bg-white hover:bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-[#E5E2D9] font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{currentUser.isGuest ? '테스트 종료' : 'LOGOUT'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-open-login"
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 bg-[#4B5E40] hover:bg-[#3d4d34] text-white text-xs px-3.5 py-1.5 rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  로그인 / 회원가입
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
