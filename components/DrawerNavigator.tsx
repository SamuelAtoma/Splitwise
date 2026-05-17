import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Platform, ScrollView, TextInput, Image,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { MapBg } from '../lib/utils';
import { Icons } from '../lib/icons';
import MapScreenComponent from './MapScreen';
import GroupOrdersScreen from './GroupOrdersScreen';
import ChatScreen from './ChatScreen';
import FCCPCScreen from './FCCPCScreen';

// ── Palette ──────────────────────────────────────────────────────
const TEAL        = '#17B8B8';
const TEAL_DARK   = '#0D8F8F';
const TEAL_DEEP   = '#0A6E6E';
const WHITE       = '#FFFFFF';
const DARK        = '#062020';
const MID         = '#3A7070';
const BG          = '#F8FEFE';
const LIGHT_BORDER = '#C8E8E8';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Cap content width so the 2-column action grid always wraps correctly on desktop too
const CONTENT_W = Math.min(SCREEN_WIDTH, 540);
const CARD_W    = Math.floor((CONTENT_W - 44) / 2);  // 16 + 12 + 16 = 44 (margin+gap+margin)

type ScreenName = 'Home' | 'Map' | 'Groups' | 'Chat' | 'Profile' | 'FCCPC';

// ══════════════════════════════════════════════════════════════════
// AI CHATBOT
// ══════════════════════════════════════════════════════════════════
const SPLITWISE_CONTEXT = `You are the SPLITWI$E AI assistant. SPLITWI$E is a Nigerian app that helps people find nearby shoppers ordering from the same online market (Jumia, Konga, Amazon, Jiji, Temu, Aliexpress, Shoprite, Slot, etc.) to pool orders, meet minimum order thresholds, and split delivery fees.

Key features:
- Live map showing nearby active shoppers
- Group chat to coordinate orders
- Market selector: Jumia, Konga, Amazon, Jiji, Temu, Aliexpress, Shoprite, Slot
- Radius selector (1-20km)
- Go Live / Go Offline on map
- Create group orders with nearby shoppers
- Split delivery fees equally

How it works:
1. Go to Map screen, select a market, set your radius
2. Tap "Go Live" to appear on the map
3. Nearby shoppers on the same market appear as pins
4. Tap a pin to start a group chat
5. Coordinate orders in chat, place combined order, split delivery fee

Payment: No escrow or payment handling — users coordinate payments directly among themselves.

Answer general e-commerce questions about online shopping in Nigeria, delivery fees, saving money, and group buying tips. Always be friendly and concise. Use ₦ for Nigerian Naira.`;

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

function getLocalResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good morning') || q.includes('good afternoon') || q.includes('good evening'))
    return "Hello! I'm the SPLITWI$E assistant. I can help you with:\n\n• How group ordering works\n• Supported markets\n• Going live on the map\n• Saving on delivery fees\n• Reporting scams (FCCPC)\n\nWhat would you like to know?";

  if (q.includes('fccpc') || q.includes('scam') || q.includes('fake') || q.includes('report') || q.includes('consumer') || q.includes('cheat') || q.includes('fraud') || q.includes('deceiv'))
    return "If you've been scammed by an online market, you can **report it to the FCCPC** — Nigeria's official consumer protection body.\n\n📞 Toll-free: +234 800 000 2121\n📧 contact@fccpc.gov.ng\n🌐 complaints.fccpc.gov.ng\n\nReporting is **free** and government-backed. Tap **Report a Scam** in the Profile tab to access the full guide.";

  if (q.includes('market') || q.includes('jumia') || q.includes('konga') || q.includes('amazon') || q.includes('jiji') || q.includes('temu') || q.includes('aliexpress') || q.includes('slot') || q.includes('support'))
    return "SPLITWI$E supports all major Nigerian online markets:\n\nJumia · Konga · Amazon\nJiji · Temu · Aliexpress · Slot\n\nYou can also **add any custom market** not listed — just type the name when selecting a market!";

  if ((q.includes('how') && q.includes('work')) || q.includes('explain') || q.includes('what is splitwise') || q.includes('what is splitwi'))
    return "Here's how SPLITWI$E works:\n\n1. **Select a market** (Jumia, Amazon, etc.)\n2. **Go to Map** — set your delivery radius\n3. **Go Live** — your pin appears on the map\n4. **Connect** — tap a nearby shopper's pin\n5. **Split** — share one delivery, divide the fee\n\nExample: ₦2,000 delivery ÷ 5 people = ₦400 each!";

  if (q.includes('save') || q.includes('discount') || q.includes('cheap') || q.includes('cost') || (q.includes('how') && q.includes('much')))
    return "You can save **up to 80% on delivery fees!**\n\nGroup size | Delivery (₦2,000)\nSolo       | ₦2,000\n2 people   | ₦1,000 each\n5 people   | ₦400 each\n10 people  | ₦200 each\n\nThe bigger the group, the more everyone saves!";

  if (q.includes('go live') || q.includes('appear') || q.includes('show on map') || (q.includes('how') && q.includes('map')))
    return "To appear on the map:\n\n1. Tap **Map** from the bottom bar\n2. Select your market from the list\n3. Set your search radius (1–20km)\n4. Tap the **Go Live** button\n\nYou'll appear as a pin. Nearby shoppers from any market can see you and connect!";

  if (q.includes('radius') || q.includes('distance') || q.includes('km') || q.includes('area') || q.includes('range'))
    return "The **radius** controls how far away you can see other shoppers:\n\n• 1km — your immediate street\n• 3km — your neighbourhood (default)\n• 5–10km — your local area\n• 20km — across your city\n\nStart with 3km and expand if no one is nearby.";

  if (q.includes('group') || q.includes('create group') || q.includes('join') || q.includes('pool'))
    return "To start a group:\n\n• **Map**: tap any shopper's pin → choose 'Create Group' or 'Private Chat'\n• **Groups** tab: tap '+ New Group' to create one manually\n\nGroups work best with **3–10 people**. The chat is where you coordinate what to order, then one person places the combined order.";

  if (q.includes('chat') || q.includes('message') || q.includes('talk') || q.includes('communicate'))
    return "SPLITWI$E has a built-in group chat for each order pool.\n\n• Tap a shopper pin on the map to open a chat\n• Use the **Chat** tab to see all your active conversations\n• Coordinate your orders, confirm items, then split the delivery fee once the order is placed.";

  if (q.includes('pay') || q.includes('payment') || q.includes('transfer') || q.includes('money') || q.includes('naira'))
    return "SPLITWI$E handles **coordination, not payments**.\n\nAfter agreeing on the order, members pay each other directly via:\n• Bank transfer (GTBank, Access, Opay, etc.)\n• Cash\n• Mobile money\n\nUse the chat to confirm who paid and who owes what.";

  if (q.includes('delivery') || q.includes('ship') || q.includes('logistics'))
    return "Delivery works like this:\n\n1. Your group places **one combined order** on the market (e.g. Jumia)\n2. Items are delivered to **one address** (or split by arrangement)\n3. The delivery fee is divided equally among group members\n\nThis beats paying full delivery alone every time!";

  if (q.includes('sign up') || q.includes('register') || q.includes('account'))
    return "To create an account:\n\n1. Open SPLITWI$E\n2. Tap **Get Started**\n3. Enter your email and create a password\n4. Complete your profile (name, avatar, phone)\n\nYou're ready to start saving!";

  if (q.includes('profile') || q.includes('avatar') || q.includes('name') || q.includes('edit'))
    return "To update your profile:\n\n• Tap the **Profile** tab at the bottom\n• Update your name, phone number, or avatar\n\nYour name and avatar appear on the map so other shoppers can identify you!";

  if (q.includes('safe') || q.includes('trust') || q.includes('secure') || q.includes('private'))
    return "SPLITWI$E is designed with safety in mind:\n\nSecure login via email/password or Google\nYou control when you go live and offline\nIn-app chat keeps communication private\nFCCPC support if any market scams you\n\nAlways use the in-app chat and never share personal financial details with strangers.";

  if (q.includes('offline') || q.includes('go offline') || q.includes('hide') || q.includes('stop'))
    return "To go offline and hide from the map:\n\n• On the Map screen, tap **Go Offline**\n• Your pin is removed and you become invisible to other shoppers\n\nYou can go live again anytime you're ready to shop!";

  if (q.includes('nigeria') || q.includes('lagos') || q.includes('abuja') || q.includes('city') || q.includes('location'))
    return "SPLITWI$E works **anywhere in Nigeria**\n\nCurrently being used in Lagos, Abuja, Port Harcourt, and more cities. As long as you have nearby shoppers within your radius, you can form a group and save on delivery!";

  if (q.includes('tip') || q.includes('advice') || q.includes('trick') || q.includes('best'))
    return "Top tips to save more with SPLITWI$E:\n\nUse a **3-5km radius** for best results\nGo live during **peak hours** (evenings & weekends)\nInvite friends to join your pool in advance\nThe closer your group, the faster the delivery\nCheck back regularly — new shoppers appear often!";

  return "I'm here to help with SPLITWI$E!\n\nYou can ask me about:\n• **How group splitting works**\n• **Supported markets** (Jumia, Konga, etc.)\n• **Going live on the map**\n• **Saving on delivery fees**\n• **Reporting scams to FCCPC**\n• **Payment coordination**\n\nWhat would you like to know?";
}

