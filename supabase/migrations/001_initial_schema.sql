-- FreeToilets initial schema (Phase 1)

-- Custom types
CREATE TYPE toilet_gender AS ENUM ('male', 'female', 'all-gender', 'accessible');

-- Buildings
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  floor_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Floor plans
CREATE TABLE floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  svg_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (building_id, level)
);

-- Toilets
CREATE TABLE toilets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_plan_id UUID REFERENCES floor_plans(id) ON DELETE SET NULL,
  x DOUBLE PRECISION,
  y DOUBLE PRECISION,
  name TEXT NOT NULL,
  gender toilet_gender NOT NULL DEFAULT 'all-gender',
  has_accessible_stall BOOLEAN NOT NULL DEFAULT false,
  has_shower BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  model_3d_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews (schema ready; submission UI comes in Phase 3)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toilet_id UUID NOT NULL REFERENCES toilets(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  author_label TEXT NOT NULL DEFAULT 'Anonymous',
  verified_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin allowlist (emails that can access admin panel)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER floor_plans_updated_at
  BEFORE UPDATE ON floor_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER toilets_updated_at
  BEFORE UPDATE ON toilets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Derived stats view for toilets
CREATE VIEW toilet_stats AS
SELECT
  t.id AS toilet_id,
  COUNT(r.id) AS review_count,
  ROUND(AVG(r.rating)::numeric, 2) AS average_rating,
  ROUND(AVG(r.rating)::numeric, 2) AS cleanliness_score
FROM toilets t
LEFT JOIN reviews r ON r.toilet_id = t.id
GROUP BY t.id;

-- Row Level Security
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE toilets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read buildings"
  ON buildings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public can read floor_plans"
  ON floor_plans FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public can read toilets"
  ON toilets FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT TO anon, authenticated USING (true);

-- Admin write access (authenticated user in admin_users)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = (auth.jwt() ->> 'email')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Admins can insert buildings"
  ON buildings FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "Admins can update buildings"
  ON buildings FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete buildings"
  ON buildings FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Admins can insert floor_plans"
  ON floor_plans FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "Admins can update floor_plans"
  ON floor_plans FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete floor_plans"
  ON floor_plans FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Admins can insert toilets"
  ON toilets FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "Admins can update toilets"
  ON toilets FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete toilets"
  ON toilets FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Admins can read admin_users"
  ON admin_users FOR SELECT TO authenticated USING (is_admin());

-- Storage buckets (run via Supabase dashboard or storage API)
-- Bucket: toilet-photos (public read, admin write)
-- Bucket: floor-plans (public read, admin write)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('toilet-photos', 'toilet-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('floor-plans', 'floor-plans', true, 10485760, ARRAY['image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read toilet photos"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'toilet-photos');

CREATE POLICY "Admins can upload toilet photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'toilet-photos' AND is_admin());

CREATE POLICY "Admins can update toilet photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'toilet-photos' AND is_admin());

CREATE POLICY "Admins can delete toilet photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'toilet-photos' AND is_admin());

CREATE POLICY "Public can read floor plans"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'floor-plans');

CREATE POLICY "Admins can upload floor plans"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'floor-plans' AND is_admin());

CREATE POLICY "Admins can update floor plans"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'floor-plans' AND is_admin());

CREATE POLICY "Admins can delete floor plans"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'floor-plans' AND is_admin());
