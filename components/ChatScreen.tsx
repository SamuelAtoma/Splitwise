import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { MapBg } from '../lib/utils';
import { Svg, Icons } from '../lib/icons';

const TEAL       = '#17B8B8';
const TEAL_DARK  = '#0D8F8F';
const TEAL_DEEP  = '#0A6E6E';
const WHITE      = '#FFFFFF';
const DARK       = '#062020';
const MID        = '#3A7070';
const LIGHT_BORDER = '#C8E8E8';
const BG         = '#F8FEFE';

interface Message {
  id: string;
  group_id: string;
  sender_id: string | null;
  sender_name: string;
  content: string;
  is_bot: boolean;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  sender_profile?: { avatar_emoji: string; display_name: string; first_name: string; };
}

interface Group {
  id: string;
  name: string;
  market_name: string;
  is_pool: boolean;
  created_by: string;
  member_count?: number;
}

// ── Message Bubble ───────────────────────────────────────────
function MessageBubble({ msg, isMe, showAvatar }: {
  msg: Message; isMe: boolean; showAvatar: boolean;
}) {
  const time = new Date(msg.created_at).toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit',
  });

  if (msg.is_bot) {
    return (
      <View style={s.botMsgWrap}>
        <View style={s.botBubble}>
          <Text style={s.botBubbleHeader}>🤖 SPLITWI$E</Text>
          <Text style={s.botBubbleTxt}>{msg.content}</Text>
          <Text style={s.msgTime}>{time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.msgRow, isMe && s.msgRowMe]}>
      {!isMe && showAvatar && (
        <View style={s.msgAvatar}>
          <Text style={{fontSize:16}}>
            {msg.sender_profile?.avatar_emoji || '🧑'}
          </Text>
        </View>
      )}
      {!isMe && !showAvatar && <View style={{width:32}}/>}

      <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
        {!isMe && showAvatar && (
          <Text style={s.bubbleSender}>
            {msg.sender_profile?.display_name || msg.sender_profile?.first_name || msg.sender_name}
          </Text>
        )}
        {/* Media content */}
        {msg.file_url && msg.file_type?.startsWith('image/') && Platform.OS === 'web' && (
          <img
            src={msg.file_url}
            alt={msg.file_name}
            style={{ maxWidth: 220, maxHeight: 200, borderRadius: 8, display: 'block', marginBottom: 4 } as any}
            onClick={() => window.open(msg.file_url, '_blank')}
          />
        )}
        {msg.file_url && msg.file_type?.startsWith('video/') && Platform.OS === 'web' && (
          <video
            src={msg.file_url}
            controls
            style={{ maxWidth: 220, borderRadius: 8, display: 'block', marginBottom: 4 } as any}
          />
        )}
        {msg.file_url && !msg.file_type?.startsWith('image/') && !msg.file_type?.startsWith('video/') && (
          <TouchableOpacity
            style={s.fileAttach}
            onPress={() => { if (Platform.OS === 'web') window.open(msg.file_url, '_blank'); }}
          >
            <View style={s.fileAttachIcon}>{(Icons as any).file(TEAL_DARK, 18)}</View>
            <View style={{flex:1}}>
              <Text style={s.fileAttachName} numberOfLines={1}>{msg.file_name || 'File'}</Text>
              {msg.file_size ? <Text style={s.fileAttachSize}>{(msg.file_size/1024).toFixed(1)} KB</Text> : null}
            </View>
          </TouchableOpacity>
        )}
        {msg.content ? <Text style={[s.bubbleTxt, isMe && s.bubbleTxtMe]}>{msg.content}</Text> : null}
        <Text style={[s.msgTime, isMe && {color:WHITE+'99',textAlign:'right'}]}>{time}</Text>
      </View>
    </View>
  );
}

