import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  PanResponder, Platform, Dimensions,
} from 'react-native';

const { width: W } = Dimensions.get('window');

const WHITE = '#FFFFFF';
const TEAL  = '#17B8B8';
const TEAL_DARK = '#0D8F8F';

// ── Live counter ─────────────────────────────────────────────────
function useLiveCounter(base: number, inc: number, active: boolean) {
  const [v, setV] = useState(base);
  useEffect(() => {
    setV(base);
    if (!active) return;
    const id = setInterval(() => setV(x => x + inc), 20);
    return () => clearInterval(id);
  }, [active]);
  return v;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString();
}

// ── Staggered slide-up / fade-in for content elements ────────────
function useReveal(active: boolean, count: number) {
  const anims = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    anims.forEach(a => a.setValue(0));
    if (!active) return;
    Animated.stagger(
      70,
      anims.map(a =>
        Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 80, friction: 11 })
      )
    ).start();
  }, [active]);

  return anims;
}

function revealed(anim: Animated.Value, dy = 20) {
  return {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) }],
  };
}

// ══════════════════════════════════════════════════════════════════
// ILLUSTRATIONS
// ══════════════════════════════════════════════════════════════════

// ── Slide 1: Split delivery fee ───────────────────────────────────
function IlluSplit({ active, accent }: { active: boolean; accent: string }) {
  const mainScale  = useRef(new Animated.Value(0)).current;
  const lineOp     = useRef(new Animated.Value(0)).current;
  const coinsScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mainScale.setValue(0); lineOp.setValue(0); coinsScale.setValue(0);
    if (!active) return;
    Animated.sequence([
      Animated.spring(mainScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.parallel([
        Animated.timing(lineOp, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(coinsScale, { toValue: 1, useNativeDriver: true, tension: 90, friction: 10 }),
      ]),
    ]).start();
  }, [active]);

  const COIN_COLORS = ['#4ADE80', '#60A5FA', '#F472B6', '#FB923C'];

  return (
    <View style={ill.root}>
      {/* Main circle */}
      <Animated.View style={[ill.mainCircle, { borderColor: accent + '80', transform: [{ scale: mainScale }] }]}>
        <Text style={[ill.mainCurrency, { color: accent }]}>₦</Text>
        <Text style={ill.mainAmount}>2,000</Text>
        <Text style={ill.mainLabel}>delivery fee</Text>
      </Animated.View>

      {/* Divider with ÷ badge */}
      <Animated.View style={{ alignItems: 'center', opacity: lineOp, marginVertical: 8 }}>
        <View style={ill.vLine} />
        <View style={[ill.divBadge, { backgroundColor: accent + '25', borderColor: accent + '60' }]}>
          <Text style={[ill.divText, { color: accent }]}>÷  4  people</Text>
        </View>
        <View style={ill.vLine} />
      </Animated.View>

      {/* 4 split coins */}
      <Animated.View style={[ill.coinRow, { transform: [{ scale: coinsScale }] }]}>
        {COIN_COLORS.map((c, i) => (
          <View key={i} style={[ill.coin, { backgroundColor: c + '18', borderColor: c + '70' }]}>
            <Text style={[ill.coinAmt, { color: c }]}>₦500</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ── Slide 2: Live map with pins ───────────────────────────────────
function IlluMap({ active, accent }: { active: boolean; accent: string }) {
  const pinAnims = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pinAnims.forEach(a => a.setValue(0));
    if (!active) return;

    Animated.stagger(160,
      pinAnims.map(a =>
        Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 })
      )
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    ).start();
  }, [active]);

  const PINS = [
    { top: 10,  left: 28,  color: '#4ADE80', label: '0.2km', anim: pinAnims[0] },
    { top: 55,  left: 160, color: '#60A5FA', label: '0.8km', anim: pinAnims[1] },
    { top: 15,  left: 230, color: '#F472B6', label: '1.1km', anim: pinAnims[2] },
    { top: 80,  left: 90,  color: '#FB923C', label: '1.5km', anim: pinAnims[3] },
  ];

  return (
    <View style={ill.mapRoot}>
      {/* Grid lines */}
      {[0, 1, 2, 3].map(i => (
        <View key={`h${i}`} style={[ill.gridH, { top: i * 32 + 8 }]} />
      ))}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View key={`v${i}`} style={[ill.gridV, { left: i * 52 }]} />
      ))}

      {/* YOU pin in center */}
      <View style={[ill.youPin, { borderColor: accent }]}>
        <Text style={[ill.youTxt, { color: accent }]}>YOU</Text>
      </View>

      {/* Animated nearby pins */}
      {PINS.map((p, i) => (
        <Animated.View key={i} style={[ill.pinGroup, { top: p.top, left: p.left, transform: [{ scale: p.anim }] }]}>
          <Animated.View style={[ill.pinRing, {
            borderColor: p.color,
            opacity: pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.2, 0] }),
            transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
          }]} />
          <View style={[ill.pinDot, { backgroundColor: p.color }]} />
          <View style={[ill.distBadge, { backgroundColor: p.color + '20', borderColor: p.color + '70' }]}>
            <Text style={[ill.distText, { color: p.color }]}>{p.label}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// ── Slide 3: Chat bubbles ─────────────────────────────────────────
