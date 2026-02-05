import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { useNavigation } from '../context/NavigationContext';
import { useGame } from '../context/GameContext';
import { speak, stopSpeech } from '../utils/speech';
import GameButton from '../components/GameButton';
import Rainbow from '../components/Rainbow';
import {
  SiyaraUnicorn,
  CelineUnicorn,
  NikolaUnicorn,
  MelodyUnicorn,
  BunnyFriend,
  CatFriend,
  DogFriend,
  OwlFriend,
} from '../characters';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { totalStars } = useGame();

  const titleY = useSharedValue(0);
  const rainbowScale = useSharedValue(0);
  const characterOpacity = useSharedValue(0);
  const siyaraBounce = useSharedValue(0);
  const footerBounce1 = useSharedValue(0);
  const footerBounce2 = useSharedValue(0);
  const footerBounce3 = useSharedValue(0);
  const friendsFloat = useSharedValue(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Animate title
    titleY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );

    // Animate rainbow in
    rainbowScale.value = withDelay(300, withTiming(1, { duration: 800 }));

    // Fade in character
    characterOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));

    // Siyara gentle bounce
    siyaraBounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1200 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      true
    );

    // Footer unicorns bounce with different timings
    footerBounce1.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 800 }),
        withTiming(0, { duration: 800 })
      ),
      -1,
      true
    );

    footerBounce2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(-15, { duration: 900 }),
          withTiming(0, { duration: 900 })
        ),
        -1,
        true
      )
    );

    footerBounce3.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      )
    );

    // Friends float animation
    friendsFloat.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );

    // Welcome message
    timeoutRef.current = setTimeout(() => {
      speak("Welcome to Unicorn Learning! Pick a game to play!");
    }, 800);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopSpeech();
    };
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
  }));

  const rainbowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rainbowScale.value }],
    opacity: rainbowScale.value,
  }));

  const characterStyle = useAnimatedStyle(() => ({
    opacity: characterOpacity.value,
  }));

  const siyaraStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: siyaraBounce.value }],
  }));

  const footer1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: footerBounce1.value }],
  }));

  const footer2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: footerBounce2.value }],
  }));

  const footer3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: footerBounce3.value }],
  }));

  const friendsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: friendsFloat.value }],
  }));

  const handleGamePress = (game) => {
    // GameButton waits for speech to finish before calling this
    navigate(game);
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigate('Settings');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      {/* Settings Button - Fixed Position */}
      <TouchableOpacity
        style={[styles.settingsButton, { top: insets.top + 10 }]}
        onPress={handleSettingsPress}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={26} color="white" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 5, paddingBottom: insets.bottom + 5 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Rainbow decoration */}
        <Animated.View style={[styles.rainbowContainer, rainbowStyle]}>
          <Rainbow width={width * 0.98} height={140} />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <MaterialCommunityIcons name="star-four-points" size={44} color="#FFD700" />
          <Text style={styles.title}>Unicorn Learning!</Text>
          <MaterialCommunityIcons name="star-four-points" size={44} color="#FFD700" />
        </Animated.View>

        {/* Main character - Siyara */}
        <Animated.View style={[styles.mainCharacter, characterStyle]}>
          <Animated.View style={siyaraStyle}>
            <View style={styles.siyaraWrapper}>
              <View style={styles.siyaraNameCloud}>
                <Text style={styles.siyaraName}>Siyara</Text>
                <View style={styles.cloudArrow} />
              </View>
              <SiyaraUnicorn size={420} speaking sparkle />
            </View>
          </Animated.View>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>Let's play and learn!</Text>
          </View>
        </Animated.View>

        {/* Stars display */}
        <View style={styles.starsContainer}>
          <MaterialCommunityIcons name="star" size={48} color="#FFD700" />
          <Text style={styles.starsText}>{totalStars}</Text>
          <Text style={styles.starsLabel}>Stars</Text>
        </View>

        {/* Game buttons grid */}
        <View style={styles.gamesGrid}>
          {/* Math Games */}
          <Text style={styles.sectionTitle}>Math Games</Text>
          <View style={styles.gameRow}>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Numbers"
                subtitle="Count with Celine!"
                colors={['#f093fb', '#f5576c']}
                character={CelineUnicorn}
                speakText="Numbers! Let's count with Celine!"
                onPress={() => handleGamePress('Numbers')}
              />
            </View>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Addition"
                subtitle="Add with Melody!"
                colors={['#4facfe', '#00f2fe']}
                character={MelodyUnicorn}
                speakText="Addition! Let's add numbers with Melody!"
                onPress={() => handleGamePress('Addition')}
              />
            </View>
          </View>
          <View style={styles.gameRow}>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Subtraction"
                subtitle="Subtract with Melody!"
                colors={['#43e97b', '#38f9d7']}
                character={MelodyUnicorn}
                speakText="Subtraction! Let's subtract numbers with Melody!"
                onPress={() => handleGamePress('Subtraction')}
              />
            </View>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Pop Bubbles"
                subtitle="Pop with Whiskers!"
                colors={['#FF6B6B', '#FF8E53']}
                character={CatFriend}
                speakText="Pop Bubbles! Let's pop numbers with Whiskers!"
                onPress={() => handleGamePress('PopBubbles')}
              />
            </View>
          </View>

          {/* Reading Games */}
          <Text style={styles.sectionTitle}>Reading Games</Text>
          <View style={styles.gameRow}>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Letters"
                subtitle="ABCs with Nikola!"
                colors={['#fa709a', '#fee140']}
                character={NikolaUnicorn}
                speakText="Letters! Let's learn the alphabet with Nikola!"
                onPress={() => handleGamePress('Letters')}
              />
            </View>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Find Letter"
                subtitle="Catch with Bella!"
                colors={['#a8edea', '#fed6e3']}
                character={BunnyFriend}
                speakText="Find the Letter! Let's catch letters with Bella!"
                onPress={() => handleGamePress('FindLetter')}
              />
            </View>
          </View>
          <View style={styles.gameRow}>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Reading"
                subtitle="Words with Oliver!"
                colors={['#667eea', '#764ba2']}
                character={OwlFriend}
                speakText="Reading! Let's read words with Oliver the Owl!"
                onPress={() => handleGamePress('Reading')}
              />
            </View>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Shapes"
                subtitle="Learn with Buddy!"
                colors={['#f5af19', '#f12711']}
                character={DogFriend}
                speakText="Shapes! Let's learn shapes with Buddy!"
                onPress={() => handleGamePress('Shapes')}
              />
            </View>
          </View>

          {/* Fun Learning */}
          <Text style={styles.sectionTitle}>Fun Learning</Text>
          <View style={styles.gameRow}>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Colors"
                subtitle="Balloons with Bella!"
                colors={['#7F7FD5', '#86A8E7', '#91EAE4']}
                character={BunnyFriend}
                speakText="Colors! Let's learn colors with Bella!"
                onPress={() => handleGamePress('Colors')}
              />
            </View>
            <View style={styles.gameButtonWrapper}>
              <GameButton
                title="Counting"
                subtitle="Count with Oliver!"
                colors={['#11998e', '#38ef7d']}
                character={OwlFriend}
                speakText="Counting! Let's count objects with Oliver!"
                onPress={() => handleGamePress('Counting')}
              />
            </View>
          </View>
        </View>

        {/* Friends section - tap to hear names! */}
        <View style={styles.friendsSection}>
          <Text style={styles.friendsTitle}>Tap to meet our Friends!</Text>
          <Animated.View style={[styles.friendsRow, friendsStyle]}>
            <View style={styles.friendWrapper}>
              <BunnyFriend size={200} showName />
            </View>
            <View style={styles.friendWrapper}>
              <DogFriend size={200} showName />
            </View>
          </Animated.View>
          <Animated.View style={[styles.friendsRow, friendsStyle]}>
            <View style={styles.friendWrapper}>
              <CatFriend size={200} showName />
            </View>
            <View style={styles.friendWrapper}>
              <OwlFriend size={200} showName />
            </View>
          </Animated.View>
        </View>

        {/* Footer unicorns */}
        <View style={styles.footerCharacters}>
          <Animated.View style={[footer1Style, styles.footerUnicorn]}>
            <View style={styles.unicornNameCloud}>
              <Text style={styles.unicornName}>Celine</Text>
              <View style={styles.unicornCloudArrow} />
            </View>
            <CelineUnicorn size={240} />
          </Animated.View>
          <Animated.View style={[footer2Style, styles.footerUnicornCenter]}>
            <View style={styles.unicornNameCloud}>
              <Text style={styles.unicornName}>Melody</Text>
              <View style={styles.unicornCloudArrow} />
            </View>
            <MelodyUnicorn size={260} dancing />
          </Animated.View>
          <Animated.View style={[footer3Style, styles.footerUnicorn]}>
            <View style={styles.unicornNameCloud}>
              <Text style={styles.unicornName}>Nikola</Text>
              <View style={styles.unicornCloudArrow} />
            </View>
            <NikolaUnicorn size={240} />
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 15,
    overflow: 'visible',
  },
  rainbowContainer: {
    marginBottom: -50,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginHorizontal: 8,
  },
  titleEmoji: {
    fontSize: 34,
  },
  mainCharacter: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: -10,
  },
  siyaraWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  siyaraNameCloud: {
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 25,
    position: 'absolute',
    top: 50,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  siyaraName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B68EE',
  },
  cloudArrow: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  speechBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: -40,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  speechText: {
    fontSize: 20,
    color: '#764ba2',
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 35,
    marginTop: 8,
    marginBottom: 3,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  starIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  starsText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 10,
  },
  starsLabel: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  gamesGrid: {
    width: '100%',
    marginVertical: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: 10,
    marginBottom: 8,
    marginLeft: 5,
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gameRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gameButtonWrapper: {
    width: '48%',
  },
  friendsSection: {
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 5,
    width: '100%',
  },
  friendsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  friendWrapper: {
    width: '48%',
    alignItems: 'center',
  },
  footerCharacters: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    marginTop: 5,
    marginBottom: 10,
    minHeight: 260,
  },
  footerUnicorn: {
    marginHorizontal: -80,
    alignItems: 'center',
  },
  footerUnicornCenter: {
    zIndex: 1,
    marginHorizontal: -30,
    alignItems: 'center',
  },
  unicornNameCloud: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  unicornName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#764ba2',
  },
  unicornCloudArrow: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
