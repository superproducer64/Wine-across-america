import { create } from 'zustand';

// Holds an invite code picked up from a pouracrossamerica://invite/{code}
// deep link until SignupScreen consumes it (or the user navigates away),
// so a cold-start deep link can steer AuthNavigator's initial route.
interface InviteState {
  pendingCode: string | null;
  setPendingCode: (code: string | null) => void;
}

export const useInviteStore = create<InviteState>((set) => ({
  pendingCode: null,
  setPendingCode: (code) => set({ pendingCode: code }),
}));
