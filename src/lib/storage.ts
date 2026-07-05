import { createClient } from "@/lib/supabase/server";

const BUCKET = "toilet-photos";

export async function uploadToiletPhoto(
  toiletId: string,
  file: File
): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${toiletId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

export async function uploadFloorPlanSvg(
  buildingId: string,
  level: string,
  file: File
): Promise<string> {
  const supabase = await createClient();
  const safeLevel = level.replace(/[^a-zA-Z0-9_-]/g, "_");
  const path = `${buildingId}/${safeLevel}.svg`;

  const { error } = await supabase.storage.from("floor-plans").upload(path, file, {
    upsert: true,
    contentType: "image/svg+xml",
  });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("floor-plans").getPublicUrl(path);

  return publicUrl;
}
