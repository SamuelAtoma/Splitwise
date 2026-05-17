import React, { useState, useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Animated, Dimensions, Platform, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { SUPPORTED_MARKETS } from '../lib/constants';
import { distanceKm, createCircle, avatarHtml } from '../lib/utils';
import {
  Svg, CartIcon, PinIcon, ChevronIcon, RecenterIcon, SignalIcon, LocationIcon, ShieldIcon,
  ChatIcon, UsersIcon,
} from '../lib/icons';

const TEAL       = '#17B8B8';
const TEAL_DARK  = '#0D8F8F';
const TEAL_DEEP  = '#0A6E6E';
const WHITE      = '#FFFFFF';
const DARK       = '#062020';
const MID        = '#3A7070';
const LIGHT_BORDER = '#C8E8E8';
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
const { width: SW, height: SH } = Dimensions.get('window');

interface Market { id: string; name: string; logo_emoji: string; is_custom: boolean; }
interface MapUser {
  id: string; user_id: string; lat: number; lng: number;
  market_name: string; is_pooling: boolean;
  profile: { first_name: string; last_name: string; avatar_emoji: string; };
}

// ── Web map markers (SVG strings for HTML injection) ─────────
const svgPin = (color: string) => `
  <svg width="22" height="28" viewBox="0 0 24 30" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="9" r="2.5" fill="white"/>
  </svg>`;

// ══════════════════════════════════════════════════════════════
// WEB MAP
// ══════════════════════════════════════════════════════════════
function WebMap({ location, mapUsers, radius, onUserTap, myProfile, selectedMarket, filterMarket }: {
  location: { lat: number; lng: number };
  mapUsers: MapUser[];
  radius: number;
  onUserTap: (user: MapUser) => void;
  myProfile: any;
  selectedMarket: any;
  filterMarket: Market | null;
}) {
  const mapContainerRef  = useRef<any>(null);
  const mapRef           = useRef<any>(null);
  const markersRef       = useRef<any[]>([]);
  const myMarkerElRef    = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!MAPBOX_TOKEN) return; // token not yet configured — show fallback UI
    const initMap = async () => {
      try {
      const mapboxgl = (await import('mapbox-gl')).default;
      (mapboxgl as any).accessToken = MAPBOX_TOKEN;

      if (!document.getElementById('mapbox-css')) {
        const link = document.createElement('link');
        link.id   = 'mapbox-css';
        link.rel  = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        document.head.appendChild(link);
      }

      if (!mapContainerRef.current) return;
      // If a stale map ref exists (e.g. after HMR), clear it before reinitializing
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
        mapRef.current = null;
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style:     'mapbox://styles/mapbox/streets-v12',
        center:    [location.lng, location.lat],
        zoom:      14,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        map.addSource('radius', { type:'geojson', data:createCircle(location.lat, location.lng, radius) });
        map.addLayer({ id:'radius-fill',   type:'fill', source:'radius', paint:{ 'fill-color':TEAL, 'fill-opacity':0.06 } });
        map.addLayer({ id:'radius-border', type:'line', source:'radius', paint:{ 'line-color':TEAL, 'line-width':1.5, 'line-dasharray':[3,3] } });

        const myEl = document.createElement('div');
        myMarkerElRef.current = myEl;
        const myEmoji = myProfile?.avatar_emoji || '';
        const myName  = myProfile?.first_name   || 'You';
        const myMkt   = selectedMarket?.name     || '';
        myEl.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
            ${myMkt ? `<div style="background:white;color:${TEAL_DEEP};font-size:9px;font-weight:800;
              padding:2px 8px;border-radius:6px;border:1.5px solid ${TEAL_DARK};white-space:nowrap;">${myMkt}</div>` : ''}
            <div style="width:52px;height:52px;border-radius:50%;background:white;overflow:hidden;
              border:3px solid ${TEAL_DARK};display:flex;align-items:center;
              justify-content:center;
              box-shadow:0 4px 20px rgba(13,143,143,0.5);">${avatarHtml(myEmoji) || svgPin(TEAL_DARK)}</div>
            <div style="background:${TEAL_DARK};color:white;font-size:10px;font-weight:800;
              padding:3px 10px;border-radius:8px;white-space:nowrap;">${myName}</div>
          </div>`;
        new mapboxgl.Marker({ element: myEl, anchor:'bottom' })
          .setLngLat([location.lng, location.lat])
          .addTo(map);

        addUserMarkers(map, mapboxgl, mapUsers, onUserTap, filterMarket);
      });

      map.on('error', (err: any) => {
        console.error('Mapbox map error:', err);
      });
    } catch (err) {
      console.error('WebMap init failed:', err);
    }
    };
    initMap();
    return () => { try { mapRef.current?.remove(); } catch (e) {} mapRef.current = null; };
  }, [location]);

  // Update "my marker" whenever profile or selected market changes
  useEffect(() => {
    if (!myMarkerElRef.current) return;
    const myEmoji = myProfile?.avatar_emoji || '';
    const myName  = myProfile?.first_name   || 'You';
    const myMkt   = selectedMarket?.name    || '';
    myMarkerElRef.current.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        ${myMkt ? `<div style="background:white;color:${TEAL_DEEP};font-size:9px;font-weight:800;
          padding:2px 8px;border-radius:6px;border:1.5px solid ${TEAL_DARK};white-space:nowrap;">${myMkt}</div>` : ''}
        <div style="width:52px;height:52px;border-radius:50%;background:white;overflow:hidden;
          border:3px solid ${TEAL_DARK};display:flex;align-items:center;
          justify-content:center;
          box-shadow:0 4px 20px rgba(13,143,143,0.5);">${avatarHtml(myEmoji) || svgPin(TEAL_DARK)}</div>
        <div style="background:${TEAL_DARK};color:white;font-size:10px;font-weight:800;
          padding:3px 10px;border-radius:8px;white-space:nowrap;">${myName}</div>
      </div>`;
  }, [myProfile, selectedMarket]);

  useEffect(() => {
    if (!mapRef.current || Platform.OS !== 'web') return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      addUserMarkers(map, mapboxgl, mapUsers, onUserTap, filterMarket);
    });
  }, [mapUsers, filterMarket]);

  useEffect(() => {
    if (!mapRef.current || Platform.OS !== 'web') return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;
    const src = map.getSource('radius') as any;
    if (src) src.setData(createCircle(location.lat, location.lng, radius));
  }, [radius]);

  const addUserMarkers = (map: any, mapboxgl: any, users: MapUser[], onTap: (u: MapUser) => void, filter: Market | null) => {
    users.forEach(u => {
      const emoji = u.profile?.avatar_emoji || '🧑';
      const name  = u.profile?.first_name   || '?';
      const isFiltering = filter !== null;
      const isMatch = !isFiltering || u.market_name?.toLowerCase() === filter?.name?.toLowerCase();
      const color = isMatch ? (u.is_pooling ? '#2F855A' : TEAL_DARK) : '#C8C8C8';
      const avatarSize = isFiltering && isMatch ? 58 : 52;
      const avatarShadow = isFiltering && isMatch
        ? '0 0 0 5px rgba(23,184,184,0.5), 0 0 0 9px rgba(23,184,184,0.15), 0 6px 28px rgba(23,184,184,0.4)'
        : '0 4px 20px rgba(0,0,0,0.2)';
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:${isMatch ? 'pointer' : 'default'};gap:2px;
          opacity:${isFiltering && !isMatch ? '0.07' : '1'};
          filter:${isFiltering && !isMatch ? 'blur(3px) grayscale(1)' : 'none'};
          transform:${isFiltering && isMatch ? 'scale(1.08)' : 'scale(1)'};
          transition:opacity 0.35s,filter 0.35s,transform 0.25s;
          pointer-events:${isFiltering && !isMatch ? 'none' : 'auto'};">
          ${u.market_name ? `<div style="background:${isMatch ? TEAL_DARK : '#e8e8e8'};color:${isMatch ? 'white' : '#bbb'};font-size:9px;font-weight:800;
            padding:3px 10px;border-radius:8px;border:none;white-space:nowrap;
            box-shadow:${isMatch ? '0 2px 8px rgba(23,184,184,0.35)' : 'none'};">${u.market_name}</div>` : ''}
          <div style="position:relative;">
            ${u.is_pooling && isMatch ? `<div style="position:absolute;top:-8px;right:-8px;z-index:2;
              background:#276749;color:white;font-size:8px;font-weight:800;
              padding:2px 5px;border-radius:6px;">POOL</div>` : ''}
            <div style="width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;background:white;overflow:hidden;
              border:${isFiltering && isMatch ? '3.5px' : '2.5px'} solid ${color};display:flex;align-items:center;
              justify-content:center;
              box-shadow:${avatarShadow};">${avatarHtml(emoji, avatarSize) || `<span style="font-size:${Math.round(avatarSize*0.46)}px;">🧑</span>`}</div>
          </div>
          <div style="background:${color};color:white;font-size:10px;font-weight:800;
            padding:3px 10px;border-radius:8px;white-space:nowrap;">${name}</div>
        </div>`;
      if (isMatch) el.addEventListener('click', () => onTap(u));
      const marker = new mapboxgl.Marker({ element: el, anchor:'bottom' })
        .setLngLat([u.lng, u.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#0D1F2D' }}>
        <Text style={{ color:WHITE, fontSize:16 }}>Map requires web browser</Text>
      </View>
    );
  }

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: 420 }} />;
}

// ══════════════════════════════════════════════════════════════
// MARKET MODAL
// ══════════════════════════════════════════════════════════════
function MarketModal({ visible, markets, onSelect, onClose }: {
  visible: boolean; markets: Market[];
  onSelect: (m: Market) => void; onClose: () => void;
}) {
  const [search,  setSearch]  = useState('');
  const [custom,  setCustom]  = useState('');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (visible) { setSearch(''); setCustom(''); setShowNew(false); }
  }, [visible]);

  const filtered = markets.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCustom = () => {
    if (!custom.trim()) return;
    onSelect({ id:'custom_'+Date.now(), name:custom.trim().toUpperCase(), logo_emoji:'🛒', is_custom:true });
    setCustom(''); setShowNew(false);
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={st.modalOverlay}>
        <TouchableOpacity style={{ flex:1 }} onPress={onClose} activeOpacity={1}/>
        <View style={st.marketSheet}>
          <View style={st.sheetHandle}/>
          <Text style={st.sheetTitle}>Select Online Market</Text>
          <Text style={st.sheetSubtitle}>Choose where you're ordering from to find nearby shoppers</Text>

          <View style={st.searchBox}>
            <PinIcon s={MID} sz={16}/>
            <TextInput
              style={st.searchInput}
              placeholder="Search markets..."
              placeholderTextColor="#9BB8B8"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color:MID, fontSize:18, paddingHorizontal:4 }}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: SH * 0.38 }}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.length === 0 ? (
              <View style={{ paddingVertical:32, alignItems:'center' }}>
                <Text style={{ fontSize:13, color:MID }}>No markets found for "{search}"</Text>
              </View>
            ) : (
              filtered.map((m, idx) => (
                <TouchableOpacity
                  key={m.id + idx}
                  style={st.marketItem}
                  onPress={() => onSelect(m)}
                  activeOpacity={0.7}
                >
                  <View style={st.marketItemLeft}>
                    <View style={st.marketEmoji}>
                      <CartIcon s={TEAL_DARK} sz={20}/>
                    </View>
                    <View>
                      <Text style={st.marketName}>{m.name}</Text>
                      {m.is_custom && <Text style={st.marketCustomTag}>Custom market</Text>}
                    </View>
                  </View>
                  <ChevronIcon s={MID} sz={18}/>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={st.addMarketBtn} onPress={() => setShowNew(v => !v)}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
              <CartIcon s={TEAL_DEEP} sz={16}/>
              <Text style={st.addMarketBtnTxt}>+ Add Custom Market</Text>
            </View>
          </TouchableOpacity>

          {showNew && (
            <View style={st.customInputRow}>
              <TextInput
                style={st.customInput}
                placeholder="e.g. Shoprite, Game, Spar..."
                placeholderTextColor="#9BB8B8"
                value={custom}
                onChangeText={setCustom}
                autoFocus
                autoCapitalize="words"
              />
              <TouchableOpacity style={st.customSubmit} onPress={handleCustom}>
                <Text style={st.customSubmitTxt}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════
// USER TAP MODAL
// ══════════════════════════════════════════════════════════════
function UserTapModal({ user, visible, onClose, onStartChat, loading }: {
  user: MapUser | null; visible: boolean;
  onClose: () => void;
  onStartChat: (isPool: boolean) => void;
  loading: boolean;
}) {
  if (!visible || !user) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={st.modalOverlay}>
        <TouchableOpacity style={{ flex:1 }} onPress={onClose} activeOpacity={1}/>
        <View style={st.userCard}>
          <View style={st.userCardHeader}>
            <View style={st.userCardAvatar}>
              <Text style={{ fontSize:36 }}>{user.profile?.avatar_emoji || '🧑'}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={st.userCardName}>{user.profile?.first_name} {user.profile?.last_name}</Text>
              <View style={st.userCardMarketRow}>
                <View style={{ width:8, height:8, borderRadius:4, backgroundColor:TEAL, marginRight:6 }}/>
                <Text style={st.userCardMarket}>Ordering from {user.market_name}</Text>
              </View>
              {user.is_pooling && (
                <View style={st.poolingBadge}>
                  <Text style={st.poolingBadgeTxt}>🔗 Open Pool — Looking for members</Text>
                </View>
              )}
            </View>
          </View>

          <View style={st.userCardDivider}/>

          <Text style={st.choiceTitle}>How do you want to connect?</Text>
          <Text style={st.choiceSubtitle}>
            Choose how you'd like to coordinate with {user.profile?.first_name}
          </Text>

          <View style={st.choiceRow}>
            <TouchableOpacity
              style={[st.choiceCard, st.choiceCardPool, loading && { opacity:0.7 }]}
              onPress={() => onStartChat(true)}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color={WHITE} size="small"/> : (
                <>
                  <View style={st.choiceIcon}>
                    <UsersIcon s={WHITE} sz={22}/>
                  </View>
                  <Text style={st.choiceCardTitle}>Open Pool</Text>
                  <Text style={st.choiceCardDesc}>Visible on map — others nearby can join</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[st.choiceCard, st.choiceCardPrivate, loading && { opacity:0.7 }]}
              onPress={() => onStartChat(false)}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color={TEAL_DARK} size="small"/> : (
                <>
                  <View style={[st.choiceIcon, { backgroundColor:TEAL+'18' }]}>
                    <ChatIcon s={TEAL_DARK} sz={22}/>
                  </View>
                  <Text style={[st.choiceCardTitle, { color:TEAL_DARK }]}>Just Us Two</Text>
                  <Text style={[st.choiceCardDesc, { color:MID }]}>Private chat — stays off the map</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={st.cancelBtn} onPress={onClose}>
            <Text style={st.cancelBtnTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════
// LOCATION PERMISSION SCREEN
// ══════════════════════════════════════════════════════════════
function LocationPermissionScreen({
  error, onRetry, isLoading,
}: { error: string; onRetry: () => void; isLoading: boolean; }) {
  const isIOS     = Platform.OS === 'ios' || (Platform.OS === 'web' && /iPad|iPhone|iPod/.test(navigator?.userAgent || ''));
  const isAndroid = Platform.OS === 'android' || (Platform.OS === 'web' && /Android/.test(navigator?.userAgent || ''));
  const isSafari  = Platform.OS === 'web' && /Safari/.test(navigator?.userAgent || '') && !/Chrome/.test(navigator?.userAgent || '');

  const steps = isIOS ? [
    { icon:'1', text: 'Tap "Enable Location" below' },
    { icon:'2', text: 'When Safari asks, tap "Allow"' },
    { icon:'3', text: 'If blocked: Settings → Privacy → Location Services → ON' },
    { icon:'4', text: 'Then: Settings → Safari → Location → "Ask" or "Allow"' },
  ] : isAndroid ? [
    { icon:'1', text: 'Tap "Enable Location" below' },
    { icon:'2', text: 'When browser asks, tap "Allow"' },
    { icon:'3', text: 'If blocked: Settings → Apps → Browser → Permissions → Location → Allow' },
  ] : [
    { icon:'1', text: 'Tap "Enable Location" below' },
    { icon:'2', text: 'Click "Allow" when the browser asks' },
    { icon:'3', text: 'If blocked: click the lock icon in address bar → Allow Location' },
  ];

  return (
    <View style={st.permScreen}>
      {/* Icon */}
      <View style={st.permIconOuter}>
        <View style={st.permIconInner}>
          <LocationIcon s={TEAL_DARK} sz={36}/>
        </View>
      </View>

      <Text style={st.permTitle}>Location Required</Text>
      <Text style={st.permSubtitle}>
        SPLITWI$E needs your location to show nearby shoppers on the map.
      </Text>

      {/* Error message */}
      {error ? (
        <View style={st.permErrorBox}>
          <Text style={st.permErrorTxt}>⚠️  {error}</Text>
        </View>
      ) : null}

      {/* Step by step guide */}
      <View style={st.permStepsCard}>
        <View style={st.permStepsHeader}>
          <ShieldIcon s={TEAL_DARK} sz={16}/>
          <Text style={st.permStepsTitle}>
            {isIOS ? '📱 iPhone / iPad Steps' : isAndroid ? '🤖 Android Steps' : '💻 Browser Steps'}
          </Text>
        </View>
        {steps.map((step, i) => (
          <View key={i} style={st.permStepRow}>
            <View style={st.permStepNum}>
              <Text style={st.permStepNumTxt}>{step.icon}</Text>
            </View>
            <Text style={st.permStepTxt}>{step.text}</Text>
          </View>
        ))}
      </View>

      {/* Enable button */}
      <TouchableOpacity
        style={[st.permBtn, isLoading && { opacity:0.7 }]}
        onPress={onRetry}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
            <ActivityIndicator color={WHITE} size="small"/>
            <Text style={st.permBtnTxt}>Getting location...</Text>
          </View>
        ) : (
          <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
            <LocationIcon s={WHITE} sz={18}/>
            <Text style={st.permBtnTxt}>Enable Location</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={st.permNote}>
        Your location is only used to show nearby shoppers and is never stored without your permission.
      </Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN MAP SCREEN
// ══════════════════════════════════════════════════════════════
interface MapScreenProps { onOpenChat: (groupId: string) => void; }

export default function MapScreen({ onOpenChat }: MapScreenProps) {
  const [location,        setLocation]        = useState<{ lat: number; lng: number } | null>(null);
  const [locationError,   setLocationError]   = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [markets,         setMarkets]         = useState<Market[]>([]);
  const [selectedMarket,  setSelectedMarket]  = useState<Market | null>(null);
  const [mapUsers,        setMapUsers]        = useState<MapUser[]>([]);
  const [radius,          setRadius]          = useState(3);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [filterMarket,    setFilterMarket]    = useState<Market | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedUser,    setSelectedUser]    = useState<MapUser | null>(null);
  const [showUserModal,   setShowUserModal]   = useState(false);
  const [chatLoading,     setChatLoading]     = useState(false);
  const [mySessionId,     setMySessionId]     = useState<string | null>(null);
  const [currentUser,     setCurrentUser]     = useState<any>(null);
  const [myProfile,       setMyProfile]       = useState<any>(null);
  const [isOnMap,         setIsOnMap]         = useState(false);
  const heartbeatRef     = useRef<any>(null);
  // Ref keeps the user ID immediately available in async callbacks
  // without depending on React state timing (fixes ghost-pin race condition)
  const currentUserIdRef = useRef<string>('');

  const radiusOptions = [1, 2, 3, 5, 10, 20];

  useEffect(() => {
    init();
    return () => { cleanupSession(); };
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyUsers();
      const interval = setInterval(fetchNearbyUsers, 15000);
      return () => clearInterval(interval);
    }
  }, [location, radius]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Set ref immediately — available to all async callbacks without waiting for React re-render
      currentUserIdRef.current = user.id;
      setCurrentUser(user);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profile) setMyProfile(profile);

      // ── Purge ghost sessions from previous visits ────────────────
      // Without this, every browser-close without "Go Offline" leaves a
      // stale row — and the user sees themselves as a tappable stranger.
      await supabase.from('map_sessions').delete().eq('user_id', user.id);
    }
    await fetchMarkets();
    await requestLocation();
  };

  const fetchMarkets = async () => {
    const { data } = await supabase.from('markets').select('*').order('name');
    if (data && data.length > 0) {
      setMarkets(data);
    } else {
      setMarkets(SUPPORTED_MARKETS);
    }
  };

  // ── Unified location request — works on ALL platforms ─────
  const requestLocation = async () => {
    setLocationLoading(true);
    setLocationError('');

    try {
      // ── Web / Mobile browser ──────────────────────────────
      if (Platform.OS === 'web') {
        if (!navigator?.geolocation) {
          setLocationError('Geolocation is not supported by your browser. Please try a different browser.');
          setLocationLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocationError('');
            setLocationLoading(false);
          },
          (err) => {
            setLocationLoading(false);
            switch (err.code) {
              case 1: // PERMISSION_DENIED
                setLocationError('Location access was denied. Please follow the steps below to enable it.');
                break;
              case 2: // POSITION_UNAVAILABLE
                setLocationError('Your location could not be determined. Make sure GPS is turned on.');
                break;
              case 3: // TIMEOUT
                setLocationError('Location request timed out. Please try again.');
                break;
              default:
                setLocationError('Unable to get your location. Please try again.');
            }
          },
          {
            enableHighAccuracy: true,
            timeout:            15000,
            maximumAge:         0,
          }
        );
      } else {
        // ── Native iOS / Android (Expo) ───────────────────
        const { status: existing } = await Location.getForegroundPermissionsAsync();

        if (existing === 'denied') {
          // Already denied — tell user to go to settings
          setLocationError('Location permission was denied. Please go to your device Settings → Privacy → Location Services and enable it for this app.');
          setLocationLoading(false);
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setLocationError('Location permission is required to find nearby shoppers.');
          setLocationLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        setLocationError('');
        setLocationLoading(false);
      }
    } catch (err) {
      setLocationLoading(false);
      setLocationError('Unable to get your location. Please check your GPS settings and try again.');
    }
  };

  const fetchNearbyUsers = async () => {
    if (!location) return;
    // Only show sessions that had a heartbeat in the last 3 minutes.
    // Heartbeat runs every 60 s, so 3 min = 3 missed heartbeats = truly dead session.
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('map_sessions')
      .select(`*, profile:profiles(first_name, last_name, avatar_emoji)`)
      // Use ref (not state) so the filter is always correct even on the first
      // fetch that fires before React has flushed the setCurrentUser() state update
      .neq('user_id', currentUserIdRef.current)
      .gte('last_seen', threeMinutesAgo);
    if (!data) return;
    const nearby = data.filter((u: any) =>
      distanceKm(location.lat, location.lng, u.lat, u.lng) <= radius
    );
    setMapUsers(nearby);
  };

  const goOnMap = async () => {
    if (!location || !selectedMarket || !currentUser) return;
    // Remove any lingering session for this user before creating a fresh one.
    // Prevents duplicate pins if "Go Live" is tapped more than once or if a
    // previous session wasn't cleaned up properly.
    await supabase.from('map_sessions').delete().eq('user_id', currentUser.id);
    const { data, error } = await supabase.from('map_sessions').insert({
      user_id:     currentUser.id,
      market_name: selectedMarket.name,
      lat:         location.lat,
      lng:         location.lng,
      is_pooling:  false,
      last_seen:   new Date().toISOString(),
    }).select().single();
    if (error) { console.error('goOnMap error:', error); return; }
    if (data) {
      setMySessionId(data.id);
      setIsOnMap(true);
      await fetchNearbyUsers();
      // Heartbeat: update last_seen every 60s so we stay visible
      heartbeatRef.current = setInterval(async () => {
        await supabase.from('map_sessions')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', data.id);
      }, 60000);
    }
    await supabase.from('profiles').update({
      is_on_map:      true,
      last_lat:       location.lat,
      last_lng:       location.lng,
      current_market: selectedMarket.name,
    }).eq('id', currentUser.id);
  };

  const goOffMap = async () => {
    await cleanupSession();
    setIsOnMap(false);
    setMySessionId(null);
  };

  const cleanupSession = async () => {
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    // Delete ALL sessions for this user (by user_id, not just the current session id)
    // so we never leave ghost rows regardless of how the component unmounts.
    const uid = currentUserIdRef.current || currentUser?.id;
    if (uid) {
      await supabase.from('map_sessions').delete().eq('user_id', uid);
      await supabase.from('profiles').update({ is_on_map: false }).eq('id', uid);
    }
  };

  const handleSelectMarket = async (market: Market) => {
    setSelectedMarket(market);
    setShowMarketModal(false);
    if (market.is_custom && currentUser) {
      const { data } = await supabase.from('markets')
        .insert({ name:market.name, logo_emoji:'🛒', is_custom:true, created_by:currentUser.id })
        .select().single();
      if (data) setMarkets(prev => [...prev, data]);
    }
  };

  const handleStartChat = async (isPool: boolean) => {
    if (!selectedUser || !currentUser || !myProfile) return;
    setChatLoading(true);
    try {
      const groupName = isPool
        ? `${selectedMarket?.name || selectedUser.market_name} Pool`
        : `${myProfile.first_name} & ${selectedUser.profile.first_name}`;

      const { data: group } = await supabase.from('groups').insert({
        name:        groupName,
        market_name: selectedMarket?.name || selectedUser.market_name,
        is_pool:     isPool,
        created_by:  currentUser.id,
        lat:         location?.lat,
        lng:         location?.lng,
      }).select().single();

      if (!group) throw new Error('Failed to create group');

      await supabase.from('group_members').insert([
        { group_id:group.id, user_id:currentUser.id },
        { group_id:group.id, user_id:selectedUser.user_id },
      ]);

      if (isPool && mySessionId) {
        await supabase.from('map_sessions')
          .update({ is_pooling:true })
          .eq('id', mySessionId);
      }

      const welcomeMsg = isPool
        ? `🔗 **${groupName}** created!\n\nHey ${myProfile.first_name} & ${selectedUser.profile.first_name}! Your pool is now **visible on the map** — others ordering from ${selectedMarket?.name || selectedUser.market_name} nearby can join.\n\nCoordinate your order here and split the delivery fee equally. 🛒`
        : `💬 **Private Chat** started!\n\nHey ${myProfile.first_name} & ${selectedUser.profile.first_name}! This is a private chat — just the two of you. Coordinate your order from **${selectedMarket?.name || selectedUser.market_name}** and split the delivery fee. 🤝`;

      await supabase.from('messages').insert({
        group_id:    group.id,
        sender_id:   null,
        sender_name: 'SPLITWI$E',
        is_bot:      true,
        content:     welcomeMsg,
      });

      setShowUserModal(false);
      onOpenChat(group.id);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Show location permission screen ──────────────────────
  if (locationError || (!location && !locationLoading)) {
    return (
      <LocationPermissionScreen
        error={locationError}
        onRetry={requestLocation}
        isLoading={locationLoading}
      />
    );
  }

  // ── Loading ───────────────────────────────────────────────
  if (!location) {
    return (
      <View style={st.loadingScreen}>
        <View style={st.loadingIconWrap}>
          <ActivityIndicator size="large" color={TEAL_DARK}/>
        </View>
        <Text style={st.loadingTitle}>Finding your location...</Text>
        <Text style={st.loadingSubtitle}>Please allow location access when prompted</Text>
      </View>
    );
  }

  return (
    <View style={st.root}>
      <View style={st.mapContainer}>
        <WebMap
          location={location}
          mapUsers={mapUsers}
          radius={radius}
          onUserTap={(user) => { setSelectedUser(user); setShowUserModal(true); }}
          myProfile={myProfile}
          selectedMarket={selectedMarket}
          filterMarket={filterMarket}
        />

        {/* Filter bar — floating at top of map */}
        <TouchableOpacity style={st.filterBar} onPress={() => setShowFilterModal(true)} activeOpacity={0.85}>
          <View style={st.filterBarLeft}>
            {Platform.OS === 'web' && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={filterMarket ? TEAL_DARK : MID} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
            <Text style={[st.filterBarTxt, filterMarket && st.filterBarTxtActive]}>
              {filterMarket ? filterMarket.name : 'Search market...'}
            </Text>
          </View>
          {filterMarket ? (
            <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); setFilterMarket(null); }} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
              <Text style={st.filterBarClear}>✕</Text>
            </TouchableOpacity>
          ) : (
            <View style={st.filterChevron}>
              {Platform.OS === 'web' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MID} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Filter active badge */}
        {filterMarket && (
          <View style={st.filterActiveBadge}>
            <View style={st.filterActiveDot}/>
            <Text style={st.filterActiveTxt}>
              Showing {mapUsers.filter(u => u.market_name?.toLowerCase() === filterMarket.name.toLowerCase()).length} {filterMarket.name} shopper{mapUsers.filter(u => u.market_name?.toLowerCase() === filterMarket.name.toLowerCase()).length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <View style={st.userCountBadge}>
          <View style={st.userCountDot}/>
          <Text style={st.userCountTxt}>{mapUsers.length} shopper{mapUsers.length !== 1 ? 's' : ''} nearby</Text>
        </View>

        <View style={st.radiusBadge}>
          <SignalIcon s={TEAL} sz={13}/>
          <Text style={st.radiusBadgeTxt}>{radius}km</Text>
        </View>

        <TouchableOpacity style={st.recenterBtn} onPress={requestLocation}>
          <RecenterIcon s={TEAL} sz={18}/>
        </TouchableOpacity>
      </View>

      <View style={st.bottomPanel}>
        <TouchableOpacity style={st.marketSelector} onPress={() => setShowMarketModal(true)}>
          <View style={st.marketSelectorLeft}>
            <View style={st.marketSelectorIconBox}>
              <CartIcon s={selectedMarket ? TEAL_DARK : MID} sz={18}/>
            </View>
            <View>
              <Text style={st.marketSelectorLabel}>SHOPPING FROM</Text>
              <Text style={[st.marketSelectorValue, !selectedMarket && { color:MID, fontWeight:'600', fontSize:13 }]}>
                {selectedMarket?.name || 'Tap to select a market'}
              </Text>
            </View>
          </View>
          <ChevronIcon s={MID} sz={18}/>
        </TouchableOpacity>

        <View style={st.radiusRow}>
          <Text style={st.radiusLabel}>Radius</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {radiusOptions.map(r => (
              <TouchableOpacity
                key={r}
                style={[st.radiusChip, radius === r && st.radiusChipActive]}
                onPress={() => setRadius(r)}
              >
                <Text style={[st.radiusChipTxt, radius === r && st.radiusChipTxtActive]}>{r}km</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedMarket && mapUsers.length === 0 && (
          <View style={st.noUsersRow}>
            <Text style={st.noUsersTxt}>
              No one ordering from {selectedMarket.name} within {radius}km — try expanding your radius.
            </Text>
          </View>
        )}

        {selectedMarket ? (
          <TouchableOpacity
            style={[st.goOnMapBtn, isOnMap && st.goOffMapBtn]}
            onPress={isOnMap ? goOffMap : goOnMap}
          >
            <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
              <View style={{ width:10, height:10, borderRadius:5, backgroundColor: isOnMap ? '#FEB2B2' : '#68D391' }}/>
              <Text style={st.goOnMapTxt}>{isOnMap ? 'Go Offline' : 'Go Live — Show me on the map'}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={st.selectPrompt}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8, justifyContent:'center' }}>
              <PinIcon s={MID} sz={16}/>
              <Text style={st.selectPromptTxt}>Select a market above to find nearby shoppers</Text>
            </View>
          </View>
        )}
      </View>

      <MarketModal
        visible={showMarketModal}
        markets={markets}
        onSelect={handleSelectMarket}
        onClose={() => setShowMarketModal(false)}
      />
      <MarketModal
        visible={showFilterModal}
        markets={markets}
        onSelect={(m) => { setFilterMarket(m); setShowFilterModal(false); }}
        onClose={() => setShowFilterModal(false)}
      />
      <UserTapModal
        user={selectedUser}
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        onStartChat={handleStartChat}
        loading={chatLoading}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const st = StyleSheet.create({
  root:         { flex:1, backgroundColor:DARK },
  mapContainer: { flex:1, position:'relative' },

  // Filter bar
  filterBar:          { position:'absolute',top:12,left:12,right:56,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'rgba(248,254,254,0.97)',borderRadius:24,paddingHorizontal:14,paddingVertical:9,borderWidth:1.5,borderColor:LIGHT_BORDER,shadowColor:DARK,shadowOffset:{width:0,height:2},shadowOpacity:0.12,shadowRadius:8,elevation:6,zIndex:20 },
  filterBarLeft:      { flexDirection:'row',alignItems:'center',gap:8,flex:1 },
  filterBarTxt:       { fontSize:13,color:MID,fontWeight:'500' },
  filterBarTxtActive: { color:TEAL_DARK,fontWeight:'700' },
  filterBarClear:     { fontSize:16,color:MID,fontWeight:'700',paddingLeft:8 },
  filterChevron:      { paddingLeft:4 },
  filterActiveBadge:  { position:'absolute',top:58,left:12,flexDirection:'row',alignItems:'center',gap:6,backgroundColor:TEAL_DARK,paddingHorizontal:12,paddingVertical:6,borderRadius:20,zIndex:19 },
  filterActiveDot:    { width:7,height:7,borderRadius:4,backgroundColor:'#68D391' },
  filterActiveTxt:    { color:WHITE,fontSize:11,fontWeight:'700' },

  userCountBadge: { position:'absolute',bottom:12,left:12,flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(6,32,32,0.85)',paddingHorizontal:12,paddingVertical:7,borderRadius:20,borderWidth:1,borderColor:'#FFFFFF18' },
  userCountDot:   { width:7,height:7,borderRadius:4,backgroundColor:'#68D391' },
  userCountTxt:   { color:WHITE,fontSize:11,fontWeight:'700' },
  radiusBadge:    { position:'absolute',top:12,right:12,flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'rgba(6,32,32,0.85)',paddingHorizontal:12,paddingVertical:7,borderRadius:20,borderWidth:1,borderColor:TEAL+'40' },
  radiusBadgeTxt: { color:TEAL,fontSize:11,fontWeight:'700' },
  recenterBtn:    { position:'absolute',bottom:12,right:12,width:38,height:38,borderRadius:19,backgroundColor:'rgba(6,32,32,0.85)',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#FFFFFF18' },

  bottomPanel: { backgroundColor:WHITE,borderTopLeftRadius:24,borderTopRightRadius:24,paddingHorizontal:20,paddingTop:20,paddingBottom:Platform.OS==='ios'?36:20,shadowColor:'#000',shadowOffset:{width:0,height:-4},shadowOpacity:0.12,shadowRadius:16,elevation:10 },

  marketSelector:        { flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#F0FCFC',borderRadius:14,padding:14,marginBottom:14,borderWidth:1,borderColor:LIGHT_BORDER },
  marketSelectorLeft:    { flexDirection:'row',alignItems:'center',gap:12 },
  marketSelectorIconBox: { width:40,height:40,borderRadius:10,backgroundColor:TEAL+'12',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:TEAL+'20' },
  marketSelectorLabel:   { fontSize:9,color:MID,fontWeight:'700',letterSpacing:1 },
  marketSelectorValue:   { fontSize:15,fontWeight:'800',color:DARK,marginTop:2 },

  radiusRow:          { flexDirection:'row',alignItems:'center',gap:12,marginBottom:12 },
  radiusLabel:        { fontSize:12,fontWeight:'700',color:MID },
  radiusChip:         { paddingHorizontal:14,paddingVertical:7,borderRadius:20,borderWidth:1,borderColor:LIGHT_BORDER,marginRight:8,backgroundColor:WHITE },
  radiusChipActive:   { backgroundColor:TEAL_DARK,borderColor:TEAL_DARK },
  radiusChipTxt:      { fontSize:12,fontWeight:'700',color:MID },
  radiusChipTxtActive:{ color:WHITE },

  noUsersRow: { backgroundColor:'#FFF8E6',borderRadius:10,padding:12,marginBottom:12,borderWidth:1,borderColor:'#F6AD55' },
  noUsersTxt: { fontSize:12,color:'#744210',fontWeight:'500',lineHeight:18 },

  goOnMapBtn:  { backgroundColor:TEAL_DARK,borderRadius:14,paddingVertical:15,alignItems:'center',shadowColor:TEAL_DARK,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:10,elevation:5 },
  goOffMapBtn: { backgroundColor:'#C53030' },
  goOnMapTxt:  { color:WHITE,fontSize:14,fontWeight:'800' },

  selectPrompt:    { backgroundColor:'#F0FCFC',borderRadius:12,padding:14,borderWidth:1,borderColor:LIGHT_BORDER },
  selectPromptTxt: { fontSize:13,color:MID,textAlign:'center',lineHeight:20 },

  // Modal
  modalOverlay: { flex:1,justifyContent:'flex-end',backgroundColor:'rgba(6,32,32,0.6)' },
  marketSheet:  { backgroundColor:WHITE,borderTopLeftRadius:28,borderTopRightRadius:28,padding:24,paddingBottom:Platform.OS==='ios'?40:28,maxHeight:SH*0.78 },
  sheetHandle:  { width:40,height:4,borderRadius:2,backgroundColor:LIGHT_BORDER,alignSelf:'center',marginBottom:20 },
  sheetTitle:   { fontSize:20,fontWeight:'900',color:DARK,marginBottom:6 },
  sheetSubtitle:{ fontSize:13,color:MID,marginBottom:16,lineHeight:20 },
  searchBox:    { flexDirection:'row',alignItems:'center',backgroundColor:'#F0FCFC',borderRadius:12,paddingHorizontal:14,paddingVertical:10,marginBottom:12,borderWidth:1,borderColor:LIGHT_BORDER,gap:8 },
  searchInput:  { flex:1,fontSize:14,color:DARK },
  marketItem:     { flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:14,borderBottomWidth:1,borderBottomColor:LIGHT_BORDER },
  marketItemLeft: { flexDirection:'row',alignItems:'center',gap:14 },
  marketEmoji:    { width:44,height:44,borderRadius:12,backgroundColor:'#F0FCFC',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:LIGHT_BORDER },
  marketName:     { fontSize:15,fontWeight:'700',color:DARK },
  marketCustomTag:{ fontSize:10,color:TEAL_DEEP,fontWeight:'600',marginTop:2 },
  addMarketBtn:    { marginTop:14,paddingVertical:14,borderRadius:12,borderWidth:1.5,borderColor:TEAL+'55',alignItems:'center' },
  addMarketBtnTxt: { color:TEAL_DEEP,fontSize:14,fontWeight:'700' },
  customInputRow:  { flexDirection:'row',gap:10,marginTop:12 },
  customInput:     { flex:1,backgroundColor:'#F0FCFC',borderRadius:10,paddingHorizontal:14,paddingVertical:12,fontSize:14,color:DARK,borderWidth:1,borderColor:LIGHT_BORDER },
  customSubmit:    { backgroundColor:TEAL_DARK,borderRadius:10,paddingHorizontal:18,justifyContent:'center' },
  customSubmitTxt: { color:WHITE,fontWeight:'800',fontSize:14 },

  // User tap modal
  userCard:         { backgroundColor:WHITE,marginHorizontal:16,borderRadius:24,padding:24,marginBottom:32,shadowColor:'#000',shadowOffset:{width:0,height:8},shadowOpacity:0.15,shadowRadius:24,elevation:12 },
  userCardHeader:   { flexDirection:'row',gap:14,marginBottom:16 },
  userCardAvatar:   { width:64,height:64,borderRadius:20,backgroundColor:'#F0FCFC',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:LIGHT_BORDER },
  userCardName:     { fontSize:18,fontWeight:'800',color:DARK,marginBottom:5 },
  userCardMarketRow:{ flexDirection:'row',alignItems:'center',marginBottom:4 },
  userCardMarket:   { fontSize:13,color:MID,fontWeight:'500' },
  poolingBadge:     { marginTop:6,backgroundColor:'#F0FFF4',paddingHorizontal:10,paddingVertical:4,borderRadius:8,borderWidth:1,borderColor:'#68D391',alignSelf:'flex-start' },
  poolingBadgeTxt:  { color:'#276749',fontSize:11,fontWeight:'700' },
  userCardDivider:  { height:1,backgroundColor:LIGHT_BORDER,marginBottom:16 },
  choiceTitle:      { fontSize:16,fontWeight:'800',color:DARK,marginBottom:4 },
  choiceSubtitle:   { fontSize:12,color:MID,marginBottom:16,lineHeight:18 },
  choiceRow:        { flexDirection:'row',gap:12,marginBottom:16 },
  choiceCard:       { flex:1,borderRadius:16,padding:16,alignItems:'center',gap:8,borderWidth:1.5 },
  choiceCardPool:   { backgroundColor:TEAL_DARK,borderColor:TEAL_DARK },
  choiceCardPrivate:{ backgroundColor:WHITE,borderColor:LIGHT_BORDER },
  choiceIcon:       { width:44,height:44,borderRadius:12,backgroundColor:WHITE+'22',alignItems:'center',justifyContent:'center',marginBottom:4 },
  choiceCardTitle:  { fontSize:13,fontWeight:'800',color:WHITE,textAlign:'center' },
  choiceCardDesc:   { fontSize:10,color:WHITE+'CC',textAlign:'center',lineHeight:14 },
  cancelBtn:        { paddingVertical:12,alignItems:'center' },
  cancelBtnTxt:     { color:MID,fontSize:14,fontWeight:'600' },

  // Location permission screen
  permScreen:      { flex:1,backgroundColor:'#F8FEFE',alignItems:'center',justifyContent:'center',padding:28 },
  permIconOuter:   { width:100,height:100,borderRadius:50,backgroundColor:TEAL+'15',alignItems:'center',justifyContent:'center',marginBottom:20 },
  permIconInner:   { width:72,height:72,borderRadius:36,backgroundColor:TEAL+'25',alignItems:'center',justifyContent:'center' },
  permTitle:       { fontSize:26,fontWeight:'900',color:DARK,marginBottom:10,textAlign:'center' },
  permSubtitle:    { fontSize:14,color:MID,textAlign:'center',lineHeight:22,marginBottom:16,maxWidth:320 },
  permErrorBox:    { backgroundColor:'#FFF5F5',borderRadius:12,padding:14,marginBottom:16,borderWidth:1,borderColor:'#FC8181',width:'100%' },
  permErrorTxt:    { color:'#C53030',fontSize:13,fontWeight:'600',lineHeight:20 },
  permStepsCard:   { backgroundColor:WHITE,borderRadius:16,padding:18,marginBottom:24,borderWidth:1,borderColor:LIGHT_BORDER,width:'100%',shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  permStepsHeader: { flexDirection:'row',alignItems:'center',gap:8,marginBottom:14 },
  permStepsTitle:  { fontSize:13,fontWeight:'800',color:DARK },
  permStepRow:     { flexDirection:'row',alignItems:'flex-start',gap:12,marginBottom:10 },
  permStepNum:     { width:24,height:24,borderRadius:12,backgroundColor:TEAL_DARK,alignItems:'center',justifyContent:'center',marginTop:1 },
  permStepNumTxt:  { fontSize:11,fontWeight:'900',color:WHITE },
  permStepTxt:     { flex:1,fontSize:13,color:DARK,lineHeight:20 },
  permBtn:         { backgroundColor:TEAL_DARK,borderRadius:16,paddingVertical:16,paddingHorizontal:32,alignItems:'center',width:'100%',shadowColor:TEAL_DARK,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:10,elevation:5,marginBottom:16 },
  permBtnTxt:      { color:WHITE,fontSize:15,fontWeight:'800' },
  permNote:        { fontSize:11,color:MID,textAlign:'center',lineHeight:16,maxWidth:300 },

  // Loading
  loadingScreen:   { flex:1,backgroundColor:'#F8FEFE',alignItems:'center',justifyContent:'center',padding:32 },
  loadingIconWrap: { marginBottom:16 },
  loadingTitle:    { fontSize:18,fontWeight:'800',color:DARK,marginBottom:8 },
  loadingSubtitle: { fontSize:13,color:MID,textAlign:'center' },
});