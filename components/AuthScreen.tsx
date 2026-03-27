import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';

const TEAL       = '#17B8B8';
const TEAL_DARK  = '#0D8F8F';
const TEAL_DEEP  = '#0A6E6E';
const WHITE      = '#FFFFFF';
const DARK       = '#062020';
const MID        = '#3A7070';
const LIGHT_BORDER = '#C8E8E8';
const ERROR      = '#E53E3E';
const BG         = '#F8FEFE';

// ══════════════════════════════════════════════════════════════
// SVG ICONS
// ══════════════════════════════════════════════════════════════
const GoogleSVG = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" style={{ display:'block' }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// ✅ Fixed Apple SVG — solid black fill, correct viewBox
const AppleSVG = () => (
  <svg width="18" height="20" viewBox="0 0 384 512" style={{ display:'block' }} fill={DARK}>
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-16.9 75.8-16.9 31.8 0 48.3 16.9 76.4 16.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const EmailSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={MID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'block' }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const PhoneSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={MID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'block' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const LockSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={MID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'block' }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UserSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={MID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'block' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const EyeSVG = ({ show }: { show: boolean }) => show ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={MID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'block' }}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={MID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'block' }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CheckSVG = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
    stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'block' }}>
    <polyline points="2,6 5,9 10,3"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════
// MAP BG SVG — full left panel
// ══════════════════════════════════════════════════════════════
const MapBgSVG = () => (
  <svg
    style={{ position:'absolute' as any, top:0, left:0, width:'100%', height:'100%' }}
    viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="400" height="700" fill={TEAL_DARK}/>
    {/* Grid */}
    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>(
      <line key={`h${i}`} x1="0" y1={i*60} x2="400" y2={i*60}
        stroke={WHITE} strokeWidth="0.4" strokeOpacity="0.12"/>
    ))}
    {[0,1,2,3,4,5,6,7,8].map(i=>(
      <line key={`v${i}`} x1={i*55} y1="0" x2={i*55} y2="700"
        stroke={WHITE} strokeWidth="0.4" strokeOpacity="0.12"/>
    ))}
    {/* Roads */}
    <path d="M0 280 Q100 260 200 280 T400 260" stroke={WHITE} strokeWidth="3" strokeOpacity="0.18" fill="none"/>
    <path d="M0 420 Q150 400 300 430 T400 410" stroke={WHITE} strokeWidth="2" strokeOpacity="0.13" fill="none"/>
    <path d="M120 0 Q130 200 110 400 T140 700" stroke={WHITE} strokeWidth="2.5" strokeOpacity="0.15" fill="none"/>
    <path d="M260 0 Q270 180 250 350 T280 700" stroke={WHITE} strokeWidth="2" strokeOpacity="0.12" fill="none"/>
    <path d="M60 0 Q80 150 50 300 T90 700" stroke={WHITE} strokeWidth="1.5" strokeOpacity="0.10" fill="none"/>
    <path d="M330 0 Q350 200 320 400 T360 700" stroke={WHITE} strokeWidth="1.5" strokeOpacity="0.10" fill="none"/>
    {/* Buildings */}
    {[[30,60,50,30],[100,80,60,35],[200,50,45,28],[300,70,55,32],
      [30,180,40,25],[140,160,50,30],[240,170,45,28],[340,155,40,24],
      [50,320,55,30],[160,340,48,28],[280,310,52,30],[350,330,42,26],
      [30,460,50,28],[130,480,58,32],[240,450,46,28],[345,465,40,24],
      [60,580,50,30],[170,600,55,28],[280,570,48,30],[360,590,38,24],
    ].map(([x,y,w,h],i)=>(
      <rect key={i} x={x} y={y} width={w} height={h} rx="3"
        fill={WHITE} fillOpacity="0.07" stroke={WHITE} strokeWidth="0.5" strokeOpacity="0.15"/>
    ))}
    {/* Pins */}
    {[[80,130],[200,200],[310,120],[60,380],[180,350],
      [290,390],[140,520],[260,540],[370,240],[100,250],
    ].map(([cx,cy],i)=>(
      <g key={i}>
        <circle cx={cx} cy={cy} r="8" fill={WHITE} fillOpacity="0.15"
          stroke={WHITE} strokeWidth="1" strokeOpacity="0.3"/>
        <circle cx={cx} cy={cy} r="3" fill={WHITE} fillOpacity="0.6"/>
        <line x1={cx} y1={cy+3} x2={cx} y2={cy+11}
          stroke={WHITE} strokeWidth="1.5" strokeOpacity="0.4"/>
      </g>
    ))}
    {[[200,200],[310,120],[180,350]].map(([cx,cy],i)=>(
      <circle key={i} cx={cx} cy={cy} r="16" fill="none"
        stroke={WHITE} strokeWidth="1" strokeOpacity="0.2"/>
    ))}
    {/* Gradient overlay */}
    <defs>
      <linearGradient id="lgov" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={TEAL_DEEP} stopOpacity="0.45"/>
        <stop offset="100%" stopColor={TEAL_DEEP} stopOpacity="0.72"/>
      </linearGradient>
    </defs>
    <rect width="400" height="700" fill="url(#lgov)"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════
