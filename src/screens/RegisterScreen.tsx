import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) Alert.alert('Registration Failed', error.message);
    else Alert.alert('🎉 Account Created!', 'Please check your email to verify your account.');
    setLoading(false);
  }

  const inputFocusStyle = (field: string) =>
    focusedField === field ? styles.inputWrapperFocused : {};

  return (
    <LinearGradient colors={['#0d1b2a', '#1a2e47', '#0f3a2a']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#4ade80', '#22c55e', '#16a34a']}
              style={styles.logoCircle}
            >
              <Text style={styles.logoEmoji}>🌱</Text>
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join PlantGuard AI and protect your crops</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Steps indicator */}
            <View style={styles.stepsRow}>
              <View style={styles.stepActive}><Text style={styles.stepText}>1</Text></View>
              <View style={styles.stepLine} />
              <View style={styles.stepInactive}><Text style={styles.stepTextInactive}>2</Text></View>
            </View>
            <Text style={styles.stepLabel}>Account Information</Text>

            {/* Full Name */}
            <View style={[styles.inputWrapper, inputFocusStyle('name')]}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Email */}
            <View style={[styles.inputWrapper, inputFocusStyle('email')]}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrapper, inputFocusStyle('password')]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Password strength hint */}
            <View style={styles.hintRow}>
              {['Weak', 'Fair', 'Strong'].map((label, i) => (
                <View
                  key={label}
                  style={[
                    styles.hintBar,
                    password.length > i * 4 && styles.hintBarActive,
                  ]}
                />
              ))}
              <Text style={styles.hintText}>
                {password.length === 0 ? 'Enter password' :
                  password.length < 5 ? 'Weak' :
                  password.length < 9 ? 'Fair' : 'Strong'}
              </Text>
            </View>

            {/* Register button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading ? ['#64748b', '#64748b'] : ['#22c55e', '#16a34a']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {loading ? '⏳  Creating account...' : 'Create Account →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Sign in link */}
          <TouchableOpacity
            style={styles.signInRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  kav: { flex: 1 },
  blob1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(34,197,94,0.1)',
    top: -60,
    left: -80,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(34,197,94,0.07)',
    bottom: 40,
    right: -60,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    marginTop: 56,
    marginBottom: 16,
  },
  backBtnText: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoEmoji: { fontSize: 36 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 8,
  },
  stepInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextInactive: { color: '#64748b', fontSize: 13 },
  stepLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  inputWrapperFocused: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    paddingVertical: 15,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  hintBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  hintBarActive: { backgroundColor: '#22c55e' },
  hintText: { color: '#64748b', fontSize: 11, marginLeft: 8 },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termsText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: { color: '#4ade80' },
  signInRow: { alignItems: 'center', marginTop: 24 },
  signInText: { color: '#94a3b8', fontSize: 14 },
  signInHighlight: { color: '#4ade80', fontWeight: '700' },
});
