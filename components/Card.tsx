// components/Card.tsx (Fixed)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface CardProps {
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  iconColor,
  backgroundColor,
  onPress,
  children,
}) => {
  const { colors } = useTheme();
  
  const cardBackgroundColor = backgroundColor || colors.surface;
  const iconColorValue = iconColor || colors.primary;

  const CardContent = (
    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconColorValue + '20' }]}>
          <MaterialIcons name={icon as any} size={32} color={iconColorValue} />
        </View>
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && <Text style={[styles.description, { color: colors.textLight }]}>{description}</Text>}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    alignSelf: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Card;