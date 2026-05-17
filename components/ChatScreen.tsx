import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { MapBg } from '../lib/utils';
import { Icons } from '../lib/icons';

// ── Palette ──────────────────────────────────────────────────
const TEAL        = '#17B8B8';
const TEAL_DARK   = '#0D8F8F';
const TEAL_DEEP   = '#0A6E6E';
const WHITE       = '#FFFFFF';
const DARK        = '#062020';
const MID         = '#3A7070';
const LIGHT_BORDER= '#C8E8E8';
const BG          = '#F8FEFE';

// WhatsApp-inspired accents
const HEADER_BG   = '#0A6E6E';   // dark teal top bar
const CHAT_BG     = '#E8F4F4';   // message area background
const BUBBLE_ME   = '#0D8F8F';   // sent bubble
const BUBBLE_THEM = '#FFFFFF';   // received bubble
const DATE_PILL   = 'rgba(10,110,110,0.13)';
const DATE_TXT    = '#0A5A5A';
const POOL_GREEN  = '#276749';

// ── Types ─────────────────────────────────────────────────────
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
  sender_profile?: { avatar_emoji: string; display_name: string; first_name: string };
}

interface Group {
  id: string;
  name: string;
  market_name: string;
  is_pool: boolean;
  created_by: string;
  member_count?: number;
}

type RenderItem =
  | { type: 'msg';  msg: Message; isMe: boolean; showAvatar: boolean; showSender: boolean; key: string }
  | { type: 'date'; label: string; key: string };

// ── Helpers ───────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSep(iso: string) {
  const d    = new Date(iso);
  const now  = new Date();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString())  return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildRenderList(msgs: Message[], myId: string): RenderItem[] {
  const list: RenderItem[] = [];
  let lastDateStr = '';
  msgs.forEach((msg, i) => {
    const ds = new Date(msg.created_at).toDateString();
    if (ds !== lastDateStr) {
      lastDateStr = ds;
      list.push({ type: 'date', label: formatDateSep(msg.created_at), key: `date-${ds}` });
    }
    const isMe       = msg.sender_id === myId;
    const prev       = msgs[i - 1];
    const showAvatar = !isMe && (!prev || prev.sender_id !== msg.sender_id);
    const showSender = !isMe && (!prev || prev.sender_id !== msg.sender_id);
    list.push({ type: 'msg', msg, isMe, showAvatar, showSender, key: msg.id });
  });
  return list;
}

// ── Group Avatar ──────────────────────────────────────────────
function GroupAvatar({ group, size = 48 }: { group: Group; size?: number }) {
  const bg  = group.is_pool ? POOL_GREEN : TEAL_DEEP;
  const ltr = group.name.charAt(0).toUpperCase();
  return (
    <View style={[ga.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[ga.ltr, { fontSize: Math.round(size * 0.38) }]}>{ltr}</Text>
    </View>
  );
}
const ga = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ltr:  { fontWeight: '800', color: WHITE },
});

