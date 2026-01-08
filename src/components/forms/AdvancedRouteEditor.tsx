import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents, useMap } from 'react-leaflet';
import { X, Trash2, Undo, Save, RotateCcw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RoutePoint {
  lat: number;
  lng: number;
  id: string;
}

interface AdvancedRouteEditorProps {
  onClose: () => void;
  onSave: (route: [number, number][]) => void;
  initialRoute?: [number, number][];
  routeColor?: string;
  title?: string;
}

const pointIcon = L.divIcon({
  html: '<div style="width: 12px; height: 12px; background: white; border: 3px solid #3B82F6; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'route-point-marker',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const midpointIcon = L.divIcon({
  html: '<div style="width: 10px; height: 10px; background: #10B981; border: 2px solid white; border-radius: 50%; opacity: 0.8; cursor: pointer;"></div>',
  className: 'midpoint-marker',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

function RouteEditor({
  points,
  setPoints,
  isDrawing,
  routeColor
}: {
  points: RoutePoint[];
  setPoints: (points: RoutePoint[]) => void;
  isDrawing: boolean;
  routeColor: string;
}) {
  const [draggingPoint, setDraggingPoint] = useState<string | null>(null);

  useMapEvents({
    click(e) {
      if (isDrawing && !draggingPoint) {
        const newPoint: RoutePoint = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          id: `point-${Date.now()}-${Math.random()}`
        };
        setPoints([...points, newPoint]);
      }
    },
    mousemove(e) {
      if (draggingPoint) {
        setPoints(points.map(p =>
          p.id === draggingPoint
            ? { ...p, lat: e.latlng.lat, lng: e.latlng.lng }
            : p
        ));
      }
    },
    mouseup() {
      setDraggingPoint(null);
    }
  });

  const handleRemovePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id));
  };

  const handleAddMidpoint = (index: number) => {
    if (index < points.length - 1) {
      const p1 = points[index];
      const p2 = points[index + 1];
      const midPoint: RoutePoint = {
        lat: (p1.lat + p2.lat) / 2,
        lng: (p1.lng + p2.lng) / 2,
        id: `point-${Date.now()}-${Math.random()}`
      };
      const newPoints = [...points];
      newPoints.splice(index + 1, 0, midPoint);
      setPoints(newPoints);
    }
  };

  const getMidpoints = () => {
    const midpoints: { lat: number; lng: number; index: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      midpoints.push({
        lat: (points[i].lat + points[i + 1].lat) / 2,
        lng: (points[i].lng + points[i + 1].lng) / 2,
        index: i
      });
    }
    return midpoints;
  };

  return (
    <>
      {points.length > 1 && (
        <Polyline
          positions={points.map(p => [p.lat, p.lng])}
          color={routeColor}
          weight={4}
          opacity={0.7}
        />
      )}

      {getMidpoints().map((mid, idx) => (
        <Marker
          key={`mid-${idx}`}
          position={[mid.lat, mid.lng]}
          icon={midpointIcon}
          eventHandlers={{
            click: () => handleAddMidpoint(mid.index)
          }}
        />
      ))}

      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={pointIcon}
          draggable={true}
          eventHandlers={{
            dragstart: () => setDraggingPoint(point.id),
            dragend: () => setDraggingPoint(null),
            contextmenu: () => handleRemovePoint(point.id)
          }}
        />
      ))}
    </>
  );
}

function MapCenterUpdater({ points }: { points: RoutePoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points.length, map]);

  return null;
}

export function AdvancedRouteEditor({
  onClose,
  onSave,
  initialRoute = [],
  routeColor = '#3B82F6',
  title = 'Editor de Rota'
}: AdvancedRouteEditorProps) {
  const [points, setPoints] = useState<RoutePoint[]>(
    initialRoute.map((coord, idx) => ({
      lat: coord[0],
      lng: coord[1],
      id: `point-${idx}`
    }))
  );
  const [isDrawing, setIsDrawing] = useState(initialRoute.length === 0);

  const handleSave = () => {
    if (points.length < 2) {
      alert('A rota precisa ter pelo menos 2 pontos');
      return;
    }
    onSave(points.map(p => [p.lat, p.lng]));
    onClose();
  };

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (confirm('Deseja limpar todos os pontos da rota?')) {
      setPoints([]);
      setIsDrawing(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600 mt-1">
              {isDrawing ? 'Clique no mapa para adicionar pontos' : 'Arraste os pontos para editar'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={points.length > 0 ? [points[0].lat, points[0].lng] : [-15.7801, -47.9292]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterUpdater points={points} />
            <RouteEditor
              points={points}
              setPoints={setPoints}
              isDrawing={isDrawing}
              routeColor={routeColor}
            />
          </MapContainer>

          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000] max-w-xs">
            <h3 className="font-medium text-slate-900 mb-2">Instruções</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Clique no mapa para adicionar pontos</li>
              <li>• Arraste pontos brancos para mover</li>
              <li>• Clique nos pontos verdes para adicionar ponto no meio</li>
              <li>• Clique com botão direito para remover ponto</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-900">
                Pontos: <span className="text-blue-600">{points.length}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex gap-2">
          <button
            onClick={handleUndo}
            disabled={points.length === 0}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Undo className="w-4 h-4" />
            Desfazer
          </button>
          <button
            onClick={handleClear}
            disabled={points.length === 0}
            className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar
          </button>
          <button
            onClick={() => setIsDrawing(!isDrawing)}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              isDrawing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {isDrawing ? 'Modo: Desenho' : 'Modo: Edição'}
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
            disabled={points.length < 2}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Rota
          </button>
        </div>
      </div>
    </div>
  );
}
