// app/child-select.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Spacing, Typography } from '../constants/theme';
import { useChild } from '../context/ChildContext';
import { useTheme } from '../context/ThemeContext';
import { getParentChildren } from '../services/apiService';

export default function ChildSelectScreen() {
  const {
    parentProfile,
    selectChild,
    setChildren,
    childrenList,
    logout,
  } = useChild();

  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);

  /**
   * Load children whenever this screen becomes active
   */
  const loadChildren = useCallback(async () => {
    if (!parentProfile?._id) {
      return;
    }

    try {
      setLoading(true);

      console.log(
        '[ChildSelect] Fetching children for parent...'
      );

      const children = await getParentChildren(
        parentProfile._id
      );

      console.log(
        '[ChildSelect] Children fetched:',
        children
      );

      setChildren(children);
    } catch (error) {
      console.error(
        '[ChildSelect] Failed to load children:',
        error
      );

      Alert.alert(
        'Error',
        'Failed to load children. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [parentProfile?._id]);

  useFocusEffect(
    useCallback(() => {
      loadChildren();
    }, [loadChildren])
  );

  /**
   * Select child
   */
  const handleSelectChild = async (child) => {
    try {
      await selectChild(child);

      console.log(
        '[ChildSelect] Child selected:',
        child.alias
      );

      // Go to main application
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error(
        '[ChildSelect] Failed to select child:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to select this child.'
      );
    }
  };

  /**
   * Logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();

              console.log(
                '[ChildSelect] Logged out'
              );

              router.replace('/login');
            } catch (error) {
              console.error(
                '[ChildSelect] Logout failed:',
                error
              );
            }
          },
        },
      ]
    );
  };

  /**
   * Add another child
   *
   * We will connect this to the child setup screen
   * once that route is added to this Expo Router project.
   */
  const handleAddAnother = () => {
  router.push('/child-setup');
};

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.primaryLight,
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              Hello, {parentProfile?.fullName || 'Parent'}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textLight,
                },
              ]}
            >
              Select a child to continue
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                borderColor: colors.primary,
              },
            ]}
            onPress={handleLogout}
          >
            <MaterialIcons
              name="logout"
              size={18}
              color={colors.primary}
            />

            <Text
              style={[
                styles.logoutText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Children */}
      <ScrollView
        style={styles.childrenContainer}
        contentContainerStyle={styles.childrenContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Your Children
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text
              style={[
                styles.loadingText,
                {
                  color: colors.textLight,
                },
              ]}
            >
              Loading children...
            </Text>
          </View>
        ) : childrenList &&
          childrenList.length > 0 ? (
          <View style={styles.childrenList}>
            {childrenList.map((child) => (
              <TouchableOpacity
                key={child._id}
                style={[
                  styles.childCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.primaryLight,
                  },
                ]}
                onPress={() =>
                  handleSelectChild(child)
                }
                activeOpacity={0.8}
              >
                <View style={styles.avatar}>
                  <MaterialIcons
                    name="person"
                    size={30}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.childCardContent}>
                  <Text
                    style={[
                      styles.childName,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {child.alias}
                  </Text>

                  <View style={styles.childDetails}>
                    <Text
                      style={[
                        styles.childDetail,
                        {
                          color: colors.textLight,
                        },
                      ]}
                    >
                      Age: {child.age}
                    </Text>

                    <Text
                      style={[
                        styles.childDetail,
                        {
                          color: colors.textLight,
                        },
                      ]}
                    >
                      Level {child.asdSeverityLevel}
                    </Text>
                  </View>

                  {child.verbalAbility && (
                    <View
                      style={[
                        styles.abilityBadge,
                        {
                          backgroundColor:
                            colors.primaryLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.abilityBadgeText,
                          {
                            color: colors.primary,
                          },
                        ]}
                      >
                        {child.verbalAbility
                          .charAt(0)
                          .toUpperCase() +
                          child.verbalAbility.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={28}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primaryLight,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >
              <MaterialIcons
                name="child-care"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyStateText,
                {
                  color: colors.text,
                },
              ]}
            >
              No children yet
            </Text>

            <Text
              style={[
                styles.emptyStateSubtext,
                {
                  color: colors.textLight,
                },
              ]}
            >
              Add a child profile to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.primaryLight,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.addChildButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={handleAddAnother}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="add"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.addChildButtonText}>
            Add Another Child
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },

  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },

  subtitle: {
    fontSize: Typography.fontSize.md,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderRadius: 10,
  },

  logoutText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },

  childrenContainer: {
    flex: 1,
  },

  childrenContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },

  childrenList: {
    gap: Spacing.sm,
  },

  childCard: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  childCardContent: {
    flex: 1,
  },

  childName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },

  childDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },

  childDetail: {
    fontSize: Typography.fontSize.sm,
  },

  abilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },

  abilityBadgeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },

  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: 16,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  emptyStateText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },

  emptyStateSubtext: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
  },

  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },

  addChildButton: {
    minHeight: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  addChildButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
});