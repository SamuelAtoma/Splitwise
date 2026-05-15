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

const PROMISES = [
  { icon: 'ban' as const,          color: '#EF4444', bg: '#FEF2F2', text: "We never sell your data" },
  { icon: 'location' as const,     color: '#F59E0B', bg: '#FFFBEB', text: "Location only when you're live" },
  { icon: 'trash' as const,        color: '#8B5CF6', bg: '#F5F3FF', text: "Delete your account anytime" },
  { icon: 'card' as const,         color: TEAL_DARK, bg: '#F0FDFA', text: "Payment data is never stored by us" },
];

const SECTIONS: { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; title: string; friendly: string; body: string }[] = [
  {
    icon: 'person-circle', color: '#3B82F6', bg: '#EFF6FF',
    title: 'What We Collect',
    friendly: 'Only what we need, nothing more.',
    body: `• Your name, email, and profile details you provide when signing up.\n• Your approximate location — only when you tap "Go Live" on the map.\n• Which markets you shop from and groups you join.\n• Chat messages (stored to deliver them to the right person).\n• Payment transaction records (amounts and dates only — we never store your card details).\n• Basic device info for bug fixes and support.`,
  },
  {
    icon: 'sparkles', color: '#F59E0B', bg: '#FFFBEB',
    title: 'How We Use It',
    friendly: 'To make SPLITWI$E work great for you.',
    body: `• Show you real shoppers nearby ordering from the same market.\n• Power the group chat so you can coordinate orders.\n• Personalise your experience and remember your preferences.\n• Send you important updates about your account (no spam, we promise).\n• Keep the platform safe and free of bad actors.`,
  },
  {
    icon: 'share-social', color: '#10B981', bg: '#ECFDF5',
    title: 'Who We Share It With',
    friendly: "We don't sell your data. Ever.",
    body: `• Other Users: Your name, avatar, and market are visible on the map only when you choose to go live.\n• Supabase: Our secure infrastructure partner — they're contractually bound to protect your data.\n• Nigerian authorities: Only if legally required under the Cybercrimes Act.\n• New owners: If we're ever acquired, you'll be notified before any transfer happens.`,
  },
  {
    icon: 'lock-closed', color: TEAL_DARK, bg: '#F0FDFA',
    title: 'How We Keep It Safe',
    friendly: 'Bank-grade security for your information.',
    body: `Your data lives on Supabase servers with TLS encryption in transit and AES-256 encryption at rest. We use Row Level Security (RLS) — meaning each user can only ever see their own data, never anyone else's.\n\nWe recommend using a strong password. If you suspect any unauthorised access, contact us immediately.`,
  },
  {
    icon: 'location', color: '#F97316', bg: '#FFF7ED',
    title: 'Your Location',
    friendly: 'You are always in control of your location.',
    body: `We only access your location when you tap "Go Live" on the map screen. The moment you tap "Go Offline," your pin vanishes from everyone's map instantly.\n\nWe never track you in the background. Location data is stored only while your session is active — it is never used for advertising or profiling.`,
  },
  {
    icon: 'card', color: '#10B981', bg: '#ECFDF5',
    title: 'Payments & Billing',
    friendly: 'Your card details never touch our servers.',
    body: `SPLITWI$E charges a small fee to unlock chat with another shopper. Payments are processed through a certified third-party payment provider (e.g., Paystack or Flutterwave).\n\nWe store only:\n• The amount paid\n• The date of the transaction\n• Whether a chat session was unlocked\n\nYour card number, CVV, and bank details are handled entirely by the payment provider — we never see or store them. You can request a history of your transactions at any time by emailing billing@splitwise.ng.`,
  },
  {
    icon: 'school', color: '#6366F1', bg: '#EEF2FF',
    title: 'Community & Student Users',
    friendly: 'Built for close-knit communities everywhere.',
    body: `SPLITWI$E is designed for tight communities — whether that's a student hostel, a university campus, a residential estate, or a block of flats. If you're part of a community account or an institutional group, the same privacy rules apply to you as to every other user.\n\nWe do not share your data with any institution, university, or organisation you may be affiliated with. Your activity on SPLITWI$E is entirely private to you.`,
  },
  {
    icon: 'checkmark-circle', color: '#8B5CF6', bg: '#F5F3FF',
    title: 'Your Rights',
    friendly: 'You are always in control of your data.',
    body: `Under the Nigeria Data Protection Regulation (NDPR), you have the right to:\n\n• See all data we hold about you.\n• Correct any inaccurate information.\n• Delete your account and all associated data.\n• Withdraw your consent at any time.\n• File a complaint with NITDA (nitda.gov.ng).\n\nEmail us at privacy@splitwise.ng to exercise any of these rights — we'll respond within 72 hours.`,
  },
  {
    icon: 'happy', color: '#EC4899', bg: '#FDF2F8',
    title: "Children's Privacy",
    friendly: 'SPLITWI$E is for ages 13 and above.',
    body: `We do not knowingly collect data from children under 13. If a child has signed up, please email us at privacy@splitwise.ng and we will immediately delete all associated data — no questions asked.`,
  },
  {
    icon: 'code-slash', color: '#6366F1', bg: '#EEF2FF',
    title: 'Cookies',
    friendly: 'Only the essential ones — nothing sneaky.',
    body: `We use cookies only for keeping you logged in and keeping the app working. We do not use advertising cookies, tracking pixels, or share your browsing behaviour with any third party.\n\nYou can clear cookies in your browser settings at any time.`,
  },
  {
    icon: 'notifications', color: '#F59E0B', bg: '#FFFBEB',
    title: 'Policy Updates',
    friendly: "We'll always tell you when something changes.",
    body: `If we update this policy in a meaningful way, we'll notify you in the app and by email — not just quietly update the page. You'll have time to review changes before they take effect.\n\nLast updated: April 2026.`,
  },
  {
    icon: 'mail', color: TEAL_DARK, bg: '#F0FDFA',
    title: 'Get In Touch',
    friendly: 'Real people. Real responses.',
    body: `Have a question or concern about your privacy? We'd love to hear from you.\n\n📧  privacy@splitwise.ng\n📍  Lagos, Nigeria\n\nFor formal data protection complaints, you can also reach NITDA at nitda.gov.ng. We always cooperate fully.`,
  },
];

