import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { TILE_CONFIG, SEOUL_BOUNDS, SEOUL_MAX_BOUNDS } from "../map/tileConfig";
import { createSchoolDivIcon, createSafePopupContent, SCHOOL_TYPE_COLORS } from "../map/iconHelper";
import type { School } from "../types";
import { Layers, RefreshCw, AlertCircle, Eye, EyeOff } from "lucide-react";

interface SchoolMapProps {
  schools: School[];
  selectedSchoolCode: string | null;
  onSelectSchool: (school: School) => void;
  selectedDistrict: string;
}

export const SchoolMap: React.FC<SchoolMapProps> = ({
  schools,
  selectedSchoolCode,
  onSelectSchool,
  selectedDistrict
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // GeoJSON layers
  const districtLayerRef = useRef<L.GeoJSON | null>(null);
  const eduOfficeLayerRef = useRef<L.GeoJSON | null>(null);
  const districtBoundsMapRef = useRef<Map<string, L.LatLngBounds>>(new Map());

  // UI state
  const [isMapReady, setIsMapReady] = useState(false);
  const [tileErrorCount, setTileErrorCount] = useState(0);
  const [tileSuccessCount, setTileSuccessCount] = useState(0);
  const [showTileAlert, setShowTileAlert] = useState(false);

  const [showDistricts, setShowDistricts] = useState(true);
  const [showEduOffices, setShowEduOffices] = useState(true);
  const [geoJsonFailed, setGeoJsonFailed] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // 1. Initialize Map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(containerRef.current, {
      zoomControl: true,
      minZoom: TILE_CONFIG.minZoom,
      maxZoom: TILE_CONFIG.maxZoom,
      maxBounds: SEOUL_MAX_BOUNDS,
      maxBoundsViscosity: 0.8
    });

    map.fitBounds(SEOUL_BOUNDS);
    mapRef.current = map;

    // Create specific pane for boundaries to keep them strictly below markers (Section 19)
    const boundariesPane = map.createPane("boundariesPane");
    boundariesPane.style.zIndex = "350";
    boundariesPane.style.pointerEvents = "none";

    // Setup OpenStreetMap Tile Layer (Section 5)
    let errCount = 0;
    let loadCount = 0;

    const tileLayer = L.tileLayer(TILE_CONFIG.url, {
      attribution: TILE_CONFIG.attribution,
      maxZoom: TILE_CONFIG.maxZoom,
      minZoom: TILE_CONFIG.minZoom
    });

    tileLayer.on("tileerror", () => {
      errCount++;
      setTileErrorCount(errCount);
      if (errCount >= 6 && loadCount === 0) {
        setShowTileAlert(true);
      }
    });

    tileLayer.on("tileload", () => {
      loadCount++;
      setTileSuccessCount(loadCount);
      setShowTileAlert(false);
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Setup MarkerClusterGroup (Section 24)
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    setIsMapReady(true);

    // ResizeObserver to handle pane/window resizes and tab switches (Section 4)
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    // Asynchronously load Seoul boundaries (Section 18 & 19)
    loadGeoJsonBoundaries(map);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      districtLayerRef.current = null;
      eduOfficeLayerRef.current = null;
      clusterGroupRef.current = null;
      markersMapRef.current.clear();
      districtBoundsMapRef.current.clear();
      setIsMapReady(false);
    };
  }, []);

  // Helper: load GeoJSON boundaries safely (Section 18)
  const loadGeoJsonBoundaries = async (map: L.Map) => {
    try {
      let geoData: any = null;

      // 1. Try local /data/seoul-gu.geojson
      try {
        const res = await fetch("/data/seoul-gu.geojson");
        if (res.ok) {
          const json = await res.json();
          if (
            json &&
            json.type === "FeatureCollection" &&
            Array.isArray(json.features) &&
            json.features.filter((f: any) => f.properties?.kind === "district").length === 25
          ) {
            geoData = json;
          }
        }
      } catch {
        // Fallback to external URL
      }

      // 2. Fallback to https://highmap.labbitory.com/data/seoul-gu.geojson
      if (!geoData) {
        try {
          const res = await fetch("https://highmap.labbitory.com/data/seoul-gu.geojson");
          if (res.ok) {
            const json = await res.json();
            if (
              json &&
              json.type === "FeatureCollection" &&
              Array.isArray(json.features) &&
              json.features.filter((f: any) => f.properties?.kind === "district").length === 25
            ) {
              geoData = json;
            }
          }
        } catch {
          // both failed
        }
      }

      if (!geoData) {
        setGeoJsonFailed(true);
        return;
      }

      // Separate features by kind
      const districtFeatures = geoData.features.filter((f: any) => f.properties?.kind === "district");
      const eduOfficeFeatures = geoData.features.filter((f: any) => f.properties?.kind === "eduOffice");
      const outlineFeatures = geoData.features.filter((f: any) => f.properties?.kind === "seoulOutline");

      // 1) District polygons layer
      const districtLayer = L.geoJSON(districtFeatures, {
        pane: "boundariesPane",
        style: () => ({
          color: "#94a3b8",
          weight: 1.2,
          opacity: 0.8,
          fillColor: "#3b82f6",
          fillOpacity: 0.03
        }),
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name;
          if (name && (layer as any).getBounds) {
            districtBoundsMapRef.current.set(name, (layer as any).getBounds());
          }

          // District label in center
          if (name) {
            layer.bindTooltip(name, {
              permanent: true,
              direction: "center",
              className: "gu-label-tooltip",
              interactive: false
            });
          }
        }
      });

      // 2) Edu Office line layer (thicker line for 11 office boundaries, Section 19)
      const eduOfficeLayer = L.geoJSON(eduOfficeFeatures, {
        pane: "boundariesPane",
        style: () => ({
          color: "#2563eb",
          weight: 2.8,
          opacity: 0.85
        })
      });

      districtLayerRef.current = districtLayer;
      eduOfficeLayerRef.current = eduOfficeLayer;

      districtLayer.addTo(map);
      eduOfficeLayer.addTo(map);
    } catch (err) {
      console.warn("구 경계 처리 중 오류 발생 (지도 표시는 유지됨):", err);
      setGeoJsonFailed(true);
    }
  };

  // Toggle district boundary layer
  useEffect(() => {
    if (!mapRef.current || !districtLayerRef.current) return;
    if (showDistricts) {
      if (!mapRef.current.hasLayer(districtLayerRef.current)) {
        districtLayerRef.current.addTo(mapRef.current);
      }
    } else {
      if (mapRef.current.hasLayer(districtLayerRef.current)) {
        mapRef.current.removeLayer(districtLayerRef.current);
      }
    }
  }, [showDistricts]);

  // Toggle edu office layer
  useEffect(() => {
    if (!mapRef.current || !eduOfficeLayerRef.current) return;
    if (showEduOffices) {
      if (!mapRef.current.hasLayer(eduOfficeLayerRef.current)) {
        eduOfficeLayerRef.current.addTo(mapRef.current);
      }
    } else {
      if (mapRef.current.hasLayer(eduOfficeLayerRef.current)) {
        mapRef.current.removeLayer(eduOfficeLayerRef.current);
      }
    }
  }, [showEduOffices]);

  // 2. Render Markers & Clusters when schools change (Section 24)
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    const clusterGroup = clusterGroupRef.current;
    clusterGroup.clearLayers();
    markersMapRef.current.clear();

    const newMarkers: L.Marker[] = [];

    // Filter only schools that pass coordinate validation (hasLocation === true)
    const validSchools = schools.filter(
      (s) => s.hasLocation && s.latitude !== null && s.longitude !== null
    );

    for (const school of validSchools) {
      const lat = school.latitude!;
      const lon = school.longitude!;
      const isSelected = school.schoolCode === selectedSchoolCode;

      const marker = L.marker([lat, lon], {
        icon: createSchoolDivIcon(school, isSelected),
        zIndexOffset: isSelected ? 1000 : 0
      });

      // Safe popup
      const popupEl = createSafePopupContent(school, onSelectSchool);
      marker.bindPopup(popupEl, {
        closeButton: true,
        className: "school-custom-popup",
        maxWidth: 280
      });

      marker.on("click", () => {
        onSelectSchool(school);
      });

      markersMapRef.current.set(school.schoolCode, marker);
      newMarkers.push(marker);
    }

    if (newMarkers.length > 0) {
      clusterGroup.addLayers(newMarkers);
    }
  }, [schools, onSelectSchool]);

  // 3. Sync Selected School marker highlight & zoom (Section 25)
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    // Reset all markers to normal icon
    markersMapRef.current.forEach((marker, code) => {
      const school = schools.find((s) => s.schoolCode === code);
      if (school) {
        const isSelected = code === selectedSchoolCode;
        marker.setIcon(createSchoolDivIcon(school, isSelected));
        marker.setZIndexOffset(isSelected ? 1000 : 0);
      }
    });

    if (!selectedSchoolCode) return;

    const targetMarker = markersMapRef.current.get(selectedSchoolCode);
    if (!targetMarker) return;

    // Expand cluster if needed and show marker
    const cluster = clusterGroupRef.current;
    cluster.zoomToShowLayer(targetMarker, () => {
      targetMarker.openPopup();
    });
  }, [selectedSchoolCode, schools]);

  // 4. District selection zoom (Section 21)
  useEffect(() => {
    if (!mapRef.current) return;

    if (!selectedDistrict || selectedDistrict === "전체") {
      mapRef.current.fitBounds(SEOUL_BOUNDS, { animate: true });
      return;
    }

    // Try GeoJSON polygon bounds first
    const guBounds = districtBoundsMapRef.current.get(selectedDistrict);
    if (guBounds) {
      mapRef.current.fitBounds(guBounds, { padding: [25, 25], maxZoom: 14, animate: true });
      return;
    }

    // Fallback: calculate bounds of schools in this district
    const districtSchools = schools.filter(
      (s) => s.district === selectedDistrict && s.hasLocation && s.latitude && s.longitude
    );
    if (districtSchools.length > 0) {
      const latLngs = districtSchools.map((s) => [s.latitude!, s.longitude!] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14, animate: true });
    }
  }, [selectedDistrict, schools]);

  const handleRetryTile = useCallback(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.redraw();
      setShowTileAlert(false);
      setTileErrorCount(0);
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] overflow-hidden bg-slate-100 flex flex-col">
      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full min-h-[420px] flex-1 z-0" />

      {/* State ①: Map initializing overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-700">지도를 준비하고 있습니다…</p>
        </div>
      )}

      {/* State ②: Background tile error notification banner (Section 6 ②) */}
      {showTileAlert && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-white border border-amber-300 shadow-md rounded-lg px-3.5 py-2 flex items-center gap-2.5 text-xs text-amber-900 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>배경지도를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.</span>
          <button
            onClick={handleRetryTile}
            className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            다시 시도
          </button>
        </div>
      )}

      {/* Controls Layer: Top Right Controls (Boundary toggles) */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 items-end">
        <div className="bg-white/95 backdrop-blur-sm shadow-md border border-slate-200 rounded-lg p-1.5 flex flex-col gap-1 text-xs">
          <div className="text-[11px] font-semibold text-slate-500 px-1.5 py-0.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            지도 레이어
          </div>

          <button
            type="button"
            disabled={geoJsonFailed}
            onClick={() => setShowDistricts(!showDistricts)}
            className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-left transition-colors cursor-pointer ${
              showDistricts ? "bg-slate-100 font-medium text-slate-900" : "text-slate-500 hover:bg-slate-50"
            } ${geoJsonFailed ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span>구 경계</span>
            {showDistricts ? <Eye className="w-3.5 h-3.5 text-slate-700" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          <button
            type="button"
            disabled={geoJsonFailed}
            onClick={() => setShowEduOffices(!showEduOffices)}
            className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-left transition-colors cursor-pointer ${
              showEduOffices ? "bg-blue-50 font-medium text-blue-900" : "text-slate-500 hover:bg-slate-50"
            } ${geoJsonFailed ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-blue-600 rounded-full inline-block" />
              교육지원청
            </span>
            {showEduOffices ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {geoJsonFailed && (
            <div className="text-[10px] text-amber-700 px-1 py-0.5">
              구 경계 데이터를 불러오지 못했습니다
            </div>
          )}
        </div>
      </div>

      {/* Map Legend: Bottom Left (Does NOT obscure bottom-right OSM attribution) */}
      <div className="absolute bottom-6 left-3 z-[400]">
        {showLegend ? (
          <div className="bg-white/95 backdrop-blur-sm shadow-md border border-slate-200 rounded-lg p-2.5 max-w-[240px] text-xs">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
              <span className="font-semibold text-slate-800">마커 범례</span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                닫기
              </button>
            </div>

            {/* School Type Colors */}
            <div className="grid grid-cols-2 gap-1.5 mb-2.5">
              {Object.entries(SCHOOL_TYPE_COLORS).map(([type, style]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: style.bg }}
                  />
                  <span className="text-[11px] text-slate-700">{type}</span>
                </div>
              ))}
            </div>

            {/* Gender Letters & Foundation Border */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">남녀구분:</span>
                <span>남(남학교)</span>
                <span>·</span>
                <span>여(여학교)</span>
                <span>·</span>
                <span>공(남녀공학)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">설립:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 bg-slate-200 inline-block" />
                  사립
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-white bg-slate-200 inline-block" />
                  공립
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="bg-white/95 shadow-md border border-slate-200 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            범례 보기
          </button>
        )}
      </div>

      {/* Custom Styles for Tooltips & Popups */}
      <style>{`
        .gu-label-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #475569 !important;
          font-weight: 600 !important;
          font-size: 11px !important;
          text-shadow: -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff;
          padding: 0 !important;
        }
        .school-custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        .school-custom-popup .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
};
