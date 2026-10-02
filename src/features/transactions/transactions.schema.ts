import { z } from "zod";

// Broker export formats money as "$24.475" or "-$3769.15"; strip the
// currency symbol and thousands separators before coercing to a number.
const moneyNumber = z.preprocess(
  (val) => (typeof val === "string" ? val.replace(/[$,]/g, "") : val),
  z.coerce.number()
);

export const transactionSchema = z.object({
  date: z.string().min(1),
  action: z.string().min(1),
  symbol: z.string().min(1),
  description: z.string().min(1),
  quantity: moneyNumber,
  price: moneyNumber,
  feesComm: moneyNumber,
  amount: moneyNumber,
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
