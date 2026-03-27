import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, ActivityIndicator, Platform, TextInput, Modal,
} from 'react-native';
import { supabase } from '../lib/supabase';

const TEAL       = '#17B8B8';
const TEAL_DARK  = '#0D8F8F';
const TEAL_DEEP  = '#0A6E6E';
const WHITE      = '#FFFFFF';
const DARK       = '#062020';
const MID        = '#3A7070';
const LIGHT_BORDER = '#C8E8E8';
const BG         = '#F8FEFE';

// ── SVG Icons ────────────────────────────────────────────────
function Svg({ size=24, stroke=DARK, fill='none', children }: any) {
  if (Platform.OS !== 'web') return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={stroke} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display:'block' }}>
      {children}
    </svg>
  ) as any;
}

const Icons = {
  users:   (s:string,sz=20) => <Svg size={sz} stroke={s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></Svg>,
  cart:    (s:string,sz=20) => <Svg size={sz} stroke={s}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></Svg>,
  chat:    (s:string,sz=20) => <Svg size={sz} stroke={s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></Svg>,
  plus:    (s:string,sz=20) => <Svg size={sz} stroke={s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Svg>,
  map:     (s:string,sz=20) => <Svg size={sz} stroke={s}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></Svg>,
  lock:    (s:string,sz=20) => <Svg size={sz} stroke={s}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></Svg>,
  globe:   (s:string,sz=20) => <Svg size={sz} stroke={s}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></Svg>,
  leave:   (s:string,sz=20) => <Svg size={sz} stroke={s}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>,
  close:   (s:string,sz=18) => <Svg size={sz} stroke={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>,
  check:   (s:string,sz=16) => <Svg size={sz} stroke={s}><polyline points="20 6 9 17 4 12"/></Svg>,
  save:    (s:string,sz=20) => <Svg size={sz} stroke={s}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></Svg>,
};

interface Group {
  id: string;
  name: string;
  market_name: string;
  is_pool: boolean;
  created_by: string;
  created_at: string;
  lat?: number;
  lng?: number;
  member_count?: number;
  members?: any[];
}

// ── Map Background ───────────────────────────────────────────
function MapBg() {
  return (
    <View style={s.mapBg}>
      {Array.from({length:18}).map((_,i)=>(
        <View key={`h${i}`} style={[s.gH,{top:`${(i/18)*100}%` as any}]}/>
      ))}
      {Array.from({length:16}).map((_,i)=>(
        <View key={`v${i}`} style={[s.gV,{left:`${(i/16)*100}%` as any}]}/>
      ))}
      <View style={s.frost}/>
    </View>
  );
}

// ── Create Group Modal ───────────────────────────────────────
function CreateGroupModal({ visible, onClose, onCreated, currentUser, profile }: {
  visible: boolean; onClose: () => void;
  onCreated: () => void; currentUser: any; profile: any;
}) {
  const [name,      setName]      = useState('');
  const [market,    setMarket]    = useState('');
  const [isPool,    setIsPool]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const markets = ['Jumia','Konga','Amazon','Jiji','Temu','Aliexpress','Shoprite','Slot'];

  const handleCreate = async () => {
    if (!name.trim())   { setError('Please enter a group name'); return; }
    if (!market.trim()) { setError('Please select or enter a market'); return; }
    setLoading(true); setError('');
    try {
      const { data: group, error: gErr } = await supabase.from('groups').insert({
        name:        name.trim(),
        market_name: market,
        is_pool:     isPool,
        created_by:  currentUser.id,
      }).select().single();
      if (gErr) throw gErr;
      await supabase.from('group_members').insert({
        group_id: group.id,
        user_id:  currentUser.id,
      });
      await supabase.from('messages').insert({
        group_id:    group.id,
        sender_id:   null,
        sender_name: 'SPLITWI$E',
        is_bot:      true,
        content:     `🎉 **${group.name}** created by ${profile?.display_name || profile?.first_name}!\n\nThis group is ordering from **${market}**.\n${isPool ? '🔗 This is an open pool — others on the map can join!' : '🔒 This is a private group.'}\n\nStart coordinating your order here! 🛒`,
      });
      setName(''); setMarket(''); setIsPool(false);
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <TouchableOpacity style={{flex:1}} onPress={onClose} activeOpacity={1}/>
        <View style={s.modalSheet}>
          <View style={s.sheetHandle}/>
          <View style={s.sheetTitleRow}>
            <Text style={s.sheetTitle}>Create New Group</Text>
            <TouchableOpacity onPress={onClose} style={s.sheetClose}>
              {Icons.close(MID, 18)}
            </TouchableOpacity>
          </View>

          <Text style={s.fieldLabel}>Group Name</Text>
          <TextInput
            style={s.fieldInput}
            placeholder="e.g. Jumia Friday Squad"
            placeholderTextColor="#9BB8B8"
            value={name}
            onChangeText={setName}
            maxLength={40}
          />

          <Text style={s.fieldLabel}>Market</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            {markets.map(m => (
              <TouchableOpacity
                key={m}
                style={[s.marketChip, market === m && s.marketChipActive]}
                onPress={() => setMarket(m)}
              >
                <Text style={[s.marketChipTxt, market === m && s.marketChipTxtActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={[s.fieldInput, { marginBottom: 16 }]}
            placeholder="Or type a custom market..."
            placeholderTextColor="#9BB8B8"
            value={market}
            onChangeText={setMarket}
          />

          <Text style={s.fieldLabel}>Group Type</Text>
          <View style={s.typeRow}>
            <TouchableOpacity
              style={[s.typeCard, !isPool && s.typeCardActive]}
              onPress={() => setIsPool(false)}
            >
              <View style={s.typeIcon}>{Icons.lock(!isPool ? WHITE : MID, 18)}</View>
              <Text style={[s.typeTitle, !isPool && {color:WHITE}]}>Private</Text>
              <Text style={[s.typeDesc, !isPool && {color:WHITE+'BB'}]}>Invite only, not on map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.typeCard, isPool && s.typeCardActivePool]}
              onPress={() => setIsPool(true)}
            >
              <View style={[s.typeIcon, isPool && {backgroundColor:WHITE+'22'}]}>
                {Icons.globe(isPool ? WHITE : MID, 18)}
              </View>
              <Text style={[s.typeTitle, isPool && {color:WHITE}]}>Open Pool</Text>
              <Text style={[s.typeDesc, isPool && {color:WHITE+'BB'}]}>Visible on map, anyone can join</Text>
            </TouchableOpacity>
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorTxt}>⚠️ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.createBtn, loading && {opacity:0.7}]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={WHITE}/>
              : <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                  {Icons.save(WHITE, 18)}
                  <Text style={s.createBtnTxt}>Create Group</Text>
                </View>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Group Card ───────────────────────────────────────────────
function GroupCard({ group, onOpenChat, onLeave, currentUserId }: {
  group: Group; onOpenChat: (id:string) => void;
  onLeave: (id:string) => void; currentUserId: string;
}) {
  const isOwner     = group.created_by === currentUserId;
  const memberCount = group.member_count || 0;
  const timeAgo     = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };

  return (
    <View style={s.groupCard}>
      {/* Header */}
      <View style={s.groupCardHeader}>
        <View style={[s.groupIconBox, group.is_pool && {backgroundColor:'#F0FFF4'}]}>
          {group.is_pool ? Icons.globe('#276749', 20) : Icons.lock(TEAL_DARK, 20)}
        </View>
        <View style={{flex:1}}>
          <Text style={s.groupName} numberOfLines={1}>{group.name}</Text>
          <View style={s.groupMeta}>
            <View style={[s.groupTypePill,
              group.is_pool
                ? {backgroundColor:'#F0FFF4', borderColor:'#68D391'}
                : {backgroundColor:TEAL+'10', borderColor:TEAL+'30'}
            ]}>
              <Text style={[s.groupTypeTxt,
                group.is_pool ? {color:'#276749'} : {color:TEAL_DEEP}
              ]}>
                {group.is_pool ? '🔗 Open Pool' : '🔒 Private'}
              </Text>
            </View>
          </View>
        </View>
        {isOwner && (
          <View style={s.ownerBadge}>
            <Text style={s.ownerBadgeTxt}>Owner</Text>
          </View>
        )}
      </View>

      {/* Info row */}
      <View style={s.groupInfoRow}>
        <View style={s.groupInfoItem}>
          {Icons.cart(MID, 14)}
          <Text style={s.groupInfoTxt}>{group.market_name}</Text>
        </View>
        <View style={s.groupInfoItem}>
          {Icons.users(MID, 14)}
          <Text style={s.groupInfoTxt}>{memberCount} member{memberCount !== 1 ? 's' : ''}</Text>
        </View>
        <Text style={s.groupTime}>{timeAgo(group.created_at)}</Text>
      </View>

      {/* Members avatars */}
      {group.members && group.members.length > 0 && (
        <View style={s.membersRow}>
          {group.members.slice(0,6).map((m:any, i:number) => (
            <View key={i} style={[s.memberAvatar, {marginLeft: i > 0 ? -8 : 0, zIndex: 6-i}]}>
              <Text style={{fontSize:14}}>{m.profile?.avatar_emoji || '🧑'}</Text>
            </View>
          ))}
          {group.members.length > 6 && (
            <View style={[s.memberAvatar, s.memberAvatarMore, {marginLeft:-8}]}>
              <Text style={s.memberAvatarMoreTxt}>+{group.members.length - 6}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={s.groupActions}>
        <TouchableOpacity style={s.chatBtn} onPress={() => onOpenChat(group.id)}>
          <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
            {Icons.chat(WHITE, 16)}
            <Text style={s.chatBtnTxt}>Open Chat</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={s.leaveBtn} onPress={() => onLeave(group.id)}>
          <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
            {Icons.leave(MID, 14)}
            <Text style={s.leaveBtnTxt}>{isOwner ? 'Delete' : 'Leave'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN GROUP ORDERS SCREEN
// ══════════════════════════════════════════════════════════════
interface Props {
  onOpenChat: (groupId: string) => void;
}

export default function GroupOrdersScreen({ onOpenChat }: Props) {
  const [groups,       setGroups]       = useState<Group[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [showCreate,   setShowCreate]   = useState(false);
  const [currentUser,  setCurrentUser]  = useState<any>(null);
  const [profile,      setProfile]      = useState<any>(null);
  const [activeTab,    setActiveTab]    = useState<'my'|'pools'>('my');

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data:{ user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (p) setProfile(p);
      await fetchGroups(user.id);
    }
    setLoading(false);
  };

  const fetchGroups = async (userId?: string) => {
    const uid = userId || currentUser?.id;
    if (!uid) return;
    try {
      // Fetch groups user is a member of
      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', uid);

      if (!memberRows || memberRows.length === 0) { setGroups([]); return; }

      const groupIds = memberRows.map((r:any) => r.group_id);

      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false });

      if (!groupData) { setGroups([]); return; }

      // Fetch members for each group
      const enriched = await Promise.all(groupData.map(async (g:any) => {
        const { data: members } = await supabase
          .from('group_members')
          .select('*, profile:profiles(first_name, last_name, avatar_emoji)')
          .eq('group_id', g.id);
        return { ...g, members: members || [], member_count: members?.length || 0 };
      }));

      setGroups(enriched);
    } catch (err) {
      console.error('fetchGroups error:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const handleLeave = async (groupId: string) => {
    if (!currentUser) return;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    if (group.created_by === currentUser.id) {
      // Owner — delete the group
      await supabase.from('messages').delete().eq('group_id', groupId);
      await supabase.from('group_members').delete().eq('group_id', groupId);
      await supabase.from('groups').delete().eq('id', groupId);
    } else {
      // Member — just leave
      await supabase.from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
    }
    await fetchGroups();
  };

  const myGroups    = groups.filter(g => g.created_by === currentUser?.id || true);
  const openPools   = groups.filter(g => g.is_pool);
  const displayed   = activeTab === 'my' ? groups : openPools;

  if (loading) {
    return (
      <View style={s.loadingScreen}>
        <ActivityIndicator size="large" color={TEAL_DARK}/>
        <Text style={s.loadingTxt}>Loading your groups...</Text>
      </View>
    );
  }

  return (
    <View style={{flex:1, backgroundColor:BG}}>
      <MapBg/>
      <Text style={s.wm}>SPLITWI$E</Text>

      <ScrollView
        style={{flex:1}}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={TEAL_DARK}/>
        }
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroLeft}>
            <Text style={s.heroTitle}>Group Orders</Text>
            <Text style={s.heroSub}>Coordinate with nearby shoppers & split delivery</Text>
          </View>
          <TouchableOpacity style={s.heroCreateBtn} onPress={() => setShowCreate(true)}>
            {Icons.plus(WHITE, 18)}
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{groups.length}</Text>
            <Text style={s.statLbl}>My Groups</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, {color:'#276749'}]}>{openPools.length}</Text>
            <Text style={s.statLbl}>Open Pools</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, {color:'#B45309'}]}>
              {groups.reduce((a,g) => a + (g.member_count||0), 0)}
            </Text>
            <Text style={s.statLbl}>Total Members</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          <TouchableOpacity
            style={[s.tab, activeTab==='my' && s.tabActive]}
            onPress={() => setActiveTab('my')}
          >
            <Text style={[s.tabTxt, activeTab==='my' && s.tabTxtActive]}>My Groups ({groups.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab==='pools' && s.tabActive]}
            onPress={() => setActiveTab('pools')}
          >
            <Text style={[s.tabTxt, activeTab==='pools' && s.tabTxtActive]}>Open Pools ({openPools.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Groups list */}
        {displayed.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              {Icons.users(TEAL_DARK, 36)}
            </View>
            <Text style={s.emptyTitle}>
              {activeTab === 'my' ? 'No groups yet' : 'No open pools nearby'}
            </Text>
            <Text style={s.emptySub}>
              {activeTab === 'my'
                ? 'Create a group or connect with a shopper on the map to get started.'
                : 'Go live on the map and connect with nearby shoppers to form a pool.'
              }
            </Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowCreate(true)}>
              <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                {Icons.plus(WHITE, 16)}
                <Text style={s.emptyBtnTxt}>Create a Group</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          displayed.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onOpenChat={onOpenChat}
              onLeave={handleLeave}
              currentUserId={currentUser?.id || ''}
            />
          ))
        )}

        <View style={{height: 100}}/>
      </ScrollView>

      <CreateGroupModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchGroups}
        currentUser={currentUser}
        profile={profile}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  mapBg:  { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F0FCFC',overflow:'hidden' },
  gH:     { position:'absolute',left:0,right:0,height:1,backgroundColor:'#17B8B80E' },
  gV:     { position:'absolute',top:0,bottom:0,width:1,backgroundColor:'#17B8B809' },
  frost:  { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F8FEFEFD' },
  wm:     { position:'absolute',alignSelf:'center',top:'18%',fontSize:Platform.OS==='web'?120:68,fontWeight:'900',color:TEAL+'07',letterSpacing:-4,textAlign:'center',width:'100%',zIndex:0 },

  scroll: { paddingHorizontal:16, paddingTop:20, paddingBottom:40 },

  loadingScreen: { flex:1,alignItems:'center',justifyContent:'center',gap:12,backgroundColor:BG },
  loadingTxt:    { fontSize:14,color:MID,fontWeight:'500' },

  hero:          { flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:16 },
  heroLeft:      { flex:1 },
  heroTitle:     { fontSize:26,fontWeight:'900',color:DARK,marginBottom:4 },
  heroSub:       { fontSize:13,color:MID,lineHeight:18 },
  heroCreateBtn: { width:48,height:48,borderRadius:14,backgroundColor:TEAL_DARK,alignItems:'center',justifyContent:'center',shadowColor:TEAL_DARK,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:8,elevation:5 },

  statsRow: { flexDirection:'row',gap:10,marginBottom:20 },
  statCard: { flex:1,backgroundColor:WHITE,borderRadius:14,padding:14,alignItems:'center',borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2 },
  statNum:  { fontSize:22,fontWeight:'900',color:TEAL_DEEP,marginBottom:3 },
  statLbl:  { fontSize:10,color:MID,fontWeight:'500',textAlign:'center' },

  tabs:       { flexDirection:'row',backgroundColor:WHITE,borderRadius:12,padding:4,marginBottom:16,borderWidth:1,borderColor:LIGHT_BORDER },
  tab:        { flex:1,paddingVertical:10,borderRadius:9,alignItems:'center' },
  tabActive:  { backgroundColor:TEAL_DARK },
  tabTxt:     { fontSize:13,fontWeight:'700',color:MID },
  tabTxtActive:{ color:WHITE },

  groupCard:       { backgroundColor:WHITE,borderRadius:18,padding:18,marginBottom:12,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  groupCardHeader: { flexDirection:'row',alignItems:'flex-start',gap:12,marginBottom:12 },
  groupIconBox:    { width:44,height:44,borderRadius:12,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:TEAL+'20' },
  groupName:       { fontSize:16,fontWeight:'800',color:DARK,marginBottom:4 },
  groupMeta:       { flexDirection:'row',gap:6 },
  groupTypePill:   { paddingHorizontal:8,paddingVertical:3,borderRadius:10,borderWidth:1 },
  groupTypeTxt:    { fontSize:10,fontWeight:'700' },
  ownerBadge:      { backgroundColor:TEAL+'12',paddingHorizontal:8,paddingVertical:4,borderRadius:8,borderWidth:1,borderColor:TEAL+'30' },
  ownerBadgeTxt:   { fontSize:10,fontWeight:'800',color:TEAL_DEEP },
  groupInfoRow:    { flexDirection:'row',alignItems:'center',gap:14,marginBottom:12 },
  groupInfoItem:   { flexDirection:'row',alignItems:'center',gap:5 },
  groupInfoTxt:    { fontSize:12,color:MID,fontWeight:'500' },
  groupTime:       { marginLeft:'auto' as any,fontSize:11,color:MID },
  membersRow:      { flexDirection:'row',marginBottom:12 },
  memberAvatar:    { width:30,height:30,borderRadius:15,backgroundColor:TEAL+'15',borderWidth:2,borderColor:WHITE,alignItems:'center',justifyContent:'center' },
  memberAvatarMore:    { backgroundColor:TEAL_DARK },
  memberAvatarMoreTxt: { fontSize:9,fontWeight:'800',color:WHITE },
  groupActions:    { flexDirection:'row',gap:10 },
  chatBtn:         { flex:1,backgroundColor:TEAL_DARK,borderRadius:12,paddingVertical:12,alignItems:'center',shadowColor:TEAL_DARK,shadowOffset:{width:0,height:2},shadowOpacity:0.25,shadowRadius:6,elevation:3 },
  chatBtnTxt:      { color:WHITE,fontSize:13,fontWeight:'800' },
  leaveBtn:        { paddingHorizontal:16,paddingVertical:12,borderRadius:12,borderWidth:1.5,borderColor:LIGHT_BORDER,alignItems:'center',justifyContent:'center' },
  leaveBtnTxt:     { fontSize:12,fontWeight:'700',color:MID },

  emptyState: { alignItems:'center',paddingVertical:48,paddingHorizontal:24 },
  emptyIcon:  { width:88,height:88,borderRadius:22,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center',marginBottom:20,borderWidth:1.5,borderColor:TEAL+'25' },
  emptyTitle: { fontSize:20,fontWeight:'800',color:DARK,marginBottom:8,textAlign:'center' },
  emptySub:   { fontSize:13,color:MID,textAlign:'center',lineHeight:20,marginBottom:24,maxWidth:300 },
  emptyBtn:   { backgroundColor:TEAL_DARK,paddingHorizontal:24,paddingVertical:13,borderRadius:12,shadowColor:TEAL_DARK,shadowOffset:{width:0,height:3},shadowOpacity:0.25,shadowRadius:8,elevation:4 },
  emptyBtnTxt:{ color:WHITE,fontSize:14,fontWeight:'800' },

  // Modal
  modalOverlay: { flex:1,justifyContent:'flex-end',backgroundColor:'rgba(6,32,32,0.6)' },
  modalSheet:   { backgroundColor:WHITE,borderTopLeftRadius:28,borderTopRightRadius:28,padding:24,paddingBottom:Platform.OS==='ios'?40:28 },
  sheetHandle:  { width:40,height:4,borderRadius:2,backgroundColor:LIGHT_BORDER,alignSelf:'center',marginBottom:20 },
  sheetTitleRow:{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:20 },
  sheetTitle:   { fontSize:20,fontWeight:'900',color:DARK },
  sheetClose:   { width:32,height:32,borderRadius:16,backgroundColor:LIGHT_BORDER,alignItems:'center',justifyContent:'center' },
  fieldLabel:   { fontSize:12,fontWeight:'700',color:MID,marginBottom:8,letterSpacing:0.5 },
  fieldInput:   { backgroundColor:BG,borderRadius:12,borderWidth:1.5,borderColor:LIGHT_BORDER,paddingHorizontal:14,paddingVertical:13,fontSize:14,color:DARK,marginBottom:16 },
  marketChip:       { paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1.5,borderColor:LIGHT_BORDER,backgroundColor:WHITE },
  marketChipActive: { backgroundColor:TEAL_DARK,borderColor:TEAL_DARK },
  marketChipTxt:    { fontSize:12,fontWeight:'700',color:MID },
  marketChipTxtActive:{ color:WHITE },
  typeRow:          { flexDirection:'row',gap:12,marginBottom:20 },
  typeCard:         { flex:1,borderRadius:14,padding:14,alignItems:'center',gap:6,borderWidth:1.5,borderColor:LIGHT_BORDER,backgroundColor:WHITE },
  typeCardActive:   { backgroundColor:TEAL_DARK,borderColor:TEAL_DARK },
  typeCardActivePool:{ backgroundColor:'#276749',borderColor:'#276749' },
  typeIcon:         { width:36,height:36,borderRadius:10,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center',marginBottom:4 },
  typeTitle:        { fontSize:13,fontWeight:'800',color:DARK },
  typeDesc:         { fontSize:10,color:MID,textAlign:'center',lineHeight:14 },
  errorBox:     { backgroundColor:'#FFF5F5',borderRadius:10,padding:12,marginBottom:12,borderWidth:1,borderColor:'#FC8181' },
  errorTxt:     { color:'#C53030',fontSize:13,fontWeight:'600' },
  createBtn:    { backgroundColor:TEAL_DARK,borderRadius:14,paddingVertical:15,alignItems:'center',shadowColor:TEAL_DARK,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:10,elevation:5 },
  createBtnTxt: { color:WHITE,fontSize:15,fontWeight:'800' },
});