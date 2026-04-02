import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Platform, ScrollView, TextInput,
} from 'react-native';
import { supabase } from '../lib/supabase';
import MapScreenComponent from './MapScreen';
import GroupOrdersScreen from './GroupOrdersScreen';
import ChatScreen from './ChatScreen';
import FCCPCScreen from './FCCPCScreen';

const TEAL       = '#17B8B8';
const TEAL_DARK  = '#0D8F8F';
const TEAL_DEEP  = '#0A6E6E';
const WHITE      = '#FFFFFF';
const DARK       = '#062020';
const MID        = '#3A7070';
const BG         = '#F8FEFE';
const LIGHT_BORDER = '#C8E8E8';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(300, SCREEN_WIDTH * 0.78);

type ScreenName = 'Home' | 'Map' | 'Groups' | 'Chat' | 'Profile' | 'FCCPC';

// ══════════════════════════════════════════════════════════════
// SVG ICON SYSTEM
// ══════════════════════════════════════════════════════════════
function Svg({ size = 24, stroke = DARK, fill = 'none', children, style }: {
  size?: number; stroke?: string; fill?: string; children: any; style?: any;
}) {
  if (Platform.OS !== 'web') return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={stroke} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', ...style }}>
      {children}
    </svg>
  ) as any;
}

