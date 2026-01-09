import { DivIcon } from 'leaflet';

export const iconTypes = [
  { value: 'datacenter', label: 'Datacenter' },
  { value: 'pin', label: 'Pin Localização' }
];

const createDatacenterIcon = (color: string, strokeColor: string) => {
  return new DivIcon({
    html: `
      <div style="position: relative;">
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>
          <rect x="10" y="8" width="20" height="6" fill="white" rx="1"/>
          <rect x="10" y="16" width="20" height="6" fill="white" rx="1"/>
          <rect x="10" y="24" width="20" height="6" fill="white" rx="1"/>
          <circle cx="26" cy="11" r="1.2" fill="${color}"/>
          <circle cx="26" cy="19" r="1.2" fill="${color}"/>
          <circle cx="26" cy="27" r="1.2" fill="${color}"/>
          <line x1="13" y1="11" x2="22" y2="11" stroke="${color}" stroke-width="1"/>
          <line x1="13" y1="19" x2="22" y2="19" stroke="${color}" stroke-width="1"/>
          <line x1="13" y1="27" x2="22" y2="27" stroke="${color}" stroke-width="1"/>
        </svg>
      </div>
    `,
    className: 'custom-map-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const createPinIcon = (color: string, strokeColor: string) => {
  return new DivIcon({
    html: `
      <div style="position: relative;">
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 5 C13 5 8 10 8 17 C8 25 20 35 20 35 C20 35 32 25 32 17 C32 10 27 5 20 5 Z" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>
          <circle cx="20" cy="17" r="5" fill="white"/>
        </svg>
      </div>
    `,
    className: 'custom-map-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 35],
    popupAnchor: [0, -35]
  });
};

const adjustColor = (color: string, amount: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

export const getPopIcon = (color: string = '#2563eb', iconType: string = 'datacenter'): DivIcon => {
  const strokeColor = adjustColor(color, -30);
  return iconType === 'pin' ? createPinIcon(color, strokeColor) : createDatacenterIcon(color, strokeColor);
};

export const getCtoIcon = (color: string = '#dc2626', iconType: string = 'datacenter'): DivIcon => {
  const strokeColor = adjustColor(color, -30);
  return iconType === 'pin' ? createPinIcon(color, strokeColor) : createDatacenterIcon(color, strokeColor);
};