function Input({ label, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, hint, error, required, icon }: any) {
  const [focused, setFocused] = useState(false);
  const [show,    setShow]    = useState(false);
  return (
    <View style={f.inputWrap}>
      {label && (
        <Text style={f.label}>
          {label}{required && <Text style={{ color: ERROR }}> *</Text>}
        </Text>
      )}
      <View style={[
        f.inputBox,
        focused && { borderColor: TEAL, borderWidth: 1.5 },
        error   && { borderColor: ERROR },
      ]}>
        {icon && <View style={f.inputIconWrap}>{icon}</View>}
        <TextInput
          style={f.input}
          placeholder={placeholder}
          placeholderTextColor="#9BB8B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType || 'default'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(s => !s)} style={f.eyeBtn}>
            <EyeSVG show={show}/>
          </TouchableOpacity>
        )}
      </View>
      {hint  && !error && <Text style={f.hint}>{hint}</Text>}
      {error && <Text style={f.error}>{error}</Text>}
    </View>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={f.errorBanner}>
      <Text style={f.errorBannerTxt}>⚠️  {message}</Text>
    </View>
  );
}

function OrDivider({ label = 'OR USE YOUR EMAIL' }: { label?: string }) {
  return (
    <View style={f.orRow}>
      <View style={f.orLine}/>
      <Text style={f.orTxt}>{label}</Text>
      <View style={f.orLine}/>
    </View>
  );
}

