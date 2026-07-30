import { NavigatorScreenParams } from '@react-navigation/native';
import { InboxMessage } from '@/lib/supabase';

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
  SharedWineDetail: { snapshot: Record<string, unknown>; senderName: string };
  Comparison: undefined;
  Admin: undefined;
  Insights: undefined;
  MemberDirectory: undefined;
  InviteMembers: undefined;
  Inbox: undefined;
  MessageDetail: { message: InboxMessage };
  ComposeMessage: { recipientId: string; recipientName: string | null; recipientAvatarUrl: string | null };
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Convenience re-export used by screens that navigate to WineDetail
export type MainTabParamList = MainStackParamList;
