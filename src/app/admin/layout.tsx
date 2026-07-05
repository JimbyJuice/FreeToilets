import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  // Allow unauthenticated access only to /admin login page
  // Dashboard routes are protected in their own layout or page

  return (
    <div className="min-h-screen">
      {admin && (
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="font-semibold">
                FreeToilets Admin
              </Link>
              <nav className="flex gap-4 text-sm text-muted">
                <Link href="/admin/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
              </nav>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-muted hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
