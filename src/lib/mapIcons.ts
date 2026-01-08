import L from 'leaflet';

export function createDatacenterIcon(color: string = '#10B981', size: number = 44) {
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="${color}" opacity="0.3"/>
      <rect x="6" y="5" width="12" height="3.5" fill="${color}" rx="1"/>
      <rect x="6" y="10" width="12" height="3.5" fill="${color}" rx="1"/>
      <rect x="6" y="15" width="12" height="3.5" fill="${color}" rx="1"/>
      <circle cx="8" cy="6.7" r="0.9" fill="white"/>
      <circle cx="8" cy="11.7" r="0.9" fill="white"/>
      <circle cx="8" cy="16.7" r="0.9" fill="white"/>
      <circle cx="10.5" cy="6.7" r="0.9" fill="white"/>
      <circle cx="10.5" cy="11.7" r="0.9" fill="white"/>
      <circle cx="10.5" cy="16.7" r="0.9" fill="white"/>
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

export function createPinIcon(color: string = '#F59E0B', size: number = 40) {
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-pin-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export function getPOPIcon(color: string = '#10B981') {
  return createDatacenterIcon(color);
}

export function getCTOIcon(color: string = '#F59E0B') {
  return createPinIcon(color);
}
