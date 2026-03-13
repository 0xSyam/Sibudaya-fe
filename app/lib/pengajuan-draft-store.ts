let pendingSertifikatNikFile: File | null = null;

export function setPendingSertifikatNikFile(file: File | null) {
  pendingSertifikatNikFile = file;
}

export function getPendingSertifikatNikFile() {
  return pendingSertifikatNikFile;
}

export function clearPendingPengajuanDraftFiles() {
  pendingSertifikatNikFile = null;
}