import { Sidebar } from './Sidebar';
import { MapView } from './MapView';

export function Dashboard() {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative">
        <MapView />
      </div>
    </div>
  );
}
