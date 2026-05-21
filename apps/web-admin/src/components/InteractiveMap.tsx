import React, { useState, useEffect, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import turkeyData from "../assets/data/turkey-districts.json";

// We use an approximate center for Turkey
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
          stroke: isSelected ? "#FFFFFF" : "#0F172A",
          strokeWidth: isSelected ? 1 : 0.5,
          outline: "none"
        },
        hover: {
          fill: "#38BDF8", // neon blue on hover
          stroke: "#FFFFFF",
          strokeWidth: 1,
          outline: "none",
          cursor: "pointer"
        },
        pressed: {
          fill: "#0284C7",
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRegionClick = (id: string, name: string) => {
    setSelectedRegionId(id);
    if (onRegionClick) {
      onRegionClick(id, name);
    }
  };

  const mapHeight = isMobile ? 350 : 500;

  return (
    <div style={{
      width: '100%',
      height: `${mapHeight}px`,
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      border: '1px solid #334155',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: TURKEY_CENTER,
          scale: isMobile ? 2200 : 3000
        }}
        width={800}
        height={mapHeight}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <ZoomableGroup center={TURKEY_CENTER} zoom={1} minZoom={1} maxZoom={10}>
          <Geographies geography={turkeyData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const id = geo.properties["@id"] || geo.properties.name;
                const isSelected = selectedRegionId === id;
                const regionState = regionStates[id];
                const color = isSelected ? "#38BDF8" : (regionState?.color || "#1E293B");

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
      
      {/* Overlay controls or legends can go here */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        color: '#94a3b8',
        fontSize: '11px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(4px)',
        padding: '4px 10px',
        borderRadius: '6px',
        border: '1px solid #334155',
        pointerEvents: 'none',
        fontWeight: '500'
      }}>
        Kaydırarak yakınlaştırın, sürükleyin
      </div>
    </div>
  );
};
