import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking, Platform,
} from 'react-native';

const TEAL       = '#17B8B8';
const TEAL_DARK  = '#0D8F8F';
const TEAL_DEEP  = '#0A6E6E';
const WHITE      = '#FFFFFF';
const DARK       = '#062020';
const MID        = '#3A7070';
const LIGHT_BORDER = '#C8E8E8';
const BG         = '#F8FEFE';
const RED        = '#C53030';
const RED_BG     = '#FFF5F5';
const RED_BORDER = '#FC8181';

function Svg({ size = 24, stroke = DARK, fill = 'none', children, style }: any) {
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

const ShieldIcon = ({ s, sz = 24 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </Svg>
);
const PhoneIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.62 3.38 2 2 0 013.6 1.21h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </Svg>
);
const MailIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </Svg>
);
const GlobeIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
  </Svg>
);
const AlertIcon = ({ s, sz = 20 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </Svg>
);
const CheckIcon = ({ s, sz = 16 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}>
    <polyline points="20 6 9 17 4 12"/>
  </Svg>
);
const ChevronIcon = ({ s, sz = 16 }: { s: string; sz?: number }) => (
  <Svg size={sz} stroke={s}><polyline points="6 9 12 15 18 9"/></Svg>
);

const REGIONS = [
  { zone: 'Headquarters (Abuja)', phone: '0805 600 2020', phone2: '0805 600 3030', email: 'contact@fccpc.gov.ng' },
  { zone: 'South-West (Lagos)',   phone: '0814 717 0730', email: 'lagos@fccpc.gov.ng' },
  { zone: 'South-South (Port Harcourt)', phone: '0814 717 0732', email: 'southsouth@fccpc.gov.ng' },
  { zone: 'South-East (Awka)',    phone: '0803 412 4060', email: 'southeast@fccpc.gov.ng' },
  { zone: 'North-Central (Minna)', phone: '0814 717 0734', email: 'northcentral@fccpc.gov.ng' },
  { zone: 'North-East (Bauchi)',  phone: '0814 717 0735', email: 'northeast@fccpc.gov.ng' },
  { zone: 'North-West (Kano)',    phone: '0806 077 4766', email: 'northwest@fccpc.gov.ng' },
  { zone: 'Oyo (Ibadan)',         phone: '0904 930 7940', email: 'oyo@fccpc.gov.ng' },
];

export default function FCCPCScreen() {
  const [expanded, setExpanded] = useState(false);

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <ScrollView style={s.root} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroIconWrap}>
          {Platform.OS === 'web' ? (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          ) : (
            <Text style={{ fontSize: 36 }}>🛡️</Text>
          )}
        </View>
        <Text style={s.heroTitle}>You're Protected</Text>
        <Text style={s.heroSub}>
          The Federal Competition & Consumer Protection Commission (FCCPC) safeguards your rights as an online shopper in Nigeria.
          Got scammed? Received a fake product? Report it — for free.
        </Text>
      </View>

      {/* Toll-free banner */}
      <TouchableOpacity style={s.tollfree} onPress={() => open('tel:+2348000002121')} activeOpacity={0.85}>
        <View style={s.tollfreeLeft}>
          <PhoneIcon s={WHITE} sz={20}/>
          <View>
            <Text style={s.tollfreeLabel}>TOLL-FREE HOTLINE</Text>
            <Text style={s.tollfreeNum}>+234 800 000 2121</Text>
          </View>
        </View>
        <Text style={s.tollfreeCta}>Call Now →</Text>
      </TouchableOpacity>

      {/* What is FCCPC */}
      <View style={s.card}>
        <Text style={s.cardTitle}>What is the FCCPC?</Text>
        <Text style={s.cardBody}>
          The FCCPC is Nigeria's official government body that protects consumers from unfair business practices.
          They investigate complaints against online markets, enforce product safety standards, and ensure you get what you paid for.
        </Text>
        <View style={s.pillRow}>
          {['Free to use', 'Government agency', 'Nationwide coverage'].map((p, i) => (
            <View key={i} style={s.pill}>
              <CheckIcon s={TEAL_DEEP} sz={12}/>
              <Text style={s.pillTxt}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* When to report */}
      <View style={[s.card, s.alertCard]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <AlertIcon s={RED} sz={18}/>
          <Text style={[s.cardTitle, { color: RED, marginBottom: 0 }]}>When Should You Report?</Text>
        </View>
        {[
          'You received a fake or counterfeit product',
          'An online market took your money and didn\'t deliver',
          'You were sold an item different from what was advertised',
          'A seller refused to honour a refund or warranty',
          'You experienced misleading pricing or hidden charges',
        ].map((item, i) => (
          <View key={i} style={s.alertRow}>
            <View style={s.alertDot}/>
            <Text style={s.alertTxt}>{item}</Text>
          </View>
        ))}
      </View>

      {/* How to report */}
      <View style={s.card}>
        <Text style={s.cardTitle}>How to File a Complaint</Text>
        {[
          { num: '1', title: 'Go online', desc: 'Visit complaints.fccpc.gov.ng on any browser — it\'s free.' },
          { num: '2', title: 'Fill the form', desc: 'Describe what happened, name the seller/market, and upload evidence (screenshots, receipts).' },
          { num: '3', title: 'Track your case', desc: 'You\'ll get a reference number to track the status of your complaint at any time.' },
        ].map((step, i) => (
          <View key={i} style={[s.stepRow, i < 2 && s.stepRowBorder]}>
            <View style={s.stepNum}><Text style={s.stepNumTxt}>{step.num}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <TouchableOpacity style={s.primaryBtn} onPress={() => open('https://complaints.fccpc.gov.ng')} activeOpacity={0.85}>
        <GlobeIcon s={WHITE} sz={18}/>
        <Text style={s.primaryBtnTxt}>File a Complaint Online</Text>
      </TouchableOpacity>

      <View style={s.secondaryRow}>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => open('tel:08056002020')} activeOpacity={0.85}>
          <PhoneIcon s={TEAL_DARK} sz={16}/>
          <Text style={s.secondaryBtnTxt}>Call FCCPC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => open('mailto:contact@fccpc.gov.ng')} activeOpacity={0.85}>
          <MailIcon s={TEAL_DARK} sz={16}/>
          <Text style={s.secondaryBtnTxt}>Send Email</Text>
        </TouchableOpacity>
      </View>

      {/* Contact info */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Main Contact</Text>
        {[
          { icon: <PhoneIcon s={TEAL_DARK} sz={16}/>, label: 'Phone', value: '0805 600 2020 / 0805 600 3030', action: () => open('tel:08056002020') },
          { icon: <PhoneIcon s={TEAL_DARK} sz={16}/>, label: 'Toll-Free', value: '+234 800 000 2121', action: () => open('tel:+2348000002121') },
          { icon: <MailIcon s={TEAL_DARK} sz={16}/>, label: 'Email', value: 'contact@fccpc.gov.ng', action: () => open('mailto:contact@fccpc.gov.ng') },
          { icon: <GlobeIcon s={TEAL_DARK} sz={16}/>, label: 'Website', value: 'fccpc.gov.ng', action: () => open('https://fccpc.gov.ng') },
        ].map((item, i, arr) => (
          <View key={i}>
            <TouchableOpacity style={s.contactRow} onPress={item.action} activeOpacity={0.7}>
              <View style={s.contactIconBox}>{item.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={s.contactLabel}>{item.label}</Text>
                <Text style={s.contactValue}>{item.value}</Text>
              </View>
              <Text style={s.contactArrow}>→</Text>
            </TouchableOpacity>
            {i < arr.length - 1 && <View style={s.divider}/>}
          </View>
        ))}
      </View>

      {/* Address */}
      <View style={s.addressCard}>
        <Text style={s.addressLabel}>HEADQUARTERS</Text>
        <Text style={s.addressTxt}>23 Jimmy Carter Street, Asokoro, Abuja</Text>
      </View>

      {/* Regional offices */}
      <TouchableOpacity style={s.regionToggle} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <Text style={s.regionToggleTxt}>Regional Offices</Text>
        <ChevronIcon s={TEAL_DARK} sz={18}/>
      </TouchableOpacity>

      {expanded && (
        <View style={s.card}>
          {REGIONS.slice(1).map((r, i) => (
            <View key={i}>
              <View style={s.regionRow}>
                <Text style={s.regionZone}>{r.zone}</Text>
                <TouchableOpacity onPress={() => open(`tel:${r.phone.replace(/\s/g, '')}`)}>
                  <Text style={s.regionPhone}>{r.phone}</Text>
                </TouchableOpacity>
              </View>
              {i < REGIONS.length - 2 && <View style={s.divider}/>}
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }}/>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  hero:         { backgroundColor: TEAL_DEEP, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  heroIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle:    { fontSize: 24, fontWeight: '900', color: WHITE, textAlign: 'center', marginBottom: 10 },
  heroSub:      { fontSize: 13, color: WHITE + 'CC', textAlign: 'center', lineHeight: 20 },

  tollfree:     { backgroundColor: TEAL_DARK, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  tollfreeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tollfreeLabel:{ fontSize: 9, fontWeight: '800', color: WHITE + '99', letterSpacing: 2, marginBottom: 3 },
  tollfreeNum:  { fontSize: 18, fontWeight: '900', color: WHITE },
  tollfreeCta:  { fontSize: 13, fontWeight: '800', color: WHITE },

  card:      { backgroundColor: WHITE, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: LIGHT_BORDER },
  alertCard: { backgroundColor: RED_BG, borderColor: RED_BORDER },
  cardTitle: { fontSize: 15, fontWeight: '800', color: DARK, marginBottom: 10 },
  cardBody:  { fontSize: 13, color: MID, lineHeight: 20, marginBottom: 14 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: TEAL + '12', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: TEAL + '30' },
  pillTxt: { fontSize: 11, fontWeight: '600', color: TEAL_DEEP },

  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  alertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: RED, marginTop: 6 },
  alertTxt: { flex: 1, fontSize: 13, color: RED + 'DD', lineHeight: 20 },

  stepRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14 },
  stepRowBorder: { borderBottomWidth: 1, borderBottomColor: LIGHT_BORDER },
  stepNum:       { width: 32, height: 32, borderRadius: 16, backgroundColor: TEAL_DARK, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumTxt:    { fontSize: 14, fontWeight: '900', color: WHITE },
  stepTitle:     { fontSize: 14, fontWeight: '800', color: DARK, marginBottom: 3 },
  stepDesc:      { fontSize: 12, color: MID, lineHeight: 18 },

  primaryBtn:    { backgroundColor: TEAL_DARK, borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, shadowColor: TEAL_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  primaryBtnTxt: { color: WHITE, fontSize: 15, fontWeight: '800' },

  secondaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: TEAL + '55', backgroundColor: WHITE },
  secondaryBtnTxt: { color: TEAL_DARK, fontSize: 13, fontWeight: '700' },

  contactRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  contactIconBox:{ width: 36, height: 36, borderRadius: 10, backgroundColor: TEAL + '10', alignItems: 'center', justifyContent: 'center' },
  contactLabel:  { fontSize: 10, fontWeight: '700', color: MID, letterSpacing: 0.5, marginBottom: 2 },
  contactValue:  { fontSize: 13, fontWeight: '600', color: DARK },
  contactArrow:  { color: TEAL_DARK, fontSize: 16, fontWeight: '700' },
  divider:       { height: 1, backgroundColor: LIGHT_BORDER },

  addressCard:  { backgroundColor: TEAL + '0D', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: TEAL + '25' },
  addressLabel: { fontSize: 9, fontWeight: '800', color: TEAL_DARK, letterSpacing: 2, marginBottom: 4 },
  addressTxt:   { fontSize: 13, color: TEAL_DEEP, fontWeight: '600' },

  regionToggle:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: WHITE, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: LIGHT_BORDER },
  regionToggleTxt: { fontSize: 14, fontWeight: '700', color: DARK },
  regionRow:       { paddingVertical: 12 },
  regionZone:      { fontSize: 13, fontWeight: '700', color: DARK, marginBottom: 3 },
  regionPhone:     { fontSize: 12, color: TEAL_DARK, fontWeight: '600' },
});
