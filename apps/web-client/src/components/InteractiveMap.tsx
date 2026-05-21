import React, { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import turkeyData from "../assets/data/turkey-districts.json";

const TURKEY_CENTER: [number, number] = [35.2433, 38.9637];

interface InteractiveMapProps {
  onRegionClick?: (regionId: string, regionName: string) => void;
  regionStates?: Record<string, { color: string; owner: string }>;
}

const MemoizedGeography = memo(({ 
  geo, 
  color, 
  isSelected, 
  onClick 
}: any) => {
  return (
    <Geography
      geography={geo}
      onClick={() => onClick(geo.properties["@id"] || geo.properties.name, geo.properties.name)}
      style={{
        default: {
          fill: color,
          stroke: isSelected ? "#38bdf8" : "#1e293b",
          strokeWidth: isSelected ? 1.5 : 0.5,
          outline: "none",
          transition: "fill 0.2s ease"
        },
        hover: {
          fill: "#0ea5e9",
          stroke: "#f8fafc",
          strokeWidth: 1.2,
          outline: "none",
          cursor: "pointer",
          transition: "fill 0.2s ease"
        },
        pressed: {
          fill: "#0369a1",
          outline: "none"
        }
      }}
    />
  );
}, (prev, next) => {
  return prev.color === next.color && prev.isSelected === next.isSelected;
});

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onRegionClick,
  regionStates = {}
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const handleRegionClick = (id: string, name: string) => {
    setSelectedRegionId(id);
    if (onRegionClick) {
      onRegionClick(id, name);
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: TURKEY_CENTER,
          scale: 3600
        }}
        width={800}
        height={500}
        className="w-full h-full max-h-[550px]"
      >
        <ZoomableGroup center={TURKEY_CENTER} zoom={1} minZoom={1} maxZoom={8}>
          <Geographies geography={turkeyData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const id = geo.properties["@id"] || geo.properties.name;
                const isSelected = selectedRegionId === id;
                const regionState = regionStates[id];
                const color = isSelected ? "#38bdf8" : (regionState?.color || "#1e293b");

                return (
                  <MemoizedGeography
                    key={id}
                    geo={geo}
                    color={color}
                    isSelected={isSelected}
                    onClick={handleRegionClick}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800/80 backdrop-blur-sm pointer-events-none">
        Zoom: Mouse Scroll | Sürükle: Drag
      </div>
    </div>
  );
};
