import type {
  AuthTokens,
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SafeUser,
  JenisFasilitasi,
  PaketFasilitasi,
  Lembaga,
  CreateLembagaDto,
  UpdateLembagaDto,
  UploadSertifikatDto,
  Pengajuan,
  CreatePengajuanPentasDto,
  CreatePengajuanHibahDto,
  Notifikasi,
  FilterPengajuanDto,
  SetujuiPemeriksaanDto,
  TolakPemeriksaanDto,
  SetSurveyDto,
  TolakLaporanDto,
  LaporanKegiatan,
  SurveyLapangan,
  SuratPersetujuan,
  PencairanDana,
  PengirimanSarana,
} from "./types";

// ─── Base URL ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const AUTH_USE_API = process.env.NEXT_PUBLIC_AUTH_USE_API ?? "true";
const LOCAL_AUTH_USER_KEY = "local_auth_user";

export function isApiAuthEnabled(): boolean {
  return AUTH_USE_API.toLowerCase() !== "false";
}

// ─── Token helpers (localStorage) ────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getLocalAuthUser(): SafeUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LOCAL_AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SafeUser;
  } catch {
    localStorage.removeItem(LOCAL_AUTH_USER_KEY);
    return null;
  }
}

export function setLocalAuthUser(user: SafeUser) {
  localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(user));
}

export function clearLocalAuthUser() {
  localStorage.removeItem(LOCAL_AUTH_USER_KEY);
}

// ─── Fetch wrapper ───────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Jika 401 & ada refresh token → coba refresh sekali
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({
          statusCode: retryRes.status,
          message: retryRes.statusText,
        }));
        throw err;
      }
      return retryRes.json() as Promise<T>;
    } else {
      // Refresh gagal → clear tokens
      clearTokens();
      throw { statusCode: 401, message: "Sesi telah berakhir. Silakan login kembali." };
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw err;
  }

  return res.json() as Promise<T>;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { access_token: string };
    localStorage.setItem("access_token", data.access_token);
    return true;
  } catch {
    return false;
  }
}

// ─── Multipart Fetch wrapper (for file uploads) ─────────────────────────────

