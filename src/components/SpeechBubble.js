import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

export default function SpeechBubble({ text, visible = true, position = 'right' }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withDelay(200, withSpring(1, { damping: 12 }));
      opacity.value = withDelay(200, withSpring(1));
    } else {
      scale.value = withSpring(0);
      opacity.value = withSpring(0);
    }
  }, [visible, text]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!text) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'left' ? styles.left : styles.right,
        animatedStyle,
      ]}
    >
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View
        style={[
          styles.arrow,
          position === 'left' ? styles.arrowLeft : styles.arrowRight,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 280,
    marginVertical: 10,
  },
  left: {
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  right: {
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  bubble: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
  },
  arrow: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: 'white',
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    position: 'absolute',
    bottom: -10,
  },
  arrowLeft: {
    left: 30,
  },
  arrowRight: {
    right: 30,
  },
});
