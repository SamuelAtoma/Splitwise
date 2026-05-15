import React, { Platform } from 'react-native';

// ══════════════════════════════════════════════════════════════
// SVG ICON WRAPPER
// ══════════════════════════════════════════════════════════════

interface SvgProps {
  size?: number;
  stroke?: string;
  fill?: string;
  children?: any;
  style?: any;
}

export function Svg({ size = 24, stroke = '#062020', fill = 'none', children, style }: SvgProps) {
  if (Platform.OS !== 'web') return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', ...style }}
    >
      {children}
    </svg>
  ) as any;
}

// ══════════════════════════════════════════════════════════════
// AUTH SCREEN ICONS
// ══════════════════════════════════════════════════════════════

export const GoogleSVG = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" style={{ display: 'block' }}>
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

export const AppleSVG = () => (
  <svg width="18" height="20" viewBox="0 0 384 512" style={{ display: 'block' }} fill="#062020">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-16.9 75.8-16.9 31.8 0 48.3 16.9 76.4 16.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

export const EmailSVG = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3A7070"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const PhoneSVG = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3A7070"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const LockSVG = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3A7070"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const UserSVG = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3A7070"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const EyeSVG = ({ show }: { show: boolean }) =>
  show ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3A7070"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3A7070"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

export const CheckSVG = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    stroke="white"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <polyline points="2,6 5,9 10,3" />
  </svg>
);

// ══════════════════════════════════════════════════════════════
// DRAWER NAVIGATOR ICONS
// ══════════════════════════════════════════════════════════════

export const Icons = {
  home: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </Svg>
  ),
  map: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" stroke={s} fill="none" />
    </Svg>
  ),
  groups: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" stroke={s} fill="none" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </Svg>
  ),
  chat: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Svg>
  ),
  profile: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" stroke={s} fill="none" />
    </Svg>
  ),
  cart: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </Svg>
  ),
  savings: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </Svg>
  ),
  orders: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </Svg>
  ),
  signout: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Svg>
  ),
  send: (s: string, sz = 16) => (
    <Svg size={sz} stroke={s}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" stroke={s} fill={s} />
    </Svg>
  ),
  close: (s: string, sz = 18) => (
    <Svg size={sz} stroke={s} style={{ strokeWidth: 2.5 }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  ),
  bot: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <rect x="3" y="8" width="18" height="12" rx="3" fill="none" />
      <path d="M9 8V6a3 3 0 016 0v2" />
      <circle cx="9" cy="14" r="1.2" fill={s} stroke="none" />
      <circle cx="15" cy="14" r="1.2" fill={s} stroke="none" />
      <line x1="9" y1="17.5" x2="15" y2="17.5" />
      <line x1="12" y1="3" x2="12" y2="5" />
    </Svg>
  ),
  tip: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6L15 17H9l-.7-2C6.3 13.7 5 11.5 5 9a7 7 0 017-7z" />
    </Svg>
  ),
  check: (s: string, sz = 16) => (
    <Svg size={sz} stroke={s}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  ),
  activity: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </Svg>
  ),
  shield: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  ),
  market: (s: string, sz = 24) => (
    <Svg size={sz} stroke={s}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <rect x="9" y="12" width="6" height="9" rx="1" />
    </Svg>
  ),
  back: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <polyline points="15 18 9 12 15 6" />
    </Svg>
  ),
  users: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </Svg>
  ),
  attach: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </Svg>
  ),
  image: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </Svg>
  ),
  file: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </Svg>
  ),
  video: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </Svg>
  ),
  globe: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </Svg>
  ),
  lock: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </Svg>
  ),
  chevron: (s: string, sz = 18) => (
    <Svg size={sz} stroke={s}>
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  ),
  recenter: (s: string, sz = 20) => (
    <Svg size={sz} stroke={s}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </Svg>
  ),
  signal: (s: string, sz = 16) => (
    <Svg size={sz} stroke={s}>
      <path d="M1.5 8.5a11 11 0 0121 0" />
      <path d="M5 12a7 7 0 0114 0" />
      <path d="M8.5 15.5a3.5 3.5 0 017 0" />
      <circle cx="12" cy="19" r="1" fill={s} stroke="none" />
    </Svg>
  ),
};

// ══════════════════════════════════════════════════════════════
// MAP SCREEN ICON COMPONENTS
// ══════════════════════════════════════════════════════════════

export const CartIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </Svg>
);

export const PinIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </Svg>
);

export const ChevronIcon = ({ s, sz = 18 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const RecenterIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </Svg>
);

export const SignalIcon = ({ s, sz = 16 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M1.5 8.5a11 11 0 0121 0" />
    <path d="M5 12a7 7 0 0114 0" />
    <path d="M8.5 15.5a3.5 3.5 0 017 0" />
    <circle cx="12" cy="19" r="1" fill={s} stroke="none" />
  </Svg>
);

export const LocationIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="3" />
  </Svg>
);

export const ShieldIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export const ChatIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </Svg>
);

export const UsersIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </Svg>
);
