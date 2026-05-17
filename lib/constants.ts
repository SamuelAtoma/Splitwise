// ── Single source of truth for supported markets ─────────────────────────────
// Update this list once and every screen stays in sync.

export const SUPPORTED_MARKETS: {
  id: string;
  name: string;
  logo_emoji: string;
  is_custom: boolean;
}[] = [
  { id: '1', name: 'Jumia',      logo_emoji: '🛒', is_custom: false },
  { id: '2', name: 'Konga',      logo_emoji: '🛍️', is_custom: false },
  { id: '3', name: 'Amazon',     logo_emoji: '📦', is_custom: false },
  { id: '4', name: 'Jiji',       logo_emoji: '🏷️', is_custom: false },
  { id: '5', name: 'Temu',       logo_emoji: '🎁', is_custom: false },
  { id: '6', name: 'Aliexpress', logo_emoji: '✈️', is_custom: false },
  { id: '7', name: 'Shoprite',   logo_emoji: '🏪', is_custom: false },
  { id: '8', name: 'Slot',       logo_emoji: '📱', is_custom: false },
];

// Plain name array — used wherever only the string is needed (pickers, labels, etc.)
export const MARKET_NAMES = SUPPORTED_MARKETS.map(m => m.name);
