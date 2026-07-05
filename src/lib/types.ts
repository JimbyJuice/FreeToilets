export type ToiletGender = "male" | "female" | "all-gender" | "accessible";

export interface Building {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  floor_count: number;
  created_at: string;
  updated_at: string;
}

export interface FloorPlan {
  id: string;
  building_id: string;
  level: string;
  svg_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Toilet {
  id: string;
  building_id: string;
  floor_plan_id: string | null;
  x: number | null;
  y: number | null;
  name: string;
  gender: ToiletGender;
  has_accessible_stall: boolean;
  has_shower: boolean;
  description: string | null;
  photos: string[];
  model_3d_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  toilet_id: string;
  rating: number;
  comment: string | null;
  author_label: string;
  verified_email: string | null;
  created_at: string;
}

export interface ToiletWithRelations extends Toilet {
  building?: Building;
  floor_plan?: FloorPlan | null;
}

export const TOILET_GENDERS: { value: ToiletGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "all-gender", label: "All-gender" },
  { value: "accessible", label: "Accessible" },
];
