import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Platform, ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

const TEAL = '#17B8B8';
const TEAL_DARK = '#0D8F8F';
const TEAL_DEEP = '#0A6E6E';
const WHITE = '#FFFFFF';
const DARK = '#062020';
const MID = '#3A7070';
const LIGHT_BORDER = '#C8E8E8';

const AVATARS = [
  '🧑🏾','👩🏽','👨🏿','👩🏾','🧑🏽','👨🏾','👩🏿','🧑🏿',
  '👨🏽','👩🏻','🧑🏻','👨🏻','🦸🏾','🦸🏽','🧙🏾','🧝🏽',
  '👮🏾','👷🏽','🧑🏾‍💻','👩🏽‍💼','👨🏿‍🎓','👩🏾‍🔬','🧑🏽‍🍳','👩🏻‍🎨',
];

const THEMES = [
  { name: 'Teal',    primary: '#17B8B8', dark: '#0D8F8F' },
  { name: 'Purple',  primary: '#8B5CF6', dark: '#6D28D9' },
  { name: 'Blue',    primary: '#3B82F6', dark: '#1D4ED8' },
  { name: 'Green',   primary: '#10B981', dark: '#059669' },
  { name: 'Orange',  primary: '#F97316', dark: '#EA580C' },
  { name: 'Rose',    primary: '#F43F5E', dark: '#E11D48' },
];

interface Props {
  onComplete: () => void;
  onBack?: () => void;
}

export default function ProfileSetup({ onComplete, onBack }: Props) {
  const [displayName,    setDisplayName]    = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🧑🏾');
  const [selectedTheme,  setSelectedTheme]  = useState(THEMES[0]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Please enter a display name'); return; }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name:  displayName.trim(),
          avatar_emoji:  selectedAvatar,
          theme_color:   selectedTheme.primary,
        })
        .eq('id', user.id);
      if (updateError) throw updateError;
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Background */}
      <View style={s.bg}>
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={`h${i}`} style={[s.gH, { top: `${(i / 14) * 100}%` as any }]} />
        ))}
        <View style={s.frost} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        {onBack && (
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backBtnTxt}>← Back</Text>
          </TouchableOpacity>
        )}

        {/* Header */}
        <Logo size={36} color={TEAL} showText textSize={18} textColor={TEAL_DARK} />
        <Text style={s.title}>Set Up Your Profile</Text>
        <Text style={s.subtitle}>Choose how you appear on the map to nearby shoppers</Text>

        {/* Avatar Preview */}
        <View style={[s.avatarPreview, { borderColor: selectedTheme.primary + '60', backgroundColor: selectedTheme.primary + '12' }]}>
          <Text style={s.avatarPreviewEmoji}>{selectedAvatar}</Text>
          <View style={[s.avatarBadge, { backgroundColor: selectedTheme.primary }]}>
            <Text style={s.avatarBadgeTxt}>{displayName || 'Your Name'}</Text>
          </View>
        </View>

        {/* Display Name */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Display Name</Text>
          <TextInput
            style={s.input}
            placeholder="How others will see you on the map"
            placeholderTextColor="#9BB8B8"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={20}
          />
          <Text style={s.inputHint}>{displayName.length}/20 characters</Text>
        </View>

        {/* Avatar Picker */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Choose Your Avatar</Text>
          <View style={s.avatarGrid}>
            {AVATARS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.avatarOption,
                  selectedAvatar === emoji && {
                    borderColor: selectedTheme.primary,
                    backgroundColor: selectedTheme.primary + '15',
                  },
                ]}
                onPress={() => setSelectedAvatar(emoji)}
              >
                <Text style={s.avatarEmoji}>{emoji}</Text>
                {selectedAvatar === emoji && (
                  <View style={[s.avatarCheck, { backgroundColor: selectedTheme.primary }]}>
                    {Platform.OS === 'web' ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <Text style={{ color: WHITE, fontSize: 8, fontWeight: '900' }}>✓</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Picker */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Choose Your Color Theme</Text>
          <View style={s.themeRow}>
            {THEMES.map((theme, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.themeOption,
                  { backgroundColor: theme.primary },
                  selectedTheme.name === theme.name && s.themeSelected,
                ]}
                onPress={() => setSelectedTheme(theme)}
              >
                {selectedTheme.name === theme.name && (
                  <Text style={s.themeCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.themeLabel}>{selectedTheme.name} Theme</Text>
        </View>

        {/* Error */}
        {!!error && (
          <View style={s.errorBanner}>
            <Text style={s.errorTxt}>⚠️ {error}</Text>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: selectedTheme.dark }, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={WHITE} />
            : <Text style={s.saveBtnTxt}>Save & Continue →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={s.skipBtn} onPress={onComplete}>
          <Text style={s.skipBtnTxt}>Skip for now</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F8FEFE' },
  bg:     { position: 'absolute', inset: 0 as any, backgroundColor: '#F8FEFE', overflow: 'hidden' },
  gH:     { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#17B8B80E' },
  frost:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#F8FEFEFD' },

  scroll: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 48, alignItems: 'center' },

  backBtn:    { alignSelf: 'flex-start' as any, marginBottom: 16, paddingVertical: 6 },
  backBtnTxt: { color: TEAL_DARK, fontSize: 14, fontWeight: '700' },
  title:    { fontSize: 28, fontWeight: '800', color: DARK, textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: MID, textAlign: 'center', lineHeight: 22, marginBottom: 28, maxWidth: 320 },

  avatarPreview: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, position: 'relative',
  },
  avatarPreviewEmoji: { fontSize: 52 },
  avatarBadge:        { position: 'absolute', bottom: -14, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  avatarBadgeTxt:     { color: WHITE, fontSize: 11, fontWeight: '800', textAlign: 'center' },

  section:      { width: '100%', maxWidth: 480, marginTop: 32 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: DARK, marginBottom: 12, letterSpacing: 0.3 },

  input:     { backgroundColor: WHITE, borderRadius: 12, borderWidth: 1.5, borderColor: LIGHT_BORDER, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: DARK },
  inputHint: { fontSize: 11, color: MID, marginTop: 6, textAlign: 'right' },

  avatarGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarOption: {
    width: 58, height: 58, borderRadius: 14,
    backgroundColor: WHITE, borderWidth: 1.5,
    borderColor: LIGHT_BORDER, alignItems: 'center',
    justifyContent: 'center', position: 'relative',
  },
  avatarEmoji:  { fontSize: 30 },
  avatarCheck:  {
    position: 'absolute', top: -5, right: -5,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: WHITE,
  },

  themeRow:     { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  themeOption:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  themeSelected:{ borderWidth: 3, borderColor: WHITE, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  themeCheck:   { color: WHITE, fontSize: 18, fontWeight: '900' },
  themeLabel:   { marginTop: 10, fontSize: 12, color: MID, fontWeight: '600' },

  errorBanner: { width: '100%', maxWidth: 480, backgroundColor: '#FFF5F5', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FEB2B2', marginTop: 16 },
  errorTxt:    { color: '#C53030', fontSize: 13 },

  saveBtn:    { width: '100%', maxWidth: 480, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 28, shadowColor: TEAL_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  saveBtnTxt: { color: WHITE, fontSize: 16, fontWeight: '800' },
  skipBtn:    { marginTop: 16, paddingVertical: 10 },
  skipBtnTxt: { color: MID, fontSize: 13, fontWeight: '600' },
});