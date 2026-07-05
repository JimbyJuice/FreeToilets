"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  createToilet,
  deleteToilet,
  removePhoto,
  updateToilet,
  uploadPhoto,
} from "@/app/admin/actions";
import type { Building, FloorPlan, Toilet } from "@/lib/types";
import { TOILET_GENDERS } from "@/lib/types";

function ToiletFormFields({
  buildings,
  floorPlans,
  toilet,
}: {
  buildings: Building[];
  floorPlans: FloorPlan[];
  toilet?: Toilet;
}) {
  const [buildingId, setBuildingId] = useState(toilet?.building_id ?? "");

  const filteredFloors = floorPlans.filter((fp) => fp.building_id === buildingId);

  return (
    <>
      <select
        name="building_id"
        required
        value={buildingId}
        onChange={(e) => setBuildingId(e.target.value)}
        className="rounded border border-border px-3 py-2 text-sm"
      >
        <option value="">Select building</option>
        {buildings.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <select
        name="floor_plan_id"
        defaultValue={toilet?.floor_plan_id ?? ""}
        className="rounded border border-border px-3 py-2 text-sm"
      >
        <option value="">No floor plan</option>
        {filteredFloors.map((fp) => (
          <option key={fp.id} value={fp.id}>
            Level {fp.level}
          </option>
        ))}
      </select>
      <input
        name="name"
        placeholder="Toilet name"
        required
        defaultValue={toilet?.name}
        className="rounded border border-border px-3 py-2 text-sm"
      />
      <select
        name="gender"
        defaultValue={toilet?.gender ?? "all-gender"}
        className="rounded border border-border px-3 py-2 text-sm"
      >
        {TOILET_GENDERS.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input
          name="has_accessible_stall"
          type="checkbox"
          defaultChecked={toilet?.has_accessible_stall}
        />
        Has accessible stall
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          name="has_shower"
          type="checkbox"
          defaultChecked={toilet?.has_shower}
        />
        Has shower
      </label>
      <textarea
        name="description"
        placeholder="Admin description (optional)"
        rows={2}
        defaultValue={toilet?.description ?? ""}
        className="rounded border border-border px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="x"
          type="number"
          step="any"
          placeholder="Pin X (optional)"
          defaultValue={toilet?.x ?? ""}
          className="rounded border border-border px-3 py-2 text-sm"
        />
        <input
          name="y"
          type="number"
          step="any"
          placeholder="Pin Y (optional)"
          defaultValue={toilet?.y ?? ""}
          className="rounded border border-border px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

function PhotoUpload({ toilet }: { toilet: Toilet }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleUpload(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await uploadPhoto(toilet.id, formData);
      if (result?.error) setError(result.error);
    });
  }

  function handleRemove(url: string) {
    if (!confirm("Remove this photo?")) return;
    startTransition(async () => {
      await removePhoto(toilet.id, url);
    });
  }

  return (
    <div className="mt-2 border-t border-border pt-2">
      <p className="mb-2 text-xs font-medium text-muted">Photos</p>
      {toilet.photos.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {toilet.photos.map((url) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute -right-1 -top-1 rounded-full bg-danger px-1 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <form action={handleUpload} className="flex items-center gap-2">
        <input name="photo" type="file" accept="image/*" className="text-xs" />
        <button
          type="submit"
          disabled={pending}
          className="text-xs text-accent hover:underline disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function ToiletForm({
  buildings,
  floorPlans,
  toilet,
  onDone,
}: {
  buildings: Building[];
  floorPlans: FloorPlan[];
  toilet?: Toilet;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const isEdit = !!toilet;

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = isEdit
        ? await updateToilet(toilet.id, formData)
        : await createToilet(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
    >
      <h3 className="font-medium">{isEdit ? "Edit toilet" : "Add toilet"}</h3>
      <ToiletFormFields
        buildings={buildings}
        floorPlans={floorPlans}
        toilet={toilet}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded border border-border px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ToiletManager({
  buildings,
  floorPlans,
  toilets,
}: {
  buildings: Building[];
  floorPlans: FloorPlan[];
  toilets: Toilet[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Toilet | null>(null);
  const [pending, startTransition] = useTransition();

  const buildingMap = Object.fromEntries(buildings.map((b) => [b.id, b.name]));

  function handleDelete(id: string) {
    if (!confirm("Delete this toilet?")) return;
    startTransition(async () => {
      await deleteToilet(id);
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Toilets</h2>
        {!showForm && !editing && buildings.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-hover"
          >
            Add toilet
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <ToiletForm
          buildings={buildings}
          floorPlans={floorPlans}
          toilet={editing ?? undefined}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {buildings.length === 0 ? (
        <p className="text-sm text-muted">Add a building first.</p>
      ) : toilets.length === 0 ? (
        <p className="text-sm text-muted">No toilets yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {toilets.map((t) => (
            <li key={t.id} className="px-4 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted">
                    {buildingMap[t.building_id]} · {t.gender}
                    {t.has_accessible_stall && " · accessible"}
                    {t.has_shower && " · shower"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(t)}
                    className="text-sm text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={pending}
                    className="text-sm text-danger hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <PhotoUpload toilet={t} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
