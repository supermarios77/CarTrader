import Link from "next/link"

const brands = [
  "toyota",
  "honda",
  "suzuki",
  "kia",
  "hyundai",
  "mg",
  "changan",
  "dfsk",
  "faw",
  "mercedes",
  "bmw",
  "audi",
  "peugeot",
  "proton",
  "tesla",
]

export function BrandGrid() {
  return (
    <section className="rounded-3xl border border-border/60 bg-background px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Shop by brand</h2>
          <p className="text-sm text-muted-foreground">
            Explore the most searched makes on CarTrader.
          </p>
        </div>
        <Link
          href="/brands"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all brands
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {brands.map((brand) => (
          <Link
            href={`/brands/${brand}`}
            key={brand}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm font-medium transition hover:-translate-y-1 hover:bg-muted/60"
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-background text-lg font-semibold uppercase text-primary">
              {brand.slice(0, 1)}
            </span>
            <span className="capitalize">{brand}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

