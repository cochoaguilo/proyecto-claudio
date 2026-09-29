import type { CsvAdapter } from "@/lib/csv/csv-adapter";
import type { RawPositionRow } from "./raw-position";
import {
  isOptionRow,
  isStockRow,
  parsePositionDescription,
  parsePositionNumericField,
} from "./position-parsing";

export interface PositionDraft {
  key: string;
  symbol: string;
  description: string;
  quantity: number;
  days: number;
  tradePrice: number;
  mark: number;
  last: number;
  stockMark: number;
  stockLast: number;
  deltaPosition: number;
  theta: number;
  optionDelta: number;
  optionTheta: number;
  netLiq: number;
}

interface SymbolBlock {
  actionRow: PositionDraft | null;
  options: PositionDraft[];
}

/**
 * Ports Position_Statement_TOS's main loop and final assembly. Rows are
 * walked in original file order (never sorted): a stock row opens a new
 * symbol block, an optional underlying/descriptive row that follows
 * supplies the block's stockMark/stockLast, and any option rows that
 * follow close it out. For each block, options are emitted when present;
 * otherwise the stock's own actionRow is emitted (a covered call's stock
 * leg never appears once the option rows exist). Rows left at
 * quantity === 0 (closed positions) are dropped last, before validation.
 */
export class PositionCsvAdapter
  implements CsvAdapter<RawPositionRow, PositionDraft>
{
  adapt(rawRows: RawPositionRow[]): PositionDraft[] {
    const blocks = new Map<string, SymbolBlock>();
    let currentSymbol = "";
    let stockMark = 0;
    let stockLast = 0;

    for (const raw of rawRows) {
      const instrument = raw.instrument.trim();
      const stockRow = isStockRow(instrument);
      const optionRow = isOptionRow(instrument);

      if (stockRow) {
        currentSymbol = instrument;
        stockMark = 0;
        stockLast = 0;

        const block = this.getOrCreateBlock(blocks, currentSymbol);
        block.actionRow = {
          key: currentSymbol,
          symbol: currentSymbol,
          description: currentSymbol,
          quantity: parsePositionNumericField(raw.qty),
          days: 0,
          tradePrice: parsePositionNumericField(raw.tradePrice),
          mark: parsePositionNumericField(raw.mark),
          last: parsePositionNumericField(raw.last),
          stockMark: 0,
          stockLast: 0,
          deltaPosition: parsePositionNumericField(raw.delta),
          theta: parsePositionNumericField(raw.theta),
          optionDelta: 0,
          optionTheta: 0,
          netLiq: parsePositionNumericField(raw.netLiq),
        };
        continue;
      }

      if (currentSymbol && !optionRow) {
        stockMark = parsePositionNumericField(raw.mark);
        stockLast = parsePositionNumericField(raw.last);

        const block = blocks.get(currentSymbol);
        if (block?.actionRow) {
          block.actionRow.stockMark = stockMark;
          block.actionRow.stockLast = stockLast;
        }
        continue;
      }

      if (currentSymbol && optionRow) {
        const description = parsePositionDescription(instrument);
        const block = blocks.get(currentSymbol);
        if (!block) continue;

        block.options.push({
          key: `${currentSymbol}-${description}`,
          symbol: currentSymbol,
          description,
          quantity: parsePositionNumericField(raw.qty),
          days: parsePositionNumericField(raw.days),
          tradePrice: parsePositionNumericField(raw.tradePrice),
          mark: parsePositionNumericField(raw.mark),
          last: parsePositionNumericField(raw.last),
          stockMark,
          stockLast,
          deltaPosition: parsePositionNumericField(raw.delta),
          theta: parsePositionNumericField(raw.theta),
          optionDelta: parsePositionNumericField(raw.optionDelta),
          optionTheta: parsePositionNumericField(raw.optionTheta),
          netLiq: parsePositionNumericField(raw.netLiq),
        });
      }
    }

    const rows: PositionDraft[] = [];
    for (const block of blocks.values()) {
      if (block.options.length > 0) {
        rows.push(...block.options);
      } else if (block.actionRow) {
        rows.push(block.actionRow);
      }
    }

    return rows.filter((row) => row.quantity !== 0);
  }

  private getOrCreateBlock(
    blocks: Map<string, SymbolBlock>,
    symbol: string
  ): SymbolBlock {
    let block = blocks.get(symbol);
    if (!block) {
      block = { actionRow: null, options: [] };
      blocks.set(symbol, block);
    }
    return block;
  }
}
