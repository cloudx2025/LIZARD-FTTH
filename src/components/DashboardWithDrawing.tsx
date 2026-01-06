import { useState } from 'react';
import { SidebarWithDrawing } from './SidebarWithDrawing';
import { MapViewWithDrawing } from './MapViewWithDrawing';

export function DashboardWithDrawing() {
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#0088FF');
  const [existingRoute, setExistingRoute] = useState<[number, number][] | undefined>(undefined);
  const [markerClickPoint, setMarkerClickPoint] = useState<[number, number] | null>(null);

  const handleStartDrawing = (_caboId: string | null, color: string, route?: [number, number][]) => {
    setDrawingColor(color);
    setExistingRoute(route);
    setMarkerClickPoint(null);
    setIsDrawingRoute(true);
  };

  const handleStopDrawing = () => {
    setIsDrawingRoute(false);
    setExistingRoute(undefined);
    setMarkerClickPoint(null);
  };

  const handleMarkerClick = (lat: number, lng: number) => {
    setMarkerClickPoint([lat, lng]);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <SidebarWithDrawing
        onDrawRoute={handleStartDrawing}
        isDrawingRoute={isDrawingRoute}
        onStopDrawing={handleStopDrawing}
      />
      <div className="flex-1 relative">
        <MapViewWithDrawing
          isDrawingRoute={isDrawingRoute}
          drawingColor={drawingColor}
          existingRoute={existingRoute}
          onMarkerClick={handleMarkerClick}
          markerClickPoint={markerClickPoint}
        />
      </div>
    </div>
  );
}
