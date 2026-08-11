import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, logoutUser } from './services/authService';
import {
  fetchUserTravelData,
  updateVisitCount,
  setTravelStatus,
  deletePhoto
} from './services/dbService';
import { uploadTravelPhoto } from './services/photoService';

import {
  TabMode,
  StatusMode,
  ContinentFilter,
  KoreaFilter,
  TravelRecord,
  PhotoMeta
} from './types';
import { WORLD_COUNTRIES, getCountryByCode } from './data/country-data';
import { KOREA_REGIONS, KOREA_PROVINCES, getKoreaRegionByCode } from './data/korea-data';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WorldMap } from './components/WorldMap';
import { KoreaMap } from './components/KoreaMap';
import { PhotoModal } from './components/PhotoModal';
import { AuthModal } from './components/AuthModal';

import { Globe2, Sparkles } from 'lucide-react';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [guestUser, setGuestUser] = useState<(User & { isGuest: boolean }) | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // App UI State
  const [tabMode, setTabMode] = useState<TabMode>('overseas');
  const [statusMode, setStatusMode] = useState<StatusMode>('visited');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [continentFilter, setContinentFilter] = useState<ContinentFilter>('전체');
  const [koreaFilter, setKoreaFilter] = useState<KoreaFilter>('전체');

  // Selected Target
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);

  // Travel Data
  const [travelRecords, setTravelRecords] = useState<Record<string, TravelRecord>>({});
  const [photoRecords, setPhotoRecords] = useState<Record<string, PhotoMeta[]>>({});

  const currentUser = guestUser || firebaseUser;

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setFirebaseUser(user);
      setAuthInitialized(true);

      if (user && !guestUser) {
        setDataLoading(true);
        const data = await fetchUserTravelData(user.uid);
        setTravelRecords({ ...data.countries, ...data.regions });
        setPhotoRecords({ ...data.countryPhotos, ...data.regionPhotos });
        setDataLoading(false);
      } else if (!user && !guestUser) {
        setTravelRecords({});
        setPhotoRecords({});
      }
    });

    return () => unsubscribe();
  }, [guestUser]);

  // 2. Start Guest Test Account Session
  const handleStartTestGuestSession = () => {
    const fakeGuest = {
      uid: 'guest_test_session_' + Date.now(),
      email: 'guest@travel-log.test',
      displayName: '테스트 계정',
      isGuest: true
    } as any;

    setGuestUser(fakeGuest);

    // Initial sample test records for instant clicking and testing
    setTravelRecords({
      'JPN': { visited: true, visitCount: 2, wishlist: false, updatedAt: Date.now() },
      'FRA': { visited: true, visitCount: 1, wishlist: false, updatedAt: Date.now() },
      'USA': { visited: false, visitCount: 0, wishlist: true, updatedAt: Date.now() },
      'SEOUL_GANGNAM': { visited: true, visitCount: 3, wishlist: false, updatedAt: Date.now() },
      'GANGWON_GANGNEUNG': { visited: true, visitCount: 1, wishlist: false, updatedAt: Date.now() },
      'JEJU_SEOGWIPO': { visited: false, visitCount: 0, wishlist: true, updatedAt: Date.now() }
    });

    setPhotoRecords({});
    setIsAuthModalOpen(false);
  };

  // 3. Logout / Exit Session
  const handleLogout = async () => {
    if (guestUser) {
      setGuestUser(null);
      setTravelRecords({});
      setPhotoRecords({});
    } else {
      await logoutUser();
    }
  };

  // Calculate visited & wishlist totals for Header counter
  const visitedCount = Object.keys(travelRecords).filter(code => {
    const isOverseasCode = WORLD_COUNTRIES.some(c => c.code === code);
    const isDomesticCode = KOREA_REGIONS.some(r => r.code === code);

    if (tabMode === 'overseas' && isOverseasCode) return travelRecords[code]?.visited;
    if (tabMode === 'domestic' && isDomesticCode) return travelRecords[code]?.visited;
    return false;
  }).length;

  const wishlistCount = Object.keys(travelRecords).filter(code => {
    const isOverseasCode = WORLD_COUNTRIES.some(c => c.code === code);
    const isDomesticCode = KOREA_REGIONS.some(r => r.code === code);

    if (tabMode === 'overseas' && isOverseasCode) return travelRecords[code]?.wishlist;
    if (tabMode === 'domestic' && isDomesticCode) return travelRecords[code]?.wishlist;
    return false;
  }).length;

  // Helper: check auth before mutating
  const ensureAuthenticated = (): boolean => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Select target country/region handler
  const handleSelectTarget = async (code: string, type: 'country' | 'region') => {
    setSelectedCode(code);

    if (statusMode === 'visited') {
      if (!ensureAuthenticated()) return;
      const currentRec = travelRecords[code] || { visited: false, visitCount: 0, wishlist: false };
      
      if (!currentRec.visited) {
        await handleSetStatus(code, type, 'visited');
      } else {
        await handleUpdateVisitCount(code, type, 1);
      }
    } else if (statusMode === 'wishlist') {
      if (!ensureAuthenticated()) return;
      const currentRec = travelRecords[code] || { visited: false, visitCount: 0, wishlist: false };
      if (!currentRec.wishlist) {
        await handleSetStatus(code, type, 'wishlist');
      } else {
        await handleSetStatus(code, type, 'clear');
      }
    } else if (statusMode === 'photo') {
      const currentRec = travelRecords[code] || { visited: false, visitCount: 0, wishlist: false };
      if (currentRec.visited) {
        setIsPhotoModalOpen(true);
      } else {
        alert("방문 완료 처리된 국가/지역만 사진을 업로드하거나 확인할 수 있습니다.");
      }
    }
  };

  // Update Visit Count (+1 or -1)
  const handleUpdateVisitCount = async (code: string, type: 'country' | 'region', delta: number) => {
    if (!ensureAuthenticated() || !currentUser) return;

    if (currentUser.isGuest) {
      // In Guest Mode: memory state update
      const curr = travelRecords[code] || { visited: false, visitCount: 0, wishlist: false };
      const newCount = Math.max(0, (curr.visitCount || 0) + delta);
      const newVisited = newCount > 0;
      setTravelRecords(prev => ({
        ...prev,
        [code]: { visited: newVisited, visitCount: newCount, wishlist: newVisited ? false : curr.wishlist, updatedAt: Date.now() }
      }));
      return;
    }

    const currentPhotos = photoRecords[code] || [];
    const { updatedRecord, remainingPhotos } = await updateVisitCount(
      currentUser.uid,
      code,
      type,
      delta,
      currentPhotos
    );

    setTravelRecords(prev => ({ ...prev, [code]: updatedRecord }));
    setPhotoRecords(prev => ({ ...prev, [code]: remainingPhotos }));
  };

  // Set Status ('visited' | 'wishlist' | 'clear')
  const handleSetStatus = async (
    code: string,
    type: 'country' | 'region',
    action: 'visited' | 'wishlist' | 'clear'
  ) => {
    if (!ensureAuthenticated() || !currentUser) return;

    if (currentUser.isGuest) {
      // In Guest Mode: memory state update
      let newRec: TravelRecord = { visited: false, visitCount: 0, wishlist: false, updatedAt: Date.now() };
      if (action === 'visited') newRec = { visited: true, visitCount: 1, wishlist: false, updatedAt: Date.now() };
      else if (action === 'wishlist') newRec = { visited: false, visitCount: 0, wishlist: true, updatedAt: Date.now() };

      setTravelRecords(prev => ({ ...prev, [code]: newRec }));
      return;
    }

    const currentPhotos = photoRecords[code] || [];
    const { updatedRecord, remainingPhotos } = await setTravelStatus(
      currentUser.uid,
      code,
      type,
      action,
      currentPhotos
    );

    setTravelRecords(prev => ({ ...prev, [code]: updatedRecord }));
    setPhotoRecords(prev => ({ ...prev, [code]: remainingPhotos }));
  };

  // Upload Photo
  const handleUploadPhoto = async (file: File) => {
    if (!ensureAuthenticated() || !currentUser || !selectedCode) return;
    const targetType = tabMode === 'overseas' ? 'country' : 'region';

    if (currentUser.isGuest) {
      // Guest local blob photo upload
      const localUrl = URL.createObjectURL(file);
      const guestPhoto: PhotoMeta = {
        photoId: 'guest_photo_' + Date.now(),
        storagePath: '',
        downloadURL: localUrl,
        createdAt: Date.now(),
        targetCode: selectedCode,
        targetType
      };
      setPhotoRecords(prev => ({
        ...prev,
        [selectedCode]: [...(prev[selectedCode] || []), guestPhoto]
      }));
      return;
    }

    const photoMeta = await uploadTravelPhoto(currentUser.uid, selectedCode, targetType, file);
    setPhotoRecords(prev => ({
      ...prev,
      [selectedCode]: [...(prev[selectedCode] || []), photoMeta]
    }));
  };

  // Delete Photo
  const handleDeletePhoto = async (photoId: string, storagePath: string) => {
    if (!ensureAuthenticated() || !currentUser || !selectedCode) return;
    const targetType = tabMode === 'overseas' ? 'country' : 'region';

    if (currentUser.isGuest) {
      setPhotoRecords(prev => ({
        ...prev,
        [selectedCode]: (prev[selectedCode] || []).filter(p => p.photoId !== photoId)
      }));
      return;
    }

    await deletePhoto(currentUser.uid, selectedCode, targetType, photoId, storagePath);
    setPhotoRecords(prev => ({
      ...prev,
      [selectedCode]: (prev[selectedCode] || []).filter(p => p.photoId !== photoId)
    }));
  };

  // Target metadata for PhotoModal
  const selectedMeta = selectedCode
    ? tabMode === 'overseas'
      ? getCountryByCode(selectedCode)
      : getKoreaRegionByCode(selectedCode)
    : null;

  const selectedTravelRecord = selectedCode
    ? travelRecords[selectedCode] || { visited: false, visitCount: 0, wishlist: false }
    : { visited: false, visitCount: 0, wishlist: false };

  const selectedPhotos = selectedCode ? photoRecords[selectedCode] || [] : [];

  // Loading Screen
  if (!authInitialized || dataLoading) {
    return (
      <div className="fixed inset-0 bg-[#F9F8F6] text-[#1A1A1A] flex flex-col items-center justify-center gap-3">
        <Globe2 className="w-12 h-12 text-[#4B5E40] animate-spin" />
        <div className="text-sm font-semibold text-[#3A3A3A]">Travel Log 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F9F8F6] font-sans text-[#1A1A1A]">
      
      {/* Top Header */}
      <Header
        tabMode={tabMode}
        setTabMode={(mode) => {
          setTabMode(mode);
          setSelectedCode(null);
        }}
        statusMode={statusMode}
        setStatusMode={setStatusMode}
        visitedCount={visitedCount}
        wishlistCount={wishlistCount}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Guest Banner Notice */}
      {currentUser?.isGuest && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs px-6 py-2 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
            <span>
              <strong>🧪 테스트용 계정 접속 중:</strong> 이 화면을 닫거나 종료하면 작성한 테스트 기록이 초기화됩니다.
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-amber-900 underline hover:text-amber-950 font-bold ml-4"
          >
            테스트 종료
          </button>
        </div>
      )}

      {/* Main Content Area (Sidebar + Map) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Sidebar */}
        <Sidebar
          tabMode={tabMode}
          statusMode={statusMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          continentFilter={continentFilter}
          setContinentFilter={setContinentFilter}
          koreaFilter={koreaFilter}
          setKoreaFilter={setKoreaFilter}
          countries={WORLD_COUNTRIES}
          koreaRegions={KOREA_REGIONS}
          travelRecords={travelRecords}
          photoRecords={photoRecords}
          onUpdateVisitCount={(code, type, delta) => handleUpdateVisitCount(code, type, delta)}
          onSetStatus={(code, type, action) => handleSetStatus(code, type, action)}
          onSelectTarget={(code, type) => handleSelectTarget(code, type)}
          selectedCode={selectedCode}
        />

        {/* Map View Area */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#E6E8E3] flex flex-col">
          
          {/*
            [실제 지도 적용 안내]:
            현재 해외/국내 탭 선택에 따라 WorldMap 및 KoreaMap이 직접 렌더링됩니다.
            향후 실제 지도 데이터나 외부 지도 API (예: Google Maps, Naver Maps, Kakao Maps, Leaflet 등)
            연동 시 아래 WorldMap 또는 KoreaMap 컴포넌트 내부의 GeoJSON/Tile 로직 또는
            지도 SDK 컴포넌트로 교체해 주시면 됩니다.
            예: // 실제 지도 적용 시 이 부분을 실제 지도 데이터/API로 교체
          */}
          {tabMode === 'overseas' ? (
            <WorldMap
              statusMode={statusMode}
              travelRecords={travelRecords}
              photoRecords={photoRecords}
              onSelectCountry={(code) => handleSelectTarget(code, 'country')}
              selectedCode={selectedCode}
            />
          ) : (
            <KoreaMap
              statusMode={statusMode}
              travelRecords={travelRecords}
              photoRecords={photoRecords}
              onSelectRegion={(code) => handleSelectTarget(code, 'region')}
              selectedCode={selectedCode}
            />
          )}

        </main>

      </div>

      {/* Photo Modal */}
      {selectedCode && selectedMeta && (
        <PhotoModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          targetName={selectedMeta.name}
          targetCode={selectedCode}
          targetType={tabMode === 'overseas' ? 'country' : 'region'}
          travelRecord={selectedTravelRecord}
          photos={selectedPhotos}
          onUploadPhoto={handleUploadPhoto}
          onDeletePhoto={handleDeletePhoto}
          flag={(selectedMeta as any).flag}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onStartTestGuestSession={handleStartTestGuestSession}
      />

    </div>
  );
}
