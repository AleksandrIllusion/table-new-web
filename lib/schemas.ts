import { z } from "zod";

const https = z
  .string()
  .url("Enter a valid URL")
  .refine((v) => v.startsWith("https://"), "URL must start with https://");

// Схема формы создания казино — одна правда для клиента и подсказок.
export const casinoFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  link: https,
  logo_img: https,
  casino_rate: z.coerce
    .number({ invalid_type_error: "Rate must be a number" })
    .min(0, "Min 0")
    .max(5, "Max 5"),
  country_id: z.coerce.number().int().positive("Select a country"),
  country_code_id: z.coerce.number().int().positive("Select a country code"),
  bonuses: z.array(z.coerce.number().int()).min(1, "Pick at least one bonus"),
  features: z.array(z.coerce.number().int()).min(1, "Pick at least one feature"),
  payments: z.array(z.coerce.number().int()).min(1, "Pick at least one payment"),
});

export type CasinoFormValues = z.infer<typeof casinoFormSchema>;
