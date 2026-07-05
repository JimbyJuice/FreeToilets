"use client";

import { useState, useTransition } from "react";
import { createFloorPlan, deleteFloorPlan } from "@/app/admin/actions";
import type { Building, FloorPlan } from "@/lib/types";

export function FloorPlanManager({
  buildings,
  floorPlans,
}: {
  buildings: Building[];
  floorPlans: FloorPlan[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createFloorPlan(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowForm(false);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this floor plan?")) return;
    startTransition(async () => {
      await deleteFloorPlan(id);
    });
  }

  const buildingMap = Object.fromEntries(buildings.map((b) => [b.id, b.name]));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Floor plans</h2>
        {!showForm && buildings.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-hover"
          >
            Add floor plan
          </button>
        )}
      </div>

      {showForm && (
        <form
          action={handleSubmit}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
        >
          <h3 className="font-medium">Add floor plan</h3>
          <select
            name="building_id"
            required
            className="rounded border border-border px-3 py-2 text-sm"
          >
            <option value="">Select building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            name="level"
            placeholder="Level (e.g. G, 1, 2, B1)"
            required
            className="rounded border border-border px-3 py-2 text-sm"
          />
          <div>
            <label className="mb-1 block text-sm text-muted">SVG file (optional)</label>
            <input
              name="svg"
              type="file"
              accept="image/svg+xml"
              className="text-sm"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {pending ? "Uploading…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-border px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {buildings.length === 0 ? (
        <p className="text-sm text-muted">Add a building first.</p>
      ) : floorPlans.length === 0 ? (
        <p className="text-sm text-muted">No floor plans yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {floorPlans.map((fp) => (
            <li key={fp.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">
                  {buildingMap[fp.building_id] ?? "Unknown"} — Level {fp.level}
                </p>
                <p className="text-xs text-muted">
                  {fp.svg_url ? "SVG uploaded" : "No SVG yet"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(fp.id)}
                disabled={pending}
                className="text-sm text-danger hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
