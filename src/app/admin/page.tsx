import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">FreeToilets Admin</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage content</p>
      </div>
      <LoginForm />
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to site
      </Link>
    </main>
  );
}
