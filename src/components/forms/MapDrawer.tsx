import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMapEvents } from 'react-leaflet';
import { X, Trash2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface MapDrawerProps {
  onClose: () => void;
  onSave: (route: [number, number][]) => void;
  initialRoute?: [number, number][];
  cableColor?: string;
}

function DrawingHandler({
  route,
  setRoute
}: {
  route: [number, number][];
  setRoute: (route: [number, number][]) => void;
}) {
  useMapEvents({
    click(e) {
      setRoute([...route, [e.latlng.lat, e.latlng.lng]]);
    },
  });

  return null;
}

export function MapDrawer({ onClose, onSave, initialRoute = [], cableColor = '#3B82F6' }: MapDrawerProps) {
  const [route, setRoute] = useState<[number, number][]>(initialRoute);
  const mapRef = useRef<any>(null);

  const handleSave = () => {
    onSave(route);
    onClose();
  };

  const handleClearRoute = () => {
    setRoute([]);
  };

  const handleUndo = () => {
    setRoute(route.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">Desenhar Rota no Mapa</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={[-23.5505, -46.6333]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DrawingHandler route={route} setRoute={setRoute} />
            {route.length > 0 && (
              <Polyline
                positions={route}
                color={cableColor}
                weight={4}
                opacity={0.7}
              />
            )}
          </MapContainer>

          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
            <p className="text-sm text-slate-700 font-medium mb-2">
              Clique no mapa para adicionar pontos
            </p>
            <p className="text-xs text-slate-500">
              {route.length === 0
                ? 'Nenhum ponto adicionado'
                : `${route.length} ponto${route.length > 1 ? 's' : ''} adicionado${route.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex gap-2">
          <button
            onClick={handleUndo}
            disabled={route.length === 0}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Desfazer
          </button>
          <button
            onClick={handleClearRoute}
            disabled={route.length === 0}
            className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Tudo
          </button>
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Salvar Rota
          </button>
        </div>
      </div>
    </div>
  );
}
