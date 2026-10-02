import { z } from "zod";

export const quoteSchema = z.object({
  symbol: z.string().min(1),
  description: z.string().min(1),
  fecha: z.string().min(1),
  last: z.coerce.number(),
  week52High: z.coerce.number(),
  week52Low: z.coerce.number(),
  movAvgExponential: z.coerce.number(),
  low100Day: z.coerce.number(),
  high: z.coerce.number(),
  low: z.coerce.number(),
  bollingerBands: z.string().optional(),
  sma10w: z.coerce.number(),
  macStop: z.coerce.number(),
  trendPilotStop: z.coerce.number(),
  sma10d: z.coerce.number(),
  sma100d: z.coerce.number(),
});

export type Quote = z.infer<typeof quoteSchema>;

export const QUOTE_HEADER_MAP: Record<string, keyof Quote> = {
  Symbol: "symbol",
  Description: "description",
  Fecha: "fecha",
  Last: "last",
  "52High": "week52High",
  "52Low": "week52Low",
  MovAvgExponential: "movAvgExponential",
  "100-day-Low": "low100Day",
  High: "high",
  Low: "low",
  BollingerBands: "bollingerBands",
  "SMA 10W": "sma10w",
  MAC_STOP: "macStop",
  TrendPilot_STOP: "trendPilotStop",
  "SMA 10d": "sma10d",
  "SMA 100d": "sma100d",
};
