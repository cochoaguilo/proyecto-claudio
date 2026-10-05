export interface RawTransactionRow {
  date: string;
  action: string;
  symbol: string;
  description: string;
  quantity: string;
  price: string;
  feesComm: string;
  amount: string;
}

export const RAW_TRANSACTION_HEADER_MAP: Record<string, keyof RawTransactionRow> = {
  Date: "date",
  Action: "action",
  Symbol: "symbol",
  Description: "description",
  Quantity: "quantity",
  Price: "price",
  "Fees & Comm": "feesComm",
  Amount: "amount",
};
