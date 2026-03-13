const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type FileValidationOptions = {
  allowedExtensions: string[];
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
  label: string;
};

function normalizeExtension(name: string): string {
  const lastDotIndex = name.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return name.slice(lastDotIndex).toLowerCase();
}

export function validateUploadFile(
  file: File,
  { allowedExtensions, allowedMimeTypes = [], maxSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES, label }: FileValidationOptions,
): string | null {
  const normalizedExtension = normalizeExtension(file.name);
  const isValidExtension = allowedExtensions.includes(normalizedExtension);
  const isValidMimeType = !file.type || allowedMimeTypes.length === 0 || allowedMimeTypes.includes(file.type);

  if (!isValidExtension || !isValidMimeType) {
    return `${label} harus menggunakan format ${allowedExtensions.join(", ")}`;
  }

  if (file.size > maxSizeBytes) {
    return `${label} melebihi batas maksimum 10 MB`;
  }

  return null;
}

export const pdfUploadValidation = {
  allowedExtensions: [".pdf"],
  allowedMimeTypes: ["application/pdf"],
  maxSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
};

export const documentUploadValidation = {
  allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png"],
  allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  maxSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
};
