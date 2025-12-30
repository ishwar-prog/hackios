import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TwoFactorMethod = 'authenticator' | 'sms';

interface SecurityState {
  isTwoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod | null;
  isEmailNotificationsEnabled: boolean;
  enableTwoFactor: (method: TwoFactorMethod) => void;
  disableTwoFactor: () => void;
  setEmailNotifications: (enabled: boolean) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      isTwoFactorEnabled: false,
      twoFactorMethod: null,
      isEmailNotificationsEnabled: false,

      enableTwoFactor: (method) => {
        set({
          isTwoFactorEnabled: true,
          twoFactorMethod: method,
        });
      },

      disableTwoFactor: () => {
        set({
          isTwoFactorEnabled: false,
          twoFactorMethod: null,
        });
      },

      setEmailNotifications: (enabled) => {
        set({ isEmailNotificationsEnabled: enabled });
      },
    }),
    {
      name: 'security-storage',
    }
  )
);
