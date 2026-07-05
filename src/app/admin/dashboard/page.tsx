import { BuildingManager } from "@/components/admin/BuildingManager";
import { FloorPlanManager } from "@/components/admin/FloorPlanManager";
import { ToiletManager } from "@/components/admin/ToiletManager";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [buildingsRes, floorPlansRes, toiletsRes] = await Promise.all([
    supabase.from("buildings").select("*").order("name"),
    supabase.from("floor_plans").select("*").order("level"),
    supabase.from("toilets").select("*").order("name"),
  ]);

  const buildings = buildingsRes.data ?? [];
  const floorPlans = floorPlansRes.data ?? [];
  const toilets = toiletsRes.data ?? [];

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>
      <div className="flex flex-col gap-12">
        <BuildingManager buildings={buildings} />
        <FloorPlanManager buildings={buildings} floorPlans={floorPlans} />
        <ToiletManager
          buildings={buildings}
          floorPlans={floorPlans}
          toilets={toilets}
        />
      </div>
    </main>
  );
}