function SocialBtn({ icon, label, onPress, disabled }: {
  icon: React.ReactNode; label: string; onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity style={[f.socialBtn, disabled && { opacity:0.5 }]}
      onPress={onPress} disabled={disabled} activeOpacity={0.75}>
      <View style={f.socialBtnIcon}>{icon}</View>
      <Text style={f.socialBtnTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Left panel — full map, no card ─────────────────────────
function LeftPanel({ heading, sub, btnLabel, onBtnPress }: {
  heading: string; sub: string; btnLabel: string; onBtnPress: () => void;
}) {
  return (
    <View style={f.leftPanel}>
      <MapBgSVG/>
      {/* Content sits directly on map */}
      <View style={f.leftContent}>
        <Text style={f.leftLogo}>
          SPLITWI<Text style={{ color: WHITE + 'AA' }}>$</Text>E
        </Text>
        <Text style={f.leftTag}>SHOP TOGETHER, SAVE TOGETHER</Text>
        <View style={f.leftDivider}/>
        <Text style={f.leftHeading}>{heading}</Text>
        <Text style={f.leftSub}>{sub}</Text>
        <TouchableOpacity style={f.leftBtn} onPress={onBtnPress} activeOpacity={0.85}>
          <Text style={f.leftBtnTxt}>{btnLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// SIGN UP
// ══════════════════════════════════════════════════════════════
function SignUpScreen({ onBack, onSuccess, onSignIn }: {
  onBack: () => void; onSuccess: () => void; onSignIn?: () => void;
}) {
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'',
    phone:'', password:'', confirmPassword:'',
  });
  const [errors,        setErrors]        = useState<any>({});
  const [submitting,    setSubmitting]    = useState(false);
  const [agreed,        setAgreed]        = useState(false);
  const [offers,        setOffers]        = useState(false);
  const [pwStrength,    setPwStrength]    = useState(0);
  const [socialLoading, setSocialLoading] = useState<string|null>(null);

  const set = (key: string) => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (key === 'password') {
      let s = 0;
      if (val.length >= 8)          s++;
      if (/[A-Z]/.test(val))        s++;
      if (/[0-9]/.test(val))        s++;
      if (/[^A-Za-z0-9]/.test(val)) s++;
      setPwStrength(s);
    }
  };

  const strengthColor = ['#FC8181','#F6AD55','#68D391','#38A169'][pwStrength-1] || '#E2E8F0';
  const strengthLabel = ['','Weak','Fair','Good','Strong'][pwStrength] || '';

  const handleSocial = async (provider: 'google'|'apple') => {
    try {
      setSocialLoading(provider); setErrors({});
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrors({ submit: err.message || `${provider} sign-in failed.` });
    } finally { setSocialLoading(null); }
  };

  const handleSubmit = async () => {
    const e: any = {};
    if (!form.firstName)                        e.firstName       = 'Required';
    if (!form.lastName)                         e.lastName        = 'Required';
    if (!form.email)                            e.email           = 'Required';
    if (!form.phone)                            e.phone           = 'Required';
    if (!form.password)                         e.password        = 'Required';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!agreed)                                e.agreed          = 'You must agree to the terms';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    try {
      setSubmitting(true); setErrors({});
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(), password: form.password,
        options: { data: {
          first_name: form.firstName.trim(),
          last_name:  form.lastName.trim(),
          phone:      form.phone.trim(),
        }},
      });
      if (signUpError) throw new Error(signUpError.message);
      if (!data.user)  throw new Error('Account creation failed');
      await new Promise(r => setTimeout(r, 800));
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: form.firstName.trim(), last_name: form.lastName.trim(),
        phone: form.phone.trim(),
        phone_verified: false, nin_verified: false, face_verified: false,
      }, { onConflict: 'id' });
      if (profileError) throw new Error(profileError.message);
      onSuccess();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Sign up failed.' });
    } finally { setSubmitting(false); }
  };

  // Mobile
  if (Platform.OS !== 'web') {
    return (
      <View style={f.root}>
        <View style={[f.mapBg,{backgroundColor:BG}]}>
          {Array.from({length:18}).map((_,i)=>(
            <View key={`h${i}`} style={[f.gH,{top:`${(i/18)*100}%` as any}]}/>
          ))}
          {Array.from({length:16}).map((_,i)=>(
            <View key={`v${i}`} style={[f.gV,{left:`${(i/16)*100}%` as any}]}/>
          ))}
          <View style={f.frost}/>
        </View>
        <ScrollView style={{flex:1}} contentContainerStyle={f.mobileScroll}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={f.mobileCard}>
            <Text style={f.mLogo}>SPLITWI<Text style={{color:TEAL_DARK}}>$</Text>E</Text>
            <Text style={f.mTag}>SHOP TOGETHER, SAVE TOGETHER</Text>
            <Text style={f.mTitle}>Create Account</Text>
            <View style={f.socialRow}>
              <SocialBtn label={socialLoading==='google'?'...':'Google'} icon={<GoogleSVG/>}
                onPress={()=>handleSocial('google')} disabled={!!socialLoading}/>
              <SocialBtn label={socialLoading==='apple'?'...':'Apple'} icon={<AppleSVG/>}
                onPress={()=>handleSocial('apple')} disabled={!!socialLoading}/>
            </View>
            <OrDivider/>
            <View style={f.nameRow}>
              <View style={{flex:1}}>
                <Input placeholder="First name" value={form.firstName}
                  onChangeText={set('firstName')} required error={errors.firstName} icon={<UserSVG/>}/>
              </View>
              <View style={{width:10}}/>
              <View style={{flex:1}}>
                <Input placeholder="Last name" value={form.lastName}
                  onChangeText={set('lastName')} required error={errors.lastName}/>
              </View>
            </View>
            <Input placeholder="Email address" value={form.email} onChangeText={set('email')}
              keyboardType="email-address" required error={errors.email} icon={<EmailSVG/>}/>
            <Input placeholder="Phone (+234...)" value={form.phone} onChangeText={set('phone')}
              keyboardType="phone-pad" required error={errors.phone} icon={<PhoneSVG/>}/>
            <Input placeholder="Password" value={form.password} onChangeText={set('password')}
              secureTextEntry required error={errors.password} icon={<LockSVG/>}/>
            {form.password.length > 0 && (
              <View style={f.strengthWrap}>
                <View style={f.strengthBars}>
                  {[1,2,3,4].map(i=>(
                    <View key={i} style={[f.strengthBar,
                      {backgroundColor:i<=pwStrength?strengthColor:'#E2E8F0'}]}/>
                  ))}
                </View>
                <Text style={[f.strengthLabel,{color:strengthColor}]}>{strengthLabel}</Text>
              </View>
            )}
            <Input placeholder="Confirm password" value={form.confirmPassword}
              onChangeText={set('confirmPassword')} secureTextEntry required
              error={errors.confirmPassword} icon={<LockSVG/>}/>
            <TouchableOpacity style={f.checkRow} onPress={()=>setAgreed(a=>!a)}>
              <View style={[f.checkbox,agreed&&{backgroundColor:TEAL_DARK,borderColor:TEAL_DARK}]}>
                {agreed && <CheckSVG/>}
              </View>
              <Text style={f.checkTxt}>
                I agree to the <Text style={{color:TEAL_DARK,fontWeight:'600'}}>Terms of Service</Text>
                {' '}and <Text style={{color:TEAL_DARK,fontWeight:'600'}}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.agreed&&<Text style={f.error}>{errors.agreed}</Text>}
            <ErrorBanner message={errors.submit||''}/>
            <View style={f.btnRow}>
              <TouchableOpacity style={f.backBtn} onPress={onBack}>
                <Text style={f.backBtnTxt}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[f.mainBtn,{flex:2},submitting&&{opacity:0.7}]}
                onPress={handleSubmit} disabled={submitting}>
                <Text style={f.mainBtnTxt}>{submitting?'CREATING...':'SIGN UP'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onSignIn} style={f.switchLink}>
              <Text style={f.switchTxt}>
                Already have an account?{' '}
                <Text style={{color:TEAL_DARK,fontWeight:'700'}}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Web
  return (
    <View style={f.root}>
      <View style={f.splitRoot}>
        <LeftPanel
          heading={'Already have\nan account?'}
          sub={'Sign in to find nearby shoppers,\nsplit delivery and save more.'}
          btnLabel="SIGN IN"
          onBtnPress={onSignIn!}
        />
        <ScrollView style={f.rightPanel} contentContainerStyle={f.rightScroll}
          showsVerticalScrollIndicator={false}>
          <Text style={f.rightTitle}>Create Account</Text>
          <Text style={f.rightSubtitle}>Join thousands saving on delivery fees</Text>

          <View style={f.socialRow}>
            <SocialBtn label={socialLoading==='google'?'Connecting...':'Google'} icon={<GoogleSVG/>}
              onPress={()=>handleSocial('google')} disabled={!!socialLoading}/>
            <SocialBtn label={socialLoading==='apple'?'Connecting...':'Apple'} icon={<AppleSVG/>}
              onPress={()=>handleSocial('apple')} disabled={!!socialLoading}/>
          </View>

          <OrDivider/>

          <View style={f.nameRow}>
            <View style={{flex:1}}>
              <Input placeholder="First name" value={form.firstName}
                onChangeText={set('firstName')} required error={errors.firstName} icon={<UserSVG/>}/>
            </View>
            <View style={{width:12}}/>
            <View style={{flex:1}}>
              <Input placeholder="Last name" value={form.lastName}
                onChangeText={set('lastName')} required error={errors.lastName}/>
            </View>
          </View>

          <Input placeholder="Email address" value={form.email} onChangeText={set('email')}
            keyboardType="email-address" required error={errors.email} icon={<EmailSVG/>}/>
          <Input placeholder="Phone number (+234...)" value={form.phone} onChangeText={set('phone')}
            keyboardType="phone-pad" required error={errors.phone} icon={<PhoneSVG/>}/>
          <Input placeholder="Password" value={form.password} onChangeText={set('password')}
            secureTextEntry required error={errors.password} icon={<LockSVG/>}/>

          {form.password.length > 0 && (
            <View style={f.strengthWrap}>
              <View style={f.strengthBars}>
                {[1,2,3,4].map(i=>(
                  <View key={i} style={[f.strengthBar,
                    {backgroundColor:i<=pwStrength?strengthColor:'#E2E8F0'}]}/>
                ))}
              </View>
              <Text style={[f.strengthLabel,{color:strengthColor}]}>{strengthLabel}</Text>
            </View>
          )}

          <Input placeholder="Confirm password" value={form.confirmPassword}
            onChangeText={set('confirmPassword')} secureTextEntry required
            error={errors.confirmPassword} icon={<LockSVG/>}/>

          <TouchableOpacity style={f.checkRow} onPress={()=>setAgreed(a=>!a)}>
            <View style={[f.checkbox,agreed&&{backgroundColor:TEAL_DARK,borderColor:TEAL_DARK}]}>
              {agreed && <CheckSVG/>}
            </View>
            <Text style={f.checkTxt}>
              I agree to the <Text style={{color:TEAL_DARK,fontWeight:'600'}}>Terms of Service</Text>
              {' '}and <Text style={{color:TEAL_DARK,fontWeight:'600'}}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.agreed&&<Text style={f.error}>{errors.agreed}</Text>}

          <TouchableOpacity style={f.checkRow} onPress={()=>setOffers(o=>!o)}>
            <View style={[f.checkbox,offers&&{backgroundColor:TEAL_DARK,borderColor:TEAL_DARK}]}>
              {offers && <CheckSVG/>}
            </View>
            <Text style={f.checkTxt}>Send me tips and exclusive offers</Text>
          </TouchableOpacity>

          <ErrorBanner message={errors.submit||''}/>

          <TouchableOpacity style={[f.mainBtn,submitting&&{opacity:0.7}]}
            onPress={handleSubmit} disabled={submitting}>
            <Text style={f.mainBtnTxt}>{submitting?'CREATING...':'SIGN UP'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// SIGN IN
// ══════════════════════════════════════════════════════════════
function SignInScreen({ onBack, onSuccess, onSignUp }: {
  onBack: () => void; onSuccess: () => void; onSignUp?: () => void;
}) {
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [rememberMe,    setRememberMe]    = useState(false);
  const [errors,        setErrors]        = useState<any>({});
  const [submitting,    setSubmitting]    = useState(false);
  const [socialLoading, setSocialLoading] = useState<string|null>(null);

  const handleSocial = async (provider: 'google'|'apple') => {
    try {
      setSocialLoading(provider); setErrors({});
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrors({ submit: err.message || `${provider} sign-in failed.` });
    } finally { setSocialLoading(null); }
  };

  const handleSignIn = async () => {
    const e: any = {};
    if (!email)    e.email    = 'Required';
    if (!password) e.password = 'Required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    try {
      setSubmitting(true); setErrors({});
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
      });
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Sign in failed.' });
    } finally { setSubmitting(false); }
  };

  // ── Shared remember + forgot row ──
  const RememberRow = () => (
    <View style={f.rememberRow}>
      <TouchableOpacity style={f.rememberLeft} onPress={()=>setRememberMe(r=>!r)} activeOpacity={0.7}>
        <View style={[f.rememberBox, rememberMe && {backgroundColor:TEAL_DARK,borderColor:TEAL_DARK}]}>
          {rememberMe && <CheckSVG/>}
        </View>
        <Text style={f.rememberTxt}>Stay signed in</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={f.forgotTxt}>Forgot password?</Text>
      </TouchableOpacity>
    </View>
  );

  // Mobile
  if (Platform.OS !== 'web') {
    return (
      <View style={f.root}>
        <View style={[f.mapBg,{backgroundColor:BG}]}>
          {Array.from({length:18}).map((_,i)=>(
            <View key={`h${i}`} style={[f.gH,{top:`${(i/18)*100}%` as any}]}/>
          ))}
          {Array.from({length:16}).map((_,i)=>(
            <View key={`v${i}`} style={[f.gV,{left:`${(i/16)*100}%` as any}]}/>
          ))}
          <View style={f.frost}/>
        </View>
        <ScrollView style={{flex:1}} contentContainerStyle={f.mobileScroll}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={f.mobileCard}>
            <Text style={f.mLogo}>SPLITWI<Text style={{color:TEAL_DARK}}>$</Text>E</Text>
            <Text style={f.mTag}>SHOP TOGETHER, SAVE TOGETHER</Text>
            <Text style={f.mTitle}>Welcome Back</Text>
            <Text style={{fontSize:13,color:MID,textAlign:'center',marginBottom:20}}>
              Sign in to continue saving
            </Text>
            <View style={f.socialRow}>
              <SocialBtn label={socialLoading==='google'?'...':'Google'} icon={<GoogleSVG/>}
                onPress={()=>handleSocial('google')} disabled={!!socialLoading}/>
              <SocialBtn label={socialLoading==='apple'?'...':'Apple'} icon={<AppleSVG/>}
                onPress={()=>handleSocial('apple')} disabled={!!socialLoading}/>
            </View>
            <OrDivider label="OR USE YOUR EMAIL"/>
            <Input placeholder="Email address" value={email} onChangeText={setEmail}
              keyboardType="email-address" required error={errors.email} icon={<EmailSVG/>}/>
            <Input placeholder="Password" value={password} onChangeText={setPassword}
              secureTextEntry required error={errors.password} icon={<LockSVG/>}/>
            <RememberRow/>
            <ErrorBanner message={errors.submit||''}/>
            <TouchableOpacity style={[f.mainBtn,submitting&&{opacity:0.7}]}
              onPress={handleSignIn} disabled={submitting}>
              <Text style={f.mainBtnTxt}>{submitting?'SIGNING IN...':'SIGN IN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSignUp} style={f.switchLink}>
              <Text style={f.switchTxt}>
                Don't have an account?{' '}
                <Text style={{color:TEAL_DARK,fontWeight:'700'}}>Create one</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBack} style={[f.switchLink,{marginTop:4}]}>
              <Text style={{color:TEAL_DARK,fontWeight:'700',fontSize:13}}>← Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Web
  return (
    <View style={f.root}>
      <View style={f.splitRoot}>
        <LeftPanel
          heading={'New here?'}
          sub={'Sign up to find nearby shoppers,\nsplit delivery and save together.'}
          btnLabel="SIGN UP"
          onBtnPress={onSignUp!}
        />
        <ScrollView style={f.rightPanel} contentContainerStyle={f.rightScroll}
          showsVerticalScrollIndicator={false}>
          <Text style={f.rightTitle}>Welcome Back</Text>
          <Text style={f.rightSubtitle}>Sign in to continue saving with your group</Text>

          <View style={f.socialRow}>
            <SocialBtn label={socialLoading==='google'?'Connecting...':'Google'} icon={<GoogleSVG/>}
              onPress={()=>handleSocial('google')} disabled={!!socialLoading}/>
            <SocialBtn label={socialLoading==='apple'?'Connecting...':'Apple'} icon={<AppleSVG/>}
              onPress={()=>handleSocial('apple')} disabled={!!socialLoading}/>
          </View>

          <OrDivider label="OR USE YOUR EMAIL"/>

          <Input placeholder="Email address" value={email} onChangeText={setEmail}
            keyboardType="email-address" required error={errors.email} icon={<EmailSVG/>}/>
          <Input placeholder="Password" value={password} onChangeText={setPassword}
            secureTextEntry required error={errors.password} icon={<LockSVG/>}/>

          <RememberRow/>

          <ErrorBanner message={errors.submit||''}/>

          <TouchableOpacity style={[f.mainBtn,submitting&&{opacity:0.7}]}
            onPress={handleSignIn} disabled={submitting}>
            <Text style={f.mainBtnTxt}>{submitting?'SIGNING IN...':'SIGN IN'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════════
interface AuthScreenProps {
  mode?: 'signup'|'signin';
  onBack: () => void;
  onSuccess: () => void;
  onSwitchToSignIn?: () => void;
  onSwitchToSignUp?: () => void;
}

export default function AuthScreen({
  mode = 'signup', onBack, onSuccess,
  onSwitchToSignIn, onSwitchToSignUp,
}: AuthScreenProps) {
  if (mode === 'signin') {
    return <SignInScreen onBack={onBack} onSuccess={onSuccess} onSignUp={onSwitchToSignUp}/>;
  }
  return <SignUpScreen onBack={onBack} onSuccess={onSuccess} onSignIn={onSwitchToSignIn}/>;
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const f = StyleSheet.create({
  root: { flex:1, backgroundColor:BG },

  // Mobile bg
  mapBg: { position:'absolute',top:0,left:0,right:0,bottom:0,overflow:'hidden' },
  gH:    { position:'absolute',left:0,right:0,height:1,backgroundColor:'#17B8B80E' },
  gV:    { position:'absolute',top:0,bottom:0,width:1,backgroundColor:'#17B8B809' },
  frost: { position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#F8FEFEFD' },

  // Split
  splitRoot: { flex:1, flexDirection:'row', minHeight:'100vh' as any },

  // Left panel — full map, no card
  leftPanel: {
    width:'40%' as any,
    minHeight:'100vh' as any,
    justifyContent:'center',
    alignItems:'center',
    position:'relative',
    overflow:'hidden',
  },
  leftContent: {
    alignItems:'center', zIndex:2, paddingHorizontal:36,
  },
  leftLogo: {
    fontSize:26, fontWeight:'900', color:WHITE,
    letterSpacing:2, textAlign:'center', marginBottom:5,
  },
  leftTag: {
    fontSize:8, fontWeight:'800', color:WHITE+'99',
    letterSpacing:3, textAlign:'center', marginBottom:28,
  },
  leftDivider: {
    width:36, height:2, backgroundColor:WHITE+'55',
    borderRadius:1, marginBottom:26,
  },
  leftHeading: {
    fontSize:32, fontWeight:'900', color:WHITE,
    textAlign:'center', lineHeight:40, marginBottom:14,
  },
  leftSub: {
    fontSize:13, color:WHITE+'CC', textAlign:'center',
    lineHeight:20, marginBottom:36,
  },
  leftBtn: {
    borderWidth:2, borderColor:WHITE,
    borderRadius:30, paddingVertical:13, paddingHorizontal:38,
  },
  leftBtnTxt: {
    color:WHITE, fontSize:13, fontWeight:'800', letterSpacing:2,
  },

  // Right panel
  rightPanel:  { flex:1, backgroundColor:WHITE },
  rightScroll: {
    paddingHorizontal:52, paddingTop:64, paddingBottom:60,
    maxWidth:480, alignSelf:'center' as any, width:'100%' as any,
  },
  rightTitle:    { fontSize:30,fontWeight:'900',color:DARK,textAlign:'center',marginBottom:6,letterSpacing:-0.5 },
  rightSubtitle: { fontSize:13,color:MID,textAlign:'center',marginBottom:28 },

  // Social
  socialRow: { flexDirection:'row', justifyContent:'center', gap:14, marginBottom:4 },
  socialBtn: {
    flexDirection:'row', alignItems:'center', gap:8,
    paddingVertical:12, paddingHorizontal:22,
    borderRadius:30, borderWidth:1.5, borderColor:LIGHT_BORDER,
    backgroundColor:WHITE,
    shadowColor:'#000', shadowOffset:{width:0,height:1},
    shadowOpacity:0.06, shadowRadius:4, elevation:2,
  },
  socialBtnIcon: { width:20, height:20, alignItems:'center', justifyContent:'center' },
  socialBtnTxt:  { fontSize:13, fontWeight:'700', color:DARK },

  // Or divider
  orRow:  { flexDirection:'row', alignItems:'center', marginVertical:22, gap:10 },
  orLine: { flex:1, height:1, backgroundColor:LIGHT_BORDER },
  orTxt:  { fontSize:9, fontWeight:'800', color:MID, letterSpacing:2 },

  // Inputs
  nameRow:       { flexDirection:'row' },
  inputWrap:     { marginBottom:12 },
  label:         { fontSize:13, fontWeight:'600', color:DARK, marginBottom:6 },
  inputBox:      {
    flexDirection:'row', alignItems:'center',
    borderWidth:1, borderColor:LIGHT_BORDER,
    borderRadius:10, backgroundColor:BG, paddingHorizontal:14,
  },
  inputIconWrap: { marginRight:8 },
  input:         { flex:1, paddingVertical:13, fontSize:14, color:DARK },
  eyeBtn:        { padding:6 },
  hint:          { fontSize:11, color:MID, marginTop:4 },
  error:         { fontSize:11, color:ERROR, marginTop:4 },

  // Password strength
  strengthWrap:  { flexDirection:'row', alignItems:'center', gap:8, marginBottom:8 },
  strengthBars:  { flexDirection:'row', gap:4, flex:1 },
  strengthBar:   { flex:1, height:4, borderRadius:2 },
  strengthLabel: { fontSize:11, fontWeight:'700', minWidth:40 },

  // Checkboxes
  checkRow:  { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:12 },
  checkbox:  { width:20, height:20, borderRadius:5, borderWidth:1.5, borderColor:LIGHT_BORDER, alignItems:'center', justifyContent:'center', marginTop:1 },
  checkMark: { color:WHITE, fontSize:12, fontWeight:'800' },
  checkTxt:  { flex:1, fontSize:13, color:DARK, lineHeight:20 },

  // ✅ Remember me row
  rememberRow: {
    flexDirection:'row', alignItems:'center',
    justifyContent:'space-between',
    marginBottom:20, marginTop:4,
  },
  rememberLeft: {
    flexDirection:'row', alignItems:'center', gap:8,
  },
  rememberBox: {
    width:18, height:18, borderRadius:4,
    borderWidth:1.5, borderColor:LIGHT_BORDER,
    alignItems:'center', justifyContent:'center',
    backgroundColor:WHITE,
  },
  rememberTxt: { fontSize:13, color:MID, fontWeight:'500' },
  forgotTxt:   { color:TEAL_DARK, fontSize:13, fontWeight:'600' },

  // Error banner
  errorBanner:    { backgroundColor:'#FFF5F5', borderRadius:10, padding:12, marginBottom:12, borderWidth:1, borderColor:'#FC8181' },
  errorBannerTxt: { color:'#C53030', fontSize:13, fontWeight:'600' },

  // Main CTA
  mainBtn: {
    backgroundColor:TEAL_DARK, borderRadius:30,
    paddingVertical:15, alignItems:'center', marginTop:8,
    shadowColor:TEAL_DARK, shadowOffset:{width:0,height:4},
    shadowOpacity:0.3, shadowRadius:10, elevation:5,
  },
  mainBtnTxt: { color:WHITE, fontSize:14, fontWeight:'800', letterSpacing:2 },

  // Mobile card
  mobileScroll: {
    paddingHorizontal:16,
    paddingTop: Platform.OS==='ios' ? 60 : 48,
    paddingBottom:40,
  },
  mobileCard: {
    backgroundColor:WHITE, borderRadius:24, padding:28,
    borderWidth:1, borderColor:LIGHT_BORDER,
    shadowColor:TEAL_DARK, shadowOffset:{width:0,height:6},
    shadowOpacity:0.08, shadowRadius:20, elevation:5,
  },
  mLogo:  { fontSize:24, fontWeight:'900', color:TEAL_DARK, textAlign:'center', letterSpacing:1.5 },
  mTag:   { fontSize:9, fontWeight:'700', color:TEAL, textAlign:'center', letterSpacing:2.5, marginTop:4, marginBottom:16 },
  mTitle: { fontSize:26, fontWeight:'900', color:DARK, textAlign:'center', marginBottom:20 },

  btnRow:     { flexDirection:'row', gap:12, marginTop:24 },
  backBtn:    { flex:1, paddingVertical:14, borderRadius:12, borderWidth:1.5, borderColor:LIGHT_BORDER, alignItems:'center' },
  backBtnTxt: { color:MID, fontSize:15, fontWeight:'700' },
  switchLink: { marginTop:16, alignItems:'center' },
  switchTxt:  { fontSize:13, color:MID },
});