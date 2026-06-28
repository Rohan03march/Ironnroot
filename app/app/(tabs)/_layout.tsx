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
      <Tabs.Screen name="routines" options={{ title: 'Routines' }} />
      <Tabs.Screen name="workouts" options={{ href: null }} />
      <Tabs.Screen name="calendar" options={{ title: 'History' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // Calculate bottom offset for floating layout
  const bottomOffset = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 20;

  // Filter routes to strictly show Home (index), Routines, Calendar (History), and Profile
  const ALLOWED_TABS = ['index', 'routines', 'calendar', 'profile'];
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
              case 'routines':
                return <Dumbbell size={size} color={color} />;
              case 'calendar':
                return <Calendar size={size} color={color} />;
              case 'profile':
                return <User size={size} color={color} />;
              default:
                return <Home size={size} color={color} />;
            }
          };

          const activeColor = '#A78BFA'; // Brighter violet for high accessibility and premium glow
          const inactiveColor = 'rgba(255, 255, 255, 0.45)'; // Soft white/grey
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
              <View style={[
                styles.iconWrapper,
                isFocused && styles.iconWrapperActive
              ]}>
                {getIcon(iconColor, 20)}
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
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.94)', // Sleek slate dark background
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: 310, // Floating centered dock layout for 4 items
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 56,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)', // Premium glowing background pill
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
});