async function apiMultipartFetch<T>(
  endpoint: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  const headers: Record<string, string> = {};

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: formData,
    credentials: "include",
  });

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: formData,
        credentials: "include",
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({
          statusCode: retryRes.status,
          message: retryRes.statusText,
        }));
        throw err;
      }
      return retryRes.json() as Promise<T>;
    } else {
      clearTokens();
      throw { statusCode: 401, message: "Sesi telah berakhir. Silakan login kembali." };
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw err;
  }

  return res.json() as Promise<T>;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  /** Login dengan email & password */
  login(dto: LoginDto): Promise<AuthTokens> {
    return apiFetch<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /** Register user baru */
  register(dto: RegisterDto): Promise<AuthTokens> {
    return apiFetch<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /** Ambil URL redirect Google OAuth */
  getGoogleOAuthUrl(): string {
    return `${API_BASE}/auth/google`;
  },

  /** Ambil data user yang sedang login */
  getMe(): Promise<SafeUser> {
    return apiFetch<SafeUser>("/auth/me");
  },

  /** Refresh access token */
  refresh(refreshToken: string): Promise<{ access_token: string }> {
    return apiFetch<{ access_token: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /** Request reset password token */
  forgotPassword(dto: ForgotPasswordDto): Promise<{ reset_token: string }> {
    return apiFetch<{ reset_token: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /** Reset password dengan token */
  resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};

// ─── Fasilitasi API ──────────────────────────────────────────────────────────

export const fasilitasiApi = {
  /** Daftar semua jenis fasilitasi beserta paket */
  getAll(): Promise<JenisFasilitasi[]> {
    return apiFetch<JenisFasilitasi[]>("/fasilitasi");
  },

  /** Daftar paket by jenis fasilitasi */
  getPaketByJenis(jenisFasilitasiId: number): Promise<PaketFasilitasi[]> {
    return apiFetch<PaketFasilitasi[]>(`/fasilitasi/${jenisFasilitasiId}/paket`);
  },
};

// ─── Lembaga API ─────────────────────────────────────────────────────────────

export const lembagaApi = {
  /** Buat lembaga baru */
  create(dto: CreateLembagaDto): Promise<Lembaga> {
    return apiFetch<Lembaga>("/lembaga", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /** Ambil lembaga milik user yang login */
  getMe(): Promise<Lembaga> {
    return apiFetch<Lembaga>("/lembaga/me");
  },

  /** Update lembaga milik user */
  updateMe(dto: UpdateLembagaDto): Promise<Lembaga> {
    return apiFetch<Lembaga>("/lembaga/me", {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },

  /** Upload sertifikat NIK */
  uploadSertifikatNik(dto: UploadSertifikatDto, file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("nomor_nik", dto.nomor_nik);
    formData.append("tanggal_terbit", dto.tanggal_terbit);
    formData.append("tanggal_berlaku_sampai", dto.tanggal_berlaku_sampai);
    return apiMultipartFetch("/lembaga/me/sertifikat-nik", formData);
  },
};

// ─── Pengajuan API ───────────────────────────────────────────────────────────

export const pengajuanApi = {
  /** Submit pengajuan fasilitasi pentas */
  submitPentas(dto: CreatePengajuanPentasDto, proposalFile: File): Promise<Pengajuan> {
    const formData = new FormData();
    formData.append("proposal_file", proposalFile);
    Object.entries(dto).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    return apiMultipartFetch<Pengajuan>("/pengajuan/pentas", formData);
  },

  /** Submit pengajuan fasilitasi hibah */
  submitHibah(dto: CreatePengajuanHibahDto, proposalFile: File): Promise<Pengajuan> {
    const formData = new FormData();
    formData.append("proposal_file", proposalFile);
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    return apiMultipartFetch<Pengajuan>("/pengajuan/hibah", formData);
  },

  /** Daftar pengajuan milik user */
  getMyPengajuan(): Promise<Pengajuan[]> {
    return apiFetch<Pengajuan[]>("/pengajuan");
  },

  /** Detail pengajuan (timeline) */
  getDetail(pengajuanId: string): Promise<Pengajuan> {
    return apiFetch<Pengajuan>(`/pengajuan/${pengajuanId}`);
  },

  /** Upload laporan kegiatan */
  uploadLaporan(pengajuanId: string, file: File): Promise<LaporanKegiatan> {
    const formData = new FormData();
    formData.append("file_laporan", file);
    return apiMultipartFetch<LaporanKegiatan>(`/pengajuan/${pengajuanId}/laporan`, formData);
  },
};

// ─── Notifikasi API ──────────────────────────────────────────────────────────

export const notifikasiApi = {
  /** Daftar notifikasi user */
  getAll(): Promise<Notifikasi[]> {
    return apiFetch<Notifikasi[]>("/notifikasi");
  },

  /** Tandai satu notifikasi sudah dibaca */
  markAsRead(notifikasiId: string): Promise<unknown> {
    return apiFetch(`/notifikasi/${notifikasiId}/baca`, { method: "PATCH" });
  },

  /** Tandai semua notifikasi sudah dibaca */
  markAllAsRead(): Promise<{ count: number }> {
    return apiFetch<{ count: number }>("/notifikasi/baca-semua", { method: "PATCH" });
  },
};

// ─── Admin Pengajuan API ─────────────────────────────────────────────────────

export const adminPengajuanApi = {
  /** Daftar semua pengajuan (dengan filter) */
  getAll(filter?: FilterPengajuanDto): Promise<Pengajuan[]> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.append(key, String(value));
      });
    }
    const qs = params.toString();
    return apiFetch<Pengajuan[]>(`/admin/pengajuan${qs ? `?${qs}` : ""}`);
  },

  /** Detail lengkap pengajuan */
  getDetail(pengajuanId: string): Promise<Pengajuan> {
    return apiFetch<Pengajuan>(`/admin/pengajuan/${pengajuanId}`);
  },

  /** Setujui pemeriksaan */
  setujui(pengajuanId: string, dto: SetujuiPemeriksaanDto): Promise<Pengajuan> {
    return apiFetch<Pengajuan>(`/admin/pengajuan/${pengajuanId}/setujui`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },

  /** Tolak pemeriksaan */
  tolak(pengajuanId: string, dto: TolakPemeriksaanDto, suratFile?: File): Promise<Pengajuan> {
    const formData = new FormData();
    formData.append("catatan", dto.catatan);
    if (suratFile) formData.append("surat_penolakan", suratFile);
    return apiMultipartFetch<Pengajuan>(`/admin/pengajuan/${pengajuanId}/tolak`, formData, "PATCH");
  },

  /** Set tanggal survey lapangan (Hibah) */
  setSurvey(pengajuanId: string, dto: SetSurveyDto): Promise<SurveyLapangan> {
    return apiFetch<SurveyLapangan>(`/admin/pengajuan/${pengajuanId}/survey`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /** Tandai survey lapangan selesai */
  selesaikanSurvey(pengajuanId: string): Promise<SurveyLapangan> {
    return apiFetch<SurveyLapangan>(`/admin/pengajuan/${pengajuanId}/survey/selesai`, {
      method: "PATCH",
    });
  },

  /** Upload surat persetujuan */
  uploadSuratPersetujuan(
    pengajuanId: string,
    dto: { nomor_surat?: string; tanggal_terbit: string },
    file: File,
  ): Promise<SuratPersetujuan> {
    const formData = new FormData();
    formData.append("surat_file", file);
    formData.append("tanggal_terbit", dto.tanggal_terbit);
    if (dto.nomor_surat) formData.append("nomor_surat", dto.nomor_surat);
    return apiMultipartFetch<SuratPersetujuan>(`/admin/pengajuan/${pengajuanId}/surat-persetujuan`, formData);
  },

  /** Konfirmasi surat persetujuan sudah ditandatangani */
  konfirmasiSuratPersetujuan(pengajuanId: string): Promise<SuratPersetujuan> {
    return apiFetch<SuratPersetujuan>(`/admin/pengajuan/${pengajuanId}/surat-persetujuan/konfirmasi`, {
      method: "PATCH",
    });
  },

  /** Setujui laporan kegiatan */
  setujuiLaporan(pengajuanId: string): Promise<LaporanKegiatan> {
    return apiFetch<LaporanKegiatan>(`/admin/pengajuan/${pengajuanId}/laporan/setujui`, {
      method: "PATCH",
    });
  },

  /** Tolak laporan kegiatan */
  tolakLaporan(pengajuanId: string, dto: TolakLaporanDto): Promise<LaporanKegiatan> {
    return apiFetch<LaporanKegiatan>(`/admin/pengajuan/${pengajuanId}/laporan/tolak`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },

  /** Upload bukti pencairan dana (Pentas) */
  uploadBuktiPencairan(
    pengajuanId: string,
    dto: { tanggal_pencairan: string; total_dana: number },
    file: File,
  ): Promise<PencairanDana> {
    const formData = new FormData();
    formData.append("bukti_transfer", file);
    formData.append("tanggal_pencairan", dto.tanggal_pencairan);
    formData.append("total_dana", String(dto.total_dana));
    return apiMultipartFetch<PencairanDana>(`/admin/pengajuan/${pengajuanId}/pencairan`, formData);
  },

  /** Konfirmasi pencairan dana selesai */
  selesaikanPencairan(pengajuanId: string): Promise<PencairanDana> {
    return apiFetch<PencairanDana>(`/admin/pengajuan/${pengajuanId}/pencairan/selesai`, {
      method: "PATCH",
    });
  },

  /** Upload bukti pengiriman sarana (Hibah) */
  uploadBuktiPengiriman(
    pengajuanId: string,
    dto: { tanggal_pengiriman: string; catatan?: string },
    file: File,
  ): Promise<PengirimanSarana> {
    const formData = new FormData();
    formData.append("bukti_pengiriman", file);
    formData.append("tanggal_pengiriman", dto.tanggal_pengiriman);
    if (dto.catatan) formData.append("catatan", dto.catatan);
    return apiMultipartFetch<PengirimanSarana>(`/admin/pengajuan/${pengajuanId}/pengiriman`, formData);
  },
};
