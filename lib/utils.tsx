import React from 'react';
import { View } from 'react-native';

// ══════════════════════════════════════════════════════════════
// DISTANCE & GEOMETRY
// ══════════════════════════════════════════════════════════════

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function createCircle(lat: number, lng: number, radiusKm: number): any {
  const points = 64;
  const coords: number[][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
    const dy = radiusKm / 110.574;
    coords.push([lng + dx * Math.cos(angle), lat + dy * Math.sin(angle)]);
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
}

// ══════════════════════════════════════════════════════════════
// AVATAR RENDERING
// ══════════════════════════════════════════════════════════════

export function avatarHtml(avatarEmoji: string, size = 52): string {
  if (avatarEmoji?.startsWith('http')) {
    return `<img src="${avatarEmoji}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;display:block;" />`;
  }
  if (avatarEmoji) {
    return `<span style="font-size:${Math.round(size * 0.46)}px;line-height:1;">${avatarEmoji}</span>`;
  }
  return '';
}

// ══════════════════════════════════════════════════════════════
// MAP BACKGROUND COMPONENT
// ══════════════════════════════════════════════════════════════

const LIGHT_BORDER = '#C8E8E8';
const PIN_OUTER = '#E8F9F9';
const PIN_DOT = '#0D8F8F';

const mapBgStyles = {
  mapBg: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: -1,
  },
  gH: {
    position: 'absolute' as const,
    left: 0, right: 0, height: 1,
    backgroundColor: LIGHT_BORDER,
  },
  gV: {
    position: 'absolute' as const,
    top: 0, bottom: 0, width: 1,
    backgroundColor: LIGHT_BORDER,
  },
  pin: {
    position: 'absolute' as const,
    width: 20, height: 20,
    transform: 'translate(-10px, -10px)',
  },
  pinR: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: PIN_OUTER,
  },
  pinD: {
    position: 'absolute' as const,
    top: 8, left: 8, width: 4, height: 4, borderRadius: 2,
    backgroundColor: PIN_DOT,
  },
  frost: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
};

export function MapBg() {
  return (
    <View style={mapBgStyles.mapBg}>
      {Array.from({ length: 18 }).map((_, i) => (
        <View key={`h${i}`} style={[mapBgStyles.gH, { top: `${(i / 18) * 100}%` as any }]} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <View key={`v${i}`} style={[mapBgStyles.gV, { left: `${(i / 16) * 100}%` as any }]} />
      ))}
      {[
        [10, 8], [22, 55], [38, 20], [50, 70], [65, 35],
        [78, 80], [18, 88], [45, 48], [72, 15], [88, 55],
      ].map(([t, l], i) => (
        <View key={i} style={[mapBgStyles.pin, { top: `${t}%` as any, left: `${l}%` as any }]}>
          <View style={mapBgStyles.pinR} />
          <View style={mapBgStyles.pinD} />
        </View>
      ))}
      <View style={mapBgStyles.frost} />
    </View>
  );
}
