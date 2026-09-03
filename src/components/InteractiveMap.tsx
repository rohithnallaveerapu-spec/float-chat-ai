import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ArgoFloat } from '../types';

interface Props {
  floats: ArgoFloat[];
  selectedFloatId?: string | null;
  onSelectFloat?: (float: ArgoFloat) => void;
  center?: [number, number];
  zoom?: number;
  showTrajectories?: boolean;
}

type BasemapType = 'dark' | 'ocean' | 'voyager';

export const InteractiveMap: React.FC<Props> = ({
  floats,
  selectedFloatId,
  onSelectFloat,
  center = [12, 70],
  zoom = 4,
  showTrajectories = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const miniMapRectRef = useRef<L.Rectangle | null>(null);
  
  const markersRef = useRef<{ [id: string]: L.CircleMarker }>({});
  const miniMarkersRef = useRef<{ [id: string]: L.CircleMarker }>({});
  const polylinesRef = useRef<L.Polyline[]>([]);

  const [basemap, setBasemap] = useState<BasemapType>('dark');
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [trajectoriesEnabled, setTrajectoriesEnabled] = useState<boolean>(showTrajectories);

  // Latitude and Longitude Live Cursor & Search State
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number }>({
    lat: center[0],
    lon: center[1],
  });
  const [showCoordSearch, setShowCoordSearch] = useState<boolean>(false);
  const [inputLat, setInputLat] = useState<string>('');
  const [inputLon, setInputLon] = useState<string>('');
  const [coordMessage, setCoordMessage] = useState<string>('');

  const TILE_URLS: Record<BasemapType, { url: string; attribution: string }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
    ocean: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, IFREMER, Ordnance Survey',
    },
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
  };

  // 1. Initialize Main Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: L.latLng(center[0], center[1]),
        zoom,
        zoomControl: false,
      });

      const layer = L.tileLayer(TILE_URLS[basemap].url, {
        attribution: TILE_URLS[basemap].attribution,
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayerRef.current = layer;
      mapInstanceRef.current = map;

      // Update inset map viewport rectangle & mouse coordinates when main map moves
      map.on('move', () => {
        if (miniMapInstanceRef.current && miniMapRectRef.current) {
          const bounds = map.getBounds();
          miniMapRectRef.current.setBounds(bounds);
        }
      });

      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorCoords({
          lat: Number(e.latlng.lat.toFixed(4)),
          lon: Number(e.latlng.lng.toFixed(4)),
        });
      });
    } else {
      mapInstanceRef.current.setView(L.latLng(center[0], center[1]), zoom);
    }
  }, [center, zoom]);

  // Handle Basemap Layer Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(TILE_URLS[basemap].url, {
      attribution: TILE_URLS[basemap].attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [basemap]);

  // 2. Initialize Mini Inset Map ("Map-on-Map")
  useEffect(() => {
    if (!showMiniMap || !miniMapContainerRef.current) return;

    if (!miniMapInstanceRef.current) {
      const miniMap = L.map(miniMapContainerRef.current, {
        center: [10, 20],
        zoom: 0,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: false,
      });

      L.tileLayer(TILE_URLS.dark.url, {
        subdomains: 'abcd',
      }).addTo(miniMap);

      // Create bounding box representing main map view
      const mainBounds = mapInstanceRef.current
        ? mapInstanceRef.current.getBounds()
        : L.latLngBounds([[-30, -50], [40, 100]]);

      const rect = L.rectangle(mainBounds, {
        color: '#6cd7d4',
        weight: 1.5,
        fillColor: '#6cd7d4',
        fillOpacity: 0.2,
      }).addTo(miniMap);

      miniMapRectRef.current = rect;
      miniMapInstanceRef.current = miniMap;

      // Clicking mini map re-centers main map
      miniMap.on('click', (e: L.LeafletMouseEvent) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(e.latlng);
        }
      });
    } else {
      miniMapInstanceRef.current.invalidateSize();
    }
  }, [showMiniMap]);

  // 3. Render Floats on Main Map & Mini Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing main markers & polylines
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};
    polylinesRef.current.forEach((p) => map.removeLayer(p));
    polylinesRef.current = [];

    // Clear mini markers
    const miniMap = miniMapInstanceRef.current;
    if (miniMap) {
      Object.values(miniMarkersRef.current).forEach((m) => miniMap.removeLayer(m));
      miniMarkersRef.current = {};
    }

    floats.forEach((fl) => {
      const isSelected = fl.float_id === selectedFloatId;

      // Trajectory line on main map
      if ((trajectoriesEnabled || isSelected) && fl.trajectory.length > 0) {
        const coords: [number, number][] = fl.trajectory.map((t) => [t.lat, t.lon]);
        coords.push([fl.lat, fl.lon]);

        const polyline = L.polyline(coords, {
          color: isSelected ? '#55C0E6' : '#6cd7d4',
          weight: isSelected ? 3 : 1.5,
          dashArray: isSelected ? undefined : '4, 4',
          opacity: isSelected ? 0.9 : 0.5,
        }).addTo(map);

        polylinesRef.current.push(polyline);
      }

      // Marker on Main Map
      const marker = L.circleMarker([fl.lat, fl.lon], {
        radius: isSelected ? 9 : 6,
        fillColor: isSelected ? '#55C0E6' : '#6cd7d4',
        color: '#111316',
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 0.95 : 0.7,
      }).addTo(map);

      marker.bindTooltip(
        `<div class="font-mono text-xs text-[#e2e2e6] font-bold">Float ${fl.float_id}</div><div class="text-[10px] text-[#6cd7d4]">${fl.ocean_region} | ${fl.latest_temp_c}°C</div>`,
        { direction: 'top', className: 'bg-[#111316] border border-[#6cd7d4] text-[#e2e2e6] rounded p-1' }
      );

      marker.on('click', () => {
        if (onSelectFloat) {
          onSelectFloat(fl);
        }
      });

      markersRef.current[fl.float_id] = marker;

      // Marker on Mini Inset Map
      if (miniMap) {
        const miniMarker = L.circleMarker([fl.lat, fl.lon], {
          radius: isSelected ? 4 : 2,
          fillColor: isSelected ? '#55C0E6' : '#6cd7d4',
          color: '#111316',
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.9,
        }).addTo(miniMap);
        miniMarkersRef.current[fl.float_id] = miniMarker;
      }
    });
  }, [floats, selectedFloatId, trajectoriesEnabled, onSelectFloat, showMiniMap]);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-[#44474e]/30 shadow-2xl">
      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#0a192f]" />

      {/* Map Control Bar (Top Right) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* Trajectory Toggle */}
        <button
          onClick={() => setTrajectoriesEnabled(!trajectoriesEnabled)}
          className={`h-8 px-2.5 rounded font-mono text-xs font-bold border transition-all flex items-center gap-1.5 shadow-lg ${
            trajectoriesEnabled
              ? 'bg-[#29a09d] text-[#00302f] border-[#6cd7d4]'
              : 'bg-[#1e2023]/90 text-[#8e9199] border-[#44474e]/40 hover:text-[#e2e2e6]'
          }`}
          title="Toggle Drift Trajectories"
        >
          <span className="material-symbols-outlined text-sm">route</span>
          <span className="hidden sm:inline">Trajectories</span>
        </button>

        {/* Basemap Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="h-8 px-2.5 rounded bg-[#1e2023]/90 hover:bg-[#282a2d] text-[#e2e2e6] border border-[#6cd7d4]/30 font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg transition-colors"
            title="Switch Map Layers"
          >
            <span className="material-symbols-outlined text-sm text-[#6cd7d4]">layers</span>
            <span className="hidden sm:inline uppercase">{basemap}</span>
            <span className="material-symbols-outlined text-xs text-[#8e9199]">arrow_drop_down</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-10 w-44 bg-[#1e2023] border border-[#6cd7d4]/30 rounded-xl shadow-2xl p-2 z-30 flex flex-col gap-1 font-mono text-xs">
              <span className="text-[10px] text-[#8e9199] px-2 py-1 uppercase font-bold">Base Map Style</span>
              <button
                onClick={() => {
                  setBasemap('dark');
                  setShowLayerMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                  basemap === 'dark' ? 'bg-[#29a09d]/20 text-[#6cd7d4] font-bold' : 'text-[#c4c6cf] hover:bg-[#282a2d]'
                }`}
              >
                <span>Carto Dark</span>
                {basemap === 'dark' && <span className="material-symbols-outlined text-xs">check</span>}
              </button>
              <button
                onClick={() => {
                  setBasemap('ocean');
                  setShowLayerMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                  basemap === 'ocean' ? 'bg-[#29a09d]/20 text-[#6cd7d4] font-bold' : 'text-[#c4c6cf] hover:bg-[#282a2d]'
                }`}
              >
                <span>Esri Ocean</span>
                {basemap === 'ocean' && <span className="material-symbols-outlined text-xs">check</span>}
              </button>
              <button
                onClick={() => {
                  setBasemap('voyager');
                  setShowLayerMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                  basemap === 'voyager' ? 'bg-[#29a09d]/20 text-[#6cd7d4] font-bold' : 'text-[#c4c6cf] hover:bg-[#282a2d]'
                }`}
              >
                <span>Voyager Light</span>
                {basemap === 'voyager' && <span className="material-symbols-outlined text-xs">check</span>}
              </button>
            </div>
          )}
        </div>

        {/* Mini Map Toggle */}
        <button
          onClick={() => setShowMiniMap(!showMiniMap)}
          className={`h-8 px-2.5 rounded font-mono text-xs font-bold border transition-all flex items-center gap-1.5 shadow-lg ${
            showMiniMap
              ? 'bg-[#29a09d] text-[#00302f] border-[#6cd7d4]'
              : 'bg-[#1e2023]/90 text-[#8e9199] border-[#44474e]/40 hover:text-[#e2e2e6]'
          }`}
          title="Toggle Inset Global Map"
        >
          <span className="material-symbols-outlined text-sm">map</span>
          <span className="hidden sm:inline">Inset Map</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col gap-0.5 ml-1">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-8 h-8 rounded-t bg-[#1e2023]/90 hover:bg-[#282a2d] text-[#e2e2e6] border border-[#6cd7d4]/30 flex items-center justify-center font-bold text-sm shadow-md transition-colors"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-8 h-8 rounded-b bg-[#1e2023]/90 hover:bg-[#282a2d] text-[#e2e2e6] border border-[#6cd7d4]/30 border-t-0 flex items-center justify-center font-bold text-sm shadow-md transition-colors"
            title="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      {/* Live Latitude & Longitude HUD Badge (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-[#111316]/90 backdrop-blur border border-[#6cd7d4]/40 rounded-lg px-3 py-1.5 shadow-xl flex items-center gap-2 font-mono text-[11px] text-[#e2e2e6]">
          <span className="material-symbols-outlined text-xs text-[#6cd7d4] animate-pulse">my_location</span>
          <span>
            LAT: <strong className="text-[#6cd7d4]">{cursorCoords.lat >= 0 ? `${cursorCoords.lat}°N` : `${Math.abs(cursorCoords.lat)}°S`}</strong>
          </span>
          <span className="text-[#44474e]">|</span>
          <span>
            LON: <strong className="text-[#55C0E6]">{cursorCoords.lon >= 0 ? `${cursorCoords.lon}°E` : `${Math.abs(cursorCoords.lon)}°W`}</strong>
          </span>
        </div>

        <button
          onClick={() => setShowCoordSearch(!showCoordSearch)}
          className="bg-[#1e2023]/90 hover:bg-[#282a2d] text-[#6cd7d4] border border-[#6cd7d4]/40 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1 shadow-lg"
          title="Jump to Lat/Lon Coordinates"
        >
          <span className="material-symbols-outlined text-xs">pin_drop</span>
          <span className="hidden sm:inline">Go to Lat/Lon</span>
        </button>
      </div>

      {/* Coordinate Search & Jump Modal Overlay */}
      {showCoordSearch && (
        <div className="absolute bottom-12 left-3 z-30 w-80 bg-[#1e2023] border border-[#6cd7d4]/50 rounded-xl shadow-2xl p-4 font-mono">
          <div className="flex justify-between items-center pb-2 border-b border-[#44474e]/30 mb-3">
            <span className="text-xs font-bold text-[#6cd7d4] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">explore</span>
              JUMP TO LATITUDE & LONGITUDE
            </span>
            <button
              onClick={() => setShowCoordSearch(false)}
              className="text-[#8e9199] hover:text-[#e2e2e6] text-xs"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const l = parseFloat(inputLat);
              const lon = parseFloat(inputLon);
              if (!isNaN(l) && !isNaN(lon) && mapInstanceRef.current) {
                mapInstanceRef.current.setView([l, lon], 6);
                setCoordMessage(`Centered map to Lat ${l}°, Lon ${lon}°`);
              } else {
                setCoordMessage('Please enter valid numeric latitude (-90 to 90) and longitude (-180 to 180).');
              }
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#8e9199] mb-1">LATITUDE (°N/S)</label>
                <input
                  type="text"
                  placeholder="e.g. 15.4"
                  value={inputLat}
                  onChange={(e) => setInputLat(e.target.value)}
                  className="w-full bg-[#111316] border border-[#44474e]/40 rounded px-2 py-1 text-xs text-[#e2e2e6] focus:border-[#6cd7d4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#8e9199] mb-1">LONGITUDE (°E/W)</label>
                <input
                  type="text"
                  placeholder="e.g. 68.2"
                  value={inputLon}
                  onChange={(e) => setInputLon(e.target.value)}
                  className="w-full bg-[#111316] border border-[#44474e]/40 rounded px-2 py-1 text-xs text-[#e2e2e6] focus:border-[#6cd7d4] focus:outline-none"
                />
              </div>
            </div>

            {coordMessage && <div className="text-[10px] text-[#6cd7d4]">{coordMessage}</div>}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#29a09d] hover:bg-[#29a09d]/90 text-[#00302f] font-bold py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">center_focus_strong</span>
                Center Map
              </button>
            </div>
          </form>

          {/* Quick Lat/Lon Presets */}
          <div className="mt-3 pt-2 border-t border-[#44474e]/20">
            <span className="block text-[9px] text-[#8e9199] uppercase mb-1">Quick Ocean Coordinates</span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                onClick={() => {
                  setInputLat('15.5');
                  setInputLon('68.2');
                  mapInstanceRef.current?.setView([15.5, 68.2], 6);
                }}
                className="bg-[#111316] hover:bg-[#282a2d] p-1 rounded text-left text-[#c4c6cf] truncate"
              >
                Arabian Sea (15.5, 68.2)
              </button>
              <button
                onClick={() => {
                  setInputLat('14.2');
                  setInputLon('88.5');
                  mapInstanceRef.current?.setView([14.2, 88.5], 6);
                }}
                className="bg-[#111316] hover:bg-[#282a2d] p-1 rounded text-left text-[#c4c6cf] truncate"
              >
                Bay of Bengal (14.2, 88.5)
              </button>
              <button
                onClick={() => {
                  setInputLat('28.0');
                  setInputLon('-45.0');
                  mapInstanceRef.current?.setView([28.0, -45.0], 5);
                }}
                className="bg-[#111316] hover:bg-[#282a2d] p-1 rounded text-left text-[#c4c6cf] truncate"
              >
                N. Atlantic (28.0, -45.0)
              </button>
              <button
                onClick={() => {
                  setInputLat('-60.0');
                  setInputLon('20.0');
                  mapInstanceRef.current?.setView([-60.0, 20.0], 4);
                }}
                className="bg-[#111316] hover:bg-[#282a2d] p-1 rounded text-left text-[#c4c6cf] truncate"
              >
                Southern Ocean (-60, 20)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Mini Inset Map Overlay ("Map-on-Map") */}
      {showMiniMap && (
        <div className="absolute top-14 right-3 z-20 w-44 h-32 bg-[#111316]/95 border-2 border-[#6cd7d4] rounded-xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-[#1e2023] px-2 py-1 border-b border-[#6cd7d4]/30 flex justify-between items-center text-[9px] font-mono font-bold text-[#6cd7d4]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">public</span>
              GLOBAL MAP INSET
            </span>
            <button
              onClick={() => setShowMiniMap(false)}
              className="text-[#8e9199] hover:text-[#e2e2e6]"
              title="Close inset"
            >
              ✕
            </button>
          </div>

          {/* Inset Canvas */}
          <div ref={miniMapContainerRef} className="w-full flex-1 cursor-pointer bg-[#0a192f]" />
        </div>
      )}
    </div>
  );
};

