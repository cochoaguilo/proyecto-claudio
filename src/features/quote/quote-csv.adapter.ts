import type { CsvAdapter } from "@/lib/csv/csv-adapter";
import type { RawQuoteRow } from "./raw-quote";
import { parseQuoteNumericField, todayIsoDate } from "./quote-parsing";

export interface QuoteDraft {
  symbol: string;
  description: string;
  fecha: string;
  last: number;
  week52High: number;
  week52Low: number;
  movAvgExponential: number;
  low100Day: number;
  high: number;
  low: number;
  bollingerBands: string;
  sma10w: number;
  macStop: number;
  trendPilotStop: number;
  sma10d: number;
  sma100d: number;
}

export class QuoteCsvAdapter implements CsvAdapter<RawQuoteRow, QuoteDraft> {
  adapt(rawRows: RawQuoteRow[]): QuoteDraft[] {
    const fecha = todayIsoDate();

    return rawRows.map((row) => ({
      symbol: row.symbol.trim(),
      description: row.description.trim(),
      fecha,
      last: parseQuoteNumericField(row.last),
      week52High: parseQuoteNumericField(row.week52High),
      week52Low: parseQuoteNumericField(row.week52Low),
      movAvgExponential: parseQuoteNumericField(row.movAvgExponential),
      low100Day: parseQuoteNumericField(row.low100Day),
      high: parseQuoteNumericField(row.high),
      low: parseQuoteNumericField(row.low),
      bollingerBands: row.bollingerBands.trim(),
      sma10w: parseQuoteNumericField(row.sma10w),
      macStop: parseQuoteNumericField(row.macStop),
      trendPilotStop: parseQuoteNumericField(row.trendPilotStop),
      sma10d: parseQuoteNumericField(row.sma10d),
      sma100d: parseQuoteNumericField(row.sma100d),
    }));
  }
}
