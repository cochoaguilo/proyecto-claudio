import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          TanStack Tables + CSV Scaffold
        </h1>
        <p className="max-w-md text-muted-foreground">
          Sube un CSV y visualizalo en una tabla generica con ordenamiento,
          busqueda, paginacion y seleccion de filas.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/usuarios">Usuarios</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/productos">Productos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/transactions">Transactions</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/quote">Quote</Link>
        </Button>
      </div>
    </div>
  );
}
