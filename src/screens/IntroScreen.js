import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { speak, stopSpeech } from '../utils/speech';
import { SiyaraUnicorn } from '../characters';

const { width, height } = Dimensions.get('window');

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const [step, setStep] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const siyaraScale = useSharedValue(0);
  const siyaraY = useSharedValue(50);
  const textOpacity = useSharedValue(0);
  const bubbleScale = useSharedValue(0);
  const starsOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  const introMessages = [
    "Hi there, friend! I'm Siyara the Unicorn!",
    "Welcome to Unicorn Learning!",
    "Here you can learn Numbers, Letters, Adding, and Taking Away!",
    "My unicorn friends will help you learn and have fun!",
    "Are you ready to play? Tap the button to start!",
  ];

  // Track all timeouts for cleanup
  const timeoutRefs = React.useRef([]);

  useEffect(() => {
    // Start the intro animation sequence
    startIntroSequence();

    // Cleanup on unmount - stop speech and clear all timeouts
    return () => {
      stopSpeech();
      timeoutRefs.current.forEach(t => clearTimeout(t));
      timeoutRefs.current = [];
    };
  }, []);

  const startIntroSequence = async () => {
    // Helper to add timeout with tracking
    const addTimeout = (callback, delay) => {
      const t = setTimeout(callback, delay);
      timeoutRefs.current.push(t);
      return t;
    };

    // Step 1: Siyara appears with bounce
    siyaraScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    siyaraY.value = withSpring(0, { damping: 10 });

    // Show floating animation
    addTimeout(() => {
      siyaraY.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 500);

    // Step 2: Speech bubble appears
    addTimeout(() => {
      bubbleScale.value = withSpring(1, { damping: 10 });
      textOpacity.value = withTiming(1, { duration: 400 });
      setStep(0);
      speak(introMessages[0]);
    }, 800);

    // Step 3: Continue with messages
    addTimeout(() => {
      setStep(1);
      speak(introMessages[1]);
    }, 4000);

    // Show sparkle stars
    addTimeout(() => {
      starsOpacity.value = withTiming(1, { duration: 500 });
    }, 5000);

    addTimeout(() => {
      setStep(2);
      speak(introMessages[2]);
    }, 7000);

    addTimeout(() => {
      setStep(3);
      speak(introMessages[3]);
    }, 12000);

    addTimeout(() => {
      setStep(4);
      speak(introMessages[4]);
      // Show the play button
      setShowButton(true);
      buttonScale.value = withSpring(1, { damping: 8 });
    }, 16000);
  };

  const handlePlayPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    stopSpeech();
    speak("Let's go!");

    // Animate out
    siyaraScale.value = withTiming(0.5, { duration: 300 });
    textOpacity.value = withTiming(0, { duration: 200 });
    buttonScale.value = withTiming(0, { duration: 200 });

    setTimeout(() => {
      navigate('Home');
    }, 500);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopSpeech();
    navigate('Home');
  };

  const siyaraStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: siyaraScale.value },
      { translateY: siyaraY.value },
    ],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
    opacity: textOpacity.value,
  }));

  const starsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      {/* Skip button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 10 }]}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Sparkle stars background */}
      <Animated.View style={[styles.starsContainer, starsStyle]}>
        <View style={styles.star}>
          <MaterialCommunityIcons name="shimmer" size={30} color="#FFD700" />
        </View>
        <View style={[styles.star, styles.star2]}>
          <MaterialCommunityIcons name="star" size={35} color="#FFD700" />
        </View>
        <View style={[styles.star, styles.star3]}>
          <MaterialCommunityIcons name="shimmer" size={28} color="#FFC107" />
        </View>
        <View style={[styles.star, styles.star4]}>
          <MaterialCommunityIcons name="star-four-points" size={32} color="#FFA000" />
        </View>
        <View style={[styles.star, styles.star5]}>
          <MaterialCommunityIcons name="shimmer" size={30} color="#FFD700" />
        </View>
        <View style={[styles.star, styles.star6]}>
          <MaterialCommunityIcons name="star" size={35} color="#FFC107" />
        </View>
      </Animated.View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Siyara character */}
        <Animated.View style={[styles.characterContainer, siyaraStyle]}>
          <SiyaraUnicorn size={320} speaking sparkle />
        </Animated.View>

        {/* Speech bubble */}
        <Animated.View style={[styles.speechBubble, bubbleStyle]}>
          <Text style={styles.speechText}>{introMessages[step]}</Text>
        </Animated.View>

        {/* Play button */}
        {showButton && (
          <Animated.View style={[styles.playButtonContainer, buttonStyle]}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.playButtonGradient}
              >
                <Text style={styles.playButtonText}>Let's Play!</Text>
                <MaterialCommunityIcons name="party-popper" size={24} color="white" style={styles.playIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Bottom decorative elements */}
      <View style={styles.bottomDecoration}>
        <MaterialCommunityIcons name="star-four-points" size={30} color="#FFD700" />
        <MaterialCommunityIcons name="palette" size={40} color="#FF5722" />
        <MaterialCommunityIcons name="star-four-points" size={30} color="#FFD700" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    fontSize: 30,
  },
  star2: {
    top: '15%',
    left: '10%',
    fontSize: 35,
  },
  star3: {
    top: '20%',
    right: '15%',
    fontSize: 28,
  },
  star4: {
    top: '45%',
    left: '5%',
    fontSize: 40,
  },
  star5: {
    top: '60%',
    right: '8%',
    fontSize: 32,
  },
  star6: {
    top: '75%',
    left: '15%',
    fontSize: 36,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  speechBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 30,
    maxWidth: width * 0.85,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 30,
  },
  speechText: {
    fontSize: 24,
    color: '#764ba2',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
  },
  playButtonContainer: {
    marginTop: 10,
  },
  playButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playIcon: {
    marginLeft: 8,
  },
  bottomDecoration: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    paddingBottom: 40,
  },
  decorEmoji: {
    fontSize: 40,
  },
});
