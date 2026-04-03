import { create } from "zustand";

type UiFormState = {
  authError: string | null;
  setAuthError: (value: string | null) => void;
  clearAuthError: () => void;
};

export const useUiFormStore = create<UiFormState>((set) => ({
  authError: null,
  setAuthError: (value) => set({ authError: value }),
  clearAuthError: () => set({ authError: null }),
}));
