import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl, useMapEvents, Circle } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { supabase } from '../lib/supabase';
import { getPopIcon, getCtoIcon } from '../lib/mapIcons';
import { useRouteDrawing } from '../contexts/RouteDrawingContext';
import { Undo2, Trash2, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

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

function DrawingHandler() {
  const { isDrawing, addPoint } = useRouteDrawing();

  useMapEvents({
    click(e) {
      if (isDrawing) {
        addPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return null;
}

function DrawingControls() {
  const { isDrawing, currentRoute, removePoint, clearRoute, stopDrawing } = useRouteDrawing();

  if (!isDrawing) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-md">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Desenhando Rota</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {currentRoute.length} pontos
            </span>
          </div>
        </div>

        <div className="text-sm text-slate-600 space-y-1">
          <p>• Clique no mapa para adicionar pontos</p>
          <p>• Arraste pontos brancos para mover</p>
          <p>• Clique nos pontos verdes para adicionar ponto no meio</p>
          <p>• Clique com botão direito para remover ponto</p>
        </div>

        <div className="flex gap-2">
          {currentRoute.length > 0 && (
            <>
              <button
                onClick={() => removePoint(currentRoute.length - 1)}
                className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center justify-center gap-2 text-sm"
                title="Desfazer último ponto"
              >
                <Undo2 className="w-4 h-4" />
                Desfazer
              </button>
              <button
                onClick={clearRoute}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 text-sm"
                title="Limpar rota"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </button>
            </>
          )}
          <button
            onClick={stopDrawing}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <Check className="w-4 h-4" />
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

export function MapView() {
  const [pops, setPops] = useState<POP[]>([]);
  const [ctos, setCtos] = useState<CTO[]>([]);
  const [cabos, setCabos] = useState<Cabo[]>([]);
  const [ctoConexoes, setCtoConexoes] = useState<CtoConexao[]>([]);
  const [loading, setLoading] = useState(true);
  const [popColor, setPopColor] = useState('#10B981');
  const [ctoColor, setCtoColor] = useState('#F59E0B');
  const [cableColor, setCableColor] = useState('#3B82F6');
  const { isDrawing, currentRoute, removePoint } = useRouteDrawing();

  const defaultCenter: LatLngExpression = [-15.7801, -47.9292];

  useEffect(() => {
    loadData();
    loadColors();

    const handleCabosUpdate = () => {
      loadData();
    };

    const handleCtoUpdate = () => {
      loadData();
    };

    window.addEventListener('cabos-updated', handleCabosUpdate);
    window.addEventListener('cto-conexoes-updated', handleCtoUpdate);

    return () => {
      window.removeEventListener('cabos-updated', handleCabosUpdate);
      window.removeEventListener('cto-conexoes-updated', handleCtoUpdate);
    };
  }, []);

  const loadColors = async () => {
    const { data: popColorData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'pop_color')
      .maybeSingle();

    const { data: ctoColorData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'cto_color')
      .maybeSingle();

    const { data: cableColorData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'cable_color')
      .maybeSingle();

    if (popColorData?.value) setPopColor(popColorData.value as string);
    if (ctoColorData?.value) setCtoColor(ctoColorData.value as string);
    if (cableColorData?.value) setCableColor(cableColorData.value as string);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-600">Carregando mapa...</div>
      </div>
    );
  }

  const handlePointRightClick = (index: number) => {
    removePoint(index);
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Mapa Padrão">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Satélite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </BaseLayer>
        </LayersControl>

        <MapUpdater pops={pops} />
        <DrawingHandler />

      {cabos.map((cabo) => {
        let positions: LatLngExpression[] = [];

        if (cabo.coordenadas && Array.isArray(cabo.coordenadas) && cabo.coordenadas.length > 0) {
          positions = cabo.coordenadas as LatLngExpression[];
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
              color={cabo.cor || cableColor}
              weight={4}
              opacity={0.7}
            >
              <Popup>
                <div className="font-semibold">{cabo.nome}</div>
                <div className="text-sm text-slate-600">Tipo: {cabo.tipo}</div>
                <div className="text-sm text-slate-600">Capacidade: {cabo.capacidade} fibras</div>
                <div className="text-sm text-slate-600">Status: {cabo.status}</div>
                {cabo.coordenadas && Array.isArray(cabo.coordenadas) && cabo.coordenadas.length > 0 && (
                  <div className="text-sm text-blue-600 mt-1">Rota customizada ({cabo.coordenadas.length} pontos)</div>
                )}
              </Popup>
            </Polyline>
          );
        }
        return null;
      })}

      {pops.map((pop) => (
        <Marker
          key={pop.id}
          position={[pop.latitude, pop.longitude]}
          icon={getPopIcon(popColor)}
        >
          <Popup>
            <div className="font-semibold" style={{ color: popColor }}>{pop.nome}</div>
            <div className="text-sm text-slate-600">{pop.endereco}</div>
            {pop.descricao && <div className="text-sm mt-1">{pop.descricao}</div>}
          </Popup>
        </Marker>
      ))}

      {ctoConexoes.map((conexao) => {
        let positions: LatLngExpression[] = [];

        if (conexao.coordenadas && Array.isArray(conexao.coordenadas) && conexao.coordenadas.length > 0) {
          positions = conexao.coordenadas as LatLngExpression[];
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
              color={conexao.cor || cableColor}
              weight={3}
              opacity={0.6}
              dashArray="10, 10"
            >
              <Popup>
                <div className="font-semibold">{conexao.nome}</div>
                <div className="text-sm text-slate-600">Conexão CTO</div>
                <div className="text-sm text-slate-600">Status: {conexao.status}</div>
                {conexao.coordenadas && Array.isArray(conexao.coordenadas) && conexao.coordenadas.length > 0 && (
                  <div className="text-sm text-blue-600 mt-1">Rota customizada ({conexao.coordenadas.length} pontos)</div>
                )}
              </Popup>
            </Polyline>
          );
        }
        return null;
      })}

      {ctos.map((cto) => (
        <Marker
          key={cto.id}
          position={[cto.latitude, cto.longitude]}
          icon={getCtoIcon(ctoColor)}
        >
          <Popup>
            <div className="font-semibold" style={{ color: ctoColor }}>{cto.nome}</div>
            {cto.endereco && <div className="text-sm text-slate-600">{cto.endereco}</div>}
            <div className="text-sm text-slate-600">Capacidade: {cto.capacidade} portas</div>
            <div className="text-sm text-slate-600">Status: {cto.status}</div>
          </Popup>
        </Marker>
      ))}

      {isDrawing && currentRoute.length > 0 && (
        <>
          <Polyline
            positions={currentRoute}
            color="#3B82F6"
            weight={4}
            opacity={0.7}
          />
          {currentRoute.map((point, index) => (
            <Circle
              key={`draw-point-${index}`}
              center={point}
              radius={5}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#3B82F6',
                fillOpacity: 1,
                weight: 2
              }}
              eventHandlers={{
                contextmenu: () => handlePointRightClick(index)
              }}
            />
          ))}
        </>
      )}
    </MapContainer>
    <DrawingControls />
    </div>
  );
}
