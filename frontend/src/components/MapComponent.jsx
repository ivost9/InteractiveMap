import React, { useEffect, useRef, useState } from "react";
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPTILER_KEY = "U4Hl9Js0IoGwOOb6QM3f";
const MAP_STYLE = `https://api.maptiler.com/maps/hybrid-v4/style.json?key=${MAPTILER_KEY}`;

const POPINTSI_COORDS = { longitude: 24.28, latitude: 42.423 };

export default function MapComponent({ places, onSelectPlace, activePlace }) {
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [is3D, setIs3D] = useState(false);

  // Функция за спиране на авто-ротацията
  const stopAutorotation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Анимация при избор на обект
  useEffect(() => {
    if (!mapRef.current || !activePlace) return;

    const map = mapRef.current.getMap();

    // Подсигуряване на координатите
    const coordinates = activePlace.geometry?.coordinates;
    if (!coordinates) return;
    const [lng, lat] = coordinates;

    stopAutorotation();

    map.flyTo({
      center: [lng, lat],
      zoom: 16,
      pitch: 60,
      bearing: 0,
      essential: true,
    });

    const rotateMap = () => {
      map.setBearing((map.getBearing() + 0.04) % 360);
      animationFrameRef.current = requestAnimationFrame(rotateMap);
    };

    const timer = setTimeout(() => {
      rotateMap();
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activePlace]);

  const onMapLoad = (e) => {
    const map = e.target;
    map.addSource("maptiler-terrain", {
      type: "raster-dem",
      url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
      tileSize: 256,
    });
    map.setTerrain({ source: "maptiler-terrain", exaggeration: 1.3 });
  };

  const toggle2D3D = () => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    stopAutorotation();

    if (is3D) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      setIs3D(false);
    } else {
      map.easeTo({ pitch: 60, duration: 800 });
      setIs3D(true);
    }
  };

  const resetToPopintsi = () => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    stopAutorotation();
    onSelectPlace(null);

    map.flyTo({
      center: [POPINTSI_COORDS.longitude, POPINTSI_COORDS.latitude],
      zoom: 15,
      pitch: 0,
      bearing: 0,
      duration: 1500,
    });
    setIs3D(false);
  };

  const labelLayerStyle = {
    id: "places-labels",
    type: "symbol",
    layout: {
      "text-field": ["get", "title"],
      "text-font": ["Noto Sans Regular", "Roboto Regular"],
      "text-size": 13,
      "text-offset": [0, 1.6],
      "text-anchor": "top",
      "text-allow-overlap": ["step", ["zoom"], false, 15, true],
      "text-ignore-placement": ["step", ["zoom"], false, 15, true],
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "#0f172a",
      "text-halo-width": 2,
    },
  };

  return (
    <div
      className="w-full h-full relative"
      style={{ width: "100%", height: "100%" }}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: POPINTSI_COORDS.longitude,
          latitude: POPINTSI_COORDS.latitude,
          zoom: 14.8,
          pitch: 0,
          bearing: 0,
        }}
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        onLoad={onMapLoad}
        style={{ width: "100%", height: "100%" }}
        className="w-full h-full"
        attributionControl={false} // 🔥 ЕТО ТОВА ПРЕМАХВА КРЪГЛОТО ИНФО ЗА MAPLIBRE!
        onMoveStart={(e) => {
          if (e.originalEvent) stopAutorotation();
        }}
        onZoomStart={(e) => {
          if (e.originalEvent) stopAutorotation();
        }}
      >
        {/* Бутоните за управление */}
        <div className="absolute top-4 left-4 md:left-auto md:right-4 z-30 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={toggle2D3D}
            className="px-3 py-2 bg-slate-900/95 text-white rounded-xl font-bold border border-slate-700 shadow-2xl backdrop-blur-md hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all text-[11px] md:text-xs"
          >
            {is3D ? "🗺️ 2D ИЗГЛЕД" : "⛰️ 3D ИЗГЛЕД"}
          </button>

          <button
            onClick={resetToPopintsi}
            className="px-3 py-2 bg-slate-900/95 text-emerald-400 rounded-xl font-bold border border-slate-700 shadow-2xl backdrop-blur-md hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all text-[11px] md:text-xs"
          >
            {is3D ? "🏠 ПОПИНЦИ (ЦЕНТЪР)" : "🏠 ПОПИНЦИ (ЦЕНТЪР)"}
          </button>
        </div>

        {/* Навигационни контроли */}
        <NavigationControl position="bottom-right" showCompass={true} />

        {/* Слой за етикетите */}
        {places && (
          <Source type="geojson" data={places}>
            <Layer
              {...labelLayerStyle}
              filter={
                activePlace
                  ? [
                      "!=",
                      ["get", "id"],
                      activePlace.properties?.id || activePlace.id,
                    ]
                  : ["has", "id"]
              }
            />
          </Source>
        )}

        {/* Маркерите */}
        {places?.features?.map((place) => {
          const coordinates = place?.geometry?.coordinates;
          if (!coordinates || coordinates.length < 2) return null;

          const placeId = place.properties?.id || place.id;
          const activeId = activePlace?.properties?.id || activePlace?.id;
          const isSelected = activePlace && placeId === activeId;

          const placeIcon =
            place.properties?.icon ||
            place.properties?.raw?.icon ||
            place.icon ||
            "⛰️";

          return (
            <Marker
              key={placeId}
              longitude={coordinates[0]}
              latitude={coordinates[1]}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelectPlace(null);
                setTimeout(() => onSelectPlace(place), 50);
              }}
            >
              {isSelected ? (
                // 🎯 Изглед, когато мястото Е ИЗБРАНО (Пулсираща точка)
                <div className="relative flex items-center justify-center w-8 h-8 animate-fade-in">
                  <div className="absolute w-6 h-6 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                  <div className="w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-white shadow-xl"></div>
                </div>
              ) : (
                // 📍 ЕЛЕГАНТНА КЪРФИЦА (Мап пин) за неизбраните места
                <div className="group relative cursor-pointer flex flex-col items-center transition-transform duration-300 hover:scale-110 active:scale-95 select-none">
                  {/* Тялото на карфицата */}
                  <div
                    className="
          w-8 h-8 
          bg-gradient-to-tr from-slate-900 to-slate-800 
          border border-slate-600/50 
          rounded-full 
          shadow-[0_4px_10px_rgba(0,0,0,0.5)] 
          flex items-center justify-center 
          relative z-10
          group-hover:border-emerald-500/80
          transition-colors duration-300
        "
                  >
                    {/* Малка елегантна точка или мини-иконка в центъра на карфицата */}
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full group-hover:bg-emerald-300 transition-colors"></div>
                  </div>

                  {/* Острото връхче на карфицата отдолу */}
                  <div
                    className="
          w-2 h-2 
          bg-slate-900 
          border-r border-b border-slate-600/50 
          rotate-45 
          -mt-1 
          shadow-[2px_2px_3px_rgba(0,0,0,0.3)]
          group-hover:border-emerald-500/80
          transition-colors duration-300
        "
                  ></div>
                </div>
              )}
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
