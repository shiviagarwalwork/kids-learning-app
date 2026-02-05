import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  SiyaraUnicorn,
  BunnyFriend,
  DogFriend,
  CatFriend,
  OwlFriend,
} from '../characters';

const { width, height } = Dimensions.get('window');

// Confetti piece component
function ConfettiPiece({ delay, startX }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const colors = ['#ff6b6b', '#ffd700', '#4facfe', '#43e97b', '#f093fb', '#fee140'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(height + 50, { duration: 3000 })
    );
    translateX.value = withDelay(
      delay,
      withTiming(startX + (Math.random() - 0.5) * 100, { duration: 3000 })
    );
    rotate.value = withDelay(
      delay,
      withTiming(720, { duration: 3000 })
    );
    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

export default function CelebrationOverlay({ onComplete, message, character: Character }) {
  const scale = useSharedValue(0);
  const friendsScale = useSharedValue(0);
  const [confetti, setConfetti] = useState([]);

  const messages = [
    'Amazing!',
    'Super Star!',
    'Fantastic!',
    'You Did It!',
    'Wonderful!',
  ];
  const displayMessage = message || messages[Math.floor(Math.random() * messages.length)];

  useEffect(() => {
    // Create confetti
    const pieces = [];
    for (let i = 0; i < 40; i++) {
      pieces.push({
        id: i,
        delay: Math.random() * 500,
        startX: Math.random() * width,
      });
    }
    setConfetti(pieces);

    // Animate in
    scale.value = withSpring(1, { damping: 10 });
    friendsScale.value = withDelay(300, withSpring(1, { damping: 12 }));

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const friendsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: friendsScale.value }],
  }));

  // Use the passed character or default to Siyara
  const MainCharacter = Character || SiyaraUnicorn;

  return (
    <View style={styles.overlay}>
      {/* Confetti */}
      {confetti.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          delay={piece.delay}
          startX={piece.startX}
        />
      ))}

      {/* Content */}
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.starsRow}>
          <MaterialCommunityIcons name="star" size={40} color="#FFD700" />
          <MaterialCommunityIcons name="star-four-points" size={45} color="#FFC107" />
          <MaterialCommunityIcons name="star" size={40} color="#FFD700" />
        </View>

        <View style={styles.characterContainer}>
          <MainCharacter size={160} speaking />
        </View>

        <Text style={styles.message}>{displayMessage}</Text>

        {/* Friend characters cheering */}
        <Animated.View style={[styles.friendsRow, friendsStyle]}>
          <BunnyFriend size={60} />
          <DogFriend size={60} />
          <CatFriend size={60} />
          <OwlFriend size={60} />
        </Animated.View>

        <View style={styles.starsContainer}>
          <Text style={styles.starsLabel}>You earned a star!</Text>
          <MaterialCommunityIcons name="star" size={50} color="#FFD700" />
        </View>

        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  content: {
    alignItems: 'center',
    padding: 30,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  characterContainer: {
    marginVertical: 10,
  },
  message: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginVertical: 10,
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  starsContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  starsLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#43e97b',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
});
