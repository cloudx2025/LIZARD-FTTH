import L from 'leaflet';

export const iconTypes = [
  { value: 'datacenter', label: 'Data Center', color: '#3B82F6' },
  { value: 'router', label: 'Roteador', color: '#10B981' },
  { value: 'switch', label: 'Switch', color: '#F59E0B' },
  { value: 'server', label: 'Servidor', color: '#8B5CF6' },
  { value: 'antenna', label: 'Antena', color: '#EF4444' },
  { value: 'tower', label: 'Torre', color: '#6B7280' },
];

export function createDatacenterIcon(color: string = '#3B82F6', size: number = 40) {
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="${color}" opacity="0.2"/>
      <rect x="7" y="6" width="10" height="3" fill="${color}" rx="1"/>
      <rect x="7" y="10" width="10" height="3" fill="${color}" rx="1"/>
      <rect x="7" y="14" width="10" height="3" fill="${color}" rx="1"/>
      <circle cx="9" cy="7.5" r="0.8" fill="white"/>
      <circle cx="9" cy="11.5" r="0.8" fill="white"/>
      <circle cx="9" cy="15.5" r="0.8" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-datacenter-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function createPOPIcon(color: string = '#10B981', size: number = 36) {
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}" opacity="0.2"/>
      <circle cx="12" cy="12" r="7" fill="${color}"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
      <circle cx="12" cy="12" r="2" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-pop-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function createCTOIcon(color: string = '#F59E0B', size: number = 32) {
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="${color}" opacity="0.2"/>
      <rect x="8" y="8" width="8" height="8" fill="${color}" rx="1"/>
      <line x1="10" y1="10" x2="10" y2="14" stroke="white" stroke-width="1"/>
      <line x1="12" y1="10" x2="12" y2="14" stroke="white" stroke-width="1"/>
      <line x1="14" y1="10" x2="14" y2="14" stroke="white" stroke-width="1"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-cto-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function createCustomIcon(color: string = '#6B7280', size: number = 36) {
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

export function getIconForType(iconType: string) {
  const iconConfig = iconTypes.find(type => type.value === iconType);
  const color = iconConfig?.color || '#6B7280';

  switch (iconType) {
    case 'datacenter':
      return createDatacenterIcon(color);
    case 'router':
    case 'switch':
      return createPOPIcon(color);
    case 'server':
    case 'antenna':
    case 'tower':
    default:
      return createCustomIcon(color);
  }
}

export function getPopIcon(iconType: string) {
  const iconConfig = iconTypes.find(type => type.value === iconType);
  const color = iconConfig?.color || '#10B981';

  if (iconType === 'datacenter') {
    return createDatacenterIcon('#3B82F6');
  }

  return createPOPIcon(color);
}

export function getCtoIcon(iconType: string) {
  return createCTOIcon('#F59E0B');
}
