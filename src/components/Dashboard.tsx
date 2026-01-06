import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MapView } from './MapView';
import AdminSettings from './AdminSettings';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<'map' | 'settings'>('map');

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar onNavigate={setCurrentView} currentView={currentView} />
      <div className="flex-1 relative">
        {currentView === 'map' ? <MapView /> : <AdminSettings />}
      </div>
    </div>
  );
}
