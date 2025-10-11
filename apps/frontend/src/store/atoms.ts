import { atom } from 'jotai';

// Example atoms - you can extend these based on your needs

// User preference example
export const userPreferenceAtom = atom<{
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
}>({
  sidebarCollapsed: false,
  notificationsEnabled: true,
});

// Counter example (for demonstration)
export const counterAtom = atom(0);