// ── Date Separator ────────────────────────────────────────────
function DateSeparator({ label }: { label: string }) {
  return (
    <View style={ds.row}>
      <View style={ds.pill}><Text style={ds.txt}>{label}</Text></View>
    </View>
  );
}
const ds = StyleSheet.create({
  row:  { alignItems: 'center', marginVertical: 10 },
  pill: { backgroundColor: DATE_PILL, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  txt:  { fontSize: 11, fontWeight: '700', color: DATE_TXT, letterSpacing: 0.3 },
});

// ── Message Bubble ────────────────────────────────────────────
function MessageBubble({ msg, isMe, showSender }: {
  msg: Message; isMe: boolean; showSender: boolean;
}) {
  const time = formatTime(msg.created_at);

  // Bot message — centered announcement style
  if (msg.is_bot) {
    return (
      <View style={mb.botRow}>
        <View style={mb.botBubble}>
          <View style={mb.botHeader}>
            {Icons.bot(TEAL_DARK, 12)}
            <Text style={mb.botHeaderTxt}>SPLITWI$E</Text>
          </View>
          <Text style={mb.botTxt}>{msg.content}</Text>
          <Text style={mb.botTime}>{time}</Text>
        </View>
      </View>
    );
  }

  // Sender display name
  const senderName = msg.sender_profile?.display_name
    || msg.sender_profile?.first_name
    || msg.sender_name;

  const bubbleStyle = isMe
    ? [mb.bubble, mb.bubbleMe]
    : [mb.bubble, mb.bubbleThem];

  return (
    <View style={[mb.row, isMe && mb.rowMe]}>
      {/* Avatar spacer for received bubbles */}
      {!isMe && <View style={{ width: 36 }} />}

      <View style={bubbleStyle}>
        {/* Sender name (received only, first in sequence) */}
        {showSender && !isMe && (
          <Text style={mb.senderName}>{senderName}</Text>
        )}

        {/* Image attachment */}
        {msg.file_url && msg.file_type?.startsWith('image/') && Platform.OS === 'web' && (
          <img
            src={msg.file_url}
            alt={msg.file_name}
            style={{ maxWidth: 220, maxHeight: 200, borderRadius: 8, display: 'block', marginBottom: 4 } as any}
            onClick={() => window.open(msg.file_url, '_blank')}
          />
        )}

        {/* Video attachment */}
        {msg.file_url && msg.file_type?.startsWith('video/') && Platform.OS === 'web' && (
          <video
            src={msg.file_url}
            controls
            style={{ maxWidth: 220, borderRadius: 8, display: 'block', marginBottom: 4 } as any}
          />
        )}

        {/* Generic file attachment */}
        {msg.file_url && !msg.file_type?.startsWith('image/') && !msg.file_type?.startsWith('video/') && (
          <TouchableOpacity
            style={[mb.fileRow, isMe && mb.fileRowMe]}
            onPress={() => { if (Platform.OS === 'web') window.open(msg.file_url, '_blank'); }}
          >
            <View style={mb.fileIcon}>{(Icons as any).file(isMe ? WHITE : TEAL_DARK, 18)}</View>
            <View style={{ flex: 1 }}>
              <Text style={[mb.fileName, isMe && { color: WHITE }]} numberOfLines={1}>
                {msg.file_name || 'File'}
              </Text>
              {msg.file_size ? (
                <Text style={[mb.fileSize, isMe && { color: WHITE + 'AA' }]}>
                  {(msg.file_size / 1024).toFixed(1)} KB
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}

        {/* Text content */}
        {!!msg.content && (
          <Text style={[mb.txt, isMe && mb.txtMe]}>{msg.content}</Text>
        )}

        {/* Time + read receipt row */}
        <View style={[mb.timeRow, isMe && mb.timeRowMe]}>
          <Text style={[mb.time, isMe && mb.timeMe]}>{time}</Text>
          {isMe && Icons.check(WHITE + 'AA', 10)}
        </View>
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  // Bot
  botRow:       { alignItems: 'center', marginVertical: 6 },
  botBubble:    { backgroundColor: TEAL + '18', borderRadius: 12, padding: 12, maxWidth: '85%', borderWidth: 1, borderColor: TEAL + '30' },
  botHeader:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  botHeaderTxt: { fontSize: 10, fontWeight: '800', color: TEAL_DARK, letterSpacing: 0.5 },
  botTxt:       { fontSize: 13, color: DARK, lineHeight: 19 },
  botTime:      { fontSize: 10, color: MID, marginTop: 5, textAlign: 'right' },

  // Regular
  row:          { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2, paddingHorizontal: 10 },
  rowMe:        { flexDirection: 'row-reverse' },

  bubble:       { maxWidth: '72%', paddingHorizontal: 13, paddingTop: 9, paddingBottom: 7, elevation: 1 },
  bubbleMe:     {
    backgroundColor: BUBBLE_ME,
    borderRadius: 18,
    borderBottomRightRadius: 3,
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  bubbleThem:   {
    backgroundColor: BUBBLE_THEM,
    borderRadius: 18,
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
    shadowColor: DARK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },

  senderName:   { fontSize: 11, fontWeight: '800', color: TEAL_DARK, marginBottom: 3 },
  txt:          { fontSize: 14, color: DARK, lineHeight: 20 },
  txtMe:        { color: WHITE },
  timeRow:      { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  timeRowMe:    { justifyContent: 'flex-end' },
  time:         { fontSize: 10, color: MID },
  timeMe:       { color: WHITE + 'AA' },

  fileRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: TEAL + '15', borderRadius: 8, padding: 10, marginBottom: 4 },
  fileRowMe:    { backgroundColor: WHITE + '20' },
  fileIcon:     { width: 34, height: 34, borderRadius: 7, backgroundColor: TEAL + '20', alignItems: 'center', justifyContent: 'center' },
  fileName:     { fontSize: 12, fontWeight: '700', color: DARK },
  fileSize:     { fontSize: 10, color: MID, marginTop: 2 },
});

// ── Chat List Item ────────────────────────────────────────────
function ChatListItem({ group, onOpen, lastMessage, unread }: {
  group: Group; onOpen: (id: string) => void;
  lastMessage?: Message; unread?: number;
}) {
  const time = lastMessage ? formatTime(lastMessage.created_at) : '';
  const preview = lastMessage
    ? (lastMessage.file_url
        ? lastMessage.file_type?.startsWith('image/') ? '📷 Photo'
          : lastMessage.file_type?.startsWith('video/') ? '🎥 Video' : '📎 ' + (lastMessage.file_name || 'File')
        : lastMessage.content)
    : 'No messages yet';

  const previewSender = lastMessage && !lastMessage.is_bot && lastMessage.sender_name
    ? lastMessage.sender_name.split(' ')[0] + ': '
    : '';

  return (
    <TouchableOpacity style={cl.item} onPress={() => onOpen(group.id)} activeOpacity={0.7}>
      <GroupAvatar group={group} size={52} />
      <View style={{ flex: 1 }}>
        <View style={cl.topRow}>
          <Text style={cl.name} numberOfLines={1}>{group.name}</Text>
          <Text style={[cl.time, !!unread && cl.timeUnread]}>{time}</Text>
        </View>
        <View style={cl.bottomRow}>
          <Text style={cl.preview} numberOfLines={1}>
            {previewSender}{preview}
          </Text>
          {!!unread && unread > 0 && (
            <View style={cl.badge}><Text style={cl.badgeTxt}>{unread}</Text></View>
          )}
        </View>
        <View style={cl.subRow}>
          {group.is_pool
            ? Icons.globe(POOL_GREEN, 11)
            : Icons.lock(TEAL_DARK, 11)
          }
          <Text style={[cl.sub, group.is_pool && { color: POOL_GREEN }]}>
            {group.is_pool ? 'Open Pool' : 'Private'} · {group.market_name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cl = StyleSheet.create({
  item:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: WHITE },
  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name:      { fontSize: 15, fontWeight: '800', color: DARK, flex: 1, marginRight: 8 },
  time:      { fontSize: 11, color: MID },
  timeUnread:{ color: TEAL_DARK, fontWeight: '700' },
  preview:   { fontSize: 13, color: MID, flex: 1, marginRight: 8 },
  sub:       { fontSize: 11, color: MID, marginTop: 3 },
  subRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  badge:     { backgroundColor: TEAL_DARK, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeTxt:  { fontSize: 11, fontWeight: '900', color: WHITE },
});

// ══════════════════════════════════════════════════════════════
// MAIN CHAT SCREEN
// ══════════════════════════════════════════════════════════════
interface Props { groupId?: string }

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
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  const [uploading,    setUploading]    = useState(false);

  const scrollRef    = useRef<ScrollView>(null);
  const subRef       = useRef<any>(null);
  const fileInputRef = useRef<any>(null);

  // ── Message cache: group_id → Message[] ───────────────────
  const msgCacheRef  = useRef<Map<string, Message[]>>(new Map());

  // ── Init ─────────────────────────────────────────────────
  useEffect(() => {
    init();
    return () => { subRef.current?.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (initialGroupId && groups.length > 0) {
      const g = groups.find(gr => gr.id === initialGroupId);
      if (g) openGroup(g);
    }
  }, [initialGroupId, groups]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setCurrentUser(user);
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (p) setProfile(p);
    await fetchGroups(user.id);
    setLoading(false);
  };

  // ── Fetch groups ─────────────────────────────────────────
  const fetchGroups = async (uid: string) => {
    const { data: memberRows } = await supabase
      .from('group_members').select('group_id').eq('user_id', uid);
    if (!memberRows || memberRows.length === 0) { setGroups([]); return; }

    const groupIds = memberRows.map((r: any) => r.group_id);
    const { data: groupData } = await supabase
      .from('groups').select('*').in('id', groupIds)
      .order('created_at', { ascending: false });
    if (!groupData) return;

    const { data: memberCounts } = await supabase
      .from('group_members').select('group_id')
      .in('group_id', groupData.map((g: any) => g.id));

    const countMap: Record<string, number> = {};
    (memberCounts || []).forEach((r: any) => {
      countMap[r.group_id] = (countMap[r.group_id] || 0) + 1;
    });

    const enriched = groupData.map((g: any) => ({ ...g, member_count: countMap[g.id] || 0 }));
    setGroups(enriched);

    // Last messages
    const { data: lastMsgRows } = await supabase
      .from('messages').select('*')
      .in('group_id', enriched.map((g: any) => g.id))
      .order('created_at', { ascending: false });

    const lastMsgs: Record<string, Message> = {};
    (lastMsgRows || []).forEach((msg: any) => {
      if (!lastMsgs[msg.group_id]) lastMsgs[msg.group_id] = msg;
    });
    setLastMessages(lastMsgs);
  };

  // ── Open group ───────────────────────────────────────────
  const openGroup = async (group: Group) => {
    setActiveGroup(group);

    // Show cached immediately — no spinner if we have data
    const cached = msgCacheRef.current.get(group.id);
    if (cached && cached.length > 0) {
      setMessages(cached);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
      setMsgLoading(false);
    } else {
      setMsgLoading(true);
    }

    await fetchMessages(group.id);
    setMsgLoading(false);
    subscribeToMessages(group.id);
  };

  // ── Fetch messages ───────────────────────────────────────
  const fetchMessages = async (gid: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender_profile:profiles!sender_id(avatar_emoji, display_name, first_name)')
      .eq('group_id', gid)
      .order('created_at', { ascending: true });
    if (data) {
      msgCacheRef.current.set(gid, data);
      setMessages(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // ── Real-time subscription ───────────────────────────────
  const subscribeToMessages = (gid: string) => {
    subRef.current?.unsubscribe();
    subRef.current = supabase
      .channel(`messages:${gid}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `group_id=eq.${gid}`,
      }, async (payload: any) => {
        let newMsg = payload.new;
        if (newMsg.sender_id) {
          const { data: sp } = await supabase
            .from('profiles').select('avatar_emoji,display_name,first_name')
            .eq('id', newMsg.sender_id).maybeSingle();
          newMsg = { ...newMsg, sender_profile: sp };
        }
        setMessages(prev => {
          const next = [...prev, newMsg];
          msgCacheRef.current.set(gid, next);
          return next;
        });
        setLastMessages(prev => ({ ...prev, [gid]: newMsg }));
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();
  };

  // ── Send ─────────────────────────────────────────────────
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

  // ── File upload ──────────────────────────────────────────
  const uploadAndSend = async (file: File) => {
    if (!activeGroup || !currentUser) return;
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop() || 'bin';
      const path = `${currentUser.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('chat-media').upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(path);
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

  // ── Go back ──────────────────────────────────────────────
  const goBack = () => {
    setActiveGroup(null);
    setMessages([]);
    subRef.current?.unsubscribe();
    if (currentUser) fetchGroups(currentUser.id);
  };

  // ── Loading screen ───────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingWrap}>
        <ActivityIndicator size="large" color={TEAL_DARK} />
        <Text style={s.loadingTxt}>Loading chats…</Text>
      </View>
    );
  }

  // ── Active chat view ─────────────────────────────────────
  if (activeGroup) {
    const renderList = buildRenderList(messages, currentUser?.id || '');

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: CHAT_BG }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ── Dark teal header ── */}
        <View style={s.chatHeader}>
          <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {Icons.back(WHITE, 22)}
          </TouchableOpacity>

          <GroupAvatar group={activeGroup} size={40} />

          <View style={{ flex: 1 }}>
            <Text style={s.chatHeaderName} numberOfLines={1}>{activeGroup.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              {activeGroup.is_pool
                ? Icons.globe('#A7F3D0', 11)
                : Icons.lock('#A7F3D0', 11)
              }
              <Text style={s.chatHeaderSub}>
                {activeGroup.market_name} · {activeGroup.member_count} members
              </Text>
            </View>
          </View>

          <View style={[s.headerBadge, activeGroup.is_pool
            ? { backgroundColor: '#A7F3D0' + '30', borderColor: '#A7F3D0' + '50' }
            : { backgroundColor: WHITE + '18', borderColor: WHITE + '30' }
          ]}>
            <Text style={s.headerBadgeTxt}>
              {activeGroup.is_pool ? 'Pool' : 'Private'}
            </Text>
          </View>
        </View>

        {/* ── Messages ── */}
        {msgLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CHAT_BG }}>
            <ActivityIndicator size="large" color={TEAL_DARK} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1, backgroundColor: CHAT_BG }}
            contentContainerStyle={s.msgsContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {/* Watermark */}
            <Text style={s.chatWm}>SPLITWI$E</Text>

            {renderList.length === 0 ? (
              <View style={s.noMsgs}>
                {Icons.chat(TEAL_DARK, 38)}
                <Text style={s.noMsgsTxt}>No messages yet</Text>
                <Text style={s.noMsgsSub}>Say hello to get the conversation started!</Text>
              </View>
            ) : (
              renderList.map(item =>
                item.type === 'date'
                  ? <DateSeparator key={item.key} label={item.label} />
                  : <MessageBubble
                      key={item.key}
                      msg={item.msg}
                      isMe={item.isMe}
                      showSender={item.showSender}
                    />
              )
            )}
            <View style={{ height: 16 }} />
          </ScrollView>
        )}

        {/* ── Input bar ── */}
        <View style={s.inputBar}>
          {/* Hidden file picker (web) */}
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

          <TouchableOpacity
            style={s.attachBtn}
            onPress={() => { if (Platform.OS === 'web') fileInputRef.current?.click(); }}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator color={TEAL_DARK} size="small" />
              : Icons.attach(TEAL_DARK, 20)
            }
          </TouchableOpacity>

          <TextInput
            style={s.msgInput}
            placeholder="Type a message…"
            placeholderTextColor="#8AACAC"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || sending) && { opacity: 0.45 }]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color={WHITE} size="small" />
              : Icons.send(WHITE, 16)
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Chat list view ───────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <MapBg />
      {/* Big watermark */}
      <Text style={s.wm}>SPLITWI$E</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.listHeader}>
          <Text style={s.listTitle}>Chats</Text>
          <Text style={s.listSub}>Your groups and conversations</Text>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statPill}>
            {Icons.chat(TEAL_DARK, 13)}
            <Text style={s.statTxt}>{groups.length} chat{groups.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={[s.statPill, { borderColor: '#A7F3D0' }]}>
            {Icons.globe(POOL_GREEN, 13)}
            <Text style={[s.statTxt, { color: POOL_GREEN }]}>
              {groups.filter(g => g.is_pool).length} open pool{groups.filter(g => g.is_pool).length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* List */}
        {groups.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyIcon}>{Icons.chat(TEAL_DARK, 36)}</View>
            <Text style={s.emptyTitle}>No chats yet</Text>
            <Text style={s.emptySub}>
              Connect with a shopper on the map or create a group order to start chatting.
            </Text>
          </View>
        ) : (
          <View style={s.listCard}>
            {groups.map((group, i) => (
              <View key={group.id}>
                <ChatListItem
                  group={group}
                  onOpen={(id) => {
                    const g = groups.find(gr => gr.id === id);
                    if (g) openGroup(g);
                  }}
                  lastMessage={lastMessages[group.id]}
                />
                {i < groups.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  // Loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: BG },
  loadingTxt:  { fontSize: 14, color: MID, fontWeight: '500' },

  // Chat list page
  wm:          { position: 'absolute', alignSelf: 'center', top: '18%', fontSize: Platform.OS === 'web' ? 120 : 68, fontWeight: '900', color: TEAL + '07', letterSpacing: -4, textAlign: 'center', width: '100%', zIndex: 0 },
  listHeader:  { paddingHorizontal: 20, marginBottom: 14 },
  listTitle:   { fontSize: 28, fontWeight: '900', color: DARK, marginBottom: 4 },
  listSub:     { fontSize: 13, color: MID },
  statsRow:    { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 18 },
  statPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: WHITE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: LIGHT_BORDER },
  statTxt:     { fontSize: 12, fontWeight: '700', color: TEAL_DEEP },

  listCard:    { backgroundColor: WHITE, marginHorizontal: 0, overflow: 'hidden', borderTopWidth: 1, borderBottomWidth: 1, borderColor: LIGHT_BORDER },
  divider:     { height: 1, backgroundColor: LIGHT_BORDER, marginLeft: 82 },

  emptyWrap:   { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 28 },
  emptyIcon:   { width: 88, height: 88, borderRadius: 22, backgroundColor: TEAL + '12', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: TEAL + '25' },
  emptyTitle:  { fontSize: 20, fontWeight: '800', color: DARK, marginBottom: 8, textAlign: 'center' },
  emptySub:    { fontSize: 13, color: MID, textAlign: 'center', lineHeight: 20, maxWidth: 300 },

  // Active chat header
  chatHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingTop: Platform.OS === 'ios' ? 54 : 14, paddingBottom: 14, backgroundColor: HEADER_BG, shadowColor: DARK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 5 },
  backBtn:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  chatHeaderName: { fontSize: 15, fontWeight: '800', color: WHITE, marginBottom: 2 },
  chatHeaderSub:  { fontSize: 11, color: WHITE + 'BB' },
  headerBadge:    { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  headerBadgeTxt: { fontSize: 10, fontWeight: '700', color: WHITE },

  // Messages
  chatWm:      { position: 'absolute', alignSelf: 'center', top: '30%', fontSize: Platform.OS === 'web' ? 100 : 60, fontWeight: '900', color: TEAL_DARK + '07', letterSpacing: -3, textAlign: 'center', width: '100%', zIndex: 0 },
  msgsContent: { paddingTop: 10, paddingBottom: 4, minHeight: 200 },
  noMsgs:      { alignItems: 'center', justifyContent: 'center', paddingVertical: 70, gap: 10 },
  noMsgsTxt:   { fontSize: 17, fontWeight: '800', color: TEAL_DEEP },
  noMsgsSub:   { fontSize: 13, color: MID, textAlign: 'center', maxWidth: 260 },

  // Input bar
  inputBar:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 10, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 10, backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: LIGHT_BORDER },
  attachBtn:   { width: 40, height: 40, borderRadius: 20, backgroundColor: TEAL + '18', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: TEAL + '30', marginBottom: 1 },
  msgInput:    { flex: 1, backgroundColor: '#F0F9F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: DARK, borderWidth: 1, borderColor: LIGHT_BORDER, maxHeight: 100 },
  sendBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: TEAL_DEEP, alignItems: 'center', justifyContent: 'center', marginBottom: 1, shadowColor: TEAL_DEEP, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
});
