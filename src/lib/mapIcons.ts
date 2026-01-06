import L from 'leaflet';

export const iconTypes = [
  { value: 'datacenter', label: 'Data Center', color: '#3B82F6' },
  { value: 'router', label: 'Roteador', color: '#10B981' },
  { value: 'switch', label: 'Switch', color: '#F59E0B' },
  { value: 'server', label: 'Servidor', color: '#8B5CF6' },
  { value: 'antenna', label: 'Antena', color: '#EF4444' },
  { value: 'tower', label: 'Torre', color: '#6B7280' },
];

export function createCustomIcon(color: string = '#3B82F6', size: number = 40) {
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}
