import { useState } from 'react';
import { SidebarWithDrawing } from './SidebarWithDrawing';
import { MapView } from './MapView';
import AdminSettings from './AdminSettings';

export function DashboardWithDrawing() {
  const [currentView, setCurrentView] = useState<'map' | 'settings'>('map');
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);

  const handleStopDrawing = () => {
    setIsDrawingRoute(false);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <SidebarWithDrawing
        isDrawingRoute={isDrawingRoute}
        onStopDrawing={handleStopDrawing}
        onNavigate={setCurrentView}
        currentView={currentView}
      />
      <div className="flex-1 relative">
        {currentView === 'map' ? (
          <MapView />
        ) : (
          <AdminSettings />
        )}
      </div>
    </div>
  );
}
