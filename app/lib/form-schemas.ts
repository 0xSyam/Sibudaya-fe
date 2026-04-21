import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Nama depan wajib diisi"),
    lastName: z.string().trim().min(1, "Nama belakang wajib diisi"),
    address: z.string().trim().min(1, "Alamat wajib diisi"),
    email: z.string().trim().email("Format email tidak valid"),
    noTelp: z
      .string()
      .trim()
      .min(1, "Nomor telepon wajib diisi")
      .regex(/^\d+$/, "Nomor telepon hanya boleh berisi angka"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const requestResetSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RequestResetFormValues = z.infer<typeof requestResetSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
