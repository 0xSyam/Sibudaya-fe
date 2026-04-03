import { create } from "zustand";

type PengajuanDraftState = {
  pendingSertifikatNikFile: File | null;
  setPendingSertifikatNikFile: (file: File | null) => void;
  clearPendingPengajuanDraftFiles: () => void;
};

const usePengajuanDraftStore = create<PengajuanDraftState>((set) => ({
  pendingSertifikatNikFile: null,
  setPendingSertifikatNikFile: (file) => set({ pendingSertifikatNikFile: file }),
  clearPendingPengajuanDraftFiles: () => set({ pendingSertifikatNikFile: null }),
}));

export function setPendingSertifikatNikFile(file: File | null) {
  usePengajuanDraftStore.getState().setPendingSertifikatNikFile(file);
}

export function getPendingSertifikatNikFile() {
  return usePengajuanDraftStore.getState().pendingSertifikatNikFile;
}

export function clearPendingPengajuanDraftFiles() {
  usePengajuanDraftStore.getState().clearPendingPengajuanDraftFiles();
}