function IlluChat({ active, accent }: { active: boolean; accent: string }) {
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    bubble1.setValue(0); bubble2.setValue(0); bubble3.setValue(0);
    if (!active) return;
    Animated.stagger(340, [
      Animated.spring(bubble1, { toValue: 1, useNativeDriver: true, tension: 100, friction: 9 }),
      Animated.spring(bubble2, { toValue: 1, useNativeDriver: true, tension: 100, friction: 9 }),
      Animated.spring(bubble3, { toValue: 1, useNativeDriver: true, tension: 100, friction: 9 }),
    ]).start();
  }, [active]);

  const CHATS = [
    { text: 'Anyone on Jumia nearby?',    side: 'left',  color: WHITE + '18', border: WHITE + '35', anim: bubble1 },
    { text: 'Yes! Same address area.',    side: 'right', color: accent + '30', border: accent + '60', anim: bubble2 },
    { text: "Let's split delivery!",      side: 'left',  color: WHITE + '18', border: WHITE + '35', anim: bubble3 },
  ];

  return (
    <View style={ill.chatRoot}>
      {CHATS.map((c, i) => (
        <Animated.View
          key={i}
          style={[
            ill.bubbleWrap,
            c.side === 'right' ? ill.bubbleRight : ill.bubbleLeft,
            { opacity: c.anim, transform: [{ scale: c.anim.interpolate({ inputRange:[0,1], outputRange:[0.7,1] }) }] },
          ]}
        >
          {/* Avatar dot */}
          {c.side === 'left' && (
            <View style={[ill.chatAvatar, { backgroundColor: accent + '40' }]} />
          )}
          <View style={[ill.bubble, { backgroundColor: c.color, borderColor: c.border }]}>
            <Text style={ill.bubbleText}>{c.text}</Text>
          </View>
          {c.side === 'right' && (
            <View style={[ill.chatAvatar, { backgroundColor: WHITE + '30' }]} />
          )}
        </Animated.View>
      ))}
    </View>
  );
}

