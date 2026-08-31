// components/ARLearning.tsx (unchanged)
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ARCameraView from './ARCameraView';

export interface ARItem {
  nameEn: string;
  nameSi: string;
  emoji: string;
}

interface ARCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  icon: string;
  color: string;
  items: ARItem[];
}

const AR_CATEGORIES: ARCategory[] = [
  {
    id: 'toys',
    nameEn: 'Toys',
    nameSi: 'සෙල්ලම් බඩු',
    icon: '🧸',
    color: '#FF6B6B',
    items: [
      { nameEn: 'Teddy Bear', nameSi: 'මොළොක් වලසා', emoji: '🧸' },
      { nameEn: 'Car', nameSi: 'මෝටර් රථය', emoji: '🚗' },
      { nameEn: 'Ball', nameSi: 'පන්දුව', emoji: '⚽' },
      { nameEn: 'Robot', nameSi: 'රොබෝ', emoji: '🤖' },
      { nameEn: 'Kite', nameSi: 'රවුම', emoji: '🪁' },
      { nameEn: 'Balloon', nameSi: 'බැලූනය', emoji: '🎈' },
    ],
  },
  {
    id: 'animals',
    nameEn: 'Animals',
    nameSi: 'සතුන්',
    icon: '🐶',
    color: '#FFD166',
    items: [
      { nameEn: 'Dog', nameSi: 'බල්ලා', emoji: '🐶' },
      { nameEn: 'Cat', nameSi: 'පූසා', emoji: '🐱' },
      { nameEn: 'Elephant', nameSi: 'අලියා', emoji: '🐘' },
      { nameEn: 'Lion', nameSi: 'සිංහයා', emoji: '🦁' },
      { nameEn: 'Rabbit', nameSi: 'හාවා', emoji: '🐰' },
      { nameEn: 'Bird', nameSi: 'කුරුල්ලා', emoji: '🐦' },
    ],
  },
  {
    id: 'fruits',
    nameEn: 'Fruits',
    nameSi: 'පලතුරු',
    icon: '🍎',
    color: '#06D6A0',
    items: [
      { nameEn: 'Apple', nameSi: 'ඇපල්', emoji: '🍎' },
      { nameEn: 'Banana', nameSi: 'කෙසෙල්', emoji: '🍌' },
      { nameEn: 'Orange', nameSi: 'දොඩම්', emoji: '🍊' },
      { nameEn: 'Grapes', nameSi: 'මිදි', emoji: '🍇' },
      { nameEn: 'Watermelon', nameSi: 'පැණි කොමඩු', emoji: '🍉' },
      { nameEn: 'Pineapple', nameSi: 'අන්නාසි', emoji: '🍍' },
    ],
  },
  {
    id: 'objects',
    nameEn: 'Objects',
    nameSi: 'වස්තු',
    icon: '🪑',
    color: '#4ECDC4',
    items: [
      { nameEn: 'Chair', nameSi: 'පුටුව', emoji: '🪑' },
      { nameEn: 'Lamp', nameSi: 'ලාම්පුව', emoji: '💡' },
      { nameEn: 'Clock', nameSi: 'ඔරලෝසුව', emoji: '🕐' },
      { nameEn: 'Book', nameSi: 'පොත', emoji: '📖' },
      { nameEn: 'Cup', nameSi: 'කෝප්පය', emoji: '☕' },
      { nameEn: 'Umbrella', nameSi: 'කුඩය', emoji: '☂️' },
    ],
  },
  {
    id: 'vehicles',
    nameEn: 'Vehicles',
    nameSi: 'වාහන',
    icon: '🚌',
    color: '#9C27B0',
    items: [
      { nameEn: 'Bus', nameSi: 'බස් රථය', emoji: '🚌' },
      { nameEn: 'Bicycle', nameSi: 'බයිසිකලය', emoji: '🚲' },
      { nameEn: 'Airplane', nameSi: 'ගුවන් යානය', emoji: '✈️' },
      { nameEn: 'Boat', nameSi: 'බෝට්ටුව', emoji: '⛵' },
      { nameEn: 'Train', nameSi: 'දුම්රිය', emoji: '🚂' },
      { nameEn: 'Fire Truck', nameSi: 'ගිනි නිවන රථය', emoji: '🚒' },
    ],
  },
];

interface ARLearningProps {
  onBack: () => void;
  onProgress?: (progress: number) => void;
}

export default function ARLearning({ onBack, onProgress }: ARLearningProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ARCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<ARItem | null>(null);
  const [viewedCount, setViewedCount] = useState(0);

  const handleSelectItem = (item: ARItem) => {
    setSelectedItem(item);
    const newCount = viewedCount + 1;
    setViewedCount(newCount);
    onProgress?.(Math.min(100, newCount * 10));
  };

  if (selectedItem) {
    return (
      <ARCameraView
        item={selectedItem}
        language={language}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  if (selectedCategory) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedCategory(null)}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>
            {language === 'en' ? 'Categories' : 'ප්‍රවර්ග'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'en' ? selectedCategory.nameEn : selectedCategory.nameSi}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {language === 'en' ? 'Tap an item to see it in your room' : 'ඔබේ කාමරයේ දැකීමට අයිතමයක් තට්ටු කරන්න'}
        </Text>

        <ScrollView contentContainerStyle={styles.itemGrid}>
          {selectedCategory.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.itemCard, { backgroundColor: colors.surface }]}
              onPress={() => handleSelectItem(item)}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {language === 'en' ? item.nameEn : item.nameSi}
              </Text>
              <View style={[styles.arBadge, { backgroundColor: selectedCategory.color }]}>
                <MaterialIcons name="view-in-ar" size={12} color="#FFF" />
                <Text style={styles.arBadgeText}>AR</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>
          {language === 'en' ? 'Back to Learning' : 'ඉගෙනීමට ආපසු'}
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'en' ? 'AR Explorer' : 'AR ගවේෂකයා'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {language === 'en'
            ? 'Choose something to see in the real world!'
            : 'සැබෑ ලෝකයේ දැකීමට යමක් තෝරන්න!'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.categoryGrid}>
        {AR_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: colors.surface }]}
            onPress={() => setSelectedCategory(category)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
            </View>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {language === 'en' ? category.nameEn : category.nameSi}
            </Text>
            <Text style={[styles.categoryCount, { color: colors.textLight }]}>
              {category.items.length} {language === 'en' ? 'items' : 'අයිතම'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, paddingTop: Spacing.xl },
  backText: { fontSize: 16, marginLeft: Spacing.sm },
  header: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  title: { fontWeight: 'bold', fontSize: Typography.fontSize.xxl, paddingHorizontal: Spacing.lg },
  subtitle: { fontSize: Typography.fontSize.md, marginTop: Spacing.xs, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  categoryCard: { width: '47%', padding: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  categoryIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  categoryEmoji: { fontSize: 34 },
  categoryName: { fontWeight: 'bold', fontSize: 16, marginTop: Spacing.xs, textAlign: 'center' },
  categoryCount: { fontSize: 12, marginTop: 2 },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  itemCard: { width: '30%', padding: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  itemEmoji: { fontSize: 40, marginBottom: Spacing.xs },
  itemName: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: Spacing.xs },
  arBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  arBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});