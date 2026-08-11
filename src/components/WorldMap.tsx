import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';
import { StatusMode, TravelRecord, PhotoMeta, MapTooltipData } from '../types';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';

interface WorldMapProps {
  statusMode: StatusMode;
  travelRecords: Record<string, TravelRecord>;
  photoRecords: Record<string, PhotoMeta[]>;
  onSelectCountry: (code: string) => void;
  selectedCode: string | null;
}

/**
 * WorldMap Component
 * 
 * Handles dual GeoJSON datasets:
 * - 3D Globe Mode: Uses /geojson/world_sphere_3d.geojson (3D Cartesian [x, y, z])
 * - 2D Flat Mode: Uses /geojson/world.geojson (2D Spherical [lon, lat])
 */
export const WorldMap: React.FC<WorldMapProps> = ({
  statusMode,
  travelRecords,
  photoRecords,
  onSelectCountry,
  selectedCode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // GeoJSON state for both modes
  const [data3D, setData3D] = useState<FeatureCollection | null>(null);
  const [data2D, setData2D] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Projection mode: Default is 3D Globe (isFlatProjection = false)
  const [isFlatProjection, setIsFlatProjection] = useState<boolean>(false);
  const [rotation, setRotation] = useState<[number, number, number]>([-10, -20, 0]);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [tooltip, setTooltip] = useState<MapTooltipData | null>(null);

  // Fetch both 3D sphere and 2D flat GeoJSON files on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch('/geojson/world_sphere_3d.geojson').then(r => r.json()),
      fetch('/geojson/world.geojson').then(r => r.json())
    ])
      .then(([g3d, g2d]: [FeatureCollection, FeatureCollection]) => {
        if (!isMounted) return;

        // Transform 3D Cartesian coordinates [x, y, z] to Spherical [lon, lat] for D3 projection
        const converted3DFeatures = g3d.features.map(feature => {
          const transformedGeom = JSON.parse(JSON.stringify(feature.geometry));

          const convertPoint = ([x, y, z]: number[]) => {
            const r = Math.sqrt(x * x + y * y + z * z) || 1;
            const lat = Math.asin(Math.max(-1, Math.min(1, z / r))) * (180 / Math.PI);
            const lon = Math.atan2(y, x) * (180 / Math.PI);
            return [lon, lat];
          };

          const transformCoords = (coords: any): any => {
            if (typeof coords[0] === 'number') {
              return convertPoint(coords);
            }
            return coords.map(transformCoords);
          };

          transformedGeom.coordinates = transformCoords(transformedGeom.coordinates);

          return {
            ...feature,
            geometry: transformedGeom
          };
        });

        setData3D({
          type: 'FeatureCollection',
          features: converted3DFeatures
        });
        setData2D(g2d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load world GeoJSON files:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset view rotation & zoom
  const handleResetView = () => {
    setRotation([-10, -20, 0]);
    setZoomScale(1);
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const currentGeojson = isFlatProjection ? data2D : data3D;
    if (!currentGeojson) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 550;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create projections
    const baseRadius = Math.min(width, height) / 2.3;
    let projection: d3.GeoProjection;

    if (isFlatProjection) {
      // 2D Flat paper projection (Natural Earth 1)
      projection = d3.geoNaturalEarth1()
        .scale(baseRadius * 0.9 * zoomScale)
        .translate([width / 2, height / 2]);
    } else {
      // 3D Globe projection (Orthographic)
      projection = d3.geoOrthographic()
        .scale(baseRadius * zoomScale)
        .translate([width / 2, height / 2])
        .rotate(rotation);
    }

    const pathGenerator = d3.geoPath().projection(projection);

    const defs = svg.append('defs');

    // Create clipPaths for each country feature to enable image clipping
    currentGeojson.features.forEach((feature: any) => {
      const code = (feature.properties as any)?.code || feature.id;
      const pathD = pathGenerator(feature as any);
      if (pathD && code) {
        defs.append('clipPath')
          .attr('id', `clip-world-${code}`)
          .append('path')
          .attr('d', pathD);
      }
    });

    // 1. Ocean background & Graticule grid for Globe
    if (!isFlatProjection) {
      // Sphere ocean circle
      svg.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', baseRadius * zoomScale)
        .attr('fill', '#D1D9CF') // Warm soft ocean
        .attr('stroke', '#8BA184')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.6);

      // Sphere graticule grid
      const graticule = d3.geoGraticule()();
      svg.append('path')
        .datum(graticule)
        .attr('d', pathGenerator)
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.6);
    }

    // Map group
    const gMap = svg.append('g').attr('class', 'countries-group');

    // Color mapper for visitCount (Olive / Sage Theme)
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
        return '#D4A373'; // warm gold/tan wishlist
      }

      return '#CBD3C8';
    };

    // Render country path elements
    const countryPaths = gMap.selectAll('path.country-path')
      .data(currentGeojson.features)
      .enter()
      .append('path')
      .attr('class', 'country-path')
      .attr('d', pathGenerator)
      .attr('fill', (f: any) => getFillColor(f.properties?.code))
      .attr('stroke', (f: any) => {
        const code = f.properties?.code;
        return code === selectedCode ? '#36472D' : '#F9F8F6';
      })
      .attr('stroke-width', (f: any) => (f.properties?.code === selectedCode ? 2 : 0.6))
      .attr('cursor', 'pointer')
      .style('transition', 'fill 0.2s, stroke 0.2s');

    // 2. Render Photo Clipping Overlay for visited countries with photos
    const photoGroup = svg.append('g').attr('class', 'photo-clipped-group');

    currentGeojson.features.forEach((feature: any) => {
      const props = feature.properties as any;
      const code = props?.code;
      if (!code) return;

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
            .attr('clip-path', `url(#clip-world-${code})`)
            .attr('opacity', 0.9)
            .attr('cursor', 'pointer')
            .on('click', () => onSelectCountry(code));
        }
      }
    });

    // 3. Hover and Click event listeners
    countryPaths
      .on('mouseover', (event, d: any) => {
        const props = d.properties;
        const code = props.code;
        const rec = travelRecords[code] || { visited: false, visitCount: 0, wishlist: false };
        const photos = photoRecords[code] || [];

        d3.select(event.currentTarget)
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2);

        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);

        setTooltip({
          code,
          name: props.name,
          flag: props.flag,
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
        const code = d.properties?.code;
        d3.select(event.currentTarget)
          .attr('stroke', code === selectedCode ? '#36472D' : '#F9F8F6')
          .attr('stroke-width', code === selectedCode ? 2 : 0.6);

        setTooltip(null);
      })
      .on('click', (event, d: any) => {
        const code = d.properties?.code;
        if (code) {
          onSelectCountry(code);
        }
      });

    // 4. Drag interaction for 3D Globe projection rotation
    if (!isFlatProjection) {
      const dragBehavior = d3.drag<SVGSVGElement, unknown>()
        .on('drag', (event) => {
          const k = 0.35 / zoomScale;
          setRotation(prev => [
            prev[0] + event.dx * k,
            prev[1] - event.dy * k,
            prev[2]
          ]);
        });

      svg.call(dragBehavior as any);
    }

  }, [data3D, data2D, isFlatProjection, rotation, zoomScale, travelRecords, photoRecords, selectedCode]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] bg-[#E6E8E3] flex flex-col items-center justify-center gap-3 text-[#4B5E40]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-medium">세계 지도 데이터를 로드하는 중...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] bg-[#E6E8E3] overflow-hidden flex items-center justify-center select-none">
      
      {/* Projection Mode & Control Buttons (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-[#E5E2D9] shadow-sm">
        <button
          id="btn-toggle-projection"
          onClick={() => setIsFlatProjection(!isFlatProjection)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#4B5E40] hover:bg-[#3d4d34] text-white shadow-xs transition-all cursor-pointer"
        >
          {isFlatProjection ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" /> 🌎 지구본으로 접기
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" /> ⛶ 평면지도로 펼치기
            </>
          )}
        </button>

        <button
          id="btn-zoom-in"
          onClick={() => setZoomScale(z => Math.min(3, z + 0.25))}
          title="확대"
          className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg border border-[#E5E2D9] shadow-xs cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          id="btn-zoom-out"
          onClick={() => setZoomScale(z => Math.max(0.6, z - 0.25))}
          title="축소"
          className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg border border-[#E5E2D9] shadow-xs cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          id="btn-reset-view"
          onClick={handleResetView}
          title="화면 초기화"
          className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg border border-[#E5E2D9] shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className={`w-full h-full ${!isFlatProjection ? 'cursor-grab active:cursor-grabbing' : ''}`}
      />

      {/* Hover Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 bg-white/95 text-[#1A1A1A] text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] shadow-xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3 flex flex-col gap-1 min-w-[140px]"
          style={{
            left: `${tooltip.x + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
            top: `${tooltip.y + (containerRef.current?.getBoundingClientRect().top || 0)}px`
          }}
        >
          <div className="font-bold flex items-center gap-1.5 text-[#1A1A1A] border-b border-gray-100 pb-1">
            {tooltip.flag && <span className="text-lg">{tooltip.flag}</span>}
            <span className="text-xs">{tooltip.name}</span>
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

      {/* Map Legend & Mode Indicator Overlay */}
      <div className="absolute bottom-6 left-6 flex items-center gap-6 bg-white/70 backdrop-blur px-4 py-2 rounded-full border border-white/60 shadow-xs text-xs text-gray-700">
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

