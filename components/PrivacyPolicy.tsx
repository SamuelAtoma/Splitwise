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

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `When you use SPLITWI$E, we collect the following information:\n
• Account Information: Your name, email address, and profile details you provide during registration.\n
• Location Data: Your approximate location (with your permission) to show nearby shoppers on the map. We only collect location when you are actively using the map feature.\n
• Usage Data: How you interact with the app, including markets you select, groups you join, and features you use.\n
• Messages: Chat messages sent within the app are stored to deliver them to recipients.\n
• Device Information: Device type, operating system, and app version for technical support purposes.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use the information we collect to:\n
• Show you nearby shoppers ordering from the same online market.\n
• Enable group chat and coordination features.\n
• Improve and personalise your experience on SPLITWI$E.\n
• Send important service notifications (not marketing emails without consent).\n
• Ensure the safety and integrity of our platform.\n
• Comply with applicable Nigerian laws including the Nigeria Data Protection Regulation (NDPR) and directives from NITDA.`,
  },
  {
    title: '3. Sharing of Information',
    body: `We do not sell your personal information. We may share your information only in these circumstances:\n
• With Other Users: Your display name, avatar, and selected market are visible to nearby shoppers on the map when you choose to go online.\n
• With Service Providers: We use Supabase for data storage and authentication. These providers are contractually bound to protect your data.\n
• Legal Requirements: If required by Nigerian law, court order, or governmental authority under the Cybercrimes (Prohibition, Prevention, Etc.) Act.\n
• Business Transfer: In the event of a merger or acquisition, your data may be transferred with prior notice to you.`,
  },
  {
    title: '4. Data Storage and Security',
    body: `Your data is stored securely using Supabase infrastructure with industry-standard encryption in transit (TLS) and at rest. We implement Row Level Security (RLS) to ensure users can only access data they are authorised to view.\n\nWhile we take all reasonable precautions, no internet transmission is 100% secure. We encourage you to use a strong password and not share your login credentials.`,
  },
  {
    title: '5. Location Data',
    body: `Location data is only used while you are actively using the map feature. We do not track your location in the background. You can go offline at any time by tapping "Go Offline" on the map screen, which immediately removes your pin from other users' maps.\n\nLocation coordinates are stored temporarily in our map_sessions table and are linked to your profile only while you are online.`,
  },
  {
    title: '6. Your Rights (NDPR)',
    body: `Under the Nigeria Data Protection Regulation (NDPR), you have the right to:\n
• Access the personal data we hold about you.\n
• Request correction of inaccurate data.\n
• Request deletion of your account and associated data.\n
• Withdraw consent for data processing at any time.\n
• Lodge a complaint with the National Information Technology Development Agency (NITDA).\n\nTo exercise any of these rights, contact us at privacy@splitwise.ng`,
  },
  {
    title: '7. Children\'s Privacy',
    body: `SPLITWI$E is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately and we will delete it.`,
  },
  {
    title: '8. Cookies and Tracking',
    body: `On the web version, we use essential cookies for session management and authentication. We do not use third-party advertising cookies. You can control cookies through your browser settings, though disabling essential cookies may affect app functionality.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via the app or email. Continued use of SPLITWI$E after changes take effect constitutes acceptance of the updated policy.\n\nThis policy was last updated: April 2026.`,
  },
  {
    title: '10. Contact Us',
    body: `If you have questions about this Privacy Policy or how we handle your data, contact us:\n\nEmail: privacy@splitwise.ng\nAddress: Lagos, Nigeria\n\nFor data protection complaints, you may also contact NITDA at nitda.gov.ng`,
  },
];

export default function PrivacyPolicy({ onBack }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, Platform.OS === 'web' && ({ position: 'sticky', top: 0, zIndex: 100 } as any)]}>
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
          <View style={s.iconWrap}>
            <Ionicons name="shield-checkmark" size={36} color={WHITE} />
          </View>
          <Text style={s.heroTitle}>Privacy Policy</Text>
          <Text style={s.heroSub}>
            SPLITWI$E is committed to protecting your privacy and your personal data in accordance with the Nigeria Data Protection Regulation (NDPR).
          </Text>
          <Text style={s.heroDate}>Effective Date: April 1, 2026</Text>
        </View>

        {/* Sections */}
        <View style={s.body}>
          {SECTIONS.map((sec, i) => (
            <View key={i} style={s.section}>
              <Text style={s.secTitle}>{sec.title}</Text>
              <Text style={s.secBody}>{sec.body}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>© 2026 SPLITWI$E · All rights reserved.</Text>
          <TouchableOpacity onPress={onBack}>
            <Text style={s.footerLink}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: BG },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backTxt:    { fontSize: 14, fontWeight: '600', color: TEAL },
  headerTitle:{ fontSize: 16, fontWeight: '700', color: DARK },
  scroll:     { flex: 1 },
  content:    { paddingBottom: 48 },

  hero:       { backgroundColor: TEAL_DEEP, paddingVertical: 48, paddingHorizontal: 24, alignItems: 'center', gap: 12 },
  iconWrap:   { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroTitle:  { fontSize: 28, fontWeight: '800', color: WHITE, textAlign: 'center' },
  heroSub:    { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22, maxWidth: 480 },
  heroDate:   { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  body:       { paddingHorizontal: 24, paddingTop: 32, gap: 0, maxWidth: 760, alignSelf: 'center', width: '100%' },
  section:    { paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: BORDER },
  secTitle:   { fontSize: 16, fontWeight: '700', color: TEAL_DEEP, marginBottom: 10 },
  secBody:    { fontSize: 14, color: MID, lineHeight: 23 },

  footer:     { alignItems: 'center', paddingVertical: 32, gap: 10 },
  footerTxt:  { fontSize: 12, color: MID },
  footerLink: { fontSize: 13, color: TEAL, fontWeight: '600' },
});
