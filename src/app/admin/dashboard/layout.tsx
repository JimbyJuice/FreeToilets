import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) {
    redirect("/admin");
  }

  return <>{children}</>;
}
