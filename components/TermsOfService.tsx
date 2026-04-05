import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TEAL      = '#17B8B8';
const TEAL_DARK = '#0D8F8F';
const TEAL_DEEP = '#0A6E6E';
const WHITE     = '#FFFFFF';
const DARK      = '#062020';
const MID       = '#3A7070';
const BG        = '#F8FEFE';
const BORDER    = '#C8E8E8';

interface Props { onBack: () => void; }

const HIGHLIGHTS = [
  { icon: 'map' as const,           color: '#10B981', bg: '#ECFDF5', text: 'Browse the map for free' },
  { icon: 'chatbubbles' as const,   color: TEAL_DARK, bg: '#F0FDFA', text: 'Small fee to unlock chat' },
  { icon: 'hand-left' as const,     color: '#8B5CF6', bg: '#F5F3FF', text: 'You own your content' },
  { icon: 'close-circle' as const,  color: '#EF4444', bg: '#FEF2F2', text: 'Leave anytime, no lock-in' },
];

const SECTIONS: { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; title: string; friendly: string; body: string }[] = [
  {
    icon: 'hand-left', color: '#3B82F6', bg: '#EFF6FF',
    title: 'Accepting These Terms',
    friendly: 'By using the app, you agree to play fair.',
    body: `Using SPLITWI$E means you agree to these terms. We've written them as simply as possible so you actually know what you're agreeing to.\n\nIf you don't agree, you can stop using the app at any time — and you're always welcome back when you're ready.`,
  },
  {
    icon: 'cart', color: '#F59E0B', bg: '#FFFBEB',
    title: 'What SPLITWI$E Is',
    friendly: 'A social layer for smarter online shopping.',
    body: `SPLITWI$E helps you find other shoppers near you who are ordering from the same online market — so you can coordinate, share delivery costs, and shop smarter together.\n\nYou can browse the live map and see nearby shoppers for free. To chat and connect with a specific shopper, a small one-time fee is charged per conversation unlock.\n\nWe are NOT a marketplace. We don't process your product orders or handle deliveries. We are a discovery and communication platform.`,
  },
  {
    icon: 'cash', color: '#10B981', bg: '#ECFDF5',
    title: 'Paid Chat Feature',
    friendly: 'Free to browse. A small fee to connect.',
    body: `Viewing the live map and filtering nearby shoppers is completely free.\n\nTo start a chat conversation with another shopper, a small one-time fee is charged. This fee:\n\n• Unlocks a direct chat thread with that specific shopper.\n• Is charged once per conversation — not recurring.\n• Is non-refundable once a chat session has been opened and a message has been sent.\n\nPayments are processed securely via a certified payment provider (e.g., Paystack or Flutterwave). We do not store your card details. By making a payment, you agree to the payment provider's terms as well.\n\nIf you experience a payment issue without receiving access to the chat, contact billing@splitwise.ng within 48 hours for a review.`,
  },
  {
    icon: 'school', color: '#6366F1', bg: '#EEF2FF',
    title: 'Communities, Campuses & Hostels',
    friendly: 'Built for wherever people live and shop together.',
    body: `SPLITWI$E is designed to thrive in close-knit communities — student hostels, university campuses, residential estates, office clusters, and neighbourhoods across Nigeria.\n\nIf you're using SPLITWI$E as part of a campus community or group, the same individual terms apply to every user. No institution or organisation has administrative access to your account or chats.\n\nSPLITWI$E is open to all — students, workers, families, and anyone else who wants to shop smarter with the people around them.`,
  },
  {
    icon: 'person-add', color: '#F59E0B', bg: '#FFFBEB',
    title: 'Who Can Use SPLITWI$E',
    friendly: 'Anyone 13+ who plays by the rules.',
    body: `You must be at least 13 years old to use SPLITWI$E. By signing up, you confirm that:\n\n• All information you provide is accurate.\n• You won't impersonate anyone else.\n• You have the legal ability to agree to these terms.\n\nWe may ask for age verification at any time.`,
  },
  {
    icon: 'key', color: '#6366F1', bg: '#EEF2FF',
    title: 'Your Account',
    friendly: 'Keep your account safe — it\'s yours alone.',
    body: `You're responsible for keeping your login credentials private. If someone else gets into your account and causes a problem, you may be held responsible.\n\nNotice something suspicious? Email us at support@splitwise.ng immediately and we'll lock it down fast.`,
  },
  {
    icon: 'heart', color: '#EC4899', bg: '#FDF2F8',
    title: 'How to Behave',
    friendly: 'Treat everyone the way you\'d like to be treated.',
    body: `SPLITWI$E is built on community trust. Here's what we ask:\n\n✅ Be respectful to all users.\n✅ Only share accurate information about your orders.\n✅ Use your real identity.\n\n❌ No harassment, threats, or hate speech.\n❌ No scams, fake deals, or misleading posts.\n❌ No bots or automated scraping.\n\nViolations may result in immediate removal — no refunds, no warnings for serious offences.`,
  },
  {
    icon: 'map', color: '#F97316', bg: '#FFF7ED',
    title: 'The Live Map',
    friendly: 'Your location, your choice — always.',
    body: `When you go live on the map, nearby users can see your display name, avatar, and selected market. That's all.\n\nYou can go offline at any time by tapping "Go Offline." Your pin disappears from everyone's map instantly. We never share your precise home address.`,
  },
  {
    icon: 'chatbubbles', color: '#3B82F6', bg: '#EFF6FF',
    title: 'Chat & Messages',
    friendly: 'Be kind. Messages are stored.',
    body: `Messages you send in SPLITWI$E are stored on our servers to deliver them to the right people. Please don't share:\n\n• Bank account details or PINs\n• Passwords or verification codes\n• Your home address or ID numbers\n\nWe may review messages that are reported for abuse, but we don't read your private chats.`,
  },
  {
    icon: 'ribbon', color: '#8B5CF6', bg: '#F5F3FF',
    title: 'Intellectual Property',
    friendly: 'The app is ours. Your content is yours.',
    body: `Everything in the SPLITWI$E app — design, code, logos — belongs to us and is protected by Nigerian copyright law.\n\nYour profile, messages, and content? That's all yours. By posting it, you give us permission to display it within the app — nothing more.`,
  },
  {
    icon: 'alert-circle', color: '#EF4444', bg: '#FEF2F2',
    title: 'Our Honest Disclaimer',
    friendly: 'We do our best, but can\'t promise perfection.',
    body: `SPLITWI$E is provided "as is." We work hard to keep things running smoothly, but we can't guarantee the app will always be 100% available or error-free.\n\nWe're also not responsible for what other users do. If a group shopping arrangement goes wrong between users, that's between the people involved — we're the connecting platform, not the guarantor.`,
  },
  {
    icon: 'scale', color: '#6366F1', bg: '#EEF2FF',
    title: 'Liability',
    friendly: "We're fair about this.",
    body: `We won't be liable for indirect losses — like a missed order or a bad shopping deal made between users.\n\nIf we ever cause you direct harm through our own negligence, our maximum liability is capped at what you've paid us in the past 12 months (if anything — since the app is free, that's likely ₦0, but the principle stands).`,
  },
  {
    icon: 'storefront', color: '#10B981', bg: '#ECFDF5',
    title: 'Consumer Protection',
    friendly: 'Your rights as a Nigerian consumer are protected.',
    body: `We comply with the Federal Competition and Consumer Protection Act (FCCPA). If you feel your consumer rights have been violated:\n\n📧  support@splitwise.ng\n🏛️  FCCPC: fccpc.gov.ng\n\nWe take every complaint seriously and respond within 5 business days.`,
  },
  {
    icon: 'business', color: TEAL_DARK, bg: '#F0FDFA',
    title: 'Nigerian Law Applies',
    friendly: 'We follow Nigerian law, full stop.',
    body: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes go to Nigerian courts.\n\nWe're a Nigerian product, built for Nigerians — so this makes total sense.`,
  },
  {
    icon: 'log-out', color: '#F97316', bg: '#FFF7ED',
    title: 'Leaving SPLITWI$E',
    friendly: 'No strings attached. Leave whenever you want.',
    body: `You can delete your account at any time from the app settings. Your data will be erased within 30 days, except where we're legally required to keep it.\n\nWe can also suspend accounts that seriously violate these terms. We'll always try to warn you first for minor issues.`,
  },
  {
    icon: 'call', color: '#EC4899', bg: '#FDF2F8',
    title: 'Say Hello',
    friendly: 'We\'re a real team. We reply.',
    body: `Questions about these terms? We're happy to explain anything.\n\n📧  legal@splitwise.ng\n📍  Lagos, Nigeria\n\nThese terms were last updated: April 2026.`,
  },
];

