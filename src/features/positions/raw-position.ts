export interface RawPositionRow {
  instrument: string;
  qty: string;
  tradePrice: string;
  mark: string;
  last: string;
  days: string;
  delta: string;
  theta: string;
  optionDelta: string;
  optionTheta: string;
  netLiq: string;
}

export const RAW_POSITION_HEADER_MAP: Record<string, keyof RawPositionRow> = {
  Instrument: "instrument",
  Qty: "qty",
  "Trade Price": "tradePrice",
  Mark: "mark",
  Last: "last",
  Days: "days",
  Delta: "delta",
  Theta: "theta",
  OptionDelta: "optionDelta",
  OptionTheta: "optionTheta",
  "Net Liq": "netLiq",
};