const Icons = {
  home:    (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></Svg>,
  map:     (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" stroke={s} fill="none"/></Svg>,
  groups:  (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" stroke={s} fill="none"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></Svg>,
  chat:    (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></Svg>,
  profile: (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4" stroke={s} fill="none"/></Svg>,
  cart:    (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></Svg>,
  savings: (s: string, sz=24) => <Svg size={sz} stroke={s}><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></Svg>,
  orders:  (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></Svg>,
  signout: (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>,
  send:    (s: string, sz=16) => <Svg size={sz} stroke={s}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke={s} fill={s}/></Svg>,
  close:   (s: string, sz=18) => <Svg size={sz} stroke={s} style={{ strokeWidth: 2.5 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>,
  bot:     (s: string, sz=20) => <Svg size={sz} stroke={s}><rect x="3" y="8" width="18" height="12" rx="3" fill="none"/><path d="M9 8V6a3 3 0 016 0v2"/><circle cx="9" cy="14" r="1.2" fill={s} stroke="none"/><circle cx="15" cy="14" r="1.2" fill={s} stroke="none"/><line x1="9" y1="17.5" x2="15" y2="17.5"/><line x1="12" y1="3" x2="12" y2="5"/></Svg>,
  tip:     (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6L15 17H9l-.7-2C6.3 13.7 5 11.5 5 9a7 7 0 017-7z"/></Svg>,
  check:   (s: string, sz=16) => <Svg size={sz} stroke={s}><polyline points="20 6 9 17 4 12"/></Svg>,
  activity:(s: string, sz=24) => <Svg size={sz} stroke={s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Svg>,
  shield:  (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>,
  market:  (s: string, sz=24) => <Svg size={sz} stroke={s}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><rect x="9" y="12" width="6" height="9" rx="1"/></Svg>,
};

// ══════════════════════════════════════════════════════════════
// MAP BACKGROUND
// ══════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════
// AI CHATBOT
// ══════════════════════════════════════════════════════════════
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
  if (q.includes('market') || q.includes('jumia') || q.includes('konga') || q.includes('support'))
    return "SPLITWI$E supports: **Jumia, Konga, Amazon, Jiji, Temu, Aliexpress, Shoprite, and Slot**. You can also add custom markets! 🛒";
  if (q.includes('split') || q.includes('work') || q.includes('how'))
    return "Here's how SPLITWI$E works:\n\n1️⃣ **Go to Map** — select your market & set radius\n2️⃣ **Go Live** — appear on the map\n3️⃣ **Connect** — tap a nearby shopper pin\n4️⃣ **Split** — divide the delivery fee equally\n\nExample: ₦2,000 delivery ÷ 5 people = ₦400 each! 💰";
  if (q.includes('save') || q.includes('much') || q.includes('money') || q.includes('cost'))
    return "Save up to **80% on delivery fees**! 🎉\n\n• Solo: ₦2,000\n• 5 people: ₦400 each\n• 10 people: ₦200 each\n\nThe more members, the more everyone saves!";
  if (q.includes('live') || q.includes('map') || q.includes('appear'))
    return "To go live:\n\n1. Tap **Nearby Map**\n2. Select your market\n3. Set your radius (1-20km)\n4. Tap **Go Live** 🟢\n\nYou'll appear as a pin and nearby shoppers can find you!";
  if (q.includes('group') || q.includes('create') || q.includes('chat') || q.includes('join'))
    return "To create or join a group:\n\n• **On the map**: tap a nearby shopper pin → group chat created instantly\n• **Group Orders**: create a new group and invite others\n• Groups work best with 3-10 people from the same market! 👥";
  if (q.includes('pay') || q.includes('payment'))
    return "SPLITWI$E focuses on **coordination, not payments**. Payment coordination is done directly between members via bank transfer, cash, etc. 💳";
  if (q.includes('hello') || q.includes('hi') || q.includes('hey'))
    return "Hello! 👋 Welcome to SPLITWI$E! Ask me about:\n• How group splitting works\n• Supported markets\n• How to go live on the map\n• How much you can save!";
  return "SPLITWI$E helps Nigerians save on delivery fees by connecting nearby shoppers from the same market.\n\n• Go live on the map to find nearby shoppers\n• Split delivery fees with your group\n• The more members, the more you save! 😊";
}

function AIChatbot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! 👋 I'm the SPLITWI$E assistant. I can help you understand how group ordering works, answer e-commerce questions, or help you save more on deliveries. What would you like to know?" }
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

// ══════════════════════════════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════════════════════════════
function HomeScreen({ profile, email, onNavigate }: {
  profile: any | null; email: string; onNavigate: (s: ScreenName) => void;
}) {
  const getInitials = () => {
    if (!profile) return '??';
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { num:'₦0', lbl:'Total\nSaved',   icon: Icons.savings(TEAL_DEEP, 15), color: TEAL_DEEP  },
    { num:'0',  lbl:'Groups\nJoined', icon: Icons.groups('#6D28D9', 15),  color: '#6D28D9'  },
    { num:'0',  lbl:'Orders\nSplit',  icon: Icons.orders('#B45309', 15),  color: '#B45309'  },
  ];

  const quickActions = [
    { icon: Icons.map(TEAL_DARK, 22),    label:'Find\nNearby',   sub:'See shoppers on map',      bg:'#E6F9F9', stroke:TEAL_DARK,  screen:'Map'    as ScreenName },
    { icon: Icons.groups('#6D28D9', 22), label:'Create\nGroup',  sub:'Start a group order',      bg:'#EDE9FE', stroke:'#6D28D9', screen:'Groups' as ScreenName },
    { icon: Icons.cart('#B45309', 22),   label:'Browse\nOrders', sub:'View active group orders', bg:'#FEF3C7', stroke:'#B45309', screen:'Groups' as ScreenName },
    { icon: Icons.chat('#065F46', 22),   label:'Open\nChat',     sub:'Chat with your group',     bg:'#ECFDF5', stroke:'#065F46', screen:'Chat'   as ScreenName },
    { icon: Icons.shield('#C53030', 22), label:'Report\nScam',   sub:'Contact FCCPC for help',   bg:'#FFF5F5', stroke:'#C53030', screen:'FCCPC'  as ScreenName },
  ];

  const tips = [
    { icon: Icons.tip(TEAL_DARK, 24),  txt:'Select a market and go live on the map to find nearby shoppers instantly.' },
    { icon: Icons.cart('#B45309', 24), txt:'Groups of 5 can split a ₦2,000 delivery to just ₦400 each.' },
    { icon: Icons.map(TEAL_DARK, 24),  txt:'The closer your group, the faster and cheaper your combined delivery.' },
  ];

  const markets = ['Jumia','Konga','Amazon','Jiji','Temu','Aliexpress','Slot','& many more...'];

  // Inject CSS keyframe for web — true seamless loop, no JS timer
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = document.createElement('style');
    el.id = 'sw-marquee';
    el.textContent = `@keyframes swMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // Native fallback: Animated loop measured from real layout
  const marqueeX = useRef(new Animated.Value(0)).current;
  const marqueeAnim = useRef<Animated.CompositeAnimation | null>(null);
  const halfWidth = useRef(0);
  const onMarqueeLayout = (e: any) => {
    if (Platform.OS === 'web') return;
    const w = e.nativeEvent.layout.width / 2;
    if (halfWidth.current === 0 && w > 0) {
      halfWidth.current = w;
      marqueeX.setValue(0);
      marqueeAnim.current = Animated.loop(
        Animated.timing(marqueeX, { toValue: -w, duration: w * 14, useNativeDriver: false })
      );
      marqueeAnim.current.start();
    }
  };
  useEffect(() => () => { marqueeAnim.current?.stop(); }, []);

  return (
    <ScrollView style={{flex:1}} contentContainerStyle={s.homeScroll} showsVerticalScrollIndicator={false}>
      <MapBg/>
      <Text style={s.wm}>SPLITWI$E</Text>

      <View style={s.heroCard}>
        <View style={s.heroLeft}>
          <Text style={s.heroGreeting}>{greeting},</Text>
          <Text style={s.heroName}>{profile?.display_name || profile?.first_name || 'Shopper'}</Text>
          <Text style={s.heroSub}>Ready to split & save today?</Text>
        </View>
        <View style={s.heroAvatar}>
          {profile?.avatar_emoji
            ? <Text style={{fontSize:30}}>{profile.avatar_emoji}</Text>
            : <Text style={s.heroAvatarTxt}>{getInitials()}</Text>
          }
        </View>
      </View>

      <View style={s.statsRow}>
        {stats.map((st, i) => (
          <View key={i} style={s.statCard}>
            <View style={s.statIconWrap}>{st.icon}</View>
            <Text style={[s.statNum, {color:st.color}]}>{st.num}</Text>
            <Text style={s.statLbl}>{st.lbl}</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionHead}>Quick Actions</Text>
      <View style={s.quickGrid}>
        {quickActions.map((a, i) => (
          <TouchableOpacity key={i} style={[s.quickCard, {backgroundColor:a.bg}]}
            onPress={() => onNavigate(a.screen)} activeOpacity={0.75}>
            <View style={[s.quickIconBox, {borderColor:a.stroke+'30'}]}>{a.icon}</View>
            <Text style={[s.quickLbl, {color:a.stroke}]}>{a.label}</Text>
            <Text style={[s.quickSublbl, {color:a.stroke+'AA'}]}>{a.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionHead}>Nearby Activity</Text>
      <View style={s.activityCard}>
        <View style={s.activityEmpty}>
          <View style={s.activityEmptyIcon}>{Icons.activity(TEAL_DARK, 20)}</View>
          <View style={{flex:1}}>
            <Text style={s.activityTitle}>No activity nearby yet</Text>
            <Text style={s.activitySub}>Go live on the map to find nearby shoppers</Text>
          </View>
          <TouchableOpacity style={s.joinBtn} onPress={() => onNavigate('Map')}>
            <Text style={s.joinBtnTxt}>View Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={s.sectionHead}>How It Works</Text>
      <View style={s.howCard}>
        {[
          { icon:Icons.map(WHITE,14),     title:'Go Live on Map', desc:'Select a market and tap Go Live to show up on the map.' },
          { icon:Icons.groups(WHITE,14),  title:'Find & Connect', desc:'Tap a nearby shopper pin to create a group chat.' },
          { icon:Icons.savings(WHITE,14), title:'Split & Save',   desc:'Pool orders, place one delivery, split the fee.' },
        ].map((item, i) => (
          <View key={i}>
            <View style={s.howRow}>
              <View style={s.howStep}>{item.icon}</View>
              <View style={{flex:1}}>
                <Text style={s.howTitle}>{item.title}</Text>
                <Text style={s.howDesc}>{item.desc}</Text>
              </View>
            </View>
            {i < 2 && <View style={[s.divider, {marginLeft:52}]}/>}
          </View>
        ))}
      </View>

      <Text style={s.sectionHead}>Savings Tips</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tipsScroll}>
        {tips.map((t, i) => (
          <View key={i} style={s.tipCard}>
            <View style={s.tipIconWrap}>{t.icon}</View>
            <Text style={s.tipTxt}>{t.txt}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={s.sectionHead}>Supported Markets</Text>
      <View style={s.marketsMarqueeWrap}>
        {Platform.OS === 'web' ? (
          <View style={[s.marketsMarqueeRow, {
            animationName: 'swMarquee',
            animationDuration: '18s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          } as any]}>
            {[...markets, ...markets].map((m, i) => (
              m === '& many more...'
                ? <View key={i} style={[s.marketPill, s.marketPillMore]}><Text style={s.marketPillMoreTxt}>{m}</Text></View>
                : <View key={i} style={s.marketPill}>
                    <View style={s.marketPillIcon}>{Icons.market(TEAL_DEEP, 11)}</View>
                    <Text style={s.marketPillTxt}>{m}</Text>
                  </View>
            ))}
          </View>
        ) : (
          <Animated.View onLayout={onMarqueeLayout} style={[s.marketsMarqueeRow, { transform: [{ translateX: marqueeX }] }]}>
            {[...markets, ...markets].map((m, i) => (
              m === '& many more...'
                ? <View key={i} style={[s.marketPill, s.marketPillMore]}><Text style={s.marketPillMoreTxt}>{m}</Text></View>
                : <View key={i} style={s.marketPill}>
                    <View style={s.marketPillIcon}>{Icons.market(TEAL_DEEP, 11)}</View>
                    <Text style={s.marketPillTxt}>{m}</Text>
                  </View>
            ))}
          </Animated.View>
        )}
      </View>

      <Text style={s.sectionHead}>Account Status</Text>
      <View style={s.verifyCard}>
        {[
          { label:'Email', value: email,                 done: true           },
          { label:'Phone', value: profile?.phone || '—', done: !!profile?.phone },
        ].map((item, i, arr) => (
          <View key={i}>
            <View style={s.verifyRow}>
              <Text style={s.verifyLabel}>{item.label}</Text>
              <Text style={s.verifyValue} numberOfLines={1}>{item.value}</Text>
              <View style={[s.verifyPill,{
                backgroundColor: item.done ? '#F0FFF4':'#FFF8E6',
                borderColor:     item.done ? '#68D391':'#F6AD55',
              }]}>
                <View style={{flexDirection:'row',alignItems:'center',gap:3}}>
                  {item.done ? Icons.check('#276749',11) : null}
                  <Text style={[s.verifyPillTxt,{color:item.done?'#276749':'#B7791F'}]}>
                    {item.done ? 'Done' : '⏳ Pending'}
                  </Text>
                </View>
              </View>
            </View>
            {i < arr.length-1 && <View style={s.divider}/>}
          </View>
        ))}
      </View>
      <View style={{height:100}}/>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ══════════════════════════════════════════════════════════════
function ProfileScreen({ profile, email, onSignOut }: {
  profile: any | null; email: string; onSignOut: () => void;
}) {
  const getInitials = () => {
    if (!profile) return '??';
    return `${profile.first_name?.[0]||''}${profile.last_name?.[0]||''}`.toUpperCase();
  };

  return (
    <ScrollView style={{flex:1}} contentContainerStyle={s.profileScroll} showsVerticalScrollIndicator={false}>
      <MapBg/>
      <Text style={s.wm}>SPLITWI$E</Text>

      <View style={s.profileHero}>
        <View style={s.profileAvatar}>
          {profile?.avatar_emoji
            ? <Text style={{fontSize:40}}>{profile.avatar_emoji}</Text>
            : <Text style={s.profileAvatarTxt}>{getInitials()}</Text>
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
                    {item.done?'Verified':'⏳ Pending'}
                  </Text>
                </View>
              </View>
            </View>
            {i < arr.length-1 && <View style={s.divider}/>}
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.signOutBtn} onPress={onSignOut}>
        <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
          {Icons.signout(MID,18)}
          <Text style={s.signOutTxt}>Sign Out</Text>
        </View>
      </TouchableOpacity>
      <View style={{height:100}}/>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
// NAV ITEMS
// ══════════════════════════════════════════════════════════════
const navItems: { screen: ScreenName; icon: (active: boolean) => any; label: string; accent?: string }[] = [
  { screen:'Home',    icon: a => Icons.home(   a?TEAL_DARK:MID, 18), label:'Home'            },
  { screen:'Map',     icon: a => Icons.map(    a?TEAL_DARK:MID, 18), label:'Nearby Map'      },
  { screen:'Groups',  icon: a => Icons.groups( a?TEAL_DARK:MID, 18), label:'Group Orders'    },
  { screen:'Chat',    icon: a => Icons.chat(   a?TEAL_DARK:MID, 18), label:'In-App Chat'     },
  { screen:'Profile', icon: a => Icons.profile(a?TEAL_DARK:MID, 18), label:'My Profile'      },
  { screen:'FCCPC',   icon: a => Icons.shield( a?'#C53030':'#E53E3E', 18), label:'Report a Scam', accent:'#C53030' },
];

// ══════════════════════════════════════════════════════════════
// DRAWER NAVIGATOR
// ══════════════════════════════════════════════════════════════
interface DrawerProps { onSignOut: () => void; }

export default function DrawerNavigator({ onSignOut }: DrawerProps) {
  const [activeScreen,  setActiveScreen]  = useState<ScreenName>('Home');
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [profile,       setProfile]       = useState<any|null>(null);
  const [email,         setEmail]         = useState('');
  const [activeChatId,  setActiveChatId]  = useState<string|undefined>(undefined);
  const [botOpen,       setBotOpen]       = useState(false);
  const botAnim     = useRef(new Animated.Value(0)).current;
  const drawerAnim  = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email || '');
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) setProfile(data);
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim,  { toValue:0, useNativeDriver:true, tension:65, friction:11 }),
      Animated.timing(overlayAnim, { toValue:1, duration:250, useNativeDriver:true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim,  { toValue:-DRAWER_WIDTH, useNativeDriver:true, tension:65, friction:11 }),
      Animated.timing(overlayAnim, { toValue:0, duration:200, useNativeDriver:true }),
    ]).start(() => setDrawerOpen(false));
  };

  const navigate = (screen: ScreenName) => { setActiveScreen(screen); closeDrawer(); };

  const toggleBot = () => {
    if (botOpen) {
      Animated.timing(botAnim, { toValue:0, duration:200, useNativeDriver:true })
        .start(() => setBotOpen(false));
    } else {
      setBotOpen(true);
      Animated.spring(botAnim, { toValue:1, useNativeDriver:true, tension:80, friction:10 }).start();
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

  const screenTitles: Record<ScreenName,string> = {
    Home:'Dashboard', Map:'Nearby Map', Groups:'Group Orders',
    Chat:'In-App Chat', Profile:'My Profile', FCCPC:'Consumer Protection',
  };

  const botScale   = botAnim.interpolate({ inputRange:[0,1], outputRange:[0.85,1] });
  const botOpacity = botAnim;
  const botTransY  = botAnim.interpolate({ inputRange:[0,1], outputRange:[20,0] });

  // Shared sidebar contents
  const SidebarContents = () => (
    <>
      <View style={s.drawerHeader}>
        <View style={s.drawerMapBg}>
          {Array.from({length:8}).map((_,i)=>(
            <View key={`h${i}`} style={[s.dgH,{top:`${(i/8)*100}%` as any}]}/>
          ))}
          <View style={s.drawerFrost}/>
        </View>
        <View style={s.drawerAvatar}>
          {profile?.avatar_emoji
            ? <Text style={{fontSize:30}}>{profile.avatar_emoji}</Text>
            : <Text style={s.drawerAvatarTxt}>{getInitials()}</Text>
          }
        </View>
        <Text style={s.drawerName}>{profile?.display_name||`${profile?.first_name||''} ${profile?.last_name||''}`}</Text>
        <Text style={s.drawerEmail}>{email}</Text>
        <View style={s.drawerBadge}><Text style={s.drawerBadgeTxt}>Active</Text></View>
      </View>

      <ScrollView style={s.drawerNav} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          const isRed = item.screen === 'FCCPC';
          return (
            <TouchableOpacity key={item.screen}
              style={[s.navItem, isActive && (isRed ? s.navItemActiveRed : s.navItemActive)]}
              onPress={() => navigate(item.screen)}>
              <View style={[s.navIconBox, isActive && {backgroundColor: isRed ? '#C5303018' : TEAL+'18'}]}>
                {item.icon(isActive)}
              </View>
              <Text style={[s.navLabel, isActive && (isRed ? s.navLabelActiveRed : s.navLabelActive)]}>
                {item.label}
              </Text>
              {isActive && <View style={[s.navActiveBar, isRed && {backgroundColor:'#C53030'}]}/>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={s.drawerFooter}>
        <TouchableOpacity style={s.drawerSignOut} onPress={handleSignOut}>
          {Icons.signout(MID, 16)}
          <Text style={s.drawerSignOutTxt}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={s.drawerVersion}>SPLITWI$E v1.0.0</Text>
      </View>
    </>
  );

  return (
    <View style={s.root}>
      <View style={s.main}>
        {/* Top bar */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={openDrawer} style={s.menuBtn}>
            <View style={s.menuLine}/>
            <View style={[s.menuLine,{width:18}]}/>
            <View style={s.menuLine}/>
          </TouchableOpacity>
          <Text style={s.topBarTitle}>{screenTitles[activeScreen]}</Text>
          <View style={s.topBarRight}>
            <Text style={s.topBarLogo}>SPLITWI<Text style={{color:TEAL_DARK}}>$</Text>E</Text>
          </View>
        </View>

        {/* Screens */}
        <View style={s.screenContent}>
          {activeScreen === 'Home' && (
            <HomeScreen profile={profile} email={email} onNavigate={navigate}/>
          )}
          {activeScreen === 'Map' && (
            <MapScreenComponent onOpenChat={handleOpenChat}/>
          )}
          {activeScreen === 'Groups' && (
            <GroupOrdersScreen onOpenChat={handleOpenChat}/>
          )}
          {activeScreen === 'Chat' && (
            <ChatScreen groupId={activeChatId}/>
          )}
          {activeScreen === 'Profile' && (
            <ProfileScreen profile={profile} email={email} onSignOut={handleSignOut}/>
          )}
          {activeScreen === 'FCCPC' && (
            <FCCPCScreen/>
          )}
        </View>
      </View>

      {/* Drawer overlay */}
      {drawerOpen && (
        <Animated.View style={[s.overlay,{opacity:overlayAnim}]} pointerEvents="auto">
          <TouchableOpacity style={{flex:1}} onPress={closeDrawer} activeOpacity={1}/>
        </Animated.View>
      )}

      {/* Sliding drawer */}
      <Animated.View style={[s.drawer,{transform:[{translateX:drawerAnim}]}]}>
        <SidebarContents/>
      </Animated.View>

      {/* Floating AI Chatbot */}
      {botOpen && (
        <Animated.View style={[s.botWindow,{
          opacity: botOpacity,
          transform: [{ scale: botScale }, { translateY: botTransY }],
        }]}>
          <AIChatbot onClose={toggleBot}/>
        </Animated.View>
      )}

      {/* FAB */}
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

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex:1, backgroundColor:BG },

  // Web layout
  mapBg:  { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F0FCFC',overflow:'hidden' },
  gH:     { position:'absolute',left:0,right:0,height:1,backgroundColor:'#17B8B80E' },
  gV:     { position:'absolute',top:0,bottom:0,width:1,backgroundColor:'#17B8B809' },
  pin:    { position:'absolute',width:20,height:20,alignItems:'center',justifyContent:'center' },
  pinR:   { position:'absolute',width:16,height:16,borderRadius:8,borderWidth:1,borderColor:TEAL+'22' },
  pinD:   { width:6,height:6,borderRadius:3,backgroundColor:TEAL+'40',borderWidth:1,borderColor:WHITE },
  frost:  { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F8FEFEFD' },
  wm:     { position:'absolute',alignSelf:'center',top:'18%',fontSize:Platform.OS==='web'?120:68,fontWeight:'900',color:TEAL+'07',letterSpacing:-4,textAlign:'center',width:'100%',zIndex:0 },

  main:          { flex:1 },
  topBar:        { flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingTop:Platform.OS==='web'?14:Platform.OS==='ios'?54:40,paddingBottom:14,backgroundColor:WHITE,borderBottomWidth:1,borderBottomColor:LIGHT_BORDER,zIndex:10,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:3 },
  menuBtn:       { gap:5,padding:4 },
  menuLine:      { width:22,height:2.5,borderRadius:2,backgroundColor:DARK },
  topBarTitle:   { flex:1,textAlign:'center',fontSize:16,fontWeight:'800',color:DARK,letterSpacing:0.3 },
  topBarRight:   { minWidth:80,alignItems:'flex-end' },
  topBarLogo:    { fontSize:13,fontWeight:'900',color:DARK,letterSpacing:1 },
  screenContent: { flex:1 },
  overlay:       { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(6,32,32,0.45)',zIndex:20 },

  drawer:          { position:'absolute',top:0,left:0,bottom:0,width:DRAWER_WIDTH,backgroundColor:WHITE,zIndex:30,shadowColor:'#000',shadowOffset:{width:4,height:0},shadowOpacity:0.15,shadowRadius:20,elevation:20 },
  drawerHeader:    { paddingTop:Platform.OS==='web'?24:Platform.OS==='ios'?54:40,paddingBottom:24,paddingHorizontal:24,backgroundColor:TEAL_DEEP,overflow:'hidden' },
  drawerMapBg:     { position:'absolute',top:0,left:0,right:0,bottom:0,overflow:'hidden' },
  dgH:             { position:'absolute',left:0,right:0,height:1,backgroundColor:'#FFFFFF15' },
  drawerFrost:     { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#0A6E6E88' },
  drawerAvatar:    { width:64,height:64,borderRadius:32,backgroundColor:WHITE+'33',borderWidth:2,borderColor:WHITE+'66',alignItems:'center',justifyContent:'center',marginBottom:12 },
  drawerAvatarTxt: { fontSize:22,fontWeight:'900',color:WHITE },
  drawerName:      { fontSize:17,fontWeight:'800',color:WHITE,marginBottom:3 },
  drawerEmail:     { fontSize:12,color:WHITE+'BB',marginBottom:10 },
  drawerBadge:     { backgroundColor:WHITE+'22',paddingHorizontal:10,paddingVertical:4,borderRadius:12,alignSelf:'flex-start' },
  drawerBadgeTxt:  { fontSize:11,color:WHITE,fontWeight:'600' },
  drawerNav:       { flex:1,paddingVertical:12 },
  navItem:         { flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:13,gap:12,position:'relative' },
  navItemActive:   { backgroundColor:TEAL+'08' },
  navIconBox:      { width:34,height:34,borderRadius:8,alignItems:'center',justifyContent:'center',backgroundColor:TEAL+'08' },
  navLabel:        { fontSize:14,fontWeight:'600',color:MID },
  navLabelActive:      { color:TEAL_DEEP,fontWeight:'800' },
  navItemActiveRed:    { backgroundColor:'#C5303008' },
  navLabelActiveRed:   { color:'#C53030',fontWeight:'800' },
  navActiveBar:    { position:'absolute',left:0,top:8,bottom:8,width:3,borderRadius:2,backgroundColor:TEAL_DARK },
  drawerFooter:    { padding:20,borderTopWidth:1,borderTopColor:LIGHT_BORDER },
  drawerSignOut:   { flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12,paddingHorizontal:16,borderRadius:10,borderWidth:1,borderColor:LIGHT_BORDER,marginBottom:12 },
  drawerSignOutTxt:{ fontSize:14,fontWeight:'700',color:MID },
  drawerVersion:   { fontSize:11,color:MID,textAlign:'center' },

  homeScroll:    { paddingBottom:40 },
  heroCard:      { margin:16,marginTop:20,padding:22,backgroundColor:TEAL_DEEP,borderRadius:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between',shadowColor:TEAL_DEEP,shadowOffset:{width:0,height:6},shadowOpacity:0.3,shadowRadius:16,elevation:6 },
  heroLeft:      { flex:1 },
  heroGreeting:  { fontSize:13,color:WHITE+'99',fontWeight:'500',marginBottom:2 },
  heroName:      { fontSize:22,fontWeight:'900',color:WHITE,marginBottom:4 },
  heroSub:       { fontSize:12,color:WHITE+'BB',marginBottom:14 },
  heroBtn:       { backgroundColor:WHITE+'22',paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:WHITE+'33',alignSelf:'flex-start' },
  heroBtnTxt:    { color:WHITE,fontSize:12,fontWeight:'700' },
  heroAvatar:    { width:56,height:56,borderRadius:28,backgroundColor:WHITE+'22',borderWidth:2,borderColor:WHITE+'44',alignItems:'center',justifyContent:'center',marginLeft:12 },
  heroAvatarTxt: { fontSize:20,fontWeight:'900',color:WHITE },

  statsRow:     { flexDirection:'row',gap:10,marginHorizontal:16,marginBottom:16 },
  statCard:     { flex:1,backgroundColor:WHITE,borderRadius:14,padding:14,alignItems:'center',borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  statIconWrap: { width:32,height:32,borderRadius:8,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center',marginBottom:6 },
  statNum:      { fontSize:20,fontWeight:'900',marginBottom:3 },
  statLbl:      { fontSize:9,color:MID,textAlign:'center',fontWeight:'500',lineHeight:13 },
  sectionHead:  { fontSize:15,fontWeight:'800',color:DARK,marginHorizontal:16,marginBottom:10,marginTop:6 },

  quickGrid:    { flexDirection:'row',flexWrap:'wrap',gap:10,marginHorizontal:16,marginBottom:16 },
  quickCard:    { width:'47%',borderRadius:16,padding:16,alignItems:'center',gap:6,borderWidth:1,borderColor:LIGHT_BORDER },
  quickIconBox: { width:50,height:50,borderRadius:14,backgroundColor:WHITE+'88',alignItems:'center',justifyContent:'center',borderWidth:1,marginBottom:2 },
  quickLbl:     { fontSize:13,fontWeight:'800',textAlign:'center',lineHeight:17 },
  quickSublbl:  { fontSize:10,textAlign:'center',lineHeight:14 },

  activityCard:      { marginHorizontal:16,marginBottom:10,backgroundColor:WHITE,borderRadius:14,overflow:'hidden',borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  activityEmpty:     { flexDirection:'row',alignItems:'center',gap:12,padding:16 },
  activityEmptyIcon: { width:40,height:40,borderRadius:10,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center' },
  activityTitle:     { fontSize:13,fontWeight:'700',color:DARK,marginBottom:2 },
  activitySub:       { fontSize:11,color:MID },
  joinBtn:           { backgroundColor:TEAL+'15',paddingHorizontal:12,paddingVertical:7,borderRadius:8,borderWidth:1,borderColor:TEAL+'40' },
  joinBtnTxt:        { color:TEAL_DEEP,fontSize:12,fontWeight:'700' },

  howCard:    { marginHorizontal:16,marginBottom:16,backgroundColor:WHITE,borderRadius:14,padding:16,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  howRow:     { flexDirection:'row',alignItems:'flex-start',gap:14,paddingVertical:12 },
  howStep:    { width:32,height:32,borderRadius:16,backgroundColor:TEAL_DARK,alignItems:'center',justifyContent:'center',marginTop:2 },
  howTitle:   { fontSize:13,fontWeight:'800',color:DARK,marginBottom:3 },
  howDesc:    { fontSize:12,color:MID,lineHeight:18 },

  tipsScroll:   { paddingHorizontal:16,paddingBottom:4 },
  tipCard:      { width:200,backgroundColor:WHITE,borderRadius:14,padding:16,marginRight:10,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  tipIconWrap:  { width:40,height:40,borderRadius:10,backgroundColor:TEAL+'10',alignItems:'center',justifyContent:'center',marginBottom:10 },
  tipTxt:       { fontSize:12,color:MID,lineHeight:18 },

  marketsMarqueeWrap: { marginHorizontal:16,marginBottom:16,backgroundColor:WHITE,borderRadius:14,paddingVertical:14,borderWidth:1,borderColor:LIGHT_BORDER,overflow:'hidden' },
  marketsMarqueeRow:  { flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:8 },
  marketPill:       { flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:12,paddingVertical:7,borderRadius:20,backgroundColor:TEAL+'12',borderWidth:1,borderColor:TEAL+'30' },
  marketPillIcon:   { width:16,height:16,alignItems:'center',justifyContent:'center' },
  marketPillTxt:    { fontSize:12,fontWeight:'600',color:TEAL_DEEP },
  marketPillMore:   { backgroundColor:'#F0FCFC',borderColor:TEAL+'20',borderStyle:'dashed' as any },
  marketPillMoreTxt:{ fontSize:12,fontWeight:'600',color:MID,fontStyle:'italic' as any },

  verifyCard:    { marginHorizontal:16,marginBottom:24,backgroundColor:WHITE,borderRadius:14,padding:16,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  verifyRow:     { flexDirection:'row',alignItems:'center',paddingVertical:10 },
  verifyLabel:   { fontSize:12,color:MID,fontWeight:'500',width:60 },
  verifyValue:   { flex:1,fontSize:12,color:DARK,fontWeight:'600',marginHorizontal:8 },
  verifyPill:    { paddingHorizontal:8,paddingVertical:4,borderRadius:10,borderWidth:1 },
  verifyPillTxt: { fontSize:10,fontWeight:'700' },
  divider:       { height:1,backgroundColor:LIGHT_BORDER },

  profileScroll:    { paddingBottom:40 },
  profileHero:      { alignItems:'center',paddingTop:32,paddingBottom:24,marginHorizontal:16,marginBottom:16,backgroundColor:WHITE,borderRadius:20,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:4},shadowOpacity:0.08,shadowRadius:16,elevation:4 },
  profileAvatar:    { width:88,height:88,borderRadius:44,backgroundColor:TEAL_DARK,alignItems:'center',justifyContent:'center',marginBottom:12 },
  profileAvatarTxt: { fontSize:32,fontWeight:'900',color:WHITE },
  profileName:      { fontSize:22,fontWeight:'800',color:DARK,marginBottom:4 },
  profileEmail:     { fontSize:13,color:MID,marginBottom:12 },
  activeBadge:      { backgroundColor:'#F0FFF4',borderWidth:1,borderColor:'#68D391',paddingHorizontal:14,paddingVertical:5,borderRadius:20 },
  activeBadgeTxt:   { color:'#276749',fontSize:12,fontWeight:'700' },
  infoCard:         { marginHorizontal:16,marginBottom:14,backgroundColor:WHITE,borderRadius:16,padding:18,borderWidth:1,borderColor:LIGHT_BORDER,shadowColor:TEAL,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2 },
  infoCardTitle:    { fontSize:14,fontWeight:'800',color:DARK,marginBottom:14 },
  infoRow:          { flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:11 },
  infoLabel:        { fontSize:13,color:MID,fontWeight:'500' },
  infoValue:        { fontSize:13,color:DARK,fontWeight:'600',maxWidth:'55%',textAlign:'right' },
  signOutBtn:       { marginHorizontal:16,marginBottom:32,paddingVertical:15,borderRadius:12,borderWidth:1.5,borderColor:LIGHT_BORDER,alignItems:'center',backgroundColor:WHITE },
  signOutTxt:       { color:MID,fontSize:15,fontWeight:'700' },

  botFab:        { position:'absolute',bottom:28,right:24,zIndex:50,shadowColor:TEAL_DARK,shadowOffset:{width:0,height:6},shadowOpacity:0.35,shadowRadius:16,elevation:12 },
  botFabInner:   { width:58,height:58,borderRadius:29,backgroundColor:TEAL_DARK,alignItems:'center',justifyContent:'center' },
  botFabBadge:   { position:'absolute',top:-2,right:-2,backgroundColor:'#FF6B6B',borderRadius:10,paddingHorizontal:5,paddingVertical:2,borderWidth:2,borderColor:WHITE },
  botFabBadgeTxt:{ fontSize:9,fontWeight:'900',color:WHITE },
  botWindow:     { position:'absolute',bottom:100,right:20,width:Platform.OS==='web'?380:(SCREEN_WIDTH-32),height:Platform.OS==='web'?520:480,backgroundColor:WHITE,borderRadius:20,shadowColor:'#000',shadowOffset:{width:0,height:12},shadowOpacity:0.2,shadowRadius:32,elevation:20,zIndex:49,overflow:'hidden',borderWidth:1,borderColor:LIGHT_BORDER },
});

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