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

/** A raw row as persisted: stable identity assigned at upload time. */
export interface StoredRawTransactionRow extends RawTransactionRow {
  sourceId: string;
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
