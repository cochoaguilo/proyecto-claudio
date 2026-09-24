import { z } from "zod";

export const usuarioSchema = z.object({
  id: z.coerce.number().int().positive(),
  nombre: z.string().min(1),
  email: z.email(),
  rol: z.string().min(1),
  activo: z.preprocess(
    (v) => v === "true" || v === "1" || v === true,
    z.boolean()
  ),
});

export type Usuario = z.infer<typeof usuarioSchema>;