// ── Slide 4: Savings comparison ───────────────────────────────────
function IlluSave({ active, accent }: { active: boolean; accent: string }) {
  const leftScale  = useRef(new Animated.Value(0)).current;
  const rightScale = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const barWidth   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    leftScale.setValue(0); rightScale.setValue(0);
    badgeScale.setValue(0); barWidth.setValue(0);
    if (!active) return;
    Animated.sequence([
      Animated.parallel([
        Animated.spring(leftScale,  { toValue: 1, useNativeDriver: true, tension: 100, friction: 9 }),
        Animated.spring(rightScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 9 }),
      ]),
      Animated.timing(barWidth, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 7 }),
    ]).start();
  }, [active]);

  return (
    <View style={ill.saveRoot}>
      {/* Before vs After cards */}
      <View style={ill.saveRow}>
        <Animated.View style={[ill.saveCard, { borderColor: WHITE + '30', transform: [{ scale: leftScale }] }]}>
          <Text style={ill.saveCardLabel}>SOLO</Text>
          <Text style={ill.saveCardAmt}>₦2,000</Text>
          <Text style={ill.saveCardSub}>per order</Text>
        </Animated.View>

        <View style={ill.saveArrow}>
          <Text style={ill.saveArrowTxt}>→</Text>
        </View>

        <Animated.View style={[ill.saveCard, { borderColor: accent + '60', backgroundColor: accent + '18', transform: [{ scale: rightScale }] }]}>
          <Text style={[ill.saveCardLabel, { color: accent }]}>GROUP</Text>
          <Text style={[ill.saveCardAmt, { color: accent }]}>₦400</Text>
          <Text style={[ill.saveCardSub, { color: accent + 'CC' }]}>per person</Text>
        </Animated.View>
      </View>

      {/* Savings bar */}
      <View style={ill.barTrack}>
        <Animated.View style={[ill.barFill, {
          backgroundColor: accent,
          width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '80%'] }),
        }]} />
        <Text style={ill.barLabel}>80% saved</Text>
      </View>

      {/* Big badge */}
      <Animated.View style={[ill.saveBigBadge, { backgroundColor: accent + '20', borderColor: accent, transform: [{ scale: badgeScale }] }]}>
        <Text style={[ill.saveBigAmt, { color: accent }]}>₦1,600 saved</Text>
        <Text style={[ill.saveBigSub, { color: accent + 'BB' }]}>per order in a group of 5</Text>
      </Animated.View>
    </View>
  );
}

