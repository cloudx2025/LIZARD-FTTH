import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MapView } from './MapView';
import AdminSettings from './AdminSettings';
import { RouteDrawingProvider } from '../contexts/RouteDrawingContext';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<'map' | 'settings'>('map');

  return (
    <RouteDrawingProvider>
      <div className="h-screen w-screen flex overflow-hidden">
        <Sidebar onNavigate={setCurrentView} currentView={currentView} />
        <div className="flex-1 relative">
          {currentView === 'map' ? <MapView /> : <AdminSettings />}
        </div>
      </div>
    </RouteDrawingProvider>
  );
}
