import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { supabase, Profile } from '../lib/supabase';

const TEAL = '#17B8B8';
const TEAL_DARK = '#0D8F8F';
const TEAL_DEEP = '#0A6E6E';
const WHITE = '#FFFFFF';
const DARK = '#062020';
const MID = '#3A7070';
const BG = '#F8FEFE';
const LIGHT_BORDER = '#C8E8E8';

function MapBg() {
  return (
    <View style={s.mapBg}>
      {Array.from({ length: 18 }).map((_, i) => (
        <View key={`h${i}`} style={[s.gH, { top: `${(i / 18) * 100}%` as any }]} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <View key={`v${i}`} style={[s.gV, { left: `${(i / 16) * 100}%` as any }]} />
      ))}
      {[[10,8],[22,55],[38,20],[50,70],[65,35],[78,80],[18,88],[45,48],[72,15],[88,55]].map(([t,l],i) => (
        <View key={i} style={[s.pin, { top: `${t}%` as any, left: `${l}%` as any }]}>
          <View style={s.pinR} /><View style={s.pinD} />
        </View>
      ))}
      <View style={s.frost} />
    </View>
  );
}

interface Props { onSignOut: () => void; }

export default function Dashboard({ onSignOut }: Props) {
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [email,    setEmail]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
  try {
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Not authenticated');
    setEmail(user.email || '');

    // Use maybeSingle() instead of single() to avoid JSON error
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    // If no profile exists yet, create one from auth metadata
    if (!data) {
      const meta = user.user_metadata;
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id:         user.id,
          first_name: meta?.first_name || '',
          last_name:  meta?.last_name  || '',
          phone:      meta?.phone      || '',
          dob:        '',
          nin:        '',
          phone_verified: false,
          nin_verified:   false,
          face_verified:  false,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setProfile(newProfile);
    } else {
      setProfile(data);
    }

  } catch (err: any) {
    setError(err.message || 'Failed to load profile');
  } finally {
    setLoading(false);
  }
};

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const getInitials = () => {
    if (!profile) return '??';
    return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={s.loadingScreen}>
        <MapBg />
        <ActivityIndicator size="large" color={TEAL_DARK} />
        <Text style={s.loadingTxt}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.loadingScreen}>
        <MapBg />
        <Text style={s.errorTxt}>⚠️ {error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={fetchProfile}>
          <Text style={s.retryTxt}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 12 }}>
          <Text style={{ color: MID, fontSize: 13 }}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <MapBg />
      <Text style={s.wm}>SPLITWI$E</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={s.topBar}>
          <Text style={s.logo}>
            SPLITWI<Text style={{ color: TEAL_DARK }}>$</Text>E
          </Text>
          <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
            <Text style={s.signOutTxt}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Profile hero */}
        <View style={s.heroCard}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{getInitials()}</Text>
          </View>
          <Text style={s.heroName}>
            {profile?.first_name} {profile?.last_name}
          </Text>
          <Text style={s.heroEmail}>{email}</Text>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeTxt}>✅  Account Active</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>₦0</Text>
            <Text style={s.statLbl}>Total Saved</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>0</Text>
            <Text style={s.statLbl}>Groups Joined</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>0</Text>
            <Text style={s.statLbl}>Orders Split</Text>
          </View>
        </View>

        {/* Profile details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>👤  Personal Information</Text>

          <View style={s.detailRow}>
            <Text style={s.detailLabel}>First Name</Text>
            <Text style={s.detailValue}>{profile?.first_name || '—'}</Text>
          </View>
          <View style={s.divider} />

          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Last Name</Text>
            <Text style={s.detailValue}>{profile?.last_name || '—'}</Text>
          </View>
          <View style={s.divider} />

          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Email</Text>
            <Text style={s.detailValue}>{email || '—'}</Text>
          </View>
          <View style={s.divider} />

          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Phone</Text>
            <Text style={s.detailValue}>{profile?.phone || '—'}</Text>
          </View>
          <View style={s.divider} />

          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Date of Birth</Text>
            <Text style={s.detailValue}>{profile?.dob || '—'}</Text>
          </View>
          <View style={s.divider} />

          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Member Since</Text>
            <Text style={s.detailValue}>{formatDate(profile?.created_at || '')}</Text>
          </View>
        </View>

        {/* Verification status */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔐  Verification Status</Text>

          {[
            { label: 'Phone Verified',  value: profile?.phone_verified },
            { label: 'NIN Verified',    value: profile?.nin_verified   },
            { label: 'Face Verified',   value: profile?.face_verified  },
          ].map((item, i) => (
            <View key={i}>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>{item.label}</Text>
                <View style={[
                  s.verifyPill,
                  { backgroundColor: item.value ? '#F0FFF4' : '#FFF8E6',
                    borderColor:      item.value ? '#68D391' : '#F6AD55' }
                ]}>
                  <Text style={[
                    s.verifyPillTxt,
                    { color: item.value ? '#276749' : '#B7791F' }
                  ]}>
                    {item.value ? '✅ Verified' : '⏳ Pending'}
                  </Text>
                </View>
              </View>
              {i < 2 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        {/* Coming soon */}
        <View style={s.comingSoon}>
          <Text style={s.comingSoonTitle}>🚀 Coming Soon</Text>
          <Text style={s.comingSoonTxt}>
            Map · Group Orders · Escrow Payments · In-App Chat · AI Assistant
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  mapBg: { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F0FCFC',overflow:'hidden' },
  gH:   { position:'absolute',left:0,right:0,height:1,backgroundColor:'#17B8B80E' },
  gV:   { position:'absolute',top:0,bottom:0,width:1,backgroundColor:'#17B8B809' },
  pin:  { position:'absolute',width:20,height:20,alignItems:'center',justifyContent:'center' },
  pinR: { position:'absolute',width:16,height:16,borderRadius:8,borderWidth:1,borderColor:TEAL+'22' },
  pinD: { width:6,height:6,borderRadius:3,backgroundColor:TEAL+'40',borderWidth:1,borderColor:WHITE },
  frost:{ position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F8FEFEFD' },

  wm: {
    position:'absolute', alignSelf:'center', top:'10%',
    fontSize: Platform.OS==='web' ? 120 : 68,
    fontWeight:'900', color:TEAL+'07',
    letterSpacing:-4, textAlign:'center', width:'100%', zIndex:0,
  },

  loadingScreen: { flex:1, backgroundColor:BG, alignItems:'center', justifyContent:'center', gap:16 },
  loadingTxt:    { fontSize:14, color:MID, fontWeight:'500' },
  errorTxt:      { fontSize:14, color:'#E53E3E', textAlign:'center', paddingHorizontal:32 },
  retryBtn:      { backgroundColor:TEAL_DARK, paddingHorizontal:24, paddingVertical:12, borderRadius:10 },
  retryTxt:      { color:WHITE, fontWeight:'700', fontSize:14 },

  scroll: { paddingTop: Platform.OS==='ios'?60:48, paddingHorizontal:16, paddingBottom:40 },

  topBar: {
    flexDirection:'row', alignItems:'center',
    justifyContent:'space-between', marginBottom:20,
  },
  logo:       { fontSize:18, fontWeight:'900', color:DARK, letterSpacing:1.2 },
  signOutBtn: { paddingHorizontal:16, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:TEAL+'50', backgroundColor:WHITE },
  signOutTxt: { color:TEAL_DEEP, fontSize:12, fontWeight:'700' },

  heroCard: {
    backgroundColor:WHITE, borderRadius:20, padding:28,
    alignItems:'center', marginBottom:16,
    borderWidth:1, borderColor:LIGHT_BORDER,
    shadowColor:TEAL_DARK, shadowOffset:{width:0,height:4},
    shadowOpacity:0.08, shadowRadius:16, elevation:4,
  },
  avatar:    { width:72, height:72, borderRadius:36, backgroundColor:TEAL_DARK, alignItems:'center', justifyContent:'center', marginBottom:14 },
  avatarTxt: { color:WHITE, fontSize:26, fontWeight:'900' },
  heroName:  { fontSize:22, fontWeight:'800', color:DARK, marginBottom:4 },
  heroEmail: { fontSize:13, color:MID, marginBottom:14 },
  heroBadge: { backgroundColor:'#F0FFF4', borderWidth:1, borderColor:'#68D391', paddingHorizontal:16, paddingVertical:6, borderRadius:20 },
  heroBadgeTxt:{ color:'#276749', fontSize:12, fontWeight:'700' },

  statsRow: { flexDirection:'row', gap:10, marginBottom:16 },
  statCard: {
    flex:1, backgroundColor:WHITE, borderRadius:14, padding:16,
    alignItems:'center', borderWidth:1, borderColor:LIGHT_BORDER,
    shadowColor:TEAL, shadowOffset:{width:0,height:2},
    shadowOpacity:0.06, shadowRadius:8, elevation:2,
  },
  statNum: { fontSize:20, fontWeight:'900', color:TEAL_DEEP, marginBottom:4 },
  statLbl: { fontSize:10, color:MID, textAlign:'center', fontWeight:'500' },

  section: {
    backgroundColor:WHITE, borderRadius:16, padding:20,
    marginBottom:16, borderWidth:1, borderColor:LIGHT_BORDER,
    shadowColor:TEAL, shadowOffset:{width:0,height:2},
    shadowOpacity:0.06, shadowRadius:8, elevation:2,
  },
  sectionTitle: { fontSize:14, fontWeight:'800', color:DARK, marginBottom:16 },

  detailRow:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12 },
  detailLabel: { fontSize:13, color:MID, fontWeight:'500' },
  detailValue: { fontSize:13, color:DARK, fontWeight:'600', maxWidth:'55%', textAlign:'right' },
  divider:     { height:1, backgroundColor:LIGHT_BORDER },

  verifyPill:   { paddingHorizontal:10, paddingVertical:4, borderRadius:12, borderWidth:1 },
  verifyPillTxt:{ fontSize:11, fontWeight:'700' },

  comingSoon: {
    backgroundColor:TEAL_DARK+'15', borderRadius:16, padding:20,
    alignItems:'center', borderWidth:1, borderColor:TEAL+'30',
  },
  comingSoonTitle:{ fontSize:15, fontWeight:'800', color:TEAL_DEEP, marginBottom:8 },
  comingSoonTxt:  { fontSize:12, color:MID, textAlign:'center', lineHeight:20 },
});