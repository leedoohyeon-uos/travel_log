import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';
import { getKoreaRegionByCode } from '../data/korea-data';
import { StatusMode, TravelRecord, PhotoMeta, MapTooltipData } from '../types';
import { RotateCcw, ZoomIn, ZoomOut, ArrowLeft, Loader2 } from 'lucide-react';

interface KoreaMapProps {
  statusMode: StatusMode;
  travelRecords: Record<string, TravelRecord>;
  photoRecords: Record<string, PhotoMeta[]>;
  onSelectRegion: (code: string) => void;
  selectedCode: string | null;
}

/**
 * KoreaMap Component
 * 
 * [실제 지도 적용 안내]:
 * 향후 실제 지도 데이터베이스 또는 국내 전문 지도 API (예: Kakao Maps API, Naver Maps API, Vworld, 또는 고해상도 시군구 GeoJSON/Vector Tiles)
 * 연동 시, 아래 /geojson/korea.geojson 로딩 및 D3 렌더링 부분을 해당 지도 API SDK 호출로 교체합니다.
 * 예: // 실제 지도 적용 시 이 부분을 실제 지도 데이터/API(Naver/Kakao Maps API, GeoJSON 등)로 교체
 */
export const KoreaMap: React.FC<KoreaMapProps> = ({
  statusMode,
  travelRecords,
  photoRecords,
  onSelectRegion,
  selectedCode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [zoomScale, setZoomScale] = useState<number>(1);
  const [focusedProvince, setFocusedProvince] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<MapTooltipData | null>(null);

  // Fetch actual Korea GeoJSON
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('${import.meta.env.BASE_URL}geojson/korea.geojson')
      .then(res => res.json())
      .then((data: FeatureCollection) => {
        if (isMounted) {
          setGeojson(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load Korea GeoJSON:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleResetView = () => {
    setFocusedProvince(null);
    setZoomScale(1);
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !geojson) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 550;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Filter features if a province is focused (show sub-districts/municipalities belonging to that province)
    let displayFeatures: any[] = geojson.features;
    if (focusedProvince) {
      const filtered = geojson.features.filter((f: any) => {
        const code = String(f.properties?.code || '');
        const level = f.properties?.level;
        return level === 'municipality' && code.startsWith(focusedProvince);
      });
      if (filtered.length > 0) {
        displayFeatures = filtered;
      }
    } else {
      // By default show provinces (or all if levels aren't separated)
      const provincesOnly = geojson.features.filter((f: any) => f.properties?.level === 'province');
      if (provincesOnly.length > 0) {
        displayFeatures = provincesOnly;
      }
    }

    // D3 Mercator projection centered on South Korea
    const projection = d3.geoMercator()
      .center([127.8, 35.8])
      .scale(width * 8 * zoomScale)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    const defs = svg.append('defs');

    // Create SVG clipPaths for each region
    displayFeatures.forEach((feature: any) => {
      const code = String(feature.properties?.code || feature.id);
      const pathD = pathGenerator(feature);
      if (pathD && code) {
        defs.append('clipPath')
          .attr('id', `clip-korea-${code}`)
          .append('path')
          .attr('d', pathD);
      }
    });

    const gMap = svg.append('g').attr('class', 'korea-regions-group');

    const getFillColor = (code: string) => {
      const rec = travelRecords[code];
      if (!rec) return '#CBD3C8';

      if (rec.visited) {
        switch (Math.min(5, rec.visitCount)) {
          case 1: return '#A8B7A1';
          case 2: return '#8BA184';
          case 3: return '#6B8364';
          case 4: return '#4B5E40';
          case 5: return '#36472D';
          default: return '#4B5E40';
        }
      }

      if (rec.wishlist) {
        return '#D4A373';
      }

      return '#CBD3C8';
    };

    // Render region paths
    const regionPaths = gMap.selectAll('path.region-path')
      .data(displayFeatures)
      .enter()
      .append('path')
      .attr('class', 'region-path')
      .attr('d', pathGenerator)
      .attr('fill', f => getFillColor(String(f.properties?.code)))
      .attr('stroke', f => {
        const code = String(f.properties?.code);
        return code === selectedCode ? '#36472D' : '#F9F8F6';
      })
      .attr('stroke-width', f => (String(f.properties?.code) === selectedCode ? 2.5 : 1))
      .attr('cursor', 'pointer')
      .style('transition', 'fill 0.2s, stroke 0.2s');

    // Text labels for region names (only if zoom is sufficient or showing provinces)
    gMap.selectAll('text.region-label')
      .data(displayFeatures)
      .enter()
      .append('text')
      .attr('class', 'region-label')
      .attr('x', f => {
        const centroid = pathGenerator.centroid(f);
        return centroid[0] || 0;
      })
      .attr('y', f => {
        const centroid = pathGenerator.centroid(f);
        return centroid[1] || 0;
      })
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('fill', '#2E3A28')
      .attr('font-size', displayFeatures.length > 30 ? '9px' : '11px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text(f => f.properties?.name || '');

    // Photo clipping overlay
    const photoGroup = svg.append('g').attr('class', 'korea-photo-clipped-group');

    displayFeatures.forEach((feature: any) => {
      const code = String(feature.properties?.code);
      const photos = photoRecords[code] || [];

      if (photos.length > 0) {
        const pathD = pathGenerator(feature as any);
        if (pathD) {
          const bounds = pathGenerator.bounds(feature as any);
          const x0 = bounds[0][0];
          const y0 = bounds[0][1];
          const imgWidth = Math.max(10, bounds[1][0] - x0);
          const imgHeight = Math.max(10, bounds[1][1] - y0);

          const activePhoto = photos[photos.length - 1];

          photoGroup.append('image')
            .attr('href', activePhoto.downloadURL)
            .attr('x', x0)
            .attr('y', y0)
            .attr('width', imgWidth)
            .attr('height', imgHeight)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('clip-path', `url(#clip-korea-${code})`)
            .attr('opacity', 0.9)
            .attr('cursor', 'pointer')
            .on('click', () => onSelectRegion(code));
        }
      }
    });

    // Hover & Click events
    regionPaths
      .on('mouseover', (event, d: any) => {
        const code = String(d.properties.code);
        const regionMeta = getKoreaRegionByCode(code);
        const rec = travelRecords[code] || { visited: false, visitCount: 0, wishlist: false };
        const photos = photoRecords[code] || [];

        d3.select(event.currentTarget)
          .attr('stroke', '#34d399')
          .attr('stroke-width', 2.5);

        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);

        setTooltip({
          code,
          name: regionMeta?.name || d.properties.name,
          visitCount: rec.visitCount,
          wishlist: rec.wishlist,
          visited: rec.visited,
          photosCount: photos.length,
          x: mouseX,
          y: mouseY
        });
      })
      .on('mousemove', (event) => {
        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
        setTooltip(prev => prev ? { ...prev, x: mouseX, y: mouseY } : null);
      })
      .on('mouseout', (event, d: any) => {
        const code = String(d.properties.code);
        d3.select(event.currentTarget)
          .attr('stroke', code === selectedCode ? '#f43f5e' : '#F9F8F6')
          .attr('stroke-width', code === selectedCode ? 2.5 : 1);

        setTooltip(null);
      })
      .on('click', (event, d: any) => {
        const code = String(d.properties.code);
        if (d.properties.level === 'province') {
          setFocusedProvince(code);
        }
        onSelectRegion(code);
      });

  }, [geojson, zoomScale, travelRecords, photoRecords, selectedCode, focusedProvince]);

  const focusedMeta = focusedProvince ? getKoreaRegionByCode(focusedProvince) : null;

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] bg-[#E6E8E3] flex flex-col items-center justify-center gap-3 text-[#4B5E40]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-medium">대한민국 세부 지도 데이터를 로드하는 중...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] bg-[#E6E8E3] overflow-hidden flex items-center justify-center select-none">
      
      {/* Zoom & View Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-[#E5E2D9] shadow-xs">
        {focusedProvince && (
          <button
            id="btn-back-korea-all"
            onClick={() => setFocusedProvince(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#4B5E40] hover:bg-[#3d4d34] text-white shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 전국 도/시 보기
          </button>
        )}

        <button
          id="btn-zoom-in-korea"
          onClick={() => setZoomScale(z => Math.min(2.5, z + 0.25))}
          title="확대"
          className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg border border-[#E5E2D9] shadow-xs cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          id="btn-zoom-out-korea"
          onClick={() => setZoomScale(z => Math.max(0.7, z - 0.25))}
          title="축소"
          className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg border border-[#E5E2D9] shadow-xs cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          id="btn-reset-korea-view"
          onClick={handleResetView}
          title="화면 초기화"
          className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg border border-[#E5E2D9] shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <svg ref={svgRef} className="w-full h-full" />

      {/* Hover Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 bg-white/95 text-[#1A1A1A] text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] shadow-xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3 flex flex-col gap-1 min-w-[130px]"
          style={{
            left: `${tooltip.x + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
            top: `${tooltip.y + (containerRef.current?.getBoundingClientRect().top || 0)}px`
          }}
        >
          <div className="font-bold text-[#1A1A1A] border-b border-gray-100 pb-1 flex items-center justify-between">
            <span>{tooltip.name}</span>
          </div>
          <div className="text-[11px] text-gray-600 flex justify-between gap-3 pt-0.5">
            <span>방문 상태:</span>
            {tooltip.visited ? (
              <span className="text-[#4B5E40] font-bold">✓ {tooltip.visitCount}회 방문</span>
            ) : tooltip.wishlist ? (
              <span className="text-[#D4A373] font-bold">★ 위시리스트</span>
            ) : (
              <span className="text-gray-400">미방문</span>
            )}
          </div>
          {tooltip.photosCount > 0 && (
            <div className="text-[10px] text-rose-500 font-medium text-right pt-0.5">
              📷 사진 {tooltip.photosCount}장
            </div>
          )}
        </div>
      )}

      {/* Region Sub-Districts Overlay Card when focused */}
      {focusedMeta && (
        <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md border border-[#E5E2D9] p-4 rounded-xl shadow-xl max-w-xs text-xs text-[#1A1A1A]">
          <div className="font-bold text-[#4B5E40] text-sm mb-1.5 flex items-center justify-between">
            <span>{focusedMeta.name} (시·군·구 세부)</span>
            <button
              onClick={() => setFocusedProvince(null)}
              className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-500 text-[11px] mb-2">원하는 시·군·구를 클릭하여 선택할 수 있습니다:</p>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {focusedMeta.subDistricts?.map(sub => (
              <button
                key={sub.code}
                onClick={() => onSelectRegion(sub.code)}
                className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer transition-colors ${
                  selectedCode === sub.code
                    ? 'bg-[#4B5E40] text-white border-[#36472D]'
                    : 'bg-[#F5F5F0] text-gray-700 border-[#E5E2D9] hover:bg-[#E5E8E0]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 flex items-center gap-6 bg-white/70 backdrop-blur px-4 py-2 rounded-full border border-white/60 shadow-xs text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#CBD3C8] rounded-xs"></div>
          <span className="text-[11px] text-gray-600 font-medium">미방문</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#A8B7A1] rounded-xs"></div>
          <div className="w-3 h-3 bg-[#8BA184] rounded-xs"></div>
          <div className="w-3 h-3 bg-[#4B5E40] rounded-xs"></div>
          <span className="text-[11px] text-gray-600 font-medium ml-1">방문 (진할수록 다수)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#D4A373] rounded-xs"></div>
          <span className="text-[11px] text-gray-600 font-medium">위시리스트</span>
        </div>
      </div>

    </div>
  );
};

