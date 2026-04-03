// ─── Auth Types (sesuai dengan backend response) ────────────────────────────

export interface SafeUser {
  user_id: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  provider: "LOCAL" | "GOOGLE";
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  no_telp?: string | null;
  address?: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: SafeUser;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  no_telp: string;
  password: string;
  confirm_password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  new_password: string;
}

export interface UpdateMyProfileDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  no_telp?: string;
  address?: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ─── Fasilitasi Types ────────────────────────────────────────────────────────

export interface PaketFasilitasi {
  paket_id: string;
  jenis_fasilitasi_id: number;
  nama_paket: string;
  kuota: number;
  nilai_bantuan: string | null;
  catatan: string | null;
}

export interface PaketFasilitasiWithCount extends PaketFasilitasi {
  _count: { pengajuan: number };
}

export interface JenisFasilitasi {
  jenis_fasilitasi_id: number;
  nama: string;
  deskripsi: string | null;
  template_proposal_file?: string | null;
  template_laporan_file?: string | null;
  paket_fasilitasi: PaketFasilitasi[];
}

export interface AdminJenisFasilitasi {
  jenis_fasilitasi_id: number;
  nama: string;
  deskripsi: string | null;
  template_proposal_file: string | null;
  template_laporan_file: string | null;
  paket_fasilitasi: PaketFasilitasiWithCount[];
}

export interface JenisLembagaMaster {
  jenis_lembaga_id: number;
  nama: string;
  created_at: string;
}

// ─── Lembaga Types ───────────────────────────────────────────────────────────

export interface SertifikatNik {
  nik_id: string;
  lembaga_id: string;
  nomor_nik: string;
  file_path: string;
  tanggal_terbit: string;
  tanggal_berlaku_sampai: string;
  status_verifikasi: string;
  catatan_admin: string | null;
}

export interface Lembaga {
  lembaga_id: string;
  user_id: string;
  nama_lembaga: string;
  jenis_kesenian: string;
  alamat: string;
  no_hp: string;
  email: string;
  created_at: string;
  sertifikat_nik: SertifikatNik | null;
}

export interface CreateLembagaDto {
  nama_lembaga: string;
  jenis_kesenian: string;
  alamat: string;
  no_hp: string;
  email: string;
}

export interface UpdateLembagaDto {
  nama_lembaga?: string;
  jenis_kesenian?: string;
  alamat?: string;
  no_hp?: string;
  email?: string;
}

export interface UploadSertifikatDto {
  nomor_nik: string;
  tanggal_terbit: string;
  tanggal_berlaku_sampai: string;
}

// ─── Pengajuan Types ─────────────────────────────────────────────────────────

export interface SuratPersetujuan {
  surat_id: string;
  pengajuan_id: string;
  nomor_surat: string | null;
  file_path: string;
  tanggal_terbit: string;
  status: string;
  tanggal_konfirmasi: string | null;
}

export interface SurveyLapangan {
  survey_id: string;
  pengajuan_id: string;
  tanggal_survey: string;
  status: string;
  catatan: string | null;
}

export interface LaporanKegiatan {
  laporan_id: string;
  pengajuan_id: string;
  file_laporan: string | null;
  template_file: string | null;
  status: string;
  catatan_admin: string | null;
  tanggal_upload: string;
}

export interface PencairanDana {
  pencairan_id: string;
  pengajuan_id: string;
  bukti_transfer: string | null;
  tanggal_pencairan: string | null;
  total_dana: string | null;
  status: string;
}

export interface PengirimanSarana {
  pengiriman_id: string;
  pengajuan_id: string;
  tanggal_pengiriman: string | null;
  bukti_pengiriman: string | null;
  catatan: string | null;
  status: string;
}

export interface Pengajuan {
  pengajuan_id: string;
  lembaga_id: string;
  jenis_fasilitasi_id: number;
  paket_id: string | null;
  jenis_kegiatan: string | null;
  judul_kegiatan: string | null;
  tujuan_kegiatan: string | null;
  lokasi_kegiatan: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  total_pengajuan_dana: string | null;
  nama_bank: string | null;
  nomor_rekening: string | null;
  nama_pemegang_rekening: string | null;
  nama_penerima: string | null;
  alamat_pengiriman: string | null;
  provinsi: string | null;
  kabupaten_kota: string | null;
  kecamatan: string | null;
  kelurahan_desa: string | null;
  kode_pos: string | null;
  proposal_file: string;
  sertifikat_nik_file: string | null;
  status: string;
  status_pemeriksaan: string;
  catatan_pemeriksaan: string | null;
  surat_penolakan_file: string | null;
  tanggal_pengajuan: string;
  jenis_fasilitasi?: JenisFasilitasi;
  paket_fasilitasi?: PaketFasilitasi | null;
  lembaga_budaya?: Lembaga;
  surat_persetujuan?: SuratPersetujuan | null;
  survey_lapangan?: SurveyLapangan | null;
  laporan_kegiatan?: LaporanKegiatan | null;
  pencairan_dana?: PencairanDana | null;
  pengiriman_sarana?: PengirimanSarana | null;
}

export interface CreatePengajuanPentasDto {
  jenis_kegiatan: string;
  judul_kegiatan: string;
  tujuan_kegiatan: string;
  lokasi_kegiatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_pengajuan_dana: number;
  nama_bank: string;
  nomor_rekening: string;
  nama_pemegang_rekening: string;
  alamat_lembaga: string;
}

export interface CreatePengajuanHibahDto {
  jenis_kegiatan: string;
  nama_penerima: string;
  email_penerima: string;
  no_hp_penerima: string;
  alamat_pengiriman: string;
  provinsi: string;
  kabupaten_kota: string;
  kecamatan: string;
  kelurahan_desa: string;
  kode_pos: string;
  catatan?: string;
}

// ─── Notifikasi Types ────────────────────────────────────────────────────────

export interface Notifikasi {
  notifikasi_id: string;
  user_id: string;
  judul: string;
  pesan: string;
  status_baca: boolean;
  created_at: string;
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface FilterPengajuanDto {
  search?: string;
  status?: string;
  jenis_fasilitasi_id?: number;
  start_date?: string;
  end_date?: string;
  sort_order?: "asc" | "desc";
}

export interface SetujuiPemeriksaanDto {
  paket_id?: string;
  catatan?: string;
}

export interface TolakPemeriksaanDto {
  catatan: string;
}

export interface SetSurveyDto {
  tanggal_survey: string;
  catatan?: string;
}

export interface TolakLaporanDto {
  catatan_admin: string;
}

export interface UpdateTimelineStatusDto {
  step:
    | "PEMERIKSAAN"
    | "SURVEY"
    | "SURAT_PERSETUJUAN"
    | "PENGIRIMAN"
    | "PELAPORAN"
    | "PENCAIRAN";
  status: "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  note?: string;
}

export interface AdminAccount {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  email: string;
  no_telp: string | null;
  address: string | null;
  role: "ADMIN";
  provider: "LOCAL" | "GOOGLE";
  created_at: string;
}

export interface CreateAdminAccountDto {
  first_name: string;
  last_name: string;
  email: string;
  no_telp: string;
  address?: string;
  password: string;
  confirm_password: string;
}

export interface UpdateAdminAccountDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  no_telp?: string;
  address?: string;
  password?: string;
  confirm_password?: string;
}

export interface ResetAdminPasswordDto {
  new_password: string;
  confirm_new_password: string;
}
