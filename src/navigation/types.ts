import { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Signup: { inviteCode?: string } | undefined;
  ResetRequest: undefined;
  NewPassword: { error?: string } | undefined;
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
  ShareCard: { entryId: string };
  Comparison: undefined;
  Admin: undefined;
  Insights: undefined;
  MemberDirectory: undefined;
  InviteMembers: undefined;
  Inbox: undefined;
  MessageDetail: { otherUserId: string; otherDisplayName: string | null; otherAvatarUrl: string | null };
  ComposeMessage: { recipientId: string; recipientName: string | null; recipientAvatarUrl: string | null };
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Convenience re-export used by screens that navigate to WineDetail
export type MainTabParamList = MainStackParamList;
