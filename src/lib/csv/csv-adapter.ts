export interface CsvAdapter<TRaw, TTarget> {
  adapt(rawRows: TRaw[]): TTarget[];
}