function AIChatbot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm the SPLITWI$E assistant. I can help you understand how group ordering works, answer e-commerce questions, or help you save more on deliveries. What would you like to know?" }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { system: SPLITWISE_CONTEXT, messages: newMessages.map(m => ({ role: m.role, content: m.content })) },
      });
      if (error || !data?.content) throw new Error('fallback');
      const reply = data.content?.[0]?.text || data.reply || data.content;
      setMessages(prev => [...prev, { role: 'assistant', content: typeof reply === 'string' ? reply : getLocalResponse(text) }]);
    } catch {
      await new Promise(r => setTimeout(r, 600));
      setMessages(prev => [...prev, { role: 'assistant', content: getLocalResponse(text) }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const suggestions = ['How does splitting work?', 'Which markets are supported?', 'How do I go live?', 'How much can I save?'];

  return (
    <View style={bot.container}>
      <View style={bot.header}>
        <View style={bot.headerLeft}>
          <View style={bot.botAvatar}>{Icons.bot(WHITE, 18)}</View>
          <View>
            <Text style={bot.headerTitle}>SPLITWI$E Assistant</Text>
            <View style={bot.onlineRow}>
              <View style={bot.onlineDot}/>
              <Text style={bot.onlineTxt}>Always here to help</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={bot.closeBtn} activeOpacity={0.7}>
          {Icons.close(WHITE, 18)}
        </TouchableOpacity>
      </View>
      <ScrollView ref={scrollRef} style={bot.messages} contentContainerStyle={bot.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((msg, i) => (
          <View key={i} style={[bot.msgRow, msg.role === 'user' && bot.msgRowUser]}>
            {msg.role === 'assistant' && (
              <View style={bot.msgAvatar}>{Icons.bot(TEAL_DARK, 14)}</View>
            )}
            <View style={[bot.bubble, msg.role === 'user' ? bot.bubbleUser : bot.bubbleBot]}>
              <Text style={[bot.bubbleTxt, msg.role === 'user' ? bot.bubbleTxtUser : bot.bubbleTxtBot]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={bot.msgRow}>
            <View style={bot.msgAvatar}>{Icons.bot(TEAL_DARK, 14)}</View>
            <View style={[bot.bubbleBot, { paddingHorizontal:16, paddingVertical:12 }]}>
              <View style={bot.typingDots}>
                {[0,1,2].map(i => <View key={i} style={bot.typingDot}/>)}
              </View>
            </View>
          </View>
        )}
        {messages.length === 1 && (
          <View style={bot.suggestions}>
            {suggestions.map((sg, i) => (
              <TouchableOpacity key={i} style={bot.suggBtn} onPress={() => setInput(sg)}>
                <Text style={bot.suggTxt}>{sg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={bot.inputRow}>
        <TextInput style={bot.input} placeholder="Ask me anything..."
          placeholderTextColor="#9BB8B8" value={input} onChangeText={setInput}
          onSubmitEditing={sendMessage} returnKeyType="send" multiline={false}/>
        <TouchableOpacity style={[bot.sendBtn, (!input.trim()||loading) && {opacity:0.5}]}
          onPress={sendMessage} disabled={!input.trim()||loading}>
          {Icons.send(WHITE, 16)}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// BOTTOM TAB BAR
// ══════════════════════════════════════════════════════════════════
const TAB_ITEMS: { screen: ScreenName; icon: (a: boolean) => React.ReactNode; label: string }[] = [
  { screen: 'Home',    icon: a => Icons.home(   a ? TEAL_DARK : MID, 22), label: 'Home'    },
  { screen: 'Map',     icon: a => Icons.map(    a ? TEAL_DARK : MID, 22), label: 'Map'     },
  { screen: 'Chat',    icon: a => Icons.chat(   a ? TEAL_DARK : MID, 22), label: 'Chat'    },
  { screen: 'Groups',  icon: a => Icons.groups( a ? TEAL_DARK : MID, 22), label: 'Groups'  },
  { screen: 'Profile', icon: a => Icons.profile(a ? TEAL_DARK : MID, 22), label: 'Profile' },
];

function BottomTabBar({ active, onPress }: {
  active: ScreenName;
  onPress: (s: ScreenName) => void;
}) {
  return (
    <View style={tab.bar}>
      {TAB_ITEMS.map(item => {
        // FCCPC is a sub-page of Profile — keep Profile tab highlighted
        const isActive = active === item.screen || (active === 'FCCPC' && item.screen === 'Profile');
        return (
          <TouchableOpacity
            key={item.screen}
            style={tab.item}
            onPress={() => onPress(item.screen)}
            activeOpacity={0.65}
          >
            {isActive && <View style={tab.activePill} />}
            <View style={[tab.iconWrap, isActive && tab.iconWrapActive]}>
              {item.icon(isActive)}
            </View>
            <Text style={[tab.label, isActive && tab.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════════════════════════════════
function HomeScreen({ profile, onNavigate, openGroups, matchBanner, onDismissBanner }: {
  profile: any | null; email: string; onNavigate: (s: ScreenName) => void;
  openGroups: any[]; matchBanner: boolean; onDismissBanner: () => void;
}) {
  const [delivery, setDelivery] = useState(2000);
  const [people,   setPeople]   = useState(4);

  // Green dot pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Radar rings — 3 rings with staggered starts
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const firstName = profile?.display_name?.split(' ')[0] || profile?.first_name || 'Shopper';

  const perPerson = Math.round(delivery / people);
  const savePct   = Math.round(((delivery - perPerson) / delivery) * 100);

  const getInitials = () => {
    if (!profile) return '?';
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
  };

  useEffect(() => {
    // Pulsing green dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.8, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Radar rings — each ring expands and fades out, staggered 667ms apart
    const animateRing = (val: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0,    useNativeDriver: true }),
        ])
      ).start();
    };
    animateRing(ring1, 0);
    animateRing(ring2, 667);
    animateRing(ring3, 1333);
  }, []);

  const actions = [
    { icon: Icons.map(WHITE, 22),    label: 'Find Nearby',  sub: 'See shoppers on map',   bg: TEAL_DARK,  screen: 'Map'    as ScreenName },
    { icon: Icons.chat(WHITE, 22),   label: 'My Chats',     sub: 'Coordinate with group', bg: '#6D28D9',  screen: 'Chat'   as ScreenName },
    { icon: Icons.groups(WHITE, 22), label: 'Group Orders', sub: 'Pool & split orders',   bg: '#B45309',  screen: 'Groups' as ScreenName },
    { icon: Icons.shield(WHITE, 22), label: 'Report Scam',  sub: 'FCCPC consumer help',   bg: '#C53030',  screen: 'FCCPC'  as ScreenName },
  ];

  const feeOptions = [500, 1000, 1500, 2000, 3000, 5000];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={hs.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Match notification banner ─────────────────────── */}
      {matchBanner && openGroups.length > 0 && (
        <View style={hs.matchBanner}>
          <View style={hs.matchBannerLeft}>
            <View style={hs.matchBannerDot}/>
            <View style={{ flex: 1 }}>
              <Text style={hs.matchBannerTitle}>
                🔥 {openGroups.length} open pool{openGroups.length !== 1 ? 's' : ''} near you!
              </Text>
              <Text style={hs.matchBannerSub}>
                {openGroups[0]?.market_name} · {openGroups[0]?.name}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity style={hs.matchBannerJoin} onPress={() => onNavigate('Groups')}>
              <Text style={hs.matchBannerJoinTxt}>View →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={hs.matchBannerClose} onPress={onDismissBanner}>
              {Icons.close(MID, 14)}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <View style={hs.hero}>

        {/* Greeting row */}
        <View style={hs.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={hs.heroGreeting}>Good {greeting}</Text>
            <Text style={hs.heroName}>{firstName}</Text>
          </View>
          <View style={hs.avatarWrap}>
            {profile?.avatar_emoji?.startsWith?.('http')
              ? <Image source={{ uri: profile.avatar_emoji }} style={hs.avatarImg} />
              : profile?.avatar_emoji && profile.avatar_emoji.length <= 4
                ? <Text style={{ fontSize: 28 }}>{profile.avatar_emoji}</Text>
                : <Text style={hs.avatarTxt}>{getInitials()}</Text>
            }
          </View>
        </View>

        <Text style={hs.heroTagline}>Find shoppers near you — split delivery fees together.</Text>

        {/* Radar animation + Go Live CTA */}
        <View style={hs.radarContainer}>
          {/* Concentric rings that emanate outward */}
          {[ring1, ring2, ring3].map((r, i) => (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[hs.radarRing, {
                opacity: r.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.45, 0] }),
                transform: [{
                  scale: r.interpolate({ inputRange: [0, 1], outputRange: [0.15, 3.2] }),
                }],
              }]}
            />
          ))}

          <TouchableOpacity style={hs.heroBtn} onPress={() => onNavigate('Map')} activeOpacity={0.85}>
            {/* Pulsing halo behind the green dot */}
            <Animated.View style={[hs.heroBtnPulse, { transform: [{ scale: pulseAnim }] }]} />
            <View style={hs.heroBtnDot} />
            <Text style={hs.heroBtnTxt}>Go Live on Map</Text>
            {Icons.map(WHITE, 18)}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Quick actions 2 × 2 ──────────────────────────────── */}
      <View style={hs.gridWrapper}>
        <View style={hs.grid}>
          {actions.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[hs.actionCard, { backgroundColor: a.bg, width: CARD_W }]}
              onPress={() => onNavigate(a.screen)}
              activeOpacity={0.82}
            >
              <View style={hs.actionIconWrap}>{a.icon}</View>
              <Text style={hs.actionLabel}>{a.label}</Text>
              <Text style={hs.actionSub}>{a.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Savings calculator ───────────────────────────────── */}
      <View style={hs.calcCard}>
        <View style={hs.calcHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {Icons.savings(TEAL_DARK, 20)}
            <Text style={hs.calcTitle}>Savings Calculator</Text>
          </View>
          <Text style={hs.calcSub}>See how much your group saves</Text>
        </View>

        {/* Fee chips */}
        <Text style={hs.calcLabel}>Delivery fee</Text>
        <View style={hs.chipRow}>
          {feeOptions.map(v => (
            <TouchableOpacity
              key={v}
              style={[hs.chip, delivery === v && hs.chipActive]}
              onPress={() => setDelivery(v)}
            >
              <Text style={[hs.chipTxt, delivery === v && hs.chipTxtActive]}>
                ₦{v >= 1000 ? `${v / 1000}k` : v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* People counter */}
        <Text style={[hs.calcLabel, { marginTop: 18 }]}>People in group</Text>
        <View style={hs.counterRow}>
          <TouchableOpacity style={hs.counterBtn} onPress={() => setPeople(p => Math.max(2, p - 1))} activeOpacity={0.7}>
            <Text style={hs.counterBtnTxt}>−</Text>
          </TouchableOpacity>
          <View style={hs.counterValWrap}>
            <Text style={hs.counterVal}>{people}</Text>
            <Text style={hs.counterValLbl}>people</Text>
          </View>
          <TouchableOpacity style={hs.counterBtn} onPress={() => setPeople(p => Math.min(20, p + 1))} activeOpacity={0.7}>
            <Text style={hs.counterBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        <View style={hs.calcResult}>
          <View>
            <Text style={hs.calcResultLbl}>Each person pays</Text>
            <Text style={hs.calcResultAmt}>₦{perPerson.toLocaleString()}</Text>
          </View>
          <View style={hs.saveBadge}>
            <Text style={hs.saveBadgeTxt}>Save {savePct}%</Text>
          </View>
        </View>

        <TouchableOpacity style={hs.calcCta} onPress={() => onNavigate('Map')} activeOpacity={0.85}>
          <Text style={hs.calcCtaTxt}>Find a group now →</Text>
        </TouchableOpacity>
      </View>

      {/* ── Deals Near You ───────────────────────────────────── */}
      {openGroups.length > 0 && (
        <View style={hs.dealsSection}>
          <View style={hs.dealsSectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={hs.dealsSectionTitle}>🔥 Deals Near You</Text>
              <Text style={hs.dealsSectionSub}>Open pools you can join right now</Text>
            </View>
            <TouchableOpacity style={hs.dealsViewAll} onPress={() => onNavigate('Groups')}>
              <Text style={hs.dealsViewAllTxt}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {openGroups.map((g: any) => {
              const diff = g.expires_at ? new Date(g.expires_at).getTime() - Date.now() : null;
              const hrs   = diff ? Math.floor(diff / 3600000) : null;
              const mins  = diff ? Math.floor((diff % 3600000) / 60000) : null;
              const timeLabel = diff === null ? '' : hrs! > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
              return (
                <TouchableOpacity key={g.id} style={hs.dealCard} onPress={() => onNavigate('Groups')} activeOpacity={0.8}>
                  <View style={hs.dealCardTop}>
                    <Text style={hs.dealCardMarket}>{g.market_name}</Text>
                    {timeLabel ? (
                      <View style={hs.dealTimePill}>
                        <Text style={hs.dealTimeTxt}>⏱ {timeLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={hs.dealCardName} numberOfLines={1}>{g.name}</Text>
                  <View style={hs.dealCardMeta}>
                    <Text style={hs.dealCardMembers}>
                      👥 {g.member_count || 0}{g.max_members ? `/${g.max_members}` : ''} members
                    </Text>
                  </View>
                  <View style={hs.dealCardJoinBtn}>
                    <Text style={hs.dealCardJoinTxt}>Join Pool →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ══════════════════════════════════════════════════════════════════
function ProfileScreen({ profile, email, onSignOut, onEditProfile, onNavigateFCCPC, splitsCompleted, orderHistory }: {
  profile: any | null;
  email: string;
  onSignOut: () => void;
  onEditProfile?: () => void;
  onNavigateFCCPC?: () => void;
  splitsCompleted: number;
  orderHistory: any[];
}) {
  const getInitials = () => {
    if (!profile) return '??';
    return `${profile.first_name?.[0]||''}${profile.last_name?.[0]||''}`.toUpperCase();
  };
  const avatarIsUrl = profile?.avatar_emoji?.startsWith?.('http');

  return (
    <ScrollView style={{flex:1}} contentContainerStyle={s.profileScroll} showsVerticalScrollIndicator={false}>
      <MapBg/>
      <Text style={s.wm}>SPLITWI$E</Text>

      <View style={s.profileHero}>
        <View style={s.profileAvatar}>
          {avatarIsUrl
            ? <Image source={{ uri: profile.avatar_emoji }} style={s.profileAvatarImg} />
            : (profile?.avatar_emoji && profile.avatar_emoji.length <= 4
                ? <Text style={{fontSize:40}}>{profile.avatar_emoji}</Text>
                : <View style={[s.profileAvatarInitials, { backgroundColor: profile?.theme_color || TEAL }]}>
                    <Text style={s.profileAvatarTxt}>{getInitials()}</Text>
                  </View>
              )
          }
        </View>
        <Text style={s.profileName}>{profile?.display_name||`${profile?.first_name||''} ${profile?.last_name||''}`}</Text>
        <Text style={s.profileEmail}>{email}</Text>
        <View style={s.activeBadge}>
          <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
            {Icons.check('#276749',12)}
            <Text style={s.activeBadgeTxt}>Account Active</Text>
          </View>
        </View>
        {onEditProfile && (
          <TouchableOpacity style={s.editProfileBtn} onPress={onEditProfile}>
            <Text style={s.editProfileBtnTxt}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.infoCard}>
        <Text style={s.infoCardTitle}>Personal Information</Text>
        {[
          { label:'First Name',   value: profile?.first_name   || '—' },
          { label:'Last Name',    value: profile?.last_name    || '—' },
          { label:'Display Name', value: profile?.display_name || '—' },
          { label:'Email',        value: email                 || '—' },
          { label:'Phone',        value: profile?.phone        || '—' },
          { label:'Member Since', value: profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})
              : '—' },
        ].map((item, i, arr) => (
          <View key={i}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>{item.label}</Text>
              <Text style={s.infoValue} numberOfLines={1}>{item.value}</Text>
            </View>
            {i < arr.length-1 && <View style={s.divider}/>}
          </View>
        ))}
      </View>

      <View style={s.infoCard}>
        <Text style={s.infoCardTitle}>Verification Status</Text>
        {[
          { label:'Email Verified', done: true             },
          { label:'Phone Verified', done: !!profile?.phone },
        ].map((item, i, arr) => (
          <View key={i}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>{item.label}</Text>
              <View style={[s.verifyPill,{
                backgroundColor: item.done?'#F0FFF4':'#FFF8E6',
                borderColor:     item.done?'#68D391':'#F6AD55',
              }]}>
                <View style={{flexDirection:'row',alignItems:'center',gap:3}}>
                  {item.done ? Icons.check('#276749',11) : null}
                  <Text style={[s.verifyPillTxt,{color:item.done?'#276749':'#B7791F'}]}>
                    {item.done?'Verified':'Pending'}
                  </Text>
                </View>
              </View>
            </View>
            {i < arr.length-1 && <View style={s.divider}/>}
          </View>
        ))}
      </View>

      {/* ── Reputation / Completion Score ─────────────────── */}
      <View style={s.reputCard}>
        <Text style={s.reputTitle}>Shopper Reputation</Text>
        <View style={s.reputRow}>
          <View style={s.reputItem}>
            <Text style={s.reputNum}>{splitsCompleted}</Text>
            <Text style={s.reputLbl}>Splits Done</Text>
          </View>
          <View style={s.reputDivider}/>
          <View style={s.reputItem}>
            <Text style={[s.reputNum, { color: '#B45309' }]}>{orderHistory.length}</Text>
            <Text style={s.reputLbl}>Groups Joined</Text>
          </View>
          <View style={s.reputDivider}/>
          <View style={s.reputItem}>
            <View style={s.reputStars}>
              {[1,2,3,4,5].map(i => {
                const filled = i <= Math.min(5, Math.floor(splitsCompleted / 2) + 1);
                return (
                  <Text key={i} style={{ fontSize: 14, color: filled ? '#F59E0B' : '#D1D5DB' }}>★</Text>
                );
              })}
            </View>
            <Text style={s.reputLbl}>Score</Text>
          </View>
        </View>
        {splitsCompleted === 0 && (
          <Text style={s.reputHint}>Complete your first split to build your reputation! 🚀</Text>
        )}
        {splitsCompleted >= 5 && splitsCompleted < 20 && (
          <View style={s.reputBadge}><Text style={s.reputBadgeTxt}>🏅 Trusted Splitter</Text></View>
        )}
        {splitsCompleted >= 20 && (
          <View style={[s.reputBadge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B55' }]}>
            <Text style={[s.reputBadgeTxt, { color: '#92400E' }]}>🏆 Power Splitter</Text>
          </View>
        )}
      </View>

      {/* ── Order History ────────────────────────────────────── */}
      {orderHistory.length > 0 && (
        <View style={s.historyCard}>
          <Text style={s.infoCardTitle}>Order History</Text>
          {orderHistory.slice(0, 5).map((g: any, i: number) => (
            <View key={g.id || i}>
              <View style={s.historyRow}>
                <View style={[s.historyIcon, g.is_pool && { backgroundColor: '#F0FFF4' }]}>
                  <Text style={{ fontSize: 14 }}>{g.is_pool ? '🔗' : '🔒'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.historyName} numberOfLines={1}>{g.name}</Text>
                  <Text style={s.historyMeta}>{g.market_name} · {g.member_count || 0} members</Text>
                </View>
                <Text style={s.historyDate}>
                  {new Date(g.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              {i < Math.min(orderHistory.length, 5) - 1 && <View style={s.divider}/>}
            </View>
          ))}
          {orderHistory.length > 5 && (
            <Text style={s.historyMore}>+{orderHistory.length - 5} more groups</Text>
          )}
        </View>
      )}

      {/* FCCPC / Report a Scam */}
      {onNavigateFCCPC && (
        <TouchableOpacity style={s.fccpcCard} onPress={onNavigateFCCPC} activeOpacity={0.8}>
          <View style={s.fccpcIconWrap}>
            {Icons.shield('#C53030', 20)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fccpcCardTitle}>Report a Scam</Text>
            <Text style={s.fccpcCardSub}>FCCPC Consumer Protection</Text>
          </View>
          <Text style={s.fccpcArrow}>›</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={s.signOutBtn} onPress={onSignOut}>
        <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
          {Icons.signout(MID,18)}
          <Text style={s.signOutTxt}>Sign Out</Text>
        </View>
      </TouchableOpacity>
      <View style={{height:32}}/>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════
// TAB NAVIGATOR  (replaces DrawerNavigator)
// ══════════════════════════════════════════════════════════════════
interface DrawerProps { onSignOut: () => void; onEditProfile?: () => void; }

export default function DrawerNavigator({ onSignOut, onEditProfile }: DrawerProps) {
  const [activeScreen,  setActiveScreen]  = useState<ScreenName>('Home');
  const [profile,       setProfile]       = useState<any|null>(null);
  const [email,         setEmail]         = useState('');
  const [activeChatId,  setActiveChatId]  = useState<string|undefined>(undefined);
  const [botOpen,       setBotOpen]       = useState(false);
  const [openGroups,    setOpenGroups]    = useState<any[]>([]);
  const [orderHistory,  setOrderHistory]  = useState<any[]>([]);
  const [matchBanner,   setMatchBanner]   = useState(false);
  const [bannerSeen,    setBannerSeen]    = useState(false);
  const botAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfile();
    // Realtime: watch for new open groups
    const channel = supabase
      .channel('open-groups-watch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'groups' }, (payload) => {
        const g = payload.new as any;
        if (g?.is_pool) {
          setOpenGroups(prev => [g, ...prev.slice(0, 9)]);
          if (!bannerSeen) setMatchBanner(true);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email || '');
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) setProfile(data);
    await fetchOpenGroups();
    await fetchOrderHistory(user.id);
  };

  const fetchOpenGroups = async () => {
    try {
      const { data } = await supabase
        .from('groups')
        .select('*, group_members(count)')
        .eq('is_pool', true)
        .order('created_at', { ascending: false })
        .limit(10);
      const now = Date.now();
      const active = (data || []).filter((g: any) => {
        if (!g.expires_at) return true;
        return new Date(g.expires_at).getTime() > now;
      }).map((g: any) => ({
        ...g,
        member_count: g.group_members?.[0]?.count || 0,
      }));
      setOpenGroups(active);
      if (active.length > 0 && !bannerSeen) setMatchBanner(true);
    } catch { /* silent */ }
  };

  const fetchOrderHistory = async (userId: string) => {
    try {
      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);
      if (!memberRows || memberRows.length === 0) return;
      const groupIds = memberRows.map((r: any) => r.group_id);
      const { data: groups } = await supabase
        .from('groups')
        .select('id, name, market_name, is_pool, created_at, member_count')
        .in('id', groupIds)
        .order('created_at', { ascending: false });
      if (groups) setOrderHistory(groups);
    } catch { /* silent */ }
  };

  const navigate = (screen: ScreenName) => {
    if (screen === 'Chat') setActiveChatId(undefined);
    setActiveScreen(screen);
  };

  const toggleBot = () => {
    if (botOpen) {
      Animated.timing(botAnim, { toValue: 0, duration: 200, useNativeDriver: true })
        .start(() => setBotOpen(false));
    } else {
      setBotOpen(true);
      Animated.spring(botAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
    }
  };

  const handleOpenChat = (groupId: string) => {
    setActiveChatId(groupId);
    setActiveScreen('Chat');
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); onSignOut(); };

  const getInitials = () => {
    if (!profile) return '??';
    return `${profile.first_name?.[0]||''}${profile.last_name?.[0]||''}`.toUpperCase();
  };

  const screenTitles: Record<ScreenName, string> = {
    Home: 'Dashboard', Map: 'Nearby Map', Groups: 'Group Orders',
    Chat: 'Chats', Profile: 'My Profile', FCCPC: 'Consumer Protection',
  };

  const botScale   = botAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const botOpacity = botAnim;
  const botTransY  = botAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <View style={s.root}>

      {/* ── Top bar ────────────────────────────────────────── */}
      <View style={s.topBar}>
        {/* Spacer matches avatar width for symmetric centering */}
        <View style={s.topBarSpacer} />

        <View style={{ flex: 1, alignItems: 'center' }}>
          {activeScreen === 'Home' ? (
            <Text style={s.topBarLogo}>
              SPLITWI<Text style={{ color: TEAL_DARK }}>$</Text>E
            </Text>
          ) : (
            <Text style={s.topBarTitle}>{screenTitles[activeScreen]}</Text>
          )}
        </View>

        {/* Avatar → Profile */}
        <TouchableOpacity
          onPress={() => navigate('Profile')}
          style={s.topBarAvatarBtn}
          activeOpacity={0.8}
        >
          {profile?.avatar_emoji?.startsWith?.('http')
            ? <Image source={{ uri: profile.avatar_emoji }} style={s.topBarAvatarImg} />
            : profile?.avatar_emoji && profile.avatar_emoji.length <= 4
              ? <Text style={{ fontSize: 18 }}>{profile.avatar_emoji}</Text>
              : <Text style={s.topBarAvatarTxt}>{getInitials()}</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Screen content ─────────────────────────────────── */}
      <View style={s.screenContent}>
        {activeScreen === 'Home' && (
          <HomeScreen
            profile={profile}
            email={email}
            onNavigate={navigate}
            openGroups={openGroups}
            matchBanner={matchBanner}
            onDismissBanner={() => { setMatchBanner(false); setBannerSeen(true); }}
          />
        )}
        {activeScreen === 'Map' && (
          <MapScreenComponent onOpenChat={handleOpenChat} />
        )}
        {activeScreen === 'Groups' && (
          <GroupOrdersScreen onOpenChat={handleOpenChat} />
        )}
        {activeScreen === 'Chat' && (
          <ChatScreen groupId={activeChatId} />
        )}
        {activeScreen === 'Profile' && (
          <ProfileScreen
            profile={profile}
            email={email}
            onSignOut={handleSignOut}
            onEditProfile={onEditProfile}
            onNavigateFCCPC={() => navigate('FCCPC')}
            splitsCompleted={profile?.splits_completed || 0}
            orderHistory={orderHistory}
          />
        )}
        {activeScreen === 'FCCPC' && <FCCPCScreen />}
      </View>

      {/* ── Bottom tab bar ─────────────────────────────────── */}
      <BottomTabBar active={activeScreen} onPress={navigate} />

      {/* ── Floating AI Chatbot ────────────────────────────── */}
      {botOpen && (
        <Animated.View style={[s.botWindow, {
          opacity: botOpacity,
          transform: [{ scale: botScale }, { translateY: botTransY }],
        }]}>
          <AIChatbot onClose={toggleBot} />
        </Animated.View>
      )}

      {/* FAB — visible on all screens */}
      <TouchableOpacity style={s.botFab} onPress={toggleBot} activeOpacity={0.85}>
        <View style={s.botFabInner}>
          {botOpen ? Icons.close(WHITE, 20) : Icons.bot(WHITE, 22)}
        </View>
        {!botOpen && (
          <View style={s.botFabBadge}>
            <Text style={s.botFabBadgeTxt}>AI</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Watermark (profile screen)
  wm: { position:'absolute',alignSelf:'center',top:'18%',fontSize:Platform.OS==='web'?120:68,fontWeight:'900',color:TEAL+'07',letterSpacing:-4,textAlign:'center',width:'100%',zIndex:0 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 14 : Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BORDER,
    zIndex: 10,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  topBarSpacer:     { width: 40 },
  topBarLogo:       { fontSize: 15, fontWeight: '900', color: DARK, letterSpacing: 1.5 },
  topBarTitle:      { fontSize: 15, fontWeight: '800', color: DARK },
  topBarAvatarBtn:  { width: 38, height: 38, borderRadius: 19, backgroundColor: TEAL + '18', borderWidth: 1.5, borderColor: TEAL + '44', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  topBarAvatarImg:  { width: 38, height: 38, borderRadius: 19 },
  topBarAvatarTxt:  { fontSize: 13, fontWeight: '900', color: TEAL_DARK },

  // Screen content
  screenContent: { flex: 1 },

  // Profile screen
  profileScroll:    { paddingBottom: 40 },
  profileHero:      { alignItems:'center',paddingTop:32,paddingBottom:24,marginHorizontal:16,marginBottom:16,backgroundColor:WHITE,borderRadius:20,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:4},shadowOpacity:0.08,shadowRadius:16,elevation:4 },
  profileAvatar:        { width:88,height:88,borderRadius:44,overflow:'hidden',alignItems:'center',justifyContent:'center',marginBottom:12 },
  profileAvatarImg:     { width:88,height:88,borderRadius:44 },
  profileAvatarInitials:{ width:88,height:88,borderRadius:44,alignItems:'center',justifyContent:'center' },
  profileAvatarTxt:     { fontSize:32,fontWeight:'900',color:WHITE },
  editProfileBtn:       { marginTop:14,paddingHorizontal:24,paddingVertical:9,borderRadius:10,borderWidth:1.5,borderColor:TEAL,backgroundColor:'transparent' },
  editProfileBtnTxt:    { color:TEAL,fontWeight:'700',fontSize:14 },
  profileName:      { fontSize:22,fontWeight:'800',color:DARK,marginBottom:4 },
  profileEmail:     { fontSize:13,color:MID,marginBottom:12 },
  activeBadge:      { backgroundColor:'#F0FFF4',borderWidth:1,borderColor:'#68D391',paddingHorizontal:14,paddingVertical:5,borderRadius:20 },
  activeBadgeTxt:   { color:'#276749',fontSize:12,fontWeight:'700' },
  infoCard:         { marginHorizontal:16,marginBottom:14,backgroundColor:WHITE,borderRadius:16,padding:18,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  infoCardTitle:    { fontSize:14,fontWeight:'800',color:DARK,marginBottom:14 },
  infoRow:          { flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:11 },
  infoLabel:        { fontSize:13,color:MID,fontWeight:'500' },
  infoValue:        { fontSize:13,color:DARK,fontWeight:'600',maxWidth:'55%',textAlign:'right' },
  divider:          { height:1,backgroundColor:LIGHT_BORDER },
  verifyPill:       { paddingHorizontal:8,paddingVertical:4,borderRadius:10,borderWidth:1 },
  verifyPillTxt:    { fontSize:10,fontWeight:'700' },

  // FCCPC card in profile
  fccpcCard:     { flexDirection:'row',alignItems:'center',marginHorizontal:16,marginBottom:14,backgroundColor:WHITE,borderRadius:16,padding:18,borderWidth:1,borderColor:'#FECACA',shadowColor:'#C53030',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2,gap:12 },
  fccpcIconWrap: { width:42,height:42,borderRadius:12,backgroundColor:'#FFF5F5',borderWidth:1,borderColor:'#FECACA',alignItems:'center',justifyContent:'center' },
  fccpcCardTitle:{ fontSize:14,fontWeight:'800',color:'#9B1C1C',marginBottom:2 },
  fccpcCardSub:  { fontSize:12,color:MID },
  fccpcArrow:    { fontSize:22,fontWeight:'700',color:'#C53030' },

  signOutBtn: { marginHorizontal:16,marginBottom:32,paddingVertical:15,borderRadius:12,borderWidth:1.5,borderColor:LIGHT_BORDER,alignItems:'center',backgroundColor:WHITE },
  signOutTxt: { color:MID,fontSize:15,fontWeight:'700' },

  // Reputation card
  reputCard:    { marginHorizontal:16,marginBottom:14,backgroundColor:WHITE,borderRadius:16,padding:18,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  reputTitle:   { fontSize:14,fontWeight:'800',color:DARK,marginBottom:14 },
  reputRow:     { flexDirection:'row',alignItems:'center',justifyContent:'space-around',marginBottom:12 },
  reputItem:    { alignItems:'center',gap:4 },
  reputNum:     { fontSize:26,fontWeight:'900',color:TEAL_DEEP },
  reputLbl:     { fontSize:10,color:MID,fontWeight:'500' },
  reputDivider: { width:1,height:40,backgroundColor:LIGHT_BORDER },
  reputStars:   { flexDirection:'row',gap:1 },
  reputHint:    { fontSize:11,color:MID,textAlign:'center',marginTop:4,fontStyle:'italic' },
  reputBadge:   { marginTop:10,alignSelf:'center',paddingHorizontal:16,paddingVertical:6,borderRadius:20,backgroundColor:'#F0FFF4',borderWidth:1,borderColor:'#68D39155' },
  reputBadgeTxt:{ fontSize:12,fontWeight:'800',color:'#276749' },

  // Order history card
  historyCard:  { marginHorizontal:16,marginBottom:14,backgroundColor:WHITE,borderRadius:16,padding:18,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  historyRow:   { flexDirection:'row',alignItems:'center',gap:12,paddingVertical:10 },
  historyIcon:  { width:36,height:36,borderRadius:10,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center' },
  historyName:  { fontSize:13,fontWeight:'700',color:DARK,marginBottom:2 },
  historyMeta:  { fontSize:11,color:MID,fontWeight:'500' },
  historyDate:  { fontSize:11,color:MID },
  historyMore:  { textAlign:'center',color:MID,fontSize:12,marginTop:10,fontWeight:'600' },

  // AI chatbot FAB + window
  botFab:         { position:'absolute',bottom:84,right:20,zIndex:50,shadowColor:TEAL_DARK,shadowOffset:{width:0,height:6},shadowOpacity:0.35,shadowRadius:16,elevation:12 },
  botFabInner:    { width:54,height:54,borderRadius:27,backgroundColor:TEAL_DARK,alignItems:'center',justifyContent:'center' },
  botFabBadge:    { position:'absolute',top:-2,right:-2,backgroundColor:'#FF6B6B',borderRadius:10,paddingHorizontal:5,paddingVertical:2,borderWidth:2,borderColor:WHITE },
  botFabBadgeTxt: { fontSize:9,fontWeight:'900',color:WHITE },
  botWindow:      { position:'absolute',bottom:148,right:16,width:Platform.OS==='web'?380:(SCREEN_WIDTH-32),height:Platform.OS==='web'?520:480,backgroundColor:WHITE,borderRadius:20,shadowColor:'#000',shadowOffset:{width:0,height:12},shadowOpacity:0.2,shadowRadius:32,elevation:20,zIndex:49,overflow:'hidden',borderWidth:1,borderColor:LIGHT_BORDER },
});

// ── Bottom tab bar styles ────────────────────────────────────────
const tab = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: LIGHT_BORDER,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 16,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
    paddingTop: 2,
  },
  activePill: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: TEAL_DARK,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: TEAL + '18',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: MID,
  },
  labelActive: {
    color: TEAL_DARK,
    fontWeight: '800',
  },
});

// ── Home screen styles ───────────────────────────────────────────
const hs = StyleSheet.create({
  scroll: { paddingBottom: 40 },

  // Hero
  hero: {
    margin: 16,
    marginTop: 20,
    backgroundColor: TEAL_DEEP,
    borderRadius: 24,
    padding: 24,
    shadowColor: TEAL_DEEP,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  heroTop:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroGreeting: { fontSize: 13, color: WHITE + '88', fontWeight: '500', marginBottom: 2 },
  heroName:     { fontSize: 26, fontWeight: '900', color: WHITE, letterSpacing: -0.5 },
  heroTagline:  { fontSize: 13, color: WHITE + 'BB', lineHeight: 20, marginBottom: 24 },

  avatarWrap:   { width: 52, height: 52, borderRadius: 26, backgroundColor: WHITE + '22', borderWidth: 2, borderColor: WHITE + '44', alignItems: 'center', justifyContent: 'center', marginLeft: 12, overflow: 'hidden' },
  avatarImg:    { width: 52, height: 52, borderRadius: 26 },
  avatarTxt:    { fontSize: 18, fontWeight: '900', color: WHITE },

  // Radar + CTA
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  radarRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: WHITE + '60',
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: WHITE + '22',
    borderWidth: 1,
    borderColor: WHITE + '44',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  heroBtnPulse: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ADE80' + '50', left: 22 },
  heroBtnDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  heroBtnTxt:   { flex: 1, color: WHITE, fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },

  // 2×2 action grid — CARD_W ensures exactly 2 columns on all screen sizes
  gridWrapper:  { alignItems: 'center', marginBottom: 16 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, justifyContent: 'center' },
  actionCard:   { borderRadius: 18, padding: 18, gap: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 },
  actionIconWrap:{ width: 44, height: 44, borderRadius: 13, backgroundColor: WHITE + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionLabel:  { fontSize: 14, fontWeight: '800', color: WHITE },
  actionSub:    { fontSize: 11, color: WHITE + 'BB', lineHeight: 16 },

  // Savings calculator
  calcCard:     { marginHorizontal: 16, marginBottom: 16, backgroundColor: WHITE, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: LIGHT_BORDER, shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  calcHeader:   { marginBottom: 18 },
  calcTitle:    { fontSize: 17, fontWeight: '900', color: DARK },
  calcSub:      { fontSize: 12, color: MID },
  calcLabel:    { fontSize: 11, fontWeight: '700', color: MID, marginBottom: 10, textTransform: 'uppercase' as any, letterSpacing: 0.8 },

  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: LIGHT_BORDER, backgroundColor: BG },
  chipActive:   { backgroundColor: TEAL_DEEP, borderColor: TEAL_DEEP },
  chipTxt:      { fontSize: 13, fontWeight: '700', color: MID },
  chipTxtActive:{ color: WHITE },

  counterRow:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn:    { width: 44, height: 44, borderRadius: 22, backgroundColor: TEAL + '15', borderWidth: 1.5, borderColor: TEAL + '40', alignItems: 'center', justifyContent: 'center' },
  counterBtnTxt: { fontSize: 22, fontWeight: '700', color: TEAL_DEEP, lineHeight: 26 },
  counterValWrap:{ alignItems: 'center' },
  counterVal:    { fontSize: 34, fontWeight: '900', color: DARK, lineHeight: 38 },
  counterValLbl: { fontSize: 11, color: MID, fontWeight: '500' },

  calcResult:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, backgroundColor: TEAL_DEEP + '09', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: TEAL + '22' },
  calcResultLbl: { fontSize: 12, color: MID, fontWeight: '600', marginBottom: 4 },
  calcResultAmt: { fontSize: 34, fontWeight: '900', color: TEAL_DEEP },
  saveBadge:     { backgroundColor: '#ECFDF5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#6EE7B7' },
  saveBadgeTxt:  { fontSize: 15, fontWeight: '900', color: '#065F46' },

  calcCta:    { marginTop: 14, backgroundColor: TEAL_DARK, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  calcCtaTxt: { color: WHITE, fontWeight: '800', fontSize: 14 },

  // Match notification banner
  matchBanner:      { marginHorizontal:16,marginTop:16,marginBottom:4,backgroundColor:TEAL_DEEP,borderRadius:14,padding:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,shadowColor:TEAL_DEEP,shadowOffset:{width:0,height:4},shadowOpacity:0.25,shadowRadius:10,elevation:6 },
  matchBannerLeft:  { flex:1,flexDirection:'row',alignItems:'center',gap:10 },
  matchBannerDot:   { width:8,height:8,borderRadius:4,backgroundColor:'#4ADE80' },
  matchBannerTitle: { fontSize:13,fontWeight:'800',color:WHITE,marginBottom:2 },
  matchBannerSub:   { fontSize:11,color:WHITE+'BB' },
  matchBannerJoin:  { paddingHorizontal:12,paddingVertical:7,borderRadius:10,backgroundColor:WHITE+'22',borderWidth:1,borderColor:WHITE+'33' },
  matchBannerJoinTxt:{ fontSize:12,fontWeight:'800',color:WHITE },
  matchBannerClose: { width:28,height:28,borderRadius:14,backgroundColor:WHITE+'18',alignItems:'center',justifyContent:'center' },

  // Deals Near You
  dealsSection:       { marginHorizontal:16,marginBottom:16 },
  dealsSectionHeader: { flexDirection:'row',alignItems:'flex-end',marginBottom:14 },
  dealsSectionTitle:  { fontSize:17,fontWeight:'900',color:DARK,marginBottom:2 },
  dealsSectionSub:    { fontSize:12,color:MID },
  dealsViewAll:       { paddingHorizontal:12,paddingVertical:6,borderRadius:10,backgroundColor:TEAL+'12',borderWidth:1,borderColor:TEAL+'30' },
  dealsViewAllTxt:    { fontSize:12,fontWeight:'700',color:TEAL_DEEP },
  dealCard:           { width:180,backgroundColor:WHITE,borderRadius:16,padding:14,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  dealCardTop:        { flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:6 },
  dealCardMarket:     { fontSize:12,fontWeight:'800',color:TEAL_DEEP },
  dealTimePill:       { paddingHorizontal:7,paddingVertical:3,borderRadius:10,backgroundColor:'#FEF3C7',borderWidth:1,borderColor:'#F59E0B44' },
  dealTimeTxt:        { fontSize:9,fontWeight:'700',color:'#92400E' },
  dealCardName:       { fontSize:14,fontWeight:'800',color:DARK,marginBottom:6,lineHeight:18 },
  dealCardMeta:       { marginBottom:10 },
  dealCardMembers:    { fontSize:11,color:MID,fontWeight:'500' },
  dealCardJoinBtn:    { backgroundColor:TEAL_DARK,borderRadius:10,paddingVertical:8,alignItems:'center' },
  dealCardJoinTxt:    { fontSize:12,fontWeight:'800',color:WHITE },
});

// ── AI Chatbot styles ────────────────────────────────────────────
const bot = StyleSheet.create({
  container:    { flex:1,backgroundColor:WHITE },
  header:       { flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,backgroundColor:TEAL_DARK },
  headerLeft:   { flexDirection:'row',alignItems:'center',gap:10 },
  botAvatar:    { width:36,height:36,borderRadius:18,backgroundColor:WHITE+'22',alignItems:'center',justifyContent:'center' },
  headerTitle:  { fontSize:14,fontWeight:'800',color:WHITE },
  onlineRow:    { flexDirection:'row',alignItems:'center',gap:4,marginTop:2 },
  onlineDot:    { width:6,height:6,borderRadius:3,backgroundColor:'#4ADE80' },
  onlineTxt:    { fontSize:10,color:WHITE+'CC',fontWeight:'500' },
  closeBtn:     { width:32,height:32,borderRadius:16,backgroundColor:WHITE+'22',alignItems:'center',justifyContent:'center' },
  messages:        { flex:1 },
  messagesContent: { padding:14,gap:10 },
  msgRow:     { flexDirection:'row',alignItems:'flex-end',gap:8 },
  msgRowUser: { flexDirection:'row-reverse' },
  msgAvatar:  { width:28,height:28,borderRadius:14,backgroundColor:TEAL+'20',alignItems:'center',justifyContent:'center',marginBottom:2 },
  bubble:        { maxWidth:'78%',borderRadius:16,paddingHorizontal:13,paddingVertical:9 },
  bubbleBot:     { backgroundColor:BG,borderWidth:1,borderColor:LIGHT_BORDER,borderBottomLeftRadius:4 },
  bubbleUser:    { backgroundColor:TEAL_DARK,borderBottomRightRadius:4 },
  bubbleTxt:     { fontSize:13,lineHeight:20 },
  bubbleTxtBot:  { color:DARK },
  bubbleTxtUser: { color:WHITE },
  typingDots:    { flexDirection:'row',gap:4,alignItems:'center' },
  typingDot:     { width:7,height:7,borderRadius:4,backgroundColor:TEAL+'60' },
  suggestions:   { flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:4 },
  suggBtn:       { paddingHorizontal:12,paddingVertical:6,borderRadius:16,backgroundColor:TEAL+'12',borderWidth:1,borderColor:TEAL+'30' },
  suggTxt:       { fontSize:11,fontWeight:'600',color:TEAL_DEEP },
  inputRow:      { flexDirection:'row',alignItems:'center',gap:8,padding:12,borderTopWidth:1,borderTopColor:LIGHT_BORDER,backgroundColor:WHITE },
  input:         { flex:1,paddingHorizontal:14,paddingVertical:10,borderRadius:22,backgroundColor:BG,borderWidth:1,borderColor:LIGHT_BORDER,fontSize:13,color:DARK },
  sendBtn:       { width:40,height:40,borderRadius:20,backgroundColor:TEAL_DARK,alignItems:'center',justifyContent:'center' },
});
