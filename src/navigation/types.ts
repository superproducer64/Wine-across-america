import { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// ─── Tab Navigator ────────────────────────────────────────────────────────────

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  AddEntry: undefined;
  Settings: undefined;
};

// ─── Main Stack (wraps tabs + modal/push screens) ─────────────────────────────

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  CheeseDetail: { entryId: string };
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type MainTabParamList = MainStackParamList;
