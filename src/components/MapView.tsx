import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

interface POP {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco: string;
  descricao: string | null;
}

interface CTO {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco: string | null;
  capacidade: number;
  status: string;
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

const popIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ctoIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

export function MapView() {
  const [pops, setPops] = useState<POP[]>([]);
  const [ctos, setCtos] = useState<CTO[]>([]);
  const [cabos, setCabos] = useState<Cabo[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultCenter: LatLngExpression = [-15.7801, -47.9292];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [popsResult, ctosResult, cabosResult] = await Promise.all([
      supabase.from('pops').select('*'),
      supabase.from('ctos').select('*'),
      supabase.from('cabos').select('*')
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

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-600">Carregando mapa...</div>
      </div>
    );
  }

  return (
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

      {cabos.map((cabo) => {
        if (cabo.pop_origem && cabo.pop_destino) {
          const positions: LatLngExpression[] = [
            [cabo.pop_origem.latitude, cabo.pop_origem.longitude],
            [cabo.pop_destino.latitude, cabo.pop_destino.longitude]
          ];

          return (
            <Polyline
              key={cabo.id}
              positions={positions}
              color={cabo.cor}
              weight={4}
              opacity={0.7}
            >
              <Popup>
                <div className="font-semibold">{cabo.nome}</div>
                <div className="text-sm text-slate-600">Tipo: {cabo.tipo}</div>
                <div className="text-sm text-slate-600">Capacidade: {cabo.capacidade} fibras</div>
                <div className="text-sm text-slate-600">Status: {cabo.status}</div>
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
          icon={popIcon}
        >
          <Popup>
            <div className="font-semibold text-blue-600">{pop.nome}</div>
            <div className="text-sm text-slate-600">{pop.endereco}</div>
            {pop.descricao && <div className="text-sm mt-1">{pop.descricao}</div>}
          </Popup>
        </Marker>
      ))}

      {ctos.map((cto) => (
        <Marker
          key={cto.id}
          position={[cto.latitude, cto.longitude]}
          icon={ctoIcon}
        >
          <Popup>
            <div className="font-semibold text-red-600">{cto.nome}</div>
            {cto.endereco && <div className="text-sm text-slate-600">{cto.endereco}</div>}
            <div className="text-sm text-slate-600">Capacidade: {cto.capacidade} portas</div>
            <div className="text-sm text-slate-600">Status: {cto.status}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
