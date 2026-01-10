import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
})

export const createFolderSchema = z.object({
  name: z.string()
    .min(1, "Le nom ne peut pas être vide")
    .max(50, "Nom trop long (max 50 caractères)")
    .regex(/^[^\\/:*?"<>|]+$/, "Le nom contient des caractères interdits"),
})

export const renameSchema = z.object({
  name: z.string().min(1).max(50),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type CreateFolderValues = z.infer<typeof createFolderSchema>