import { z } from "zod";

export const transactionSchema = z.object({
  codigo: z.string().min(1),
  strategy: z.string().optional(),
  entryPrice: z.coerce.number(),
  aux: z.string().optional(),
  uniqueKey: z.string().min(1),
  symbol: z.string().min(1),
  instrument: z.string().min(1),
  date: z.string().min(1),
  action: z.string().min(1),
  description: z.string().min(1),
  quantity: z.coerce.number(),
  price: z.coerce.number(),
  feesComm: z.coerce.number(),
  amount: z.coerce.number(),
  positionStatus: z.string().min(1),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const TRANSACTION_HEADER_MAP: Record<string, keyof Transaction> = {
  Codigo: "codigo",
  Strategy: "strategy",
  "Entry Price": "entryPrice",
  Aux: "aux",
  UniqueKey: "uniqueKey",
  Symbol: "symbol",
  Instrument: "instrument",
  Date: "date",
  Action: "action",
  Description: "description",
  Quantity: "quantity",
  Price: "price",
  "Fees & Comm": "feesComm",
  Amount: "amount",
  "Position Status": "positionStatus",
};
