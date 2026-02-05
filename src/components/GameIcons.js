import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path, G } from 'react-native-svg';

// Colorful icon wrapper
const IconWrapper = ({ children, size, backgroundColor }) => (
  <View style={[
    styles.iconWrapper,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: backgroundColor || 'transparent',
    }
  ]}>
    {children}
  </View>
);

// Star icon
export const StarIcon = ({ size = 40, color = '#FFD700' }) => (
  <MaterialCommunityIcons name="star" size={size} color={color} />
);

// Apple icon
export const AppleIcon = ({ size = 40, color = '#E53935' }) => (
  <MaterialCommunityIcons name="apple" size={size} color={color} />
);

// Ball icon
export const BallIcon = ({ size = 40, color = '#2196F3' }) => (
  <MaterialCommunityIcons name="soccer" size={size} color={color} />
);

// Heart icon
export const HeartIcon = ({ size = 40, color = '#E91E63' }) => (
  <MaterialCommunityIcons name="heart" size={size} color={color} />
);

// Flower icon
export const FlowerIcon = ({ size = 40, color = '#FF80AB' }) => (
  <MaterialCommunityIcons name="flower" size={size} color={color} />
);

// Cookie icon
export const CookieIcon = ({ size = 40, color = '#8D6E63' }) => (
  <MaterialCommunityIcons name="cookie" size={size} color={color} />
);

// Fish icon
export const FishIcon = ({ size = 40, color = '#FF9800' }) => (
  <MaterialCommunityIcons name="fish" size={size} color={color} />
);

// Butterfly icon
export const ButterflyIcon = ({ size = 40, color = '#9C27B0' }) => (
  <MaterialCommunityIcons name="butterfly" size={size} color={color} />
);

// Bird icon
export const BirdIcon = ({ size = 40, color = '#03A9F4' }) => (
  <MaterialCommunityIcons name="bird" size={size} color={color} />
);

// Banana icon (using fruit)
export const BananaIcon = ({ size = 40, color = '#FDD835' }) => (
  <MaterialCommunityIcons name="fruit-cherries" size={size} color={color} />
);

// Cat icon
export const CatIcon = ({ size = 40, color = '#FF9800' }) => (
  <MaterialCommunityIcons name="cat" size={size} color={color} />
);

// Dog icon
export const DogIcon = ({ size = 40, color = '#8B4513' }) => (
  <MaterialCommunityIcons name="dog" size={size} color={color} />
);

// Elephant icon
export const ElephantIcon = ({ size = 40, color = '#9E9E9E' }) => (
  <MaterialCommunityIcons name="elephant" size={size} color={color} />
);

// Balloon icon
export const BalloonIcon = ({ size = 40, color = '#E91E63' }) => (
  <MaterialCommunityIcons name="balloon" size={size} color={color} />
);

// Rainbow icon (using palette as rainbow isn't available)
export const RainbowIcon = ({ size = 40, color = '#FF5722' }) => (
  <MaterialCommunityIcons name="palette" size={size} color={color} />
);

// Sun icon
export const SunIcon = ({ size = 40, color = '#FFC107' }) => (
  <MaterialCommunityIcons name="white-balance-sunny" size={size} color={color} />
);

// Moon icon
export const MoonIcon = ({ size = 40, color = '#FFC107' }) => (
  <MaterialCommunityIcons name="moon-waning-crescent" size={size} color={color} />
);

// Tree icon
export const TreeIcon = ({ size = 40, color = '#4CAF50' }) => (
  <MaterialCommunityIcons name="tree" size={size} color={color} />
);

// Home icon
export const HomeIcon = ({ size = 40, color = '#795548' }) => (
  <MaterialCommunityIcons name="home" size={size} color={color} />
);

// Book icon
export const BookIcon = ({ size = 40, color = '#3F51B5' }) => (
  <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
);

// Trophy icon
export const TrophyIcon = ({ size = 40, color = '#FFD700' }) => (
  <MaterialCommunityIcons name="trophy" size={size} color={color} />
);

// Gift icon
export const GiftIcon = ({ size = 40, color = '#E91E63' }) => (
  <MaterialCommunityIcons name="gift" size={size} color={color} />
);

// Crown icon
export const CrownIcon = ({ size = 40, color = '#FFD700' }) => (
  <MaterialCommunityIcons name="crown" size={size} color={color} />
);

// Sparkle/Magic icon
export const SparkleIcon = ({ size = 40, color = '#FFD700' }) => (
  <MaterialCommunityIcons name="shimmer" size={size} color={color} />
);

// Plus icon
export const PlusIcon = ({ size = 40, color = '#4CAF50' }) => (
  <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
);

// Minus icon
export const MinusIcon = ({ size = 40, color = '#F44336' }) => (
  <MaterialCommunityIcons name="minus-circle" size={size} color={color} />
);

