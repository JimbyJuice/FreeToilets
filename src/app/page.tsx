import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">FreeToilets</h1>
      <p className="text-lg text-muted">
        Find, rate, and review bathrooms at UNSW Kensington.
      </p>
      <p className="text-sm text-muted">
        Phase 1 complete — campus map and floor plans coming in Phase 2–4.
      </p>
      <Link
        href="/admin"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Admin
      </Link>
    </main>
  );
}
