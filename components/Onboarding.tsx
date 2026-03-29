import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, PanResponder, Platform,
} from 'react-native';
import Logo from './Logo';

const TEAL      = '#17B8B8';
const TEAL_DARK = '#0D8F8F';
const TEAL_DEEP = '#0A6E6E';
const WHITE     = '#FFFFFF';
const DARK      = '#062020';
const MID       = '#3A7070';

// ── Live counter ────────────────────────────────────────────
function useLiveCounter(base: number, inc: number, active: boolean) {
  const [v, setV] = useState(base);
  useEffect(() => {
    if (!active) { setV(base); return; }
    const id = setInterval(() => setV(x => x + inc), 10);
    return () => clearInterval(id);
  }, [active]);
  return v;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return n.toLocaleString();
}

// ══════════════════════════════════════════════════════════════
// SLIDE ICON — clean SVG icon in a white frosted box
// ══════════════════════════════════════════════════════════════
const iconPaths: Record<string, string[]> = {
  cart: [
    'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z',
    'M3 6h18',
    'M16 10a4 4 0 01-8 0',
  ],
  map: [
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
    'M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  ],
  chat: [
    'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  ],
  split: [
    'M6 3h12',
    'M6 8h12',
    'M11 13l5 5-5 5',
    'M6 18h8',
  ],
};

function SlideIcon({ name }: { name: string }) {
  const fallback: Record<string, string> = {
    cart: '🛒', map: '📍', chat: '💬', split: '✂️',
  };

  if (Platform.OS === 'web') {
    return (
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: 'rgba(255,255,255,0.18)',
        border: '2px solid rgba(255,255,255,0.35)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      } as any}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round">
          {(iconPaths[name] || []).map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <View style={{
      width: 100, height: 100, borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 20,
    }}>
      <Text style={{ fontSize: 44 }}>{fallback[name]}</Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// SLIDES DATA
// ══════════════════════════════════════════════════════════════
const slides = [
  {
    step: '01', tag: 'DISCOVER', icon: 'cart',
    title: 'Shop Together,\nSave Together',
    subtitle: 'Find nearby shoppers ordering from the same online market. See who\'s ordering nearby, connect with them, and coordinate your purchases together.',
    chips: ['Jumia', 'Konga', 'Amazon', 'Jiji', 'Temu'],
    stats: [{ k: 'shoppers', l: 'Active\nShoppers' }, { k: 'markets', l: 'Online\nMarkets accepted' }],
  },
  {
    step: '02', tag: 'LOCATE', icon: 'map',
    title: 'Same Street,\nSame Market',
    subtitle: 'Our live map shows active shoppers nearby in real time. Filter by market, set your radius, and find people ordering from the exact same place as you.',
    chips: ['0.2km away', '0.5km away', '1.1km away'],
    stats: [{ k: 'groups', l: 'Groups\nFormed' }, { k: 'cities', l: 'Cities\nCovered' }],
  },
  {
    step: '03', tag: 'COORDINATE', icon: 'chat',
    title: 'Chat, Connect,\nCoordinate',
    subtitle: 'Group chat lets you talk directly with people ordering from the same market. Discuss, ask questions, and organise everything before you order.',
    chips: ["Same store? 🛒", 'Let\'s connect!', "I'm nearby ✅"],
    stats: [{ k: 'shoppers', l: 'Active\nShoppers' }, { k: 'groups', l: 'Groups\nFormed' }],
  },
  {
    step: '04', tag: 'COMMUNITY', icon: 'split',
    title: 'Your Community,\nNear You',
    subtitle: 'Join a growing community of smart shoppers in your area. Browse groups, discover who\'s ordering nearby, and start connecting in seconds.',
    chips: ['Join a group', 'Chat freely', 'Order smarter'],
    stats: [{ k: 'shoppers', l: 'Active\nShoppers' }, { k: 'markets', l: 'Online\nMarkets' }],
  },
];

interface Props { onFinish?: () => void; }

export default function Onboarding({ onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const tx   = useRef(new Animated.Value(0)).current;
  const ref  = useRef(0);

  const slide = slides[idx];
  const hasShoppers = slide.stats.some(s => s.k === 'shoppers');
  const hasGroups   = slide.stats.some(s => s.k === 'groups');
  const hasSaved    = slide.stats.some(s => s.k === 'saved');

  const shoppers = useLiveCounter(17_115, 1, hasShoppers);
  const groups   = useLiveCounter(6_311,  1, hasGroups);
  const saved    = useLiveCounter(388_800_000, 45_000, hasSaved);

  const val = (k: string) => {
    if (k === 'shoppers') return fmt(shoppers);
    if (k === 'groups')   return fmt(groups);
    if (k === 'saved')    return `₦${fmt(saved)}`;
    if (k === 'markets')  return '50+';
    if (k === 'cities')   return '12+';
    return '—';
  };

  const goTo = (next: number, dir: number) => {
    if (next < 0 || next >= slides.length) return;
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 130, useNativeDriver: true }),
      Animated.timing(tx,   { toValue: dir * 50, duration: 130, useNativeDriver: true }),
    ]).start(() => {
      ref.current = next; setIdx(next); tx.setValue(-dir * 50);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(tx,   { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    });
  };

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dy) < 70,
    onPanResponderRelease: (_, g) => {
      if (g.dx < -40)     goTo(ref.current + 1,  1);
      else if (g.dx > 40) goTo(ref.current - 1, -1);
    },
  })).current;

  const isLast  = idx === slides.length - 1;
  const isFirst = idx === 0;
  const progress = ((idx + 1) / slides.length) * 100;

  return (
    <View style={s.root} {...pan.panHandlers}>

      {/* ── Full teal background ── */}
      <View style={s.bgFill} />

      {/* ── Decorative blobs ── */}
      <View style={[s.blob, s.blob1]} />
      <View style={[s.blob, s.blob2]} />
      <View style={[s.blob, s.blob3]} />

      {/* ── Subtle grid overlay ── */}
      <View style={s.gridOverlay} pointerEvents="none">
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={`h${i}`} style={[s.gH, { top: `${(i / 14) * 100}%` as any }]} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={`v${i}`} style={[s.gV, { left: `${(i / 10) * 100}%` as any }]} />
        ))}
      </View>

      {/* ── Header ── */}
      <View style={s.header}>
        <Logo size={32} color={WHITE} showText textSize={16} textColor={WHITE} />
        <View style={{ flex: 1 }} />
        <View style={s.stepPill}>
          <Text style={s.stepTxt}>{slide.step} / 04</Text>
        </View>
        {!isLast && (
          <TouchableOpacity onPress={onFinish}
            hitSlop={{ top:14, bottom:14, left:14, right:14 }}>
            <Text style={s.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Progress bar ── */}
      <View style={s.progBg}>
        <View style={[s.progFill, { width: `${progress}%` as any }]} />
      </View>

      {/* ── Slide content ── */}
      <Animated.View style={[s.content, { opacity: fade, transform: [{ translateX: tx }] }]}>

        {/* Tag */}
        <View style={s.tag}>
          <View style={s.tagDot} />
          <Text style={s.tagTxt}>{slide.tag}</Text>
        </View>

        {/* Icon */}
        <SlideIcon name={slide.icon} />

        {/* White text card */}
        <View style={s.textCard}>
          <Text style={s.title}>{slide.title}</Text>
          <View style={s.rule} />
          <Text style={s.body}>{slide.subtitle}</Text>

          {/* Chips */}
          <View style={s.chips}>
            {slide.chips.map((c, i) => (
              <View key={i} style={s.chip}>
                <Text style={s.chipTxt}>{c}</Text>
              </View>
            ))}
          </View>

          {/* Stats */}
          <View style={s.statsBar}>
            {slide.stats.map((st, i) => (
              <React.Fragment key={st.k + i}>
                {i > 0 && <View style={s.statLine} />}
                <View style={s.stat}>
                  <Text style={s.statNum}>{val(st.k)}</Text>
                  <Text style={s.statLbl}>{st.l}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        <Text style={s.hint}>← swipe to navigate →</Text>
      </Animated.View>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <TouchableOpacity
          onPress={() => goTo(idx - 1, -1)}
          disabled={isFirst}
          style={[s.ghost, { opacity: isFirst ? 0.3 : 1 }]}
        >
          <Text style={s.ghostTxt}>← Prev</Text>
        </TouchableOpacity>

        <View style={s.dots}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i, i > idx ? 1 : -1)}>
              <View style={[s.dot, {
                width: i === idx ? 28 : 8,
                backgroundColor: i === idx ? WHITE : WHITE + '50',
              }]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => isLast ? onFinish?.() : goTo(idx + 1, 1)}
          style={s.solid}
        >
          <Text style={s.solidTxt}>{isLast ? 'Get Started' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: TEAL_DARK },

  bgFill: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: TEAL_DARK,
  },

  // Blobs
  blob:  { position: 'absolute', borderRadius: 999 },
  blob1: { width: 340, height: 340, backgroundColor: TEAL + '40', top: -120, right: -100 },
  blob2: { width: 260, height: 260, backgroundColor: TEAL_DEEP + '60', bottom: 80, left: -80 },
  blob3: { width: 160, height: 160, backgroundColor: WHITE + '08', top: '35%' as any, right: -40 },

  // Grid
  gridOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  gH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: WHITE + '0A' },
  gV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: WHITE + '08' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 58 : 46,
    paddingBottom: 10,
    gap: 12, zIndex: 10,
  },
  logo:     { fontSize: 17, fontWeight: '900', color: WHITE, letterSpacing: 1.5 },
  stepPill: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: WHITE + '40', backgroundColor: WHITE + '15',
  },
  stepTxt: { color: WHITE, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  skip:    { color: WHITE, fontSize: 13, fontWeight: '600', opacity: 0.8 },

  // Progress
  progBg:   { height: 3, backgroundColor: WHITE + '20' },
  progFill: { height: 3, backgroundColor: WHITE, borderRadius: 2 },

  // Content
  content: {
    flex: 1, paddingHorizontal: 20, paddingTop: 20,
    alignItems: 'center', zIndex: 5,
  },

  // Tag
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: WHITE + '20',
    borderWidth: 1, borderColor: WHITE + '35',
    marginBottom: 24,
  },
  tagDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: WHITE },
  tagTxt: { color: WHITE, fontSize: 10, fontWeight: '800', letterSpacing: 2.5 },

  // White card
  textCard: {
    width: '100%', maxWidth: 540,
    backgroundColor: WHITE,
    borderRadius: 28,
    padding: 28,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 12,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 34 : 26,
    fontWeight: '900', color: DARK,
    lineHeight: Platform.OS === 'web' ? 42 : 33,
    letterSpacing: -0.5, marginBottom: 10,
    textAlign: 'center',
  },
  rule: {
    width: 40, height: 3, borderRadius: 2,
    backgroundColor: TEAL_DARK,
    alignSelf: 'center', marginBottom: 14,
  },
  body: {
    fontSize: 13, lineHeight: 22, color: MID,
    marginBottom: 16, textAlign: 'center',
  },

  // Chips
  chips: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 18, justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: TEAL + '12',
    borderWidth: 1, borderColor: TEAL + '35',
  },
  chipTxt: { color: TEAL_DEEP, fontSize: 12, fontWeight: '600' },

  // Stats
  statsBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: TEAL + '08',
    borderRadius: 14, borderWidth: 1, borderColor: TEAL + '20',
    paddingVertical: 16, paddingHorizontal: 12,
  },
  stat:    { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900', color: TEAL_DEEP, letterSpacing: -0.5, marginBottom: 4 },
  statLbl: { fontSize: 10, color: MID, textAlign: 'center', lineHeight: 14, fontWeight: '500' },
  statLine:{ width: 1, height: 36, backgroundColor: TEAL + '25' },

  hint: {
    marginTop: 14, fontSize: 11,
    color: WHITE + '55', textAlign: 'center', letterSpacing: 0.5,
  },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    zIndex: 10,
  },
  ghost: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 30, borderWidth: 1.5,
    borderColor: WHITE + '55',
    backgroundColor: WHITE + '15',
    minWidth: 90, alignItems: 'center',
  },
  ghostTxt: { color: WHITE, fontSize: 13, fontWeight: '700' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:  { height: 8, borderRadius: 4 },
  solid: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 30, minWidth: 110, alignItems: 'center',
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  solidTxt: { color: TEAL_DARK, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
});