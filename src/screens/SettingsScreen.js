import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';
import { setVoiceEnabled } from '../utils/speech';
import { setMusicEnabled, setSoundEnabled } from '../utils/music';
import { APP_INFO } from '../config/content';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const {
    musicEnabled,
    toggleMusic,
    soundEnabled,
    toggleSound,
    voiceEnabled,
    toggleVoice,
    totalStars,
    totalScore,
    resetProgress,
  } = useGame();
  const { isPremium, accessLevel } = usePremium();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigate('Home');
  };

  const handleMusicToggle = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleMusic(value);
    setMusicEnabled(value);
  };

  const handleSoundToggle = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSound(value);
    setSoundEnabled(value);
  };

  const handleVoiceToggle = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleVoice(value);
    setVoiceEnabled(value);
  };

  const handleResetProgress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Reset Progress?',
      'This will reset all stars and scores. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert('Done!', 'Progress has been reset.');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // For now, show an alert. In production, link to hosted privacy policy
    Alert.alert(
      'Privacy Policy',
      'Unicorn Learning respects your privacy.\n\n' +
      '• We do NOT collect any personal information\n' +
      '• We do NOT track your activity\n' +
      '• All progress data is stored locally on your device\n' +
      '• We do NOT share any data with third parties\n\n' +
      'This app is COPPA compliant and safe for children.',
      [{ text: 'OK' }]
    );
  };

  const SettingRow = ({ icon, label, value, onValueChange, type = 'toggle' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#667eea" />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#ccc', true: '#667eea' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
          ios_backgroundColor="#ccc"
        />
      )}
    </View>
  );

  const SettingButton = ({ icon, label, onPress, danger = false }) => (
    <TouchableOpacity
      style={[styles.settingButton, danger && styles.dangerButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIcon]}>
          <Ionicons name={icon} size={24} color={danger ? '#ff6b6b' : '#667eea'} />
        </View>
        <Text style={[styles.settingLabel, danger && styles.dangerText]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={danger ? '#ff6b6b' : '#999'} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalStars}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalScore}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{isPremium ? 'Full' : 'Free'}</Text>
                <Text style={styles.statLabel}>Access</Text>
              </View>
            </View>
          </View>

          {/* Sound Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound</Text>
            <View style={styles.card}>
              <SettingRow
                icon="musical-notes"
                label="Background Music"
                value={musicEnabled}
                onValueChange={handleMusicToggle}
              />
              <View style={styles.divider} />
              <SettingRow
                icon="volume-high"
                label="Sound Effects"
                value={soundEnabled}
                onValueChange={handleSoundToggle}
              />
              <View style={styles.divider} />
              <SettingRow
                icon="mic"
                label="Voice Narration"
                value={voiceEnabled}
                onValueChange={handleVoiceToggle}
              />
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <SettingButton
                icon="shield-checkmark"
                label="Privacy Policy"
                onPress={handlePrivacyPolicy}
              />
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="information-circle" size={24} color="#667eea" />
                  </View>
                  <Text style={styles.settingLabel}>Version</Text>
                </View>
                <Text style={styles.versionText}>{APP_INFO.version}</Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <View style={styles.card}>
              <SettingButton
                icon="refresh"
                label="Reset All Progress"
                onPress={handleResetProgress}
                danger
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with love for little learners</Text>
            <View style={styles.footerIcons}>
              <MaterialCommunityIcons name="heart" size={20} color="#FF6B6B" />
              <MaterialCommunityIcons name="star-four-points" size={20} color="#FFD700" />
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 64,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  dangerIcon: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  dangerText: {
    color: '#ff6b6b',
  },
  versionText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  footerIcons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