// ── Slide 5 (CTA) — full-screen launch slide ──────────────────────
function IlluCTA({ active }: { active: boolean }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    logoScale.setValue(0);
    if (!active) return;
    Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [active]);

  return (
    <View style={ill.ctaRoot}>
      {/* Animated rings behind logo */}
      <Animated.View style={[ill.ctaRing, ill.ctaRingOuter, { transform: [{ scale: ringPulse }] }]} />
      <Animated.View style={[ill.ctaRing, ill.ctaRingMid,   { transform: [{ scale: Animated.multiply(ringPulse, 0.85) }] }]} />

      {/* Logo mark */}
      <Animated.View style={[ill.ctaLogo, { transform: [{ scale: logoScale }] }]}>
        <Text style={ill.ctaLogoText}>
          SPLITWI<Text style={{ color: TEAL }}>$</Text>E
        </Text>
        <View style={ill.ctaLogoDivider} />
        <Text style={ill.ctaLogoSub}>Smart Group Shopping</Text>
      </Animated.View>

      {/* Feature pills */}
      <View style={ill.ctaPills}>
        {['Split fees', 'Live map', 'Group chat'].map((p, i) => (
          <View key={i} style={ill.ctaPill}>
            <View style={ill.ctaPillDot} />
            <Text style={ill.ctaPillText}>{p}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// SLIDE DATA
// ══════════════════════════════════════════════════════════════════
interface SlideData {
  bg: string; accent: string; tag: string;
  title: string; body: string;
  chips: string[];
  stats: { k: string; l: string }[];
  illu: 'split' | 'map' | 'chat' | 'save' | 'cta';
}

const SLIDES: SlideData[] = [
  {
    bg: '#0A6E6E', accent: '#4ADE80',
    tag: 'SAVE MONEY',
    title: 'Split delivery.\nPay way less.',
    body:  'Find nearby shoppers on the same market. One delivery, fee divided equally between your group.',
    chips: ['Jumia', 'Konga', 'Amazon', 'Temu'],
    stats: [{ k: 'shoppers', l: 'Active shoppers' }, { k: 'markets', l: 'Markets' }],
    illu: 'split',
  },
  {
    bg: '#0C4A6E', accent: '#60A5FA',
    tag: 'LIVE MAP',
    title: "See who's\nbuying nearby.",
    body:  'Real-time map. Set your radius, filter by market. Tap any pin to connect and order together.',
    chips: ['0.2km', '0.8km', '1.5km'],
    stats: [{ k: 'cities', l: 'Cities covered' }, { k: 'groups', l: 'Groups formed' }],
    illu: 'map',
  },
  {
    bg: '#1E1B4B', accent: '#A78BFA',
    tag: 'GROUP CHAT',
    title: 'Chat. Coordinate.\nOrder together.',
    body:  'Built-in group chat. Confirm items, place one combined order, then split the delivery fee.',
    chips: ['Coordinate', 'Group orders', 'Split the fee'],
    stats: [{ k: 'shoppers', l: 'Active shoppers' }, { k: 'groups', l: 'Groups' }],
    illu: 'chat',
  },
  {
    bg: '#064E3B', accent: '#34D399',
    tag: 'SAVE BIG',
    title: 'Save up to 80%\non every order.',
    body:  '₦2,000 delivery ÷ 5 people = ₦400 each. Repeat for every order, every time.',
    chips: ['₦500 → ₦100', '₦1000 → ₦200', '₦2000 → ₦400'],
    stats: [{ k: 'saved', l: 'Saved by community' }, { k: 'groups', l: 'Groups' }],
    illu: 'save',
  },
  {
    bg: '#030712', accent: '#17B8B8',
    tag: 'READY',
    title: 'Your smarter\nway to shop.',
    body:  '',
    chips: [],
    stats: [],
    illu: 'cta',
  },
];

const N = SLIDES.length;

// ══════════════════════════════════════════════════════════════════
// SINGLE SLIDE VIEW
// ══════════════════════════════════════════════════════════════════
function SlideView({
  data, active, statVal,
  onFinish, onSignIn,
}: {
  data: SlideData;
  active: boolean;
  statVal: (k: string) => string;
  onFinish?: () => void;
  onSignIn?: () => void;
}) {
  const revealAnims = useReveal(active, 5); // tag, title, body, chips, stats

  // CTA slide gets its own full-screen layout
  if (data.illu === 'cta') {
    return (
      <View style={[sl.root, { backgroundColor: data.bg, width: W }]}>
        <IlluCTA active={active} />

        {/* CTA buttons */}
        <View style={sl.ctaBtns}>
          <TouchableOpacity style={[sl.ctaMain, { backgroundColor: data.accent }]} onPress={onFinish} activeOpacity={0.88}>
            <Text style={sl.ctaMainTxt}>Start Saving  →</Text>
          </TouchableOpacity>
          {onSignIn && (
            <TouchableOpacity onPress={onSignIn} style={sl.ctaGhost} activeOpacity={0.7}>
              <Text style={sl.ctaGhostTxt}>I already have an account</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[sl.root, { backgroundColor: data.bg, width: W }]}>

      {/* ── Illustration zone ─────────────────────── */}
      <View style={sl.illuZone}>
        {data.illu === 'split' && <IlluSplit active={active} accent={data.accent} />}
        {data.illu === 'map'   && <IlluMap   active={active} accent={data.accent} />}
        {data.illu === 'chat'  && <IlluChat  active={active} accent={data.accent} />}
        {data.illu === 'save'  && <IlluSave  active={active} accent={data.accent} />}
      </View>

      {/* ── Content zone ──────────────────────────── */}
      <View style={sl.contentZone}>

        {/* Tag */}
        <Animated.View style={[sl.tagRow, revealed(revealAnims[0], 12)]}>
          <View style={[sl.tagDot, { backgroundColor: data.accent }]} />
          <Text style={[sl.tagTxt, { color: data.accent }]}>{data.tag}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[sl.title, revealed(revealAnims[1], 16)]}>
          {data.title}
        </Animated.Text>

        {/* Body */}
        <Animated.Text style={[sl.body, revealed(revealAnims[2], 16)]}>
          {data.body}
        </Animated.Text>

        {/* Chips */}
        {data.chips.length > 0 && (
          <Animated.View style={[sl.chips, revealed(revealAnims[3], 14)]}>
            {data.chips.map((c, i) => (
              <View key={i} style={[sl.chip, { borderColor: data.accent + '55', backgroundColor: data.accent + '15' }]}>
                <Text style={[sl.chipTxt, { color: data.accent }]}>{c}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Stats */}
        {data.stats.length > 0 && (
          <Animated.View style={[sl.statsBar, revealed(revealAnims[4], 12)]}>
            {data.stats.map((st, i) => (
              <React.Fragment key={st.k + i}>
                {i > 0 && <View style={sl.statDivider} />}
                <View style={sl.stat}>
                  <Text style={[sl.statNum, { color: data.accent }]}>{statVal(st.k)}</Text>
                  <Text style={sl.statLbl}>{st.l}</Text>
                </View>
              </React.Fragment>
            ))}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN ONBOARDING COMPONENT
// ══════════════════════════════════════════════════════════════════
interface Props {
  onFinish?: () => void;
  onSignIn?: () => void;
}

export default function Onboarding({ onFinish, onSignIn }: Props) {
  const [idx, setIdx]   = useState(0);
  const idxRef          = useRef(0);
  const baseXRef        = useRef(0);
  const containerX      = useRef(new Animated.Value(0)).current;

  // Live counters (active only on the relevant slide)
  const shoppers = useLiveCounter(17_115, 1,        idx === 0 || idx === 2);
  const groups   = useLiveCounter(6_311,  1,        idx === 1 || idx === 2 || idx === 3);
  const saved    = useLiveCounter(388_800_000, 50_000, idx === 3);

  const statVal = (k: string): string => {
    if (k === 'shoppers') return fmt(shoppers) + '+';
    if (k === 'groups')   return fmt(groups)   + '+';
    if (k === 'saved')    return '₦' + fmt(saved);
    if (k === 'markets')  return '50+';
    if (k === 'cities')   return '12+';
    return '—';
  };

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(N - 1, next));
    const target  = -clamped * W;
    idxRef.current  = clamped;
    baseXRef.current = target;
    setIdx(clamped);
    Animated.spring(containerX, {
      toValue: target,
      useNativeDriver: true,
      tension: 65,
      friction: 12,
    }).start();
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dy) < 60,
      onPanResponderGrant: () => {
        containerX.stopAnimation();
        containerX.setValue(baseXRef.current);
      },
      onPanResponderMove: (_, g) => {
        const resistance = g.dx > 0 && idxRef.current === 0         ? 0.25
                         : g.dx < 0 && idxRef.current === N - 1     ? 0.25
                         : 1;
        containerX.setValue(baseXRef.current + g.dx * resistance);
      },
      onPanResponderRelease: (_, g) => {
        let next = idxRef.current;
        if      (g.dx < -(W * 0.22) || g.vx < -0.4) next = Math.min(next + 1, N - 1);
        else if (g.dx >  (W * 0.22) || g.vx >  0.4) next = Math.max(next - 1, 0);
        goTo(next);
      },
    })
  ).current;

  const isLast = idx === N - 1;
  const progress = ((idx + 1) / N) * 100;

  return (
    <View style={s.root} {...pan.panHandlers}>

      {/* ── Slide row ────────────────────────────────────────── */}
      <Animated.View style={[s.slideRow, { transform: [{ translateX: containerX }] }]}>
        {SLIDES.map((slide, i) => (
          <SlideView
            key={i}
            data={slide}
            active={i === idx}
            statVal={statVal}
            onFinish={onFinish}
            onSignIn={onSignIn}
          />
        ))}
      </Animated.View>

      {/* ── Fixed header overlay ─────────────────────────────── */}
      {!isLast && (
        <View style={s.header} pointerEvents="box-none">
          <Text style={s.logo}>
            SPLITWI<Text style={{ color: WHITE + 'AA' }}>$</Text>E
          </Text>
          <View style={{ flex: 1 }} />
          <View style={s.stepPill}>
            <Text style={s.stepTxt}>{String(idx + 1).padStart(2, '0')} / {String(N - 1).padStart(2, '0')}</Text>
          </View>
          <TouchableOpacity
            onPress={onFinish}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Text style={s.skip}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Progress bar ─────────────────────────────────────── */}
      {!isLast && (
        <View style={s.progTrack} pointerEvents="none">
          <Animated.View style={[s.progFill, { width: `${progress}%` as any }]} />
        </View>
      )}

      {/* ── Fixed footer overlay ─────────────────────────────── */}
      {!isLast && (
        <View style={s.footer} pointerEvents="box-none">
          {/* Dot indicators */}
          <View style={s.dots}>
            {SLIDES.slice(0, N - 1).map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                <Animated.View style={[s.dot, {
                  width: i === idx ? 24 : 7,
                  backgroundColor: i === idx ? WHITE : WHITE + '45',
                }]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Next / Get Started */}
          <TouchableOpacity
            style={[s.nextBtn, idx === N - 2 && s.nextBtnLast]}
            onPress={() => goTo(idx + 1)}
            activeOpacity={0.85}
          >
            <Text style={[s.nextTxt, idx === N - 2 && s.nextTxtLast]}>
              {idx === N - 2 ? 'Get Started' : 'Next'}
            </Text>
            <Text style={[s.nextArrow, idx === N - 2 && s.nextTxtLast]}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// STYLES — ILLUSTRATIONS
// ══════════════════════════════════════════════════════════════════
const ill = StyleSheet.create({
  // Split
  root:         { alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 20 },
  mainCircle:   { width: 100, height: 100, borderRadius: 50, backgroundColor: WHITE + '12', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  mainCurrency: { fontSize: 22, fontWeight: '900', lineHeight: 24 },
  mainAmount:   { fontSize: 22, fontWeight: '900', color: WHITE, lineHeight: 26, letterSpacing: -0.5 },
  mainLabel:    { fontSize: 10, color: WHITE + '88', fontWeight: '500', marginTop: 2 },
  vLine:        { width: 1.5, height: 16, backgroundColor: WHITE + '40', marginVertical: 2 },
  divBadge:     { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  divText:      { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  coinRow:      { flexDirection: 'row', gap: 8 },
  coin:         { width: 58, height: 46, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  coinAmt:      { fontSize: 12, fontWeight: '800' },

  // Map
  mapRoot:      { width: '100%', height: '100%', position: 'relative' },
  gridH:        { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: WHITE + '0D' },
  gridV:        { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: WHITE + '0A' },
  youPin:       { position: 'absolute', top: 52, left: 110, width: 52, height: 52, borderRadius: 26, backgroundColor: WHITE + '18', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  youTxt:       { fontSize: 10, fontWeight: '900' },
  pinGroup:     { position: 'absolute', alignItems: 'center' },
  pinRing:      { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 1.5 },
  pinDot:       { width: 14, height: 14, borderRadius: 7 },
  distBadge:    { marginTop: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  distText:     { fontSize: 9, fontWeight: '700' },

  // Chat
  chatRoot:     { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 10, justifyContent: 'center' },
  bubbleWrap:   { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleLeft:   { alignSelf: 'flex-start' },
  bubbleRight:  { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubble:       { maxWidth: '72%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderWidth: 1 },
  bubbleText:   { fontSize: 13, color: WHITE, fontWeight: '500', lineHeight: 18 },
  chatAvatar:   { width: 28, height: 28, borderRadius: 14, marginBottom: 2 },

  // Save
  saveRoot:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 12 },
  saveRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saveCard:     { flex: 1, backgroundColor: WHITE + '10', borderWidth: 1.5, borderRadius: 16, padding: 16, alignItems: 'center' },
  saveCardLabel:{ fontSize: 10, fontWeight: '800', color: WHITE + '70', letterSpacing: 1, marginBottom: 4 },
  saveCardAmt:  { fontSize: 24, fontWeight: '900', color: WHITE, letterSpacing: -0.5 },
  saveCardSub:  { fontSize: 10, color: WHITE + '70', fontWeight: '500', marginTop: 2 },
  saveArrow:    { paddingHorizontal: 4 },
  saveArrowTxt: { fontSize: 20, color: WHITE + '60', fontWeight: '300' },
  barTrack:     { width: '100%', height: 8, backgroundColor: WHITE + '15', borderRadius: 4, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 4 },
  barLabel:     { position: 'absolute', right: 0, top: -18, fontSize: 11, color: WHITE + '70', fontWeight: '600' },
  saveBigBadge: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  saveBigAmt:   { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  saveBigSub:   { fontSize: 11, marginTop: 3, fontWeight: '500' },

  // CTA
  ctaRoot:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 28 },
  ctaRing:      { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  ctaRingOuter: { width: 240, height: 240, borderColor: WHITE + '08' },
  ctaRingMid:   { width: 170, height: 170, borderColor: WHITE + '12' },
  ctaLogo:      { alignItems: 'center', gap: 8 },
  ctaLogoText:  { fontSize: 30, fontWeight: '900', color: WHITE, letterSpacing: 2 },
  ctaLogoDivider:{ width: 40, height: 2, backgroundColor: TEAL, borderRadius: 1 },
  ctaLogoSub:   { fontSize: 13, color: WHITE + '70', fontWeight: '500', letterSpacing: 0.5 },
  ctaPills:     { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  ctaPill:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: WHITE + '0C', borderWidth: 1, borderColor: WHITE + '20' },
  ctaPillDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  ctaPillText:  { fontSize: 12, color: WHITE + 'BB', fontWeight: '600' },
});

// ══════════════════════════════════════════════════════════════════
// STYLES — SLIDE CONTENT
// ══════════════════════════════════════════════════════════════════
const sl = StyleSheet.create({
  root:         { flex: 1, overflow: 'hidden' },
  illuZone:     { height: 200, overflow: 'hidden' },
  contentZone:  { flex: 1, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 8 },

  tagRow:       { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  tagDot:       { width: 6, height: 6, borderRadius: 3 },
  tagTxt:       { fontSize: 10, fontWeight: '800', letterSpacing: 2, opacity: 0.9 },

  title:        { fontSize: Platform.OS === 'web' ? 32 : 26, fontWeight: '900', color: WHITE, lineHeight: Platform.OS === 'web' ? 40 : 33, letterSpacing: -0.5, marginBottom: 10 },
  body:         { fontSize: 13, color: WHITE + 'CC', lineHeight: 21, marginBottom: 14 },

  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  chip:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipTxt:      { fontSize: 11, fontWeight: '700' },

  statsBar:     { flexDirection: 'row', backgroundColor: WHITE + '0C', borderRadius: 14, borderWidth: 1, borderColor: WHITE + '15', paddingVertical: 14, paddingHorizontal: 10 },
  stat:         { flex: 1, alignItems: 'center' },
  statNum:      { fontSize: 20, fontWeight: '900', marginBottom: 3, letterSpacing: -0.3 },
  statLbl:      { fontSize: 10, color: WHITE + 'AA', textAlign: 'center', fontWeight: '500' },
  statDivider:  { width: 1, backgroundColor: WHITE + '20' },

  // CTA slide
  ctaBtns:      { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 32, gap: 14 },
  ctaMain:      { paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  ctaMainTxt:   { fontSize: 17, fontWeight: '900', color: DARK, letterSpacing: 0.5 },
  ctaGhost:     { paddingVertical: 12, alignItems: 'center' },
  ctaGhostTxt:  { fontSize: 14, color: WHITE + '70', fontWeight: '600' },
});

// ══════════════════════════════════════════════════════════════════
// STYLES — MAIN SHELL
// ══════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#0A6E6E', overflow: 'hidden' },
  slideRow: { flexDirection: 'row', width: W * N, flex: 1 },

  // Header overlay
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 58 : Platform.OS === 'web' ? 18 : 46,
    paddingBottom: 10,
    gap: 12,
    zIndex: 20,
  },
  logo:     { fontSize: 16, fontWeight: '900', color: WHITE, letterSpacing: 1.5 },
  stepPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: WHITE + '35', backgroundColor: WHITE + '12' },
  stepTxt:  { color: WHITE, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  skip:     { color: WHITE + 'BB', fontSize: 13, fontWeight: '600' },

  // Progress bar overlay
  progTrack: { position: 'absolute', left: 0, right: 0, height: 3, zIndex: 20,
               top: Platform.OS === 'ios' ? 96 : Platform.OS === 'web' ? 50 : 82 },
  progFill:  { height: 3, backgroundColor: WHITE, borderRadius: 2 },

  // Footer overlay
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 44 : 20,
    zIndex: 20,
  },

  dots:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:      { height: 7, borderRadius: 4 },

  nextBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 30, borderWidth: 1.5, borderColor: WHITE + '55', backgroundColor: WHITE + '15' },
  nextBtnLast:  { backgroundColor: WHITE, borderColor: WHITE },
  nextTxt:      { color: WHITE, fontSize: 14, fontWeight: '700' },
  nextTxtLast:  { color: '#0A6E6E' },
  nextArrow:    { color: WHITE, fontSize: 15, fontWeight: '700' },
});
