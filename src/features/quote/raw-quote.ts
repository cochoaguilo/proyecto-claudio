export interface RawQuoteRow {
  symbol: string;
  description: string;
  last: string;
  week52High: string;
  week52Low: string;
  movAvgExponential: string;
  low100Day: string;
  high: string;
  low: string;
  bollingerBands: string;
  sma10w: string;
  macStop: string;
  trendPilotStop: string;
  sma10d: string;
  sma100d: string;
}

export const RAW_QUOTE_HEADER_MAP: Record<string, keyof RawQuoteRow> = {
  Symbol: "symbol",
  Description: "description",
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
