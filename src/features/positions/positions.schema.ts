import { z } from "zod";

export const positionSchema = z.object({
  key: z.string().min(1),
  symbol: z.string().min(1),
  description: z.string().min(1),
  quantity: z.coerce.number(),
  days: z.coerce.number(),
  tradePrice: z.coerce.number(),
  mark: z.coerce.number(),
  last: z.coerce.number(),
  stockMark: z.coerce.number(),
  stockLast: z.coerce.number(),
  deltaPosition: z.coerce.number(),
  theta: z.coerce.number(),
  optionDelta: z.coerce.number(),
  optionTheta: z.coerce.number(),
  netLiq: z.coerce.number(),
});

export type Position = z.infer<typeof positionSchema>;

export const POSITION_HEADER_MAP: Record<string, keyof Position> = {
  Key: "key",
  Symbol: "symbol",
  Description: "description",
  Quantity: "quantity",
  Days: "days",
  "Trade Price": "tradePrice",
  Mark: "mark",
  Last: "last",
  "Stock Mark": "stockMark",
  "Stock Last": "stockLast",
  "Delta Position": "deltaPosition",
  Theta: "theta",
  OptionDelta: "optionDelta",
  OptionTheta: "optionTheta",
  "Net Liq": "netLiq",
};
