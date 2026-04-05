import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Dimensions,
} from 'react-native';

const TEAL      = '#17B8B8';
const TEAL_DARK = '#0D8F8F';
const TEAL_DEEP = '#0A6E6E';
const WHITE     = '#FFFFFF';
const DARK      = '#062020';
const MID       = '#3A7070';
const BG        = '#F8FEFE';
const BORDER    = '#C8E8E8';

interface Props { onGetStarted: () => void; onSignIn: () => void; onPrivacy?: () => void; onTerms?: () => void; }

// Exact data from index.html
const MARKETS_DATA: Record<string, { emoji: string; name: string; color: string }> = {
  jumia:     { emoji:'🛒', name:'Jumia',      color:'#FFB300' },
  konga:     { emoji:'🛍️', name:'Konga',      color:'#FF6B35' },
  amazon:    { emoji:'📦', name:'Amazon',     color:'#FF9500' },
  aliexpress:{ emoji:'🎁', name:'AliExpress', color:'#E41F0C' },
  ebay:      { emoji:'💳', name:'eBay',       color:'#E53238' },
  shopify:   { emoji:'🏪', name:'Shopify',    color:'#96C844' },
  instagram: { emoji:'📱', name:'Instagram',  color:'#E4405F' },
};
const USERS = [
  { lat:6.5244, lng:3.3792, emoji:'👨‍🦰', name:'Atoma',    market:'jumia'     },
  { lat:6.5280, lng:3.3850, emoji:'👩‍🦱', name:'Chioma',   market:'konga'     },
  { lat:6.5200, lng:3.3700, emoji:'👨‍💼', name:'David',    market:'amazon'    },
  { lat:6.5300, lng:3.3900, emoji:'👩‍💻', name:'Zainab',   market:'jumia'     },
  { lat:6.5150, lng:3.3650, emoji:'👨‍🎓', name:'Hassan',   market:'aliexpress'},
  { lat:6.5350, lng:3.3950, emoji:'👩‍🏫', name:'Grace',    market:'shopify'   },
  { lat:6.5270, lng:3.3780, emoji:'👨‍🍳', name:'Kingsley', market:'instagram' },
  { lat:6.5180, lng:3.3820, emoji:'👩‍⚕️', name:'Amara',   market:'temu'      },
];

const MARKETS = ['Jumia','Konga','Amazon','Jiji','Temu','Aliexpress','Slot','& many more...'];

const STEPS = [
  { n:'1', title:'Sign Up',        desc:'Create your account with your location. Our map instantly shows nearby shoppers.' },
  { n:'2', title:'Select Market',  desc:'Choose from preset markets (Jumia, Konga, Amazon, etc) or create your own custom online market. See who else is ordering nearby.' },
  { n:'3', title:'Connect & Chat', desc:'Join a group, chat with the other shoppers, and coordinate your orders together.' },
];

// SVG icons exactly as in index.html
const SVG_ICONS = [
  // location pin
  `<svg viewBox="0 0 24 24" fill="none" stroke="#17B8B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><circle cx="12" cy="11" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`,
  // chat bubble
  `<svg viewBox="0 0 24 24" fill="none" stroke="#17B8B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  // target circles
  `<svg viewBox="0 0 24 24" fill="none" stroke="#17B8B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  // tag
  `<svg viewBox="0 0 24 24" fill="none" stroke="#17B8B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  // people
  `<svg viewBox="0 0 24 24" fill="none" stroke="#17B8B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
];

const FEATURES = [
  { title:'Live Location Map',       desc:'See other shoppers near you in real-time. Find people ordering from the same market and connect instantly.' },
  { title:'Group Chat',              desc:'Chat directly with people ordering from the same market. Coordinate, ask questions, and connect with ease.' },
  { title:'Same Market, Same Area',  desc:'Filter by market and location. Only see people who are ordering from the exact same place as you.' },
  { title:'Any Online Market',       desc:'Choose from popular markets like Jumia, Konga, Temu, and Amazon — or add any custom store you shop from.' },
  { title:'Real People, Real Orders',desc:'Connect with real shoppers in your neighbourhood. No middlemen, no algorithms — just people near you.' },
];

