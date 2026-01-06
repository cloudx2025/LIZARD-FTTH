import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { supabase } from '../lib/supabase';
import { createCustomIcon, iconTypes } from '../lib/mapIcons';
import 'leaflet/dist/leaflet.css';

interface POP {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco: string;
  icone: string;
}

interface CTO {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  capacidade: number;
  status: string;
  icone: string;
}

interface Cabo {
  id: string;
  nome: string;
  rota: any;
}

export function MapView() {
  const [pops, setPops] = useState<POP[]>([]);
  const [ctos, setCtos] = useState<CTO[]>([]);
  const [cabos, setCabos] = useState<Cabo[]>([]);

  useEffect(() => {
    loadData();

    const subscription = supabase
      .channel('map_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pops' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ctos' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cabos' }, loadData)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    const [popsResult, ctosResult, cabosResult] = await Promise.all([
      supabase.from('pops').select('*'),
      supabase.from('ctos').select('*'),
      supabase.from('cabos').select('*')
    ]);

    if (popsResult.data) setPops(popsResult.data);
    if (ctosResult.data) setCtos(ctosResult.data);
    if (cabosResult.data) setCabos(cabosResult.data);
  };

  const getIconColor = (iconType: string) => {
    const icon = iconTypes.find(i => i.value === iconType);
    return icon?.color || '#3B82F6';
  };

  return (
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

      {pops.map((pop) => (
        <Marker
          key={pop.id}
          position={[pop.latitude, pop.longitude]}
          icon={createCustomIcon(getIconColor(pop.icone), 40)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{pop.nome}</h3>
              <p className="text-sm text-slate-600">{pop.endereco}</p>
              <div className="mt-2 text-xs text-slate-500">
                <div>Lat: {pop.latitude.toFixed(6)}</div>
                <div>Lng: {pop.longitude.toFixed(6)}</div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {ctos.map((cto) => (
        <Marker
          key={cto.id}
          position={[cto.latitude, cto.longitude]}
          icon={createCustomIcon(getIconColor(cto.icone), 35)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{cto.nome}</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <div>Capacidade: {cto.capacidade} portas</div>
                <div>Status: <span className={`font-medium ${cto.status === 'ativo' ? 'text-green-600' : 'text-red-600'}`}>
                  {cto.status}
                </span></div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <div>Lat: {cto.latitude.toFixed(6)}</div>
                <div>Lng: {cto.longitude.toFixed(6)}</div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {cabos.map((cabo) => {
        if (cabo.rota && Array.isArray(cabo.rota) && cabo.rota.length > 0) {
          return (
            <Polyline
              key={cabo.id}
              positions={cabo.rota}
              color="#3B82F6"
              weight={3}
              opacity={0.7}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{cabo.nome}</h3>
                </div>
              </Popup>
            </Polyline>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}
