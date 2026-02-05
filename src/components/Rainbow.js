import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';

export default function Rainbow({ width = 300, height = 150, style }) {
  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height} viewBox="0 0 300 150">
        <Defs>
          <LinearGradient id="rainbow1" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF6B6B" />
            <Stop offset="100%" stopColor="#FF6B6B" />
          </LinearGradient>
        </Defs>

        {/* Rainbow arcs from outside to inside */}
        <Path
          d="M10 150 Q10 10 150 10 Q290 10 290 150"
          stroke="#FF6B6B"
          strokeWidth="18"
          fill="none"
        />
        <Path
          d="M28 150 Q28 28 150 28 Q272 28 272 150"
          stroke="#FFA500"
          strokeWidth="18"
          fill="none"
        />
        <Path
          d="M46 150 Q46 46 150 46 Q254 46 254 150"
          stroke="#FFD93D"
          strokeWidth="18"
          fill="none"
        />
        <Path
          d="M64 150 Q64 64 150 64 Q236 64 236 150"
          stroke="#6BCB77"
          strokeWidth="18"
          fill="none"
        />
        <Path
          d="M82 150 Q82 82 150 82 Q218 82 218 150"
          stroke="#4D96FF"
          strokeWidth="18"
          fill="none"
        />
        <Path
          d="M100 150 Q100 100 150 100 Q200 100 200 150"
          stroke="#9B59B6"
          strokeWidth="18"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