// ── Leaflet map — exact replica of index.html (web only) ─────────
function LeafletMap({ liveCount }: { liveCount: number }) {
  const containerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;
    let destroyed = false;

    function initMap() {
      if (destroyed || !containerRef.current || !(window as any).L) return;
      if (mapRef.current) return;
      const L = (window as any).L;

      const map = L.map(containerRef.current, {
        center: [6.5244, 3.3792], zoom: 13,
        zoomControl: false, attributionControl: false, scrollWheelZoom: true,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 22, maxNativeZoom: 19,
      }).addTo(map);

      USERS.forEach(user => {
        const m = MARKETS_DATA[user.market];
        const html = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="font-size:2.5rem;background:white;border:3px solid #17B8B8;border-radius:50%;width:60px;height:60px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(23,184,184,0.3);">${user.emoji}</div>
          <div style="background:${m.color};color:white;padding:4px 10px;border-radius:6px;font-size:0.75rem;font-weight:700;margin-top:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${m.emoji} ${m.name}</div>
        </div>`;
        const icon = L.divIcon({ html, iconSize: [70, 110], className: '' });
        L.marker([user.lat, user.lng], { icon })
          .bindPopup(`<div style="text-align:center;font-family:sans-serif;"><div style="font-size:1.8rem;margin-bottom:8px;">${user.emoji}</div><strong>${user.name}</strong><br><span style="color:#17B8B8;font-weight:600;">${m.emoji} ${m.name}</span></div>`)
          .addTo(map);
      });
    }

    if ((window as any).L) {
      initMap();
    } else {
      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);
      }
      // Load Leaflet JS
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = () => { if (!destroyed) initMap(); };
        document.head.appendChild(script);
      } else {
        // Script tag exists but may still be loading
        const script = document.getElementById('leaflet-js') as HTMLScriptElement;
        script.addEventListener('load', () => { if (!destroyed) initMap(); });
      }
    }

    return () => {
      destroyed = true;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <View style={s.mapBox}>
      <div ref={containerRef} style={{ width:'100%', height:'100%' } as any} />
      <View style={s.mapOverlay}>
        <View style={s.liveDot} />
        <Text style={s.liveLabel}>
          Live: <Text style={s.liveNum}>{liveCount.toLocaleString()}</Text>
        </Text>
      </View>
    </View>
  );
}

export default function LandingPage({ onGetStarted, onSignIn, onPrivacy, onTerms }: Props) {
  const [liveCount,  setLiveCount]  = useState(0);
  const [shoppers,   setShoppers]   = useState(5243);
  const [saved,      setSaved]      = useState(127300000);
  const [groups,     setGroups]     = useState(2847);
  const [markets,    setMarkets]    = useState(12);
  const marqueeRef = useRef<any>(null);
  const { width: SW } = Dimensions.get('window');
  const wide = SW > 768;

  // Exact replication of index.html setInterval(updateCounters, 10)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const id = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 8) + 4);
      if (Math.random() > 0.6)  setShoppers(c => c + Math.floor(Math.random() * 12) + 2);
      if (Math.random() > 0.55) setSaved(c => c + Math.floor(Math.random() * 150000) + 75000);
      if (Math.random() > 0.7)  setGroups(c => c + Math.floor(Math.random() * 5) + 1);
      if (Math.random() > 0.88) setMarkets(c => Math.min(c + 1, 50));
    }, 10);
    return () => clearInterval(id);
  }, []);

  // rAF marquee
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let pos = 0, rafId: number;
    const tick = () => {
      const el = marqueeRef.current;
      if (el) {
        const half = el.scrollWidth / 2;
        pos += 0.5;
        if (pos >= half) pos = 0;
        el.style.transform = `translateX(-${pos}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  function formatCurrency(num: number) {
    return num >= 1000000 ? `₦${(num / 1000000).toFixed(1)}M` : `₦${num.toLocaleString()}`;
  }

  return (
    <>
      {/* Fixed watermark — position:fixed, stays on screen while scrolling */}
      {Platform.OS === 'web' && (
        <div style={{
          position: 'fixed', inset: 0,
          fontSize: '12rem', fontWeight: 900,
          color: 'rgba(23,184,184,0.09)',
          letterSpacing: '20px', whiteSpace: 'nowrap',
          pointerEvents: 'none', zIndex: 9999,
          lineHeight: 0.9, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textShadow: '0 0 50px rgba(23,184,184,0.07)',
          userSelect: 'none',
        } as any}>
          SPLITWI$E
        </div>
      )}

      <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ══ HEADER ══ */}
        <View style={[s.header, Platform.OS === 'web' && ({ position:'sticky', top:0, zIndex:100 } as any)]}>
          <Text style={s.logo}>SPLITWI<Text style={{ color: TEAL_DARK + 'CC' }}>$</Text>E</Text>
          {wide && (
            <View style={s.nav}>
              {['Features','How It Works','About'].map(l => (
                <Text key={l} style={s.navLink}>{l}</Text>
              ))}
            </View>
          )}
          <View style={s.headerBtns}>
            <TouchableOpacity style={s.outlineBtn} onPress={onSignIn}>
              <Text style={s.outlineBtnTxt}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.solidBtn} onPress={onGetStarted}>
              <Text style={s.solidBtnTxt}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══ BIG TITLE ══ */}
        <View style={s.bigTitle}>
          <Text style={s.bigTitleTxt}>SPLITWI<Text style={{ color: TEAL_DARK }}>$</Text>E</Text>
        </View>

        {/* ══ HERO ══ */}
        <View style={[s.hero, wide && s.heroWide]}>
          {/* Text */}
          <View style={[s.heroText, wide && { flex: 1 }]}>
            <Text style={s.heroH2}>Shop Together,{'\n'}Save Together</Text>
            <Text style={s.heroTagline}>Discover shoppers nearby, Order Together</Text>
            <Text style={s.heroDesc}>
              Discover people near you ordering from the same online market. Connect, chat, and coordinate — it's that simple. Jumia, Konga, Amazon, Temu, and more.
            </Text>
            <View style={[s.ctaRow, !wide && s.ctaRowCol]}>
              <TouchableOpacity style={s.btnPrimary} onPress={onGetStarted} activeOpacity={0.85}>
                <Text style={s.btnPrimaryTxt}>Start Shopping Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnSecondary} onPress={onSignIn} activeOpacity={0.85}>
                <Text style={s.btnSecondaryTxt}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Map */}
          <View style={[wide && { flex: 0.7 }]}>
            {Platform.OS === 'web'
              ? <LeafletMap liveCount={liveCount} />
              : (
                <View style={s.mapBox}>
                  <View style={s.mapOverlay}>
                    <View style={s.liveDot} />
                    <Text style={s.liveLabel}>Live: <Text style={s.liveNum}>0</Text></Text>
                  </View>
                </View>
              )
            }
          </View>
        </View>

        {/* ══ MARKETS MARQUEE ══ */}
        <View style={s.marqueeSection}>
          <Text style={s.sectionLabel}>SUPPORTED MARKETS</Text>
          <View style={s.marqueeWrap}>
            {Platform.OS === 'web' ? (
              <View ref={marqueeRef} style={s.marqueeRow}>
                {[...MARKETS,...MARKETS].map((m,i)=>(
                  <View key={i} style={[s.chip, m==='& many more...' && s.chipDash]}>
                    <Text style={[s.chipTxt, m==='& many more...' && { color:MID, fontStyle:'italic' }]}>{m}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.marqueeRow}>
                  {MARKETS.map((m,i)=>(
                    <View key={i} style={[s.chip, m==='& many more...' && s.chipDash]}>
                      <Text style={[s.chipTxt, m==='& many more...' && { color:MID, fontStyle:'italic' }]}>{m}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>

        {/* ══ FEATURES ══ */}
        <View style={s.featuresSection}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Why Choose SPLITWI$E?</Text>
            <Text style={s.sectionSub}>The easiest way to find people ordering from the same place as you</Text>
          </View>
          <View style={[s.featuresGrid, wide && s.featuresGridWide]}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[s.featureCard, wide && { width:'30%' }]}>
                <View style={s.featureIcon}>
                  {Platform.OS === 'web'
                    ? <div dangerouslySetInnerHTML={{ __html: SVG_ICONS[i] }} />
                    : <Text style={{ fontSize:24 }}>{'📍💬🎯🛒👥'.split('')[i]}</Text>
                  }
                </View>
                <Text style={s.featureTitle}>{f.title}</Text>
                <Text style={s.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ══ HOW IT WORKS ══ */}
        <View style={s.howSection}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>How It Works</Text>
            <Text style={s.sectionSub}>Get started in just 3 steps</Text>
          </View>
          <View style={[s.stepsRow, wide && s.stepsRowWide]}>
            {STEPS.map((st, i) => (
              <View key={i} style={[s.stepCard, wide && { flex:1 }]}>
                <View style={s.stepNum}><Text style={s.stepNumTxt}>{st.n}</Text></View>
                <Text style={s.stepTitle}>{st.title}</Text>
                <Text style={s.stepDesc}>{st.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ══ STATS ══ */}
        <View style={s.statsSection}>
          <View style={[s.statsRow, wide && s.statsRowWide]}>
            {[
              { val: shoppers.toLocaleString(), label:'Active Shoppers' },
              { val: formatCurrency(saved),     label:'Saved Together' },
              { val: groups.toLocaleString(),   label:'Groups Formed' },
              { val: String(markets),            label:'Online Markets' },
            ].map((st, i) => (
              <View key={i} style={s.statItem}>
                <Text style={s.statNum}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ══ FINAL CTA ══ */}
        <View style={s.finalCta}>
          <Text style={s.finalTitle}>Find Your People Today</Text>
          <Text style={s.finalSub}>
            Thousands of shoppers near you are already on SPLITWI$E. Sign up for free and start connecting in seconds.
          </Text>
          <View style={[s.ctaRow, !wide && s.ctaRowCol, { justifyContent:'center' }]}>
            <TouchableOpacity style={s.btnPrimary} onPress={onGetStarted} activeOpacity={0.85}>
              <Text style={s.btnPrimaryTxt}>Get Started Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnSecondary} onPress={onSignIn} activeOpacity={0.85}>
              <Text style={s.btnSecondaryTxt}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══ FOOTER ══ */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>© 2026 SPLITWI$E. Shop Together, Save Together.</Text>
          <View style={s.footerLinks}>
            <TouchableOpacity onPress={onPrivacy}>
              <Text style={s.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={s.footerDot}>•</Text>
            <TouchableOpacity onPress={onTerms}>
              <Text style={s.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={s.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={s.footerLink}>Contact Us</Text>
            </TouchableOpacity>
            <Text style={s.footerDot}>•</Text>
            <TouchableOpacity onPress={onSignIn}><Text style={s.footerLink}>Sign In</Text></TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  root:    { flex:1, backgroundColor:Platform.OS==='web' ? 'transparent' : BG },
  content: {},

  // Header
  header:        { flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:24,paddingVertical:14,backgroundColor:'rgba(248,254,254,0.95)',borderBottomWidth:1,borderBottomColor:BORDER, ...(Platform.OS==='web' ? { backdropFilter:'blur(20px)' } as any : {}) },
  logo:          { fontSize:20,fontWeight:'900',color:TEAL,letterSpacing:1 },
  nav:           { flexDirection:'row',gap:28 },
  navLink:       { fontSize:15,fontWeight:'500',color:DARK },
  headerBtns:    { flexDirection:'row',gap:8,alignItems:'center' },
  outlineBtn:    { borderWidth:1.5,borderColor:TEAL,borderRadius:8,paddingHorizontal:14,paddingVertical:7 },
  outlineBtnTxt: { fontSize:13,fontWeight:'600',color:TEAL },
  solidBtn:      { backgroundColor:TEAL,borderRadius:8,paddingHorizontal:16,paddingVertical:8 },
  solidBtnTxt:   { fontSize:13,fontWeight:'600',color:WHITE },

  // Big title
  bigTitle:    { paddingTop:30,paddingHorizontal:24,alignItems:'center' },
  bigTitleTxt: { fontSize:Platform.OS==='web'?96:48,fontWeight:'900',color:TEAL,letterSpacing:8,textAlign:'center',textShadowColor:'rgba(23,184,184,0.15)',textShadowOffset:{width:0,height:4},textShadowRadius:20 },

  // Hero
  hero:        { padding:32,paddingTop:20,gap:32 },
  heroWide:    { flexDirection:'row',alignItems:'center',gap:64 },
  heroText:    { gap:16 },
  heroH2:      { fontSize:Platform.OS==='web'?56:28,fontWeight:'700',color:DARK,lineHeight:Platform.OS==='web'?68:36 },
  heroTagline: { fontSize:Platform.OS==='web'?29:18,fontWeight:'600',color:TEAL },
  heroDesc:    { fontSize:Platform.OS==='web'?17:14,color:MID,lineHeight:27 },

  // CTA
  ctaRow:         { flexDirection:'row',gap:16,flexWrap:'wrap',marginTop:8 },
  ctaRowCol:      { flexDirection:'column' },
  btnPrimary:     { backgroundColor:TEAL,paddingHorizontal:36,paddingVertical:16,borderRadius:10,shadowColor:TEAL,shadowOffset:{width:0,height:8},shadowOpacity:0.25,shadowRadius:20,elevation:5 },
  btnPrimaryTxt:  { color:WHITE,fontWeight:'600',fontSize:16 },
  btnSecondary:   { backgroundColor:WHITE,paddingHorizontal:36,paddingVertical:16,borderRadius:10,borderWidth:2,borderColor:TEAL },
  btnSecondaryTxt:{ color:TEAL,fontWeight:'600',fontSize:16 },

  // Map
  mapBox:    { height:350,borderRadius:20,overflow:'hidden',borderWidth:2,borderColor:BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:20},shadowOpacity:0.2,shadowRadius:60,elevation:10,backgroundColor:'#EEF9F9',position:'relative' },
  mapOverlay:{ position:'absolute',bottom:20,left:20,backgroundColor:'rgba(248,254,254,0.95)',borderRadius:12,paddingHorizontal:20,paddingVertical:12,borderWidth:1,borderColor:BORDER,flexDirection:'row',alignItems:'center',gap:12,zIndex:50 },
  liveDot:   { width:10,height:10,borderRadius:5,backgroundColor:TEAL },
  liveLabel: { fontSize:14,color:DARK,fontWeight:'500' },
  liveNum:   { color:TEAL,fontWeight:'700',fontSize:19,fontVariant:['tabular-nums'] as any,letterSpacing:1 },

  // Marquee
  marqueeSection:{ paddingVertical:20,borderTopWidth:1,borderBottomWidth:1,borderColor:BORDER,backgroundColor:WHITE },
  sectionLabel:  { fontSize:10,fontWeight:'800',color:MID,letterSpacing:2,textAlign:'center',marginBottom:12 },
  marqueeWrap:   { overflow:'hidden' },
  marqueeRow:    { flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:8 },
  chip:          { paddingHorizontal:14,paddingVertical:7,borderRadius:20,backgroundColor:TEAL+'12',borderWidth:1,borderColor:TEAL+'30' },
  chipDash:      { backgroundColor:'#F0FCFC',borderStyle:'dashed' as any,borderColor:TEAL+'20' },
  chipTxt:       { fontSize:12,fontWeight:'700',color:TEAL_DEEP },

  // Features
  featuresSection:{ padding:64,paddingHorizontal:40,backgroundColor:'rgba(23,184,184,0.03)',borderTopWidth:1,borderBottomWidth:1,borderColor:BORDER },
  sectionHead:   { alignItems:'center',marginBottom:48 },
  sectionTitle:  { fontSize:Platform.OS==='web'?45:24,fontWeight:'700',color:DARK,textAlign:'center',marginBottom:12 },
  sectionSub:    { fontSize:Platform.OS==='web'?18:14,color:MID,textAlign:'center' },
  featuresGrid:  { gap:24 },
  featuresGridWide:{ flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:32 },
  featureCard:   { backgroundColor:WHITE,padding:40,borderRadius:16,borderWidth:1,borderColor:BORDER,shadowColor:DARK,shadowOffset:{width:0,height:4},shadowOpacity:0.04,shadowRadius:12,elevation:2 },
  featureIcon:   { width:60,height:60,borderRadius:12,backgroundColor:'rgba(23,184,184,0.08)',borderWidth:1,borderColor:'rgba(23,184,184,0.15)',alignItems:'center',justifyContent:'center',marginBottom:20 },
  featureTitle:  { fontSize:Platform.OS==='web'?22:16,fontWeight:'600',color:DARK,marginBottom:12 },
  featureDesc:   { fontSize:Platform.OS==='web'?15:13,color:MID,lineHeight:Platform.OS==='web'?27:20 },

  // How it works
  howSection:  { padding:64,paddingHorizontal:40,maxWidth:1200,alignSelf:'center',width:'100%' as any },
  stepsRow:    { gap:24,marginTop:16 },
  stepsRowWide:{ flexDirection:'row',gap:32 },
  stepCard:    { backgroundColor:WHITE,padding:40,borderRadius:16,borderWidth:1,borderColor:BORDER,alignItems:'center',shadowColor:DARK,shadowOffset:{width:0,height:4},shadowOpacity:0.04,shadowRadius:12,elevation:2 },
  stepNum:     { width:60,height:60,borderRadius:30,backgroundColor:TEAL,alignItems:'center',justifyContent:'center',marginBottom:20 },
  stepNumTxt:  { fontSize:Platform.OS==='web'?29:18,fontWeight:'700',color:WHITE },
  stepTitle:   { fontSize:Platform.OS==='web'?21:16,fontWeight:'600',color:DARK,marginBottom:12,textAlign:'center' },
  stepDesc:    { fontSize:Platform.OS==='web'?15:13,color:MID,lineHeight:Platform.OS==='web'?26:20,textAlign:'center' },

  // Stats — gradient like original (linear-gradient(135deg, #17B8B8 0%, #0A6E6E 100%))
  statsSection:{ paddingVertical:64,paddingHorizontal:40,backgroundColor:TEAL_DEEP },
  statsRow:    { gap:32 },
  statsRowWide:{ flexDirection:'row',justifyContent:'space-around' },
  statItem:    { alignItems:'center' },
  statNum:     { fontSize:Platform.OS==='web'?51:32,fontWeight:'700',color:WHITE,fontVariant:['tabular-nums'],letterSpacing:2,marginBottom:8 },
  statLabel:   { fontSize:Platform.OS==='web'?16:13,color:'rgba(255,255,255,0.9)' },

  // Final CTA
  finalCta:  { padding:64,paddingHorizontal:40,alignItems:'center' },
  finalTitle:{ fontSize:Platform.OS==='web'?45:24,fontWeight:'700',color:DARK,textAlign:'center',marginBottom:20 },
  finalSub:  { fontSize:Platform.OS==='web'?19:14,color:MID,textAlign:'center',maxWidth:600,marginBottom:32,lineHeight:Platform.OS==='web'?30:22 },

  // Footer
  footer:      { backgroundColor:DARK,paddingVertical:48,paddingHorizontal:40,alignItems:'center',gap:16 },
  footerTxt:   { fontSize:14,color:BORDER },
  footerLinks: { flexDirection:'row',alignItems:'center',gap:12,flexWrap:'wrap',justifyContent:'center' },
  footerLink:  { fontSize:14,color:TEAL },
  footerDot:   { fontSize:14,color:MID },
});
