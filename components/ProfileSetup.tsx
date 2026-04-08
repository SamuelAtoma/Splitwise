import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Platform, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const TEAL       = '#17B8B8';
const TEAL_DARK  = '#0D8F8F';
const TEAL_DEEP  = '#0A6E6E';
const WHITE      = '#FFFFFF';
const DARK       = '#062020';
const MID        = '#3A7070';
const LIGHT_BG   = '#F8FEFE';
const BORDER     = '#C8E8E8';

const THEMES = [
  { name:'Teal',   primary:'#17B8B8', dark:'#0D8F8F' },
  { name:'Purple', primary:'#8B5CF6', dark:'#6D28D9' },
  { name:'Blue',   primary:'#3B82F6', dark:'#1D4ED8' },
  { name:'Green',  primary:'#10B981', dark:'#059669' },
  { name:'Orange', primary:'#F97316', dark:'#EA580C' },
  { name:'Rose',   primary:'#F43F5E', dark:'#E11D48' },
];

interface Props { onComplete: () => void; onBack?: () => void; }

function getInitials(first: string, last: string) {
  const f = first.trim()[0]?.toUpperCase() || '';
  const l = last.trim()[0]?.toUpperCase() || '';
  return f + l || '?';
}

export default function ProfileSetup({ onComplete, onBack }: Props) {
  const [firstName,     setFirstName]     = useState('');
  const [lastName,      setLastName]      = useState('');
  const [username,      setUsername]      = useState('');
  const [photoUri,      setPhotoUri]      = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [loading,       setLoading]       = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [error,         setError]         = useState('');
  const fileInputRef = useRef<any>(null);

  const initials = getInitials(firstName, lastName);
  const displayName = username.trim() || `${firstName.trim()} ${lastName.trim()}`.trim() || 'Your Name';

  // Auto-fill username when both names typed
  const handleFirstName = (val: string) => {
    setFirstName(val);
    if (!username) setUsername(val.trim().toLowerCase().replace(/\s+/g, ''));
  };

  const pickPhoto = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: any) => {
    const file: File = e.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }

    setUploading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('chat-media')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(path);

      setPhotoUri(publicUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) { setError('Please enter your first name'); return; }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id:           user.id,
          first_name:   firstName.trim(),
          last_name:    lastName.trim(),
          display_name: displayName,
          avatar_emoji: photoUri || initials,   // URL if uploaded, else initials
          theme_color:  selectedTheme.primary,
        }, { onConflict: 'id' });

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
      {/* Subtle grid bg */}
      <View style={s.bg}>
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={i} style={[s.gridLine, { top: `${(i / 14) * 100}%` as any }]} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Ionicons name="arrow-back" size={18} color={TEAL} />
            <Text style={s.backTxt}>Back</Text>
          </TouchableOpacity>
        )}

        <Text style={s.logo}>SPLITWI<Text style={{ color: TEAL_DARK }}>$</Text>E</Text>
        <Text style={s.title}>Create Your Profile</Text>
        <Text style={s.subtitle}>This is how other shoppers will see you on the map</Text>

        {/* ── Avatar preview + upload ── */}
        <View style={s.avatarSection}>
          <TouchableOpacity style={s.avatarWrap} onPress={pickPhoto} activeOpacity={0.85}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.avatarPhoto} />
            ) : (
              <View style={[s.avatarInitials, { backgroundColor: selectedTheme.primary }]}>
                <Text style={s.avatarInitialsTxt}>{initials}</Text>
              </View>
            )}

            {/* Camera badge */}
            <View style={[s.cameraBadge, { backgroundColor: selectedTheme.dark }]}>
              {uploading
                ? <ActivityIndicator size="small" color={WHITE} />
                : <Ionicons name="camera" size={16} color={WHITE} />
              }
            </View>
          </TouchableOpacity>

          <Text style={s.avatarHint}>
            {photoUri ? 'Tap to change photo' : 'Tap to add a profile photo'}
          </Text>

          {/* Name badge preview */}
          <View style={[s.nameBadge, { backgroundColor: selectedTheme.primary }]}>
            <Text style={s.nameBadgeTxt}>{displayName}</Text>
          </View>
        </View>

        {/* Hidden file input for web */}
        {Platform.OS === 'web' && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' } as any}
            onChange={handleFileChange}
          />
        )}

        {/* ── Name fields ── */}
        <View style={s.row}>
          <View style={[s.field, { flex: 1 }]}>
            <Text style={s.label}>First Name <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Amara"
              placeholderTextColor="#9BB8B8"
              value={firstName}
              onChangeText={handleFirstName}
              autoCapitalize="words"
              maxLength={30}
            />
          </View>
          <View style={[s.field, { flex: 1 }]}>
            <Text style={s.label}>Last Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Okafor"
              placeholderTextColor="#9BB8B8"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              maxLength={30}
            />
          </View>
        </View>

        {/* Username */}
        <View style={s.field}>
          <Text style={s.label}>Username <Text style={s.hint}>(shown on map)</Text></Text>
          <View style={s.inputWrap}>
            <Text style={s.inputPrefix}>@</Text>
            <TextInput
              style={[s.input, s.inputInner]}
              placeholder="yourname"
              placeholderTextColor="#9BB8B8"
              value={username}
              onChangeText={v => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>
          <Text style={s.fieldHint}>{20 - username.length} characters remaining</Text>
        </View>

        {/* Theme colours */}
        <View style={s.field}>
          <Text style={s.label}>Profile Colour</Text>
          <View style={s.themeRow}>
            {THEMES.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.themeCircle,
                  { backgroundColor: t.primary },
                  selectedTheme.name === t.name && s.themeSelected,
                ]}
                onPress={() => setSelectedTheme(t)}
              >
                {selectedTheme.name === t.name && (
                  <Ionicons name="checkmark" size={18} color={WHITE} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.fieldHint}>{selectedTheme.name} — used for your map pin and badge</Text>
        </View>

        {/* Error */}
        {!!error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#C53030" />
            <Text style={s.errorTxt}>{error}</Text>
          </View>
        )}

        {/* Save */}
        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: selectedTheme.dark }, (loading || uploading) && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading || uploading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={WHITE} />
            : (
              <View style={s.saveBtnInner}>
                <Text style={s.saveBtnTxt}>Save & Continue</Text>
                <Ionicons name="arrow-forward" size={18} color={WHITE} />
              </View>
            )
          }
        </TouchableOpacity>

        <TouchableOpacity style={s.skipBtn} onPress={onComplete}>
          <Text style={s.skipTxt}>Skip for now</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex:1, backgroundColor: LIGHT_BG },
  bg:        { position:'absolute', inset:0 as any, overflow:'hidden' },
  gridLine:  { position:'absolute', left:0, right:0, height:1, backgroundColor:'rgba(23,184,184,0.06)' },

  scroll:    { paddingHorizontal:24, paddingTop:Platform.OS==='ios'?60:48, paddingBottom:60, alignItems:'center', maxWidth:520, alignSelf:'center', width:'100%' },

  backBtn:   { alignSelf:'flex-start' as any, flexDirection:'row', alignItems:'center', gap:6, marginBottom:20 },
  backTxt:   { color:TEAL, fontSize:14, fontWeight:'600' },

  logo:      { fontSize:22, fontWeight:'900', color:TEAL, letterSpacing:1, marginBottom:20 },
  title:     { fontSize:26, fontWeight:'800', color:DARK, textAlign:'center', marginBottom:8 },
  subtitle:  { fontSize:14, color:MID, textAlign:'center', lineHeight:22, marginBottom:32, maxWidth:300 },

  // Avatar
  avatarSection:    { alignItems:'center', gap:10, marginBottom:32 },
  avatarWrap:       { position:'relative', width:110, height:110 },
  avatarPhoto:      { width:110, height:110, borderRadius:55, borderWidth:3, borderColor:BORDER },
  avatarInitials:   { width:110, height:110, borderRadius:55, alignItems:'center', justifyContent:'center' },
  avatarInitialsTxt:{ fontSize:36, fontWeight:'900', color:WHITE },
  cameraBadge:      { position:'absolute', bottom:2, right:2, width:32, height:32, borderRadius:16, alignItems:'center', justifyContent:'center', borderWidth:2.5, borderColor:WHITE },
  avatarHint:       { fontSize:12, color:MID },
  nameBadge:        { paddingHorizontal:16, paddingVertical:6, borderRadius:20 },
  nameBadgeTxt:     { color:WHITE, fontSize:13, fontWeight:'700' },

  // Fields
  row:       { flexDirection:'row', gap:12, width:'100%' },
  field:     { width:'100%', marginBottom:20 },
  label:     { fontSize:13, fontWeight:'700', color:DARK, marginBottom:8 },
  required:  { color:'#EF4444' },
  hint:      { fontWeight:'400', color:MID },
  input:     { backgroundColor:WHITE, borderRadius:12, borderWidth:1.5, borderColor:BORDER, paddingHorizontal:16, paddingVertical:14, fontSize:15, color:DARK },
  inputWrap: { flexDirection:'row', alignItems:'center', backgroundColor:WHITE, borderRadius:12, borderWidth:1.5, borderColor:BORDER, paddingLeft:12 },
  inputPrefix:{ fontSize:15, color:MID, fontWeight:'600' },
  inputInner:{ flex:1, borderWidth:0, backgroundColor:'transparent', paddingLeft:4 },
  fieldHint: { fontSize:11, color:MID, marginTop:6 },

  // Theme
  themeRow:     { flexDirection:'row', gap:12, flexWrap:'wrap', marginTop:4 },
  themeCircle:  { width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
  themeSelected:{ borderWidth:3, borderColor:WHITE, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.25, shadowRadius:6, elevation:4 },

  // Error
  errorBox:  { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#FFF5F5', borderRadius:10, padding:12, borderWidth:1, borderColor:'#FEB2B2', marginBottom:12, width:'100%' },
  errorTxt:  { color:'#C53030', fontSize:13, flex:1 },

  // Buttons
  saveBtn:      { width:'100%', paddingVertical:16, borderRadius:14, alignItems:'center', marginTop:8, shadowColor:TEAL_DARK, shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:10, elevation:5 },
  saveBtnInner: { flexDirection:'row', alignItems:'center', gap:8 },
  saveBtnTxt:   { color:WHITE, fontSize:16, fontWeight:'800' },
  skipBtn:      { marginTop:16, paddingVertical:10 },
  skipTxt:      { color:MID, fontSize:13, fontWeight:'600' },
});
