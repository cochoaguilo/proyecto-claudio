import { z } from "zod";

export const transactionSchema = z.object({
  date: z.string().min(1),
  action: z.string().min(1),
  symbol: z.string().min(1),
  description: z.string().min(1),
  quantity: z.coerce.number(),
  price: z.coerce.number(),
  feesComm: z.coerce.number(),
  amount: z.coerce.number(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const TRANSACTION_HEADER_MAP: Record<string, keyof Transaction> = {
  Date: "date",
  Action: "action",
  Symbol: "symbol",
  Description: "description",
  Quantity: "quantity",
  Price: "price",
  "Fees & Comm": "feesComm",
  Amount: "amount",
};
