import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdaptiveLearningContext = createContext();

/**
 * Adaptive Learning System
 *
 * Uses spaced repetition and performance tracking to personalize
 * the learning experience for each child.
 *
 * Marketing: "AI-Powered Adaptive Learning - Adjusts to your child's needs"
 *
 * Features:
 * - Tracks accuracy per concept (letter, number, math fact)
 * - Prioritizes content the child struggles with
 * - Uses spaced repetition for optimal learning
 * - Calculates mastery levels per skill
 */

// Initial learning data structure
const createInitialLearningData = () => ({
  // Letters learning data
  letters: Object.fromEntries(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => [
      letter,
      {
        attempts: 0,
        correct: 0,
        lastAttempt: null,
        masteryLevel: 0, // 0-5 scale
        nextReviewDate: null,
      }
    ])
  ),

  // Numbers learning data (1-20)
  numbers: Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [
      (i + 1).toString(),
      {
        attempts: 0,
        correct: 0,
        lastAttempt: null,
        masteryLevel: 0,
        nextReviewDate: null,
      }
    ])
  ),

  // Addition facts (a + b where a,b in 1-10)
  addition: {},

  // Subtraction facts
  subtraction: {},

  // Overall stats
  stats: {
    totalSessions: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    streakDays: 0,
    lastSessionDate: null,
  }
});

// Spaced repetition intervals (in hours)
const REVIEW_INTERVALS = {
  0: 0,      // Immediate
  1: 4,      // 4 hours
  2: 24,     // 1 day
  3: 72,     // 3 days
  4: 168,    // 1 week
  5: 336,    // 2 weeks (mastered)
};

