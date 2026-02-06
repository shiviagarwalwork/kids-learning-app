import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CONTENT_TIERS, CURRENT_ACCESS, isGameUnlocked, hasFeature } from '../config/content';

const PremiumContext = createContext();

/**
 * PremiumProvider - Manages premium/free access state
 *
 * Currently configured to provide FULL access (all content free).
 * When ready to implement monetization:
 * 1. Change CURRENT_ACCESS in config/content.js to 'FREE'
 * 2. Implement purchase flow with expo-in-app-purchases or react-native-iap
 * 3. Update isPremium based on purchase status
 */
export function PremiumProvider({ children }) {
  // For free launch, everyone has premium access
  const [isPremium, setIsPremium] = useState(true);
  const [accessLevel, setAccessLevel] = useState(CURRENT_ACCESS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      // For future: Check actual purchase status here
      // const purchased = await AsyncStorage.getItem('premiumPurchased');
      // setIsPremium(purchased === 'true');

      // Currently: Everyone gets premium (free launch)
      setIsPremium(true);
      setAccessLevel('PREMIUM');
    } catch (e) {
      if (__DEV__) console.log('Error loading premium status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for future purchase flow
  const purchasePremium = async () => {
    // TODO: Implement with expo-in-app-purchases
    Alert.alert(
      'All Content Free!',
      'All content is currently free during our launch period. Enjoy!',
      [{ text: 'OK' }]
    );
    return { success: true, message: 'All content is free during launch!' };
  };

  // Placeholder for restore purchases
  const restorePurchases = async () => {
    // TODO: Implement with expo-in-app-purchases
    Alert.alert(
      'Restore Complete',
      'All content is currently free during our launch period. Nothing to restore!',
      [{ text: 'OK' }]
    );
    return { success: true, message: 'All content is free during launch!' };
  };

  // Check if specific game is unlocked
  const checkGameAccess = (gameId) => {
    return isGameUnlocked(gameId, accessLevel);
  };

  // Check if feature is available
  const checkFeatureAccess = (featureId) => {
    return hasFeature(featureId, accessLevel);
  };

  // Get current tier info
  const getCurrentTier = () => {
    return CONTENT_TIERS[accessLevel];
  };

  return (
    <PremiumContext.Provider value={{
      // Status
      isPremium,
      accessLevel,
      isLoading,

      // Access checks
      checkGameAccess,
      checkFeatureAccess,
      getCurrentTier,

      // Actions (future)
      purchasePremium,
      restorePurchases,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}

export default PremiumContext;
