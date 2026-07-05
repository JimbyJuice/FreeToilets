"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { uploadFloorPlanSvg, uploadToiletPhoto } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { ToiletGender } from "@/lib/types";

function revalidateAdmin() {
  revalidatePath("/admin/dashboard");
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function createBuilding(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("buildings").insert({
    name: formData.get("name") as string,
    latitude: parseFloat(formData.get("latitude") as string),
    longitude: parseFloat(formData.get("longitude") as string),
    floor_count: parseInt(formData.get("floor_count") as string, 10) || 0,
  });

  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}

export async function updateBuilding(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("buildings")
    .update({
      name: formData.get("name") as string,
      latitude: parseFloat(formData.get("latitude") as string),
      longitude: parseFloat(formData.get("longitude") as string),
      floor_count: parseInt(formData.get("floor_count") as string, 10) || 0,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}

export async function deleteBuilding(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("buildings").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}

export async function createFloorPlan(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const buildingId = formData.get("building_id") as string;
  const level = formData.get("level") as string;
  const svgFile = formData.get("svg") as File | null;

  let svg_url: string | null = null;
  if (svgFile && svgFile.size > 0) {
    svg_url = await uploadFloorPlanSvg(buildingId, level, svgFile);
  }

  const { error } = await supabase.from("floor_plans").insert({
    building_id: buildingId,
    level,
    svg_url,
  });

  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}

export async function deleteFloorPlan(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("floor_plans").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}

export async function createToilet(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const floorPlanId = (formData.get("floor_plan_id") as string) || null;

  const { error } = await supabase.from("toilets").insert({
    building_id: formData.get("building_id") as string,
    floor_plan_id: floorPlanId || null,
    name: formData.get("name") as string,
    gender: formData.get("gender") as ToiletGender,
    has_accessible_stall: formData.get("has_accessible_stall") === "on",
    has_shower: formData.get("has_shower") === "on",
    description: (formData.get("description") as string) || null,
    x: formData.get("x") ? parseFloat(formData.get("x") as string) : null,
    y: formData.get("y") ? parseFloat(formData.get("y") as string) : null,
  });

  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}

export async function updateToilet(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const floorPlanId = (formData.get("floor_plan_id") as string) || null;

  const { error } = await supabase
    .from("toilets")
    .update({
      building_id: formData.get("building_id") as string,
      floor_plan_id: floorPlanId || null,
      name: formData.get("name") as string,
      gender: formData.get("gender") as ToiletGender,
      has_accessible_stall: formData.get("has_accessible_stall") === "on",
      has_shower: formData.get("has_shower") === "on",
      description: (formData.get("description") as string) || null,
      x: formData.get("x") ? parseFloat(formData.get("x") as string) : null,
      y: formData.get("y") ? parseFloat(formData.get("y") as string) : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}

export async function deleteToilet(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("toilets").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}

export async function uploadPhoto(toiletId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const file = formData.get("photo") as File;

  if (!file || file.size === 0) {
    return { error: "No file selected" };
  }

  const publicUrl = await uploadToiletPhoto(toiletId, file);

  const { data: toilet } = await supabase
    .from("toilets")
    .select("photos")
    .eq("id", toiletId)
    .single();

  const photos = [...(toilet?.photos ?? []), publicUrl];

  const { error } = await supabase
    .from("toilets")
    .update({ photos })
    .eq("id", toiletId);

  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true, url: publicUrl };
}

export async function removePhoto(toiletId: string, photoUrl: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: toilet } = await supabase
    .from("toilets")
    .select("photos")
    .eq("id", toiletId)
    .single();

  const photos = (toilet?.photos ?? []).filter((p: string) => p !== photoUrl);

  const { error } = await supabase
    .from("toilets")
    .update({ photos })
    .eq("id", toiletId);

  if (error) return { error: error.message };
  revalidateAdmin();
  return { success: true };
}
