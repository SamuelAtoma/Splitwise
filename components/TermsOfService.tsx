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
    title: '1. Acceptance of Terms',
    body: `By creating an account or using SPLITWI$E ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.\n\nThese terms constitute a legally binding agreement between you and SPLITWI$E under Nigerian law. We reserve the right to update these terms at any time with notice to users.`,
  },
  {
    title: '2. Description of Service',
    body: `SPLITWI$E is a social shopping coordination platform that allows users to:\n
• Discover other shoppers in their area ordering from the same online markets (Jumia, Konga, Amazon, Temu, AliExpress, and others).\n
• Connect and chat with nearby shoppers to coordinate group orders.\n
• Share delivery costs and shopping tips within groups.\n\nWe do not process payments, fulfill orders, or act as an intermediary between users and any online market. We are a communication and discovery platform only.`,
  },
  {
    title: '3. Eligibility',
    body: `You must be at least 13 years of age to use SPLITWI$E. By using the App, you represent and warrant that:\n
• You are at least 13 years old.\n
• You have the legal capacity to enter into this agreement.\n
• You will use the App only for lawful purposes.\n
• All information you provide is accurate and up to date.`,
  },
  {
    title: '4. User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to:\n
• Provide accurate information during registration.\n
• Not share your login credentials with others.\n
• Notify us immediately of any unauthorised use of your account.\n
• Not create multiple accounts or impersonate another person.\n\nWe reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '5. User Conduct',
    body: `By using SPLITWI$E, you agree not to:\n
• Harass, abuse, threaten, or intimidate other users.\n
• Post or share illegal, fraudulent, or misleading content.\n
• Use the App for any commercial solicitation without our consent.\n
• Attempt to access other users' accounts or data.\n
• Use automated tools (bots, scrapers) to access the App.\n
• Violate any applicable Nigerian law, including the Cybercrimes (Prohibition, Prevention, Etc.) Act 2015.\n
• Engage in any activity that disrupts the App's operation.\n\nViolation of these rules may result in immediate account termination.`,
  },
  {
    title: '6. Location and Map Features',
    body: `When you use the live map feature, your approximate location is shared with other users of the App. By enabling the map, you consent to:\n
• Your location being visible to other SPLITWI$E users in your area.\n
• Your display name, avatar, and selected market being shown on the map.\n\nYou can go offline at any time. Location sharing is always opt-in and requires your explicit action.`,
  },
  {
    title: '7. Chat and Communications',
    body: `Messages sent through SPLITWI$E are stored on our servers to deliver them to recipients. You are solely responsible for the content of your messages. We reserve the right to review messages reported for violations and take appropriate action.\n\nDo not share sensitive personal information (bank details, passwords, national ID numbers) through the chat feature.`,
  },
  {
    title: '8. Intellectual Property',
    body: `All content, design, logos, and software within SPLITWI$E are owned by or licensed to SPLITWI$E. You may not copy, reproduce, distribute, or create derivative works without our express written permission.\n\nContent you create (profile information, messages) remains yours. By posting it, you grant SPLITWI$E a non-exclusive licence to display and transmit that content as necessary to operate the service.`,
  },
  {
    title: '9. Disclaimer of Warranties',
    body: `SPLITWI$E is provided "as is" without warranties of any kind. We do not guarantee:\n
• That the App will be uninterrupted or error-free.\n
• The accuracy of information posted by other users.\n
• The outcome of any group shopping arrangement made through the App.\n\nWe are not responsible for any disputes between users regarding orders, payments, or deliveries. Such arrangements are made entirely between users.`,
  },
  {
    title: '10. Limitation of Liability',
    body: `To the maximum extent permitted by Nigerian law, SPLITWI$E shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including but not limited to loss of data, loss of profits, or financial loss resulting from group shopping arrangements.\n\nOur total liability to you shall not exceed the amount you paid us (if any) in the 12 months prior to the claim.`,
  },
  {
    title: '11. Consumer Protection',
    body: `We are committed to complying with the Federal Competition and Consumer Protection Act (FCCPA) administered by the Federal Competition and Consumer Protection Commission (FCCPC). If you have a consumer complaint, you may contact:\n\nFCCPC: fccpc.gov.ng\nOur support: support@splitwise.ng`,
  },
  {
    title: '12. Governing Law',
    body: `These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the Nigerian courts.`,
  },
  {
    title: '13. Termination',
    body: `You may delete your account at any time from the app settings. We may suspend or terminate your account at any time for violation of these terms, with or without notice.\n\nUpon termination, your right to use the App ceases immediately. We may retain certain data as required by law.`,
  },
  {
    title: '14. Contact',
    body: `For questions about these Terms of Service:\n\nEmail: legal@splitwise.ng\nAddress: Lagos, Nigeria\n\nThese terms were last updated: April 2026.`,
  },
];

export default function TermsOfService({ onBack }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, Platform.OS === 'web' && ({ position: 'sticky', top: 0, zIndex: 100 } as any)]}>
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
          <View style={s.iconWrap}>
            <Ionicons name="document-text" size={36} color={WHITE} />
          </View>
          <Text style={s.heroTitle}>Terms of Service</Text>
          <Text style={s.heroSub}>
            Please read these terms carefully before using SPLITWI$E. By using our platform, you agree to be bound by these terms.
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
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: BORDER },
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
