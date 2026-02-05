import React from 'react';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function BuddyPuppy({ size = 150, speaking = false, waving = false }) {
  const bounce = useSharedValue(0);
  const tailWag = useSharedValue(0);
  const earWiggle = useSharedValue(0);

  useEffect(() => {
    // Gentle bounce animation
    bounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );

    // Tail wagging
    tailWag.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 200 }),
        withTiming(-15, { duration: 200 })
      ),
      -1,
      true
    );

    // Ear wiggle
    earWiggle.value = withRepeat(
      withDelay(
        1000,
        withSequence(
          withTiming(5, { duration: 150 }),
          withTiming(-5, { duration: 150 }),
          withTiming(0, { duration: 150 })
        )
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Body */}
        <Ellipse cx="50" cy="70" rx="25" ry="20" fill="#C4A484" />

        {/* Belly */}
        <Ellipse cx="50" cy="72" rx="15" ry="12" fill="#F5DEB3" />

        {/* Head */}
        <Circle cx="50" cy="38" r="28" fill="#C4A484" />

        {/* Face patch */}
        <Ellipse cx="50" cy="45" rx="18" ry="15" fill="#F5DEB3" />

        {/* Left ear */}
        <Ellipse cx="28" cy="22" rx="12" ry="18" fill="#8B4513" />
        <Ellipse cx="28" cy="22" rx="7" ry="12" fill="#C4A484" />

        {/* Right ear */}
        <Ellipse cx="72" cy="22" rx="12" ry="18" fill="#8B4513" />
        <Ellipse cx="72" cy="22" rx="7" ry="12" fill="#C4A484" />

        {/* Eyes */}
        <Circle cx="40" cy="35" r="8" fill="white" />
        <Circle cx="60" cy="35" r="8" fill="white" />
        <Circle cx="42" cy="36" r="5" fill="#4A3728" />
        <Circle cx="62" cy="36" r="5" fill="#4A3728" />
        <Circle cx="43" cy="34" r="2" fill="white" />
        <Circle cx="63" cy="34" r="2" fill="white" />

        {/* Nose */}
        <Ellipse cx="50" cy="48" rx="6" ry="5" fill="#4A3728" />
        <Ellipse cx="50" cy="47" rx="2" ry="1.5" fill="#6B5344" />

        {/* Mouth */}
        <Path
          d={speaking
            ? "M42 54 Q50 62 58 54"
            : "M42 54 Q50 58 58 54"
          }
          stroke="#4A3728"
          strokeWidth="2"
          fill="none"
        />
        {speaking && (
          <Ellipse cx="50" cy="57" rx="6" ry="4" fill="#FF6B6B" />
        )}

        {/* Tongue when speaking */}
        {speaking && (
          <Ellipse cx="50" cy="59" rx="4" ry="3" fill="#FF9999" />
        )}

        {/* Tail */}
        <Path
          d="M75 70 Q90 60 85 50"
          stroke="#C4A484"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Collar */}
        <Path
          d="M35 55 Q50 60 65 55"
          stroke="#E53935"
          strokeWidth="4"
          fill="none"
        />
        <Circle cx="50" cy="58" r="4" fill="#FFD700" />

        {/* Paws */}
        <Ellipse cx="35" cy="88" rx="8" ry="5" fill="#C4A484" />
        <Ellipse cx="65" cy="88" rx="8" ry="5" fill="#C4A484" />

        {/* Waving arm */}
        {waving && (
          <G>
            <Path
              d="M75 65 Q85 55 90 45"
              stroke="#C4A484"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            <Ellipse cx="90" cy="43" rx="6" ry="5" fill="#C4A484" />
          </G>
        )}
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
