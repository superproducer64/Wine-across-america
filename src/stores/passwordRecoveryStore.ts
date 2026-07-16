import { create } from 'zustand';

// Gates the root navigator into the NewPassword screen regardless of session
// state. Recovery deep links call setSession() with a valid token pair, which
// would otherwise make RootNavigator treat the user as signed in and drop
// them straight into the main app before they've set a new password.
interface PasswordRecoveryState {
  active: boolean;
  error: string | null;
  start: (error?: string | null) => void;
  clear: () => void;
}

export const usePasswordRecoveryStore = create<PasswordRecoveryState>((set) => ({
  active: false,
  error: null,
  start: (error = null) => set({ active: true, error }),
  clear: () => set({ active: false, error: null }),
}));
