import { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// ─── Tab Navigator (no modals) ────────────────────────────────────────────────

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  AddEntry: undefined;
  Settings: undefined;
};

// ─── Main Stack (wraps tabs + modal/push screens) ─────────────────────────────

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  WineDetail: { entryId: string };
  SharedWineDetail: { snapshot: Record<string, unknown>; senderName: string };
  Comparison: undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Convenience re-export used by screens that navigate to WineDetail
export type MainTabParamList = MainStackParamList;