export default function TermsOfService({ onBack }: Props) {
  const wide = Platform.OS === 'web';
  return (
    <View style={s.root}>
      {/* Sticky Header */}
      <View style={[s.header, wide && ({ position: 'sticky', top: 0, zIndex: 100 } as any)]}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={TEAL} />
          <Text style={s.backTxt}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Terms of Service</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Ionicons name="document-text" size={40} color={WHITE} />
          </View>
          <Text style={s.heroTitle}>Terms of Service</Text>
          <Text style={s.heroSub}>
            Short, honest, and built for real communities.{'\n'}Know exactly what you're agreeing to.
          </Text>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeTxt}>Nigerian Law · Last updated April 2026</Text>
          </View>
        </View>

        {/* Highlights */}
        <View style={s.highlightsWrap}>
          <Text style={s.highlightsLabel}>WHAT YOU SHOULD KNOW</Text>
          <View style={s.highlightsGrid}>
            {HIGHLIGHTS.map((h, i) => (
              <View key={i} style={[s.highlightCard, { backgroundColor: h.bg, borderColor: h.color + '30' }]}>
                <View style={[s.highlightIcon, { backgroundColor: h.color + '20' }]}>
                  <Ionicons name={h.icon} size={18} color={h.color} />
                </View>
                <Text style={[s.highlightTxt, { color: h.color }]}>{h.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sections */}
        <View style={s.body}>
          {SECTIONS.map((sec, i) => (
            <View key={i} style={s.card}>
              <View style={s.cardHeader}>
                <View style={[s.cardIcon, { backgroundColor: sec.bg }]}>
                  <Ionicons name={sec.icon} size={22} color={sec.color} />
                </View>
                <View style={s.cardTitles}>
                  <Text style={s.cardTitle}>{sec.title}</Text>
                  <Text style={[s.cardFriendly, { color: sec.color }]}>{sec.friendly}</Text>
                </View>
              </View>
              <Text style={s.cardBody}>{sec.body}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.footerCard}>
            <Ionicons name="checkmark-circle" size={28} color={TEAL} />
            <Text style={s.footerTitle}>Straightforward. Honest. Fair.</Text>
            <Text style={s.footerSub}>Browse free. Unlock chat when you find your person. Shop smarter with your community — that's what SPLITWI$E is built for.</Text>
            <TouchableOpacity style={s.footerBtn} onPress={onBack}>
              <Text style={s.footerBtnTxt}>← Back to Home</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.footerCopy}>© 2026 SPLITWI$E · All rights reserved.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BG },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backTxt:     { fontSize: 14, fontWeight: '600', color: TEAL },
  headerTitle: { fontSize: 16, fontWeight: '700', color: DARK },
  scroll:      { flex: 1 },
  content:     { paddingBottom: 60 },

  // Hero
  hero:        { backgroundColor: TEAL_DEEP, paddingVertical: 56, paddingHorizontal: 24, alignItems: 'center', gap: 14 },
  heroIcon:    { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroTitle:   { fontSize: 30, fontWeight: '800', color: WHITE, textAlign: 'center' },
  heroSub:     { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24, maxWidth: 420 },
  heroBadge:   { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 4 },
  heroBadgeTxt:{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // Highlights
  highlightsWrap:  { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 8, maxWidth: 800, alignSelf: 'center', width: '100%' },
  highlightsLabel: { fontSize: 11, fontWeight: '800', color: MID, letterSpacing: 2, textAlign: 'center', marginBottom: 16 },
  highlightsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  highlightCard:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, minWidth: 200, flex: 1 },
  highlightIcon:   { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  highlightTxt:    { fontSize: 13, fontWeight: '700', flex: 1 },

  // Sections
  body:        { paddingHorizontal: 20, paddingTop: 24, gap: 16, maxWidth: 800, alignSelf: 'center', width: '100%' },
  card:        { backgroundColor: WHITE, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: BORDER, shadowColor: DARK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  cardIcon:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitles:  { flex: 1, gap: 3 },
  cardTitle:   { fontSize: 16, fontWeight: '700', color: DARK },
  cardFriendly:{ fontSize: 13, fontWeight: '500' },
  cardBody:    { fontSize: 14, color: MID, lineHeight: 23 },

  // Footer
  footer:      { paddingHorizontal: 20, paddingTop: 32, alignItems: 'center', gap: 16, maxWidth: 800, alignSelf: 'center', width: '100%' },
  footerCard:  { backgroundColor: TEAL + '10', borderRadius: 20, padding: 28, alignItems: 'center', gap: 10, width: '100%', borderWidth: 1, borderColor: TEAL + '30' },
  footerTitle: { fontSize: 20, fontWeight: '700', color: DARK, textAlign: 'center' },
  footerSub:   { fontSize: 14, color: MID, textAlign: 'center', lineHeight: 22, maxWidth: 360 },
  footerBtn:   { backgroundColor: TEAL, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 6 },
  footerBtnTxt:{ color: WHITE, fontWeight: '700', fontSize: 14 },
  footerCopy:  { fontSize: 12, color: MID },
});
