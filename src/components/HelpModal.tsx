import React from 'react';
import {
  X,
  HelpCircle,
  CheckCircle2,
  Star,
  Eye,
  Camera,
  Maximize2,
  Globe2,
  MapPin,
  Search,
  BarChart2,
  Info
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helpItems = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-[#4B5E40]" />,
      title: "방문",
      badge: "상단 방문 모드",
      badgeBg: "bg-[#EAEFE9] text-[#4B5E40]",
      description: (
        <>
          <p><span className="font-bold text-[#4B5E40]">[방문]</span>을 선택한 후 지도를 클릭하면 해당 지역이 방문으로 기록됩니다.</p>
          <p className="mt-1 text-gray-500 text-[11px]">
            같은 지역을 다시 클릭하면 방문 횟수가 1회씩 증가합니다.
            <br />
            <span className="font-semibold text-gray-600">(예: 1회 → 다시 클릭 → 2회 → 다시 클릭 → 3회)</span>
          </p>
        </>
      )
    },
    {
      icon: <Star className="w-5 h-5 text-[#D4A373]" />,
      title: "위시",
      badge: "상단 위시 모드",
      badgeBg: "bg-[#FDF6ED] text-[#D4A373]",
      description: (
        <>
          <p><span className="font-bold text-[#D4A373]">[위시]</span>를 선택한 후 지도를 클릭하면 해당 지역이 위시로 기록됩니다.</p>
          <p className="mt-1 text-gray-500 text-[11px]">방문으로 변경하면 위시 상태는 자동으로 해제됩니다.</p>
        </>
      )
    },
    {
      icon: <Eye className="w-5 h-5 text-gray-600" />,
      title: "전체 보기",
      badge: "상단 전체 보기 모드",
      badgeBg: "bg-gray-100 text-gray-700",
      description: (
        <>
          <p><span className="font-bold text-gray-700">[전체 보기]</span>에서는 지도를 자유롭게 탐색할 수 있습니다.</p>
          <p className="mt-1 text-gray-500 text-[11px]">지도를 클릭해도 여행 기록이 변경되지 않으므로 안심하고 둘러보실 수 있습니다.</p>
        </>
      )
    },
    {
      icon: <Camera className="w-5 h-5 text-[#3A3A3A]" />,
      title: "사진",
      badge: "상단 사진 모드",
      badgeBg: "bg-[#F0EFEC] text-[#3A3A3A]",
      description: (
        <>
          <p><span className="font-bold text-[#3A3A3A]">[사진]</span>을 선택한 후 방문한 지역을 클릭하면 사진을 업로드하거나 확인할 수 있습니다.</p>
          <p className="mt-1 text-gray-500 text-[11px]">
            사진은 방문 횟수만큼만 등록할 수 있습니다.
            <br />
            <span className="font-semibold text-gray-600">(예: 방문 1회 → 사진 최대 1장, 방문 2회 → 사진 최대 2장)</span>
          </p>
          <p className="mt-1 text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200 text-[10px]">
            💡 방문 횟수를 줄여 사진 개수가 제한을 초과하면 최근 사진부터 자동으로 삭제됩니다.
          </p>
        </>
      )
    },
    {
      icon: <Maximize2 className="w-5 h-5 text-blue-600" />,
      title: "지도 펼치기",
      badge: "지도 우측 상단",
      badgeBg: "bg-blue-50 text-blue-700",
      description: (
        <>
          <p><span className="font-bold text-blue-700">[평면지도로 펼치기]</span> 버튼을 누르면 지구본 형태의 세계 지도가 2D 평면 세계 지도로 변경됩니다.</p>
          <p className="mt-1 text-gray-500 text-[11px]">다시 누르면 원래 지구본 형태로 돌아옵니다.</p>
        </>
      )
    },
    {
      icon: <Globe2 className="w-5 h-5 text-emerald-700" />,
      title: "국내 / 해외",
      badge: "상단 헤더 탭",
      badgeBg: "bg-emerald-50 text-emerald-800",
      description: (
        <>
          <p><span className="font-bold text-emerald-800">[해외]</span>에서는 전 세계 국가 지도를 사용합니다.</p>
          <p className="mt-0.5"><span className="font-bold text-emerald-800">[국내]</span>에서는 대한민국 세부 시·군·구 지도를 사용합니다.</p>
        </>
      )
    },
    {
      icon: <Search className="w-5 h-5 text-purple-600" />,
      title: "검색 / 필터",
      badge: "좌측 사이드바",
      badgeBg: "bg-purple-50 text-purple-700",
      description: (
        <>
          <p>검색창을 이용해 찾고 싶은 국가나 지역을 빠르게 검색할 수 있습니다.</p>
          <p className="mt-1 text-gray-500 text-[11px]">대륙별/지역별 필터를 이용해 원하는 위치만 모아볼 수 있습니다.</p>
        </>
      )
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-teal-700" />,
      title: "진행률",
      badge: "상단 상태바",
      badgeBg: "bg-teal-50 text-teal-800",
      description: (
        <>
          <p>방문한 국가 또는 지역이 증가하면 전체 진행률과 정복 지수가 자동으로 업데이트됩니다.</p>
        </>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E2D9] bg-[#F9F8F6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4B5E40] text-white flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-[#3A3A3A] flex items-center gap-2">
                Travel Log 이용 가이드
              </h3>
              <p className="text-[11px] text-gray-500">나만의 여행 지도 기록 및 이용 방법 안내</p>
            </div>
          </div>
          <button
            id="btn-close-help-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
            aria-label="도움말 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs leading-relaxed">
          <div className="p-3 bg-[#F5F5F0] rounded-xl border border-[#E5E2D9] flex items-start gap-2.5 text-gray-700 text-xs">
            <Info className="w-4 h-4 text-[#4B5E40] shrink-0 mt-0.5" />
            <span>
              Travel Log는 내가 다녀온 세계 국가와 국내 지역을 지도로 기록하고 사진을 남기는 개인 가이드북 서비스입니다. 아래 기능 설명을 참고해 보세요!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {helpItems.map((item, index) => (
              <div
                key={index}
                className="p-3.5 bg-white rounded-xl border border-[#E5E2D9] hover:border-[#4B5E40]/40 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="font-bold text-sm text-[#1A1A1A]">{item.title}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeBg}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E2D9] bg-[#F9F8F6] flex items-center justify-between shrink-0 text-xs">
          <span className="text-gray-400 text-[11px]">도움말은 언제든지 우측 하단 <span className="font-bold text-[#4B5E40]">?</span> 버튼으로 다시 보실 수 있습니다.</span>
          <button
            id="btn-confirm-help-modal"
            onClick={onClose}
            className="px-4 py-2 bg-[#4B5E40] hover:bg-[#3d4d34] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
