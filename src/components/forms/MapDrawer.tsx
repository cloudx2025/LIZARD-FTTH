import { useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMapEvents } from 'react-leaflet';
import { X, Trash2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface MapDrawerProps {
  onClose: () => void;
  onSave: (route: [number, number][]) => void;
  initialRoute?: [number, number][];
  cableColor?: string;
}

function RouteDrawer({
  route,
  setRoute,
  cableColor
}: {
  route: [number, number][];
  setRoute: (route: [number, number][]) => void;
  cableColor: string;
}) {
  useMapEvents({
    click(e) {
      setRoute([...route, [e.latlng.lat, e.latlng.lng]]);
    },
  });

  return route.length > 0 ? (
    <Polyline positions={route} color={cableColor} weight={4} opacity={0.8} />
  ) : null;
}

export function MapDrawer({ onClose, onSave, initialRoute = [], cableColor = '#3B82F6' }: MapDrawerProps) {
  const [route, setRoute] = useState<[number, number][]>(initialRoute);

  const handleSave = () => {
    onSave(route);
    onClose();
  };

  const handleClear = () => {
    setRoute([]);
  };

  const handleUndo = () => {
    if (route.length > 0) {
      setRoute(route.slice(0, -1));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Desenhar Rota do Cabo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-900">
            Clique no mapa para adicionar pontos da rota. Os pontos serão conectados na ordem em que você clicar.
          </p>
          <div className="mt-2 text-xs text-blue-700">
            Pontos adicionados: {route.length}
          </div>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={[-15.7942, -47.8822]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RouteDrawer route={route} setRoute={setRoute} cableColor={cableColor} />
          </MapContainer>
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-2">
          <button
            onClick={handleUndo}
            disabled={route.length === 0}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Desfazer
          </button>
          <button
            onClick={handleClear}
            disabled={route.length === 0}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Tudo
          </button>
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={route.length < 2}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar Rota
          </button>
        </div>
      </div>
    </div>
  );
}