export function AdaptiveLearningProvider({ children }) {
  const [learningData, setLearningData] = useState(createInitialLearningData());
  const [isLoading, setIsLoading] = useState(true);

  // Load learning data on mount
  useEffect(() => {
    loadLearningData();
  }, []);

  const loadLearningData = async () => {
    try {
      const stored = await AsyncStorage.getItem('adaptiveLearningData');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial data to ensure all fields exist
        setLearningData(prev => ({
          ...createInitialLearningData(),
          ...parsed,
          letters: { ...createInitialLearningData().letters, ...parsed.letters },
          numbers: { ...createInitialLearningData().numbers, ...parsed.numbers },
        }));
      }
    } catch (e) {
      console.log('Error loading learning data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLearningData = async (data) => {
    try {
      await AsyncStorage.setItem('adaptiveLearningData', JSON.stringify(data));
    } catch (e) {
      console.log('Error saving learning data:', e);
    }
  };

  /**
   * Record an answer for a specific concept
   * @param {string} category - 'letters', 'numbers', 'addition', 'subtraction'
   * @param {string} concept - The specific item (e.g., 'A', '5', '3+4')
   * @param {boolean} isCorrect - Whether the answer was correct
   */
  const recordAnswer = useCallback((category, concept, isCorrect) => {
    setLearningData(prev => {
      const now = new Date().toISOString();
      const categoryData = prev[category] || {};
      const conceptData = categoryData[concept] || {
        attempts: 0,
        correct: 0,
        lastAttempt: null,
        masteryLevel: 0,
        nextReviewDate: null,
      };

      // Update concept data
      const newAttempts = conceptData.attempts + 1;
      const newCorrect = conceptData.correct + (isCorrect ? 1 : 0);

      // Calculate new mastery level based on recent performance
      let newMasteryLevel = conceptData.masteryLevel;
      if (isCorrect) {
        // Increase mastery on correct answer
        newMasteryLevel = Math.min(5, conceptData.masteryLevel + 1);
      } else {
        // Decrease mastery on incorrect (but not below 0)
        newMasteryLevel = Math.max(0, conceptData.masteryLevel - 1);
      }

      // Calculate next review date using spaced repetition
      const hoursUntilReview = REVIEW_INTERVALS[newMasteryLevel];
      const nextReview = new Date();
      nextReview.setHours(nextReview.getHours() + hoursUntilReview);

      const updatedData = {
        ...prev,
        [category]: {
          ...categoryData,
          [concept]: {
            attempts: newAttempts,
            correct: newCorrect,
            lastAttempt: now,
            masteryLevel: newMasteryLevel,
            nextReviewDate: nextReview.toISOString(),
          }
        },
        stats: {
          ...prev.stats,
          totalAttempts: prev.stats.totalAttempts + 1,
          totalCorrect: prev.stats.totalCorrect + (isCorrect ? 1 : 0),
        }
      };

      saveLearningData(updatedData);
      return updatedData;
    });
  }, []);

  /**
   * Get prioritized content for a category
   * Returns items sorted by need for review (struggling items first)
   * @param {string} category - 'letters', 'numbers', etc.
   * @param {number} count - Number of items to return
   */
  const getPrioritizedContent = useCallback((category, count = 5) => {
    const categoryData = learningData[category] || {};
    const now = new Date();

    // Score each item based on:
    // 1. Low mastery level (higher priority)
    // 2. Due for review (past nextReviewDate)
    // 3. Low accuracy
    // 4. Never attempted (need exposure)
    const scoredItems = Object.entries(categoryData).map(([concept, data]) => {
      let score = 0;

      // Never attempted gets high priority
      if (data.attempts === 0) {
        score += 50;
      } else {
        // Low mastery = higher priority
        score += (5 - data.masteryLevel) * 10;

        // Low accuracy = higher priority
        const accuracy = data.correct / data.attempts;
        score += (1 - accuracy) * 30;

        // Due for review = higher priority
        if (data.nextReviewDate) {
          const reviewDate = new Date(data.nextReviewDate);
          if (now >= reviewDate) {
            const hoursOverdue = (now - reviewDate) / (1000 * 60 * 60);
            score += Math.min(hoursOverdue, 20);
          }
        }
      }

      return { concept, data, score };
    });

    // Sort by score (highest first) and return top items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.concept);
  }, [learningData]);

  /**
   * Get a weighted random item - struggling items more likely to appear
   * @param {string} category
   * @param {array} pool - Optional array to choose from
   */
  const getWeightedRandomItem = useCallback((category, pool = null) => {
    const categoryData = learningData[category] || {};
    const items = pool || Object.keys(categoryData);

    if (items.length === 0) return null;

    // Calculate weights (lower mastery = higher weight)
    const weights = items.map(item => {
      const data = categoryData[item];
      if (!data || data.attempts === 0) return 3; // Medium weight for new items
      return Math.max(1, 6 - data.masteryLevel); // 1-6 based on mastery
    });

    // Weighted random selection
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }, [learningData]);

  /**
   * Get mastery level for a concept
   * @param {string} category
   * @param {string} concept
   */
  const getMasteryLevel = useCallback((category, concept) => {
    const data = learningData[category]?.[concept];
    return data?.masteryLevel || 0;
  }, [learningData]);

  /**
   * Get overall mastery for a category (0-100%)
   * @param {string} category
   */
  const getCategoryMastery = useCallback((category) => {
    const categoryData = learningData[category] || {};
    const items = Object.values(categoryData);

    if (items.length === 0) return 0;

    const totalMastery = items.reduce((sum, item) => sum + (item.masteryLevel || 0), 0);
    const maxMastery = items.length * 5;

    return Math.round((totalMastery / maxMastery) * 100);
  }, [learningData]);

  /**
   * Get concepts that need the most work
   * @param {string} category
   * @param {number} count
   */
  const getStrugglingConcepts = useCallback((category, count = 5) => {
    const categoryData = learningData[category] || {};

    return Object.entries(categoryData)
      .filter(([_, data]) => data.attempts > 0) // Only items that have been attempted
      .sort((a, b) => {
        // Sort by mastery level (lowest first)
        const masteryDiff = a[1].masteryLevel - b[1].masteryLevel;
        if (masteryDiff !== 0) return masteryDiff;

        // Then by accuracy
        const accA = a[1].correct / a[1].attempts;
        const accB = b[1].correct / b[1].attempts;
        return accA - accB;
      })
      .slice(0, count)
      .map(([concept, data]) => ({
        concept,
        mastery: data.masteryLevel,
        accuracy: Math.round((data.correct / data.attempts) * 100),
        attempts: data.attempts,
      }));
  }, [learningData]);

  /**
   * Get learning insights for parents/display
   */
  const getLearningInsights = useCallback(() => {
    const { stats } = learningData;
    const overallAccuracy = stats.totalAttempts > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100)
      : 0;

    return {
      overallAccuracy,
      totalAttempts: stats.totalAttempts,
      totalCorrect: stats.totalCorrect,
      lettersMastery: getCategoryMastery('letters'),
      numbersMastery: getCategoryMastery('numbers'),
      additionMastery: getCategoryMastery('addition'),
      subtractionMastery: getCategoryMastery('subtraction'),
      strugglingLetters: getStrugglingConcepts('letters', 3),
      strugglingNumbers: getStrugglingConcepts('numbers', 3),
    };
  }, [learningData, getCategoryMastery, getStrugglingConcepts]);

  /**
   * Reset all learning data
   */
  const resetLearningData = useCallback(async () => {
    const initial = createInitialLearningData();
    setLearningData(initial);
    await saveLearningData(initial);
  }, []);

  return (
    <AdaptiveLearningContext.Provider value={{
      // State
      learningData,
      isLoading,

      // Core functions
      recordAnswer,
      getPrioritizedContent,
      getWeightedRandomItem,

      // Mastery functions
      getMasteryLevel,
      getCategoryMastery,
      getStrugglingConcepts,
      getLearningInsights,

      // Admin
      resetLearningData,
    }}>
      {children}
    </AdaptiveLearningContext.Provider>
  );
}

export function useAdaptiveLearning() {
  const context = useContext(AdaptiveLearningContext);
  if (!context) {
    throw new Error('useAdaptiveLearning must be used within an AdaptiveLearningProvider');
  }
  return context;
}

export default AdaptiveLearningContext;
