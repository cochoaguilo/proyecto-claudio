import { z } from "zod";

export const productoSchema = z.object({
  id: z.coerce.number().int().positive(),
  nombre: z.string().min(1),
  categoria: z.string().min(1),
  precio: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
});

export type Producto = z.infer<typeof productoSchema>;
