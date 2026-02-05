import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { speak } from '../utils/speech';

export default function GameHeader({
  title,
  score = 0,
  onBack,
  color = '#667eea',
  questionsAnswered = 0,
  totalQuestions = 5,
  showProgress = true,
}) {
  const insets = useSafeAreaInsets();
  const progress = totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0;

  const handleHomePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    speak('Going home!');
    // Small delay so the speech can start before navigating
    setTimeout(() => {
      if (onBack) onBack();
    }, 300);
  };

  const handleSpeakPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speak(`You are playing ${title}. You have ${score} points.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Home Button - bigger and more visible */}
        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: color }]}
          onPress={handleHomePress}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={28} color="white" />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <MaterialCommunityIcons name="star" size={20} color="#FFD700" style={styles.starIcon} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      {showProgress && questionsAnswered > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
          </View>
        </View>
      )}

      {/* Speak Button - floating */}
      <TouchableOpacity
        style={styles.speakButton}
        onPress={handleSpeakPress}
        activeOpacity={0.7}
      >
        <Ionicons name="volume-high" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeButton: {
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  starIcon: {
    marginRight: 6,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBackground: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  speakButton: {
    position: 'absolute',
    right: 15,
    bottom: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