// Numbers icon
export const NumbersIcon = ({ size = 40, color = '#9C27B0' }) => (
  <MaterialCommunityIcons name="numeric" size={size} color={color} />
);

// Letters icon
export const LettersIcon = ({ size = 40, color = '#FF9800' }) => (
  <MaterialCommunityIcons name="alphabetical" size={size} color={color} />
);

// Phonics letter icons - map letters to relevant icons
export const phonicsIcons = {
  A: { icon: 'apple', color: '#E53935', name: 'Apple' },
  B: { icon: 'soccer', color: '#2196F3', name: 'Ball' },
  C: { icon: 'cat', color: '#FF9800', name: 'Cat' },
  D: { icon: 'dog', color: '#8B4513', name: 'Dog' },
  E: { icon: 'elephant', color: '#9E9E9E', name: 'Elephant' },
  F: { icon: 'fish', color: '#FF9800', name: 'Fish' },
  G: { icon: 'goat', color: '#795548', name: 'Goat' },
  H: { icon: 'hat-fedora', color: '#424242', name: 'Hat' },
  I: { icon: 'ice-cream', color: '#E91E63', name: 'Ice cream' },
  J: { icon: 'kangaroo', color: '#795548', name: 'Jump' },
  K: { icon: 'kite', color: '#03A9F4', name: 'Kite' },
  L: { icon: 'lion', color: '#FF9800', name: 'Lion' },
  M: { icon: 'moon-waning-crescent', color: '#FFC107', name: 'Moon' },
  N: { icon: 'bird', color: '#8BC34A', name: 'Nest' },
  O: { icon: 'fruit-citrus', color: '#FF9800', name: 'Orange' },
  P: { icon: 'pig', color: '#FFAB91', name: 'Pig' },
  Q: { icon: 'crown', color: '#FFD700', name: 'Queen' },
  R: { icon: 'palette', color: '#FF5722', name: 'Rainbow' },
  S: { icon: 'white-balance-sunny', color: '#FFC107', name: 'Sun' },
  T: { icon: 'tree', color: '#4CAF50', name: 'Tree' },
  U: { icon: 'umbrella', color: '#673AB7', name: 'Umbrella' },
  V: { icon: 'van-utility', color: '#607D8B', name: 'Van' },
  W: { icon: 'water', color: '#03A9F4', name: 'Water' },
  X: { icon: 'package-variant', color: '#795548', name: 'Box' },
  Y: { icon: 'star', color: '#FFEB3B', name: 'Yellow' },
  Z: { icon: 'horse-variant', color: '#212121', name: 'Zebra' },
};

// Get phonics icon component
export const PhonicsIcon = ({ letter, size = 50 }) => {
  const data = phonicsIcons[letter] || { icon: 'help-circle', color: '#9E9E9E' };
  return (
    <MaterialCommunityIcons name={data.icon} size={size} color={data.color} />
  );
};

// Counting objects for math games
export const countingObjects = [
  { name: 'stars', component: StarIcon, color: '#FFD700' },
  { name: 'apples', component: AppleIcon, color: '#E53935' },
  { name: 'hearts', component: HeartIcon, color: '#E91E63' },
  { name: 'flowers', component: FlowerIcon, color: '#FF80AB' },
  { name: 'balls', component: BallIcon, color: '#2196F3' },
  { name: 'cookies', component: CookieIcon, color: '#8D6E63' },
  { name: 'fish', component: FishIcon, color: '#FF9800' },
  { name: 'butterflies', component: ButterflyIcon, color: '#9C27B0' },
  { name: 'birds', component: BirdIcon, color: '#03A9F4' },
  { name: 'balloons', component: BalloonIcon, color: '#E91E63' },
];

// Get random counting object
export const getRandomCountingObject = () => {
  return countingObjects[Math.floor(Math.random() * countingObjects.length)];
};

// Render counting items
export const CountingItem = ({ type, size = 40 }) => {
  const obj = countingObjects.find(o => o.name === type) || countingObjects[0];
  const IconComponent = obj.component;
  return <IconComponent size={size} color={obj.color} />;
};

// Celebration icons
export const CelebrationIcons = ({ size = 30 }) => (
  <View style={styles.celebrationRow}>
    <TrophyIcon size={size} />
    <StarIcon size={size} />
    <CrownIcon size={size} />
  </View>
);

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default {
  StarIcon,
  AppleIcon,
  BallIcon,
  HeartIcon,
  FlowerIcon,
  CookieIcon,
  FishIcon,
  ButterflyIcon,
  BirdIcon,
  CatIcon,
  DogIcon,
  PhonicsIcon,
  CountingItem,
  countingObjects,
  getRandomCountingObject,
  phonicsIcons,
};