export default function PrivacyPolicy({ onBack }: Props) {
  const wide = Platform.OS === 'web';
  return (
    <View style={s.root}>
      {/* Sticky Header */}
      <View style={[s.header, wide && ({ position: 'sticky', top: 0, zIndex: 100 } as any)]}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={TEAL} />
          <Text style={s.backTxt}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Ionicons name="shield-checkmark" size={40} color={WHITE} />
          </View>
          <Text style={s.heroTitle}>Your Privacy Matters</Text>
          <Text style={s.heroSub}>
            We wrote this in plain English so you actually understand it.{'\n'}No legal jargon, no surprises.
          </Text>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeTxt}>NDPR Compliant · Last updated April 2026</Text>
          </View>
        </View>

        {/* TL;DR Promises */}
        <View style={s.promisesWrap}>
          <Text style={s.promisesLabel}>THE SHORT VERSION</Text>
          <View style={s.promisesGrid}>
            {PROMISES.map((p, i) => (
              <View key={i} style={[s.promiseCard, { backgroundColor: p.bg, borderColor: p.color + '30' }]}>
                <View style={[s.promiseIcon, { backgroundColor: p.color + '20' }]}>
                  <Ionicons name={p.icon} size={18} color={p.color} />
                </View>
                <Text style={[s.promiseTxt, { color: p.color }]}>{p.text}</Text>
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

        {/* Footer CTA */}
        <View style={s.footer}>
          <View style={s.footerCard}>
            <Ionicons name="heart" size={24} color={TEAL} />
            <Text style={s.footerTitle}>We built this for trust.</Text>
            <Text style={s.footerSub}>SPLITWI$E only works if you trust us with your data. We take that seriously.</Text>
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
  hero:        { backgroundColor: TEAL_DEEP, paddingVertical: 56, paddingHorizontal: 24, alignItems: 'center', gap: 14 } as any,
  heroIcon:    { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroTitle:   { fontSize: 30, fontWeight: '800', color: WHITE, textAlign: 'center' },
  heroSub:     { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24, maxWidth: 420 },
  heroBadge:   { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 4 },
  heroBadgeTxt:{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // TL;DR
  promisesWrap:  { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 8, maxWidth: 800, alignSelf: 'center', width: '100%' },
  promisesLabel: { fontSize: 11, fontWeight: '800', color: MID, letterSpacing: 2, textAlign: 'center', marginBottom: 16 },
  promisesGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  promiseCard:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, minWidth: 200, flex: 1 },
  promiseIcon:   { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  promiseTxt:    { fontSize: 13, fontWeight: '700', flex: 1 },

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
