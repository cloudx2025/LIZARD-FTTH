import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { supabase } from '../lib/supabase';
import { RouteDrawer } from './RouteDrawer';
import { getPopIcon, getCtoIcon } from '../lib/mapIcons';
import 'leaflet/dist/leaflet.css';

interface POP {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco: string;
  descricao: string | null;
  icone: string;
}

interface CTO {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco: string | null;
  capacidade: number;
  status: string;
  icone: string;
}

interface Cabo {
  id: string;
  nome: string;
  cor: string;
  tipo: string;
  capacidade: number;
  status: string;
  coordenadas: any;
  pop_origem_id?: string | null;
  pop_destino_id?: string | null;
  pop_origem?: POP | null;
  pop_destino?: POP | null;
}

interface CtoConexao {
  id: string;
  nome: string;
  cor: string;
  status: string;
  coordenadas: any;
  cto_origem_id?: string | null;
  cto_destino_id?: string | null;
  cto_origem?: CTO | null;
  cto_destino?: CTO | null;
}

function MapUpdater({ pops }: { pops: POP[] }) {
  const map = useMap();

  useEffect(() => {
    if (pops.length > 0) {
      const bounds = pops.map(pop => [pop.latitude, pop.longitude] as [number, number]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [pops, map]);

  return null;
}

interface MapViewProps {
  isDrawingRoute: boolean;
  drawingColor: string;
  existingRoute?: [number, number][];
  onMarkerClick?: (lat: number, lng: number) => void;
  markerClickPoint?: [number, number] | null;
}

export function MapViewWithDrawing({ isDrawingRoute, drawingColor, existingRoute, onMarkerClick, markerClickPoint }: MapViewProps) {
  const [pops, setPops] = useState<POP[]>([]);
  const [ctos, setCtos] = useState<CTO[]>([]);
  const [cabos, setCabos] = useState<Cabo[]>([]);
  const [ctoConexoes, setCtoConexoes] = useState<CtoConexao[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultCenter: LatLngExpression = [-15.7801, -47.9292];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [popsResult, ctosResult, cabosResult, conexoesResult] = await Promise.all([
      supabase.from('pops').select('*'),
      supabase.from('ctos').select('*'),
      supabase.from('cabos').select('*'),
      supabase.from('cto_conexoes').select('*')
    ]);

    if (popsResult.data) setPops(popsResult.data);
    if (ctosResult.data) setCtos(ctosResult.data);

    if (cabosResult.data) {
      const cabosComPops = await Promise.all(
        cabosResult.data.map(async (cabo) => {
          const origem = cabo.pop_origem_id
            ? (await supabase.from('pops').select('*').eq('id', cabo.pop_origem_id).maybeSingle()).data
            : null;
          const destino = cabo.pop_destino_id
            ? (await supabase.from('pops').select('*').eq('id', cabo.pop_destino_id).maybeSingle()).data
            : null;

          return {
            ...cabo,
            pop_origem: origem,
            pop_destino: destino
          };
        })
      );
      setCabos(cabosComPops as Cabo[]);
    }

    if (conexoesResult.data) {
      const conexoesComCtos = await Promise.all(
        conexoesResult.data.map(async (conexao) => {
          const origem = conexao.cto_origem_id
            ? (await supabase.from('ctos').select('*').eq('id', conexao.cto_origem_id).maybeSingle()).data
            : null;
          const destino = conexao.cto_destino_id
            ? (await supabase.from('ctos').select('*').eq('id', conexao.cto_destino_id).maybeSingle()).data
            : null;

          return {
            ...conexao,
            cto_origem: origem,
            cto_destino: destino
          };
        })
      );
      setCtoConexoes(conexoesComCtos as CtoConexao[]);
    }

    setLoading(false);
  };

  const handleRouteComplete = (coordinates: [number, number][]) => {
    if ((window as any).handleRouteComplete) {
      (window as any).handleRouteComplete(coordinates);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100">
        <div className="text-slate-600 text-lg">Carregando mapa...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isDrawingRoute && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Clique no mapa para adicionar pontos na rota
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater pops={pops} />

        <RouteDrawer
          isDrawing={isDrawingRoute}
          color={drawingColor}
          onRouteComplete={handleRouteComplete}
          initialRoute={existingRoute}
          markerClickPoint={markerClickPoint}
        />

        {!isDrawingRoute && cabos.map((cabo) => {
          let positions: LatLngExpression[] = [];

          if (cabo.coordenadas) {
            try {
              const coords = typeof cabo.coordenadas === 'string'
                ? JSON.parse(cabo.coordenadas)
                : cabo.coordenadas;
              positions = coords;
            } catch (e) {
              console.error('Erro ao parsear coordenadas', e);
            }
          } else if (cabo.pop_origem && cabo.pop_destino) {
            positions = [
              [cabo.pop_origem.latitude, cabo.pop_origem.longitude],
              [cabo.pop_destino.latitude, cabo.pop_destino.longitude]
            ];
          }

          if (positions.length > 0) {
            return (
              <Polyline
                key={cabo.id}
                positions={positions}
                color={cabo.cor}
                weight={4}
                opacity={0.7}
                eventHandlers={{
                  click: () => {
                    alert(`Cabo: ${cabo.nome}\nTipo: ${cabo.tipo}\nCapacidade: ${cabo.capacidade} fibras\nStatus: ${cabo.status}`);
                  }
                }}
              >
                <Tooltip permanent={false} direction="center">
                  <div className="text-center">
                    <div className="font-semibold">{cabo.nome}</div>
                    <div className="text-xs">{cabo.tipo} • {cabo.capacidade}F</div>
                  </div>
                </Tooltip>
              </Polyline>
            );
          }
          return null;
        })}

        {!isDrawingRoute && ctoConexoes.map((conexao) => {
          let positions: LatLngExpression[] = [];

          if (conexao.coordenadas) {
            try {
              const coords = typeof conexao.coordenadas === 'string'
                ? JSON.parse(conexao.coordenadas)
                : conexao.coordenadas;
              positions = coords;
            } catch (e) {
              console.error('Erro ao parsear coordenadas da conexão CTO', e);
            }
          } else if (conexao.cto_origem && conexao.cto_destino) {
            positions = [
              [conexao.cto_origem.latitude, conexao.cto_origem.longitude],
              [conexao.cto_destino.latitude, conexao.cto_destino.longitude]
            ];
          }

          if (positions.length > 0) {
            return (
              <Polyline
                key={conexao.id}
                positions={positions}
                color={conexao.cor}
                weight={3}
                opacity={0.6}
                dashArray="10, 10"
                eventHandlers={{
                  click: () => {
                    alert(`Conexão CTO: ${conexao.nome}\nStatus: ${conexao.status}`);
                  }
                }}
              >
                <Tooltip permanent={false} direction="center">
                  <div className="text-center">
                    <div className="font-semibold">{conexao.nome}</div>
                    <div className="text-xs">Conexão CTO</div>
                  </div>
                </Tooltip>
              </Polyline>
            );
          }
          return null;
        })}

        {pops.map((pop) => (
          <Marker
            key={pop.id}
            position={[pop.latitude, pop.longitude]}
            icon={getPopIcon(pop.icone)}
            eventHandlers={{
              click: () => {
                if (isDrawingRoute && onMarkerClick) {
                  onMarkerClick(pop.latitude, pop.longitude);
                }
              }
            }}
          >
            <Popup>
              <div className="font-semibold text-blue-600">{pop.nome}</div>
              <div className="text-sm text-slate-600">{pop.endereco}</div>
              {pop.descricao && <div className="text-sm mt-1">{pop.descricao}</div>}
            </Popup>
            <Tooltip direction="top" offset={[0, -40]}>
              {pop.nome}
            </Tooltip>
          </Marker>
        ))}

        {ctos.map((cto) => (
          <Marker
            key={cto.id}
            position={[cto.latitude, cto.longitude]}
            icon={getCtoIcon(cto.icone)}
            eventHandlers={{
              click: () => {
                if (isDrawingRoute && onMarkerClick) {
                  onMarkerClick(cto.latitude, cto.longitude);
                }
              }
            }}
          >
            <Popup>
              <div className="font-semibold text-red-600">{cto.nome}</div>
              {cto.endereco && <div className="text-sm text-slate-600">{cto.endereco}</div>}
              <div className="text-sm text-slate-600">Capacidade: {cto.capacidade} portas</div>
              <div className="text-sm text-slate-600">Status: {cto.status}</div>
            </Popup>
            <Tooltip direction="top" offset={[0, -40]}>
              {cto.nome}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
