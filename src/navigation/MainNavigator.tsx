import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Fonts, Radius } from '@/theme';
import { TabParamList, MainStackParamList } from './types';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { SearchScreen } from '@/screens/search/SearchScreen';
import { WineEntryScreen } from '@/screens/entry/WineEntryScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { WineDetailScreen } from '@/screens/detail/WineDetailScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabBarIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon emoji="🔍" label="Search" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="AddEntry"
        component={WineEntryScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <Pressable
              onPress={() => navigation.navigate('AddEntry')}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          ),
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon emoji="👤" label="Account" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="WineDetail"
        component={WineDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.ink,
    borderTopColor: 'rgba(201,168,76,0.2)',
    borderTopWidth: 0.5,
    height: 70,
    paddingBottom: 8,
  },
  tabIcon: {
    alignItems: 'center',
    gap: 2,
    paddingTop: 6,
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.4,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: Colors.gold,
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 28,
    color: Colors.ink,
    lineHeight: 32,
    marginTop: -2,
  },
});
