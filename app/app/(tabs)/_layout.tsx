import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { Home, Dumbbell, Calendar, BarChart2, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="workouts" options={{ title: 'Workouts' }} />
      <Tabs.Screen name="calendar" options={{ title: 'History' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // Calculate bottom offset for floating layout
  const bottomOffset = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16;

  // Filter routes to strictly show Home (index), Workouts, Calendar (History), and Profile
  const ALLOWED_TABS = ['index', 'workouts', 'calendar', 'profile'];
  const visibleRoutes = state.routes.filter((route: any) => ALLOWED_TABS.includes(route.name));

  return (
    <View style={[styles.tabBarContainer, { bottom: bottomOffset }]}>
      <View style={styles.tabBar}>
        {visibleRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const isFocused = state.routes[state.index].key === route.key;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const getIcon = (color: string, size: number) => {
            switch (route.name) {
              case 'index':
                return <Home size={size} color={color} />;
              case 'workouts':
                return <Dumbbell size={size} color={color} />;
              case 'calendar':
                return <Calendar size={size} color={color} />;
              case 'profile':
                return <User size={size} color={color} />;
              default:
                return <Home size={size} color={color} />;
            }
          };

          const activeColor = COLORS.primary;
          const inactiveColor = COLORS.textSecondary;
          const iconColor = isFocused ? activeColor : inactiveColor;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                {getIcon(iconColor, 24)}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(21, 30, 46, 0.95)', // Translucent glassmorphic slate navy
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
  },
});