// ── Chat List Item ───────────────────────────────────────────
function ChatListItem({ group, onOpen, lastMessage, unread }: {
  group: Group; onOpen: (id:string) => void;
  lastMessage?: Message; unread?: number;
}) {
  const time = lastMessage
    ? new Date(lastMessage.created_at).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})
    : '';

  return (
    <TouchableOpacity style={s.chatListItem} onPress={() => onOpen(group.id)} activeOpacity={0.7}>
      <View style={[s.chatListIcon, group.is_pool && {backgroundColor:'#F0FFF4'}]}>
        {group.is_pool ? Icons.globe('#276749',20) : Icons.lock(TEAL_DARK,20)}
      </View>
      <View style={{flex:1}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
          <Text style={s.chatListName} numberOfLines={1}>{group.name}</Text>
          <Text style={s.chatListTime}>{time}</Text>
        </View>
        <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
          {Icons.cart(MID,11)}
          <Text style={s.chatListMarket} numberOfLines={1}>{group.market_name}</Text>
          {unread && unread > 0 ? (
            <View style={s.unreadBadge}>
              <Text style={s.unreadBadgeTxt}>{unread}</Text>
            </View>
          ) : null}
        </View>
        {lastMessage && (
          <Text style={s.chatListPreview} numberOfLines={1}>
            {lastMessage.is_bot ? '🤖 ' : ''}{lastMessage.content}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN CHAT SCREEN
// ══════════════════════════════════════════════════════════════
interface Props {
  groupId?: string;
}

export default function ChatScreen({ groupId: initialGroupId }: Props) {
  const [groups,       setGroups]       = useState<Group[]>([]);
  const [activeGroup,  setActiveGroup]  = useState<Group | null>(null);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState('');
  const [sending,      setSending]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [msgLoading,   setMsgLoading]   = useState(false);
  const [currentUser,  setCurrentUser]  = useState<any>(null);
  const [profile,      setProfile]      = useState<any>(null);
  const [lastMessages, setLastMessages] = useState<Record<string,Message>>({});
  const scrollRef    = useRef<ScrollView>(null);
  const subRef       = useRef<any>(null);
  const fileInputRef = useRef<any>(null);
  const [uploading,  setUploading] = useState(false);

  useEffect(() => {
    init();
    return () => { subRef.current?.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (initialGroupId && groups.length > 0) {
      const g = groups.find(g => g.id === initialGroupId);
      if (g) openGroup(g);
    }
  }, [initialGroupId, groups]);

  const init = async () => {
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setCurrentUser(user);
    const { data: p } = await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle();
    if (p) setProfile(p);
    await fetchGroups(user.id);
    setLoading(false);
  };

  const fetchGroups = async (uid: string) => {
    const { data: memberRows } = await supabase
      .from('group_members').select('group_id').eq('user_id', uid);
    if (!memberRows || memberRows.length === 0) { setGroups([]); return; }

    const groupIds = memberRows.map((r:any) => r.group_id);
    const { data: groupData } = await supabase
      .from('groups').select('*').in('id', groupIds)
      .order('created_at', { ascending: false });

    if (!groupData) return;

    // Get member counts in one query
    const { data: memberCounts } = await supabase
      .from('group_members').select('group_id')
      .in('group_id', groupData.map((g:any) => g.id));

    const countMap: Record<string,number> = {};
    (memberCounts || []).forEach((r:any) => {
      countMap[r.group_id] = (countMap[r.group_id] || 0) + 1;
    });

    const enriched = groupData.map((g:any) => ({ ...g, member_count: countMap[g.id] || 0 }));
    setGroups(enriched);

    // Fetch last message for each group in one query
    const { data: lastMsgRows } = await supabase
      .from('messages')
      .select('*')
      .in('group_id', enriched.map((g:any) => g.id))
      .order('created_at', { ascending: false });

    const lastMsgs: Record<string,Message> = {};
    (lastMsgRows || []).forEach((msg:any) => {
      if (!lastMsgs[msg.group_id]) lastMsgs[msg.group_id] = msg;
    });
    setLastMessages(lastMsgs);
  };

  const openGroup = async (group: Group) => {
    setActiveGroup(group);
    setMsgLoading(true);
    await fetchMessages(group.id);
    setMsgLoading(false);
    subscribeToMessages(group.id);
  };

  const fetchMessages = async (gid: string) => {
    const { data } = await supabase
      .from('messages')
      .select(`*, sender_profile:profiles!sender_id(avatar_emoji, display_name, first_name)`)
      .eq('group_id', gid)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const subscribeToMessages = (gid: string) => {
    subRef.current?.unsubscribe();
    subRef.current = supabase
      .channel(`messages:${gid}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `group_id=eq.${gid}`,
      }, async (payload: any) => {
        // Fetch sender profile
        let newMsg = payload.new;
        if (newMsg.sender_id) {
          const { data: sp } = await supabase
            .from('profiles').select('avatar_emoji,display_name,first_name')
            .eq('id', newMsg.sender_id).maybeSingle();
          newMsg = { ...newMsg, sender_profile: sp };
        }
        setMessages(prev => [...prev, newMsg]);
        setLastMessages(prev => ({ ...prev, [gid]: newMsg }));
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending || !activeGroup || !currentUser) return;
    setInput('');
    setSending(true);
    try {
      await supabase.from('messages').insert({
        group_id:    activeGroup.id,
        sender_id:   currentUser.id,
        sender_name: profile?.display_name || profile?.first_name || 'User',
        content:     text,
        is_bot:      false,
      });
    } finally {
      setSending(false);
    }
  };

  const uploadAndSend = async (file: File) => {
    if (!activeGroup || !currentUser) return;
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop() || 'bin';
      const path = `${currentUser.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('chat-media').upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from('chat-media').getPublicUrl(path);
      await supabase.from('messages').insert({
        group_id:    activeGroup.id,
        sender_id:   currentUser.id,
        sender_name: profile?.display_name || profile?.first_name || 'User',
        content:     '',
        is_bot:      false,
        file_url:    publicUrl,
        file_name:   file.name,
        file_type:   file.type,
        file_size:   file.size,
      });
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setUploading(false);
    }
  };

  const goBack = () => {
    setActiveGroup(null);
    setMessages([]);
    subRef.current?.unsubscribe();
    fetchGroups(currentUser?.id);
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingScreen}>
        <ActivityIndicator size="large" color={TEAL_DARK}/>
        <Text style={s.loadingTxt}>Loading chats...</Text>
      </View>
    );
  }

  // ── Active chat view ─────────────────────────────────────
  if (activeGroup) {
    return (
      <KeyboardAvoidingView
        style={{flex:1, backgroundColor:WHITE}}
        behavior={Platform.OS==='ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS==='ios' ? 90 : 0}
      >
        {/* Chat header */}
        <View style={s.chatHeader}>
          <TouchableOpacity style={s.chatBackBtn} onPress={goBack}>
            {Icons.back(DARK, 22)}
          </TouchableOpacity>
          <View style={[s.chatHeaderIcon, activeGroup.is_pool && {backgroundColor:'#F0FFF4'}]}>
            {activeGroup.is_pool ? Icons.globe('#276749',18) : Icons.lock(TEAL_DARK,18)}
          </View>
          <View style={{flex:1}}>
            <Text style={s.chatHeaderName} numberOfLines={1}>{activeGroup.name}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
              {Icons.cart(MID,11)}
              <Text style={s.chatHeaderSub}>{activeGroup.market_name}</Text>
              <Text style={s.chatHeaderDot}>•</Text>
              {Icons.users(MID,11)}
              <Text style={s.chatHeaderSub}>{activeGroup.member_count} members</Text>
            </View>
          </View>
          <View style={[s.chatStatusPill,
            activeGroup.is_pool
              ? {backgroundColor:'#F0FFF4',borderColor:'#68D391'}
              : {backgroundColor:TEAL+'10',borderColor:TEAL+'30'}
          ]}>
            <Text style={[s.chatStatusTxt,
              activeGroup.is_pool ? {color:'#276749'} : {color:TEAL_DEEP}
            ]}>
              {activeGroup.is_pool ? '🔗 Pool' : '🔒 Private'}
            </Text>
          </View>
        </View>

        {/* Messages */}
        {msgLoading ? (
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <ActivityIndicator size="large" color={TEAL_DARK}/>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{flex:1, backgroundColor:'#F8FEFE'}}
            contentContainerStyle={s.msgsContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({animated:true})}
          >
            {messages.length === 0 ? (
              <View style={s.noMsgs}>
                <Text style={s.noMsgsIcon}>💬</Text>
                <Text style={s.noMsgsTxt}>No messages yet. Say hello!</Text>
              </View>
            ) : (
              messages.map((msg, i) => {
                const isMe        = msg.sender_id === currentUser?.id;
                const prevMsg     = messages[i-1];
                const showAvatar  = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
                return (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMe={isMe}
                    showAvatar={showAvatar}
                  />
                );
              })
            )}
            <View style={{height:16}}/>
          </ScrollView>
        )}

        {/* Input */}
        <View style={s.inputBar}>
          {/* Hidden file input (web only) */}
          {Platform.OS === 'web' && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              style={{ display: 'none' } as any}
              onChange={(e: any) => {
                const file = e.target.files?.[0];
                if (file) uploadAndSend(file);
                e.target.value = '';
              }}
            />
          )}
          {/* Attach button */}
          <TouchableOpacity
            style={s.attachBtn}
            onPress={() => { if (Platform.OS === 'web') fileInputRef.current?.click(); }}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator color={TEAL_DARK} size="small"/>
              : Icons.attach(TEAL_DARK, 20)
            }
          </TouchableOpacity>
          <TextInput
            style={s.msgInput}
            placeholder="Type a message..."
            placeholderTextColor="#9BB8B8"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || sending) && {opacity:0.4}]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color={WHITE} size="small"/>
              : Icons.send(WHITE, 16)
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Chat list view ───────────────────────────────────────
  return (
    <View style={{flex:1, backgroundColor:BG}}>
      <MapBg/>
      <Text style={s.wm}>SPLITWI$E</Text>

      <ScrollView
        style={{flex:1}}
        contentContainerStyle={s.listScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.listHeader}>
          <Text style={s.listTitle}>Chats</Text>
          <Text style={s.listSub}>Your conversations — always here when you return</Text>
        </View>

        {/* Stats */}
        <View style={s.listStats}>
          <View style={s.listStatPill}>
            {Icons.chat(TEAL_DARK,14)}
            <Text style={s.listStatTxt}>{groups.length} chats</Text>
          </View>
          <View style={s.listStatPill}>
            {Icons.globe('#276749',14)}
            <Text style={[s.listStatTxt,{color:'#276749'}]}>
              {groups.filter(g=>g.is_pool).length} open pools
            </Text>
          </View>
        </View>

        {/* List */}
        {groups.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              {Icons.chat(TEAL_DARK,36)}
            </View>
            <Text style={s.emptyTitle}>No chats yet</Text>
            <Text style={s.emptySub}>
              Connect with a shopper on the map or create a group order to start chatting.
            </Text>
          </View>
        ) : (
          <View style={s.chatList}>
            {groups.map(group => (
              <ChatListItem
                key={group.id}
                group={group}
                onOpen={(id) => {
                  const g = groups.find(g => g.id === id);
                  if (g) openGroup(g);
                }}
                lastMessage={lastMessages[group.id]}
              />
            ))}
          </View>
        )}

        <View style={{height:100}}/>
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  mapBg:  { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F0FCFC',overflow:'hidden' },
  gH:     { position:'absolute',left:0,right:0,height:1,backgroundColor:'#17B8B80E' },
  frost:  { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F8FEFEFD' },
  wm:     { position:'absolute',alignSelf:'center',top:'18%',fontSize:Platform.OS==='web'?120:68,fontWeight:'900',color:TEAL+'07',letterSpacing:-4,textAlign:'center',width:'100%',zIndex:0 },

  loadingScreen: { flex:1,alignItems:'center',justifyContent:'center',gap:12,backgroundColor:BG },
  loadingTxt:    { fontSize:14,color:MID,fontWeight:'500' },

  listScroll: { paddingHorizontal:16,paddingTop:20 },
  listHeader: { marginBottom:16 },
  listTitle:  { fontSize:26,fontWeight:'900',color:DARK,marginBottom:4 },
  listSub:    { fontSize:13,color:MID },
  listStats:  { flexDirection:'row',gap:10,marginBottom:20 },
  listStatPill:{ flexDirection:'row',alignItems:'center',gap:6,backgroundColor:WHITE,borderRadius:20,paddingHorizontal:14,paddingVertical:8,borderWidth:1,borderColor:LIGHT_BORDER },
  listStatTxt: { fontSize:12,fontWeight:'700',color:TEAL_DEEP },

  chatList:     { backgroundColor:WHITE,borderRadius:16,borderWidth:1,borderColor:LIGHT_BORDER,overflow:'hidden' },
  chatListItem: { flexDirection:'row',alignItems:'center',gap:12,padding:16,borderBottomWidth:1,borderBottomColor:LIGHT_BORDER },
  chatListIcon: { width:46,height:46,borderRadius:13,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:TEAL+'20' },
  chatListName: { fontSize:15,fontWeight:'800',color:DARK },
  chatListTime: { fontSize:11,color:MID },
  chatListMarket:{ fontSize:11,color:MID,flex:1 },
  chatListPreview:{ fontSize:12,color:MID,marginTop:3 },
  unreadBadge:   { backgroundColor:TEAL_DARK,borderRadius:10,paddingHorizontal:6,paddingVertical:2 },
  unreadBadgeTxt:{ fontSize:10,fontWeight:'900',color:WHITE },

  emptyState: { alignItems:'center',paddingVertical:56,paddingHorizontal:24 },
  emptyIcon:  { width:88,height:88,borderRadius:22,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center',marginBottom:20,borderWidth:1.5,borderColor:TEAL+'25' },
  emptyTitle: { fontSize:20,fontWeight:'800',color:DARK,marginBottom:8,textAlign:'center' },
  emptySub:   { fontSize:13,color:MID,textAlign:'center',lineHeight:20,maxWidth:300 },

  // Chat header
  chatHeader:     { flexDirection:'row',alignItems:'center',gap:12,padding:16,paddingTop:Platform.OS==='ios'?54:16,backgroundColor:WHITE,borderBottomWidth:1,borderBottomColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:3 },
  chatBackBtn:    { width:36,height:36,borderRadius:10,backgroundColor:BG,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:LIGHT_BORDER },
  chatHeaderIcon: { width:40,height:40,borderRadius:11,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:TEAL+'20' },
  chatHeaderName: { fontSize:15,fontWeight:'800',color:DARK,marginBottom:2 },
  chatHeaderSub:  { fontSize:10,color:MID },
  chatHeaderDot:  { fontSize:10,color:MID },
  chatStatusPill: { paddingHorizontal:8,paddingVertical:4,borderRadius:10,borderWidth:1 },
  chatStatusTxt:  { fontSize:10,fontWeight:'700' },

  // Messages
  msgsContent: { padding:16,gap:4 },
  noMsgs:      { flex:1,alignItems:'center',justifyContent:'center',paddingVertical:60 },
  noMsgsIcon:  { fontSize:40,marginBottom:12 },
  noMsgsTxt:   { fontSize:14,color:MID,fontWeight:'500' },

  botMsgWrap:    { alignItems:'center',marginVertical:8 },
  botBubble:     { backgroundColor:TEAL+'10',borderRadius:16,padding:14,maxWidth:'90%',borderWidth:1,borderColor:TEAL+'25' },
  botBubbleHeader:{ fontSize:11,fontWeight:'800',color:TEAL_DARK,marginBottom:6,letterSpacing:0.5 },
  botBubbleTxt:  { fontSize:13,color:DARK,lineHeight:20 },

  msgRow:       { flexDirection:'row',alignItems:'flex-end',gap:8,marginVertical:2 },
  msgRowMe:     { flexDirection:'row-reverse' },
  msgAvatar:    { width:30,height:30,borderRadius:15,backgroundColor:TEAL+'15',alignItems:'center',justifyContent:'center' },
  bubble:       { maxWidth:'72%',borderRadius:18,paddingHorizontal:14,paddingVertical:10 },
  bubbleMe:     { backgroundColor:TEAL_DARK,borderBottomRightRadius:4 },
  bubbleThem:   { backgroundColor:WHITE,borderWidth:1,borderColor:LIGHT_BORDER,borderBottomLeftRadius:4 },
  bubbleSender: { fontSize:10,fontWeight:'800',color:TEAL_DARK,marginBottom:3 },
  bubbleTxt:    { fontSize:14,color:DARK,lineHeight:20 },
  bubbleTxtMe:  { color:WHITE },
  msgTime:      { fontSize:10,color:MID,marginTop:4 },

  // Input
  inputBar:      { flexDirection:'row',alignItems:'flex-end',gap:8,padding:12,paddingBottom:Platform.OS==='ios'?28:12,backgroundColor:WHITE,borderTopWidth:1,borderTopColor:LIGHT_BORDER },
  attachBtn:     { width:40,height:40,borderRadius:20,backgroundColor:TEAL+'15',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:TEAL+'30' },
  msgInput:      { flex:1,backgroundColor:BG,borderRadius:22,paddingHorizontal:16,paddingVertical:10,fontSize:14,color:DARK,borderWidth:1,borderColor:LIGHT_BORDER,maxHeight:100 },
  sendBtn:       { width:44,height:44,borderRadius:22,backgroundColor:TEAL_DARK,alignItems:'center',justifyContent:'center',shadowColor:TEAL_DARK,shadowOffset:{width:0,height:3},shadowOpacity:0.3,shadowRadius:6,elevation:4 },
  fileAttach:    { flexDirection:'row',alignItems:'center',gap:10,backgroundColor:TEAL+'10',borderRadius:10,padding:10,marginBottom:4,borderWidth:1,borderColor:TEAL+'25' },
  fileAttachIcon:{ width:36,height:36,borderRadius:8,backgroundColor:TEAL+'20',alignItems:'center',justifyContent:'center' },
  fileAttachName:{ fontSize:13,fontWeight:'700',color:DARK,flex:1 },
  fileAttachSize:{ fontSize:11,color:MID,marginTop:2 },
});