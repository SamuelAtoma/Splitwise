import React from 'react';
import { Platform, Text, View } from 'react-native';

interface Props {
  size?: number;
  color?: string;
  showText?: boolean;
  textSize?: number;
  textColor?: string;
}

export default function Logo({
  size = 36,
  color = '#17B8B8',
  showText = false,
  textSize = 18,
  textColor,
}: Props) {
  const tc = textColor ?? color;

  if (Platform.OS !== 'web') {
    if (showText) {
      return (
        <Text style={{ fontSize: textSize, fontWeight: '900', color: tc, letterSpacing: 1.5 }}>
          {'SPLITWI$E'}
        </Text>
      );
    }
    return <View />;
  }

  // Web — inline SVG
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showText ? 10 : 0 } as any}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Left bag half ── */}
        <path
          d="M3 24 Q3 20 7 20 L26 20 L26 52 L7 52 Q3 52 3 48 Z"
          fill={color}
        />
        {/* Left handle arch */}
        <path
          d="M10 20 C10 14 12 11 16 11 C20 11 22 14 22 20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Left cart icon (white) */}
        <path
          d="M8 31 L10 31 L13 39 L20 39 L21.5 33 L13 33"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="42" r="1.8" fill="white" />
        <circle cx="20" cy="42" r="1.8" fill="white" />

        {/* ── Right bag half ── */}
        <path
          d="M53 24 Q53 20 49 20 L30 20 L30 52 L49 52 Q53 52 53 48 Z"
          fill={color}
        />
        {/* Right handle arch */}
        <path
          d="M46 20 C46 14 44 11 40 11 C36 11 34 14 34 20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Right cart icon (white, mirrored) */}
        <path
          d="M48 31 L46 31 L43 39 L36 39 L34.5 33 L43 33"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="42" r="1.8" fill="white" />
        <circle cx="36" cy="42" r="1.8" fill="white" />

        {/* ── Centre split line ── */}
        <line x1="28" y1="8" x2="28" y2="54" stroke="white" strokeWidth="3" />
      </svg>

      {showText && (
        <span
          style={{
            fontSize: textSize,
            fontWeight: '900',
            color: tc,
            letterSpacing: '1.5px',
            fontFamily: 'Poppins, sans-serif',
          } as any}
        >
          SPLITWI<span style={{ opacity: 0.65 } as any}>$</span>E
        </span>
      )}
    </div>
  ) as any;
}
