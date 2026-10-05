export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-3 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        TanStack Tables + CSV Scaffold
      </h1>
      <p className="max-w-md text-muted-foreground">
        Upload a CSV and view it in a generic table with sorting, search,
        pagination, and row selection. Use the sidebar to jump into
        Transactions, Quote, or Positions.
      </p>
    </div>
  );
}
