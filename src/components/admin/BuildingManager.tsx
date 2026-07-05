"use client";

import { useState, useTransition } from "react";
import {
  createBuilding,
  deleteBuilding,
  updateBuilding,
} from "@/app/admin/actions";
import type { Building } from "@/lib/types";

function BuildingForm({
  building,
  onDone,
}: {
  building?: Building;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const isEdit = !!building;

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = isEdit
        ? await updateBuilding(building.id, formData)
        : await createBuilding(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <h3 className="font-medium">{isEdit ? "Edit building" : "Add building"}</h3>
      <input
        name="name"
        placeholder="Building name"
        required
        defaultValue={building?.name}
        className="rounded border border-border px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="latitude"
          type="number"
          step="any"
          placeholder="Latitude"
          required
          defaultValue={building?.latitude}
          className="rounded border border-border px-3 py-2 text-sm"
        />
        <input
          name="longitude"
          type="number"
          step="any"
          placeholder="Longitude"
          required
          defaultValue={building?.longitude}
          className="rounded border border-border px-3 py-2 text-sm"
        />
      </div>
      <input
        name="floor_count"
        type="number"
        min="0"
        placeholder="Floor count"
        defaultValue={building?.floor_count ?? 0}
        className="rounded border border-border px-3 py-2 text-sm"
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
          className="rounded border border-border px-3 py-1.5 text-sm hover:bg-background"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function BuildingManager({ buildings }: { buildings: Building[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this building and all related data?")) return;
    startTransition(async () => {
      await deleteBuilding(id);
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Buildings</h2>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-hover"
          >
            Add building
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <BuildingForm
          building={editing ?? undefined}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {buildings.length === 0 ? (
        <p className="text-sm text-muted">No buildings yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {buildings.map((b) => (
            <li key={b.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-muted">
                  {b.latitude.toFixed(5)}, {b.longitude.toFixed(5)} · {b.floor_count} floors
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(b)}
                  className="text-sm text-accent hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={pending}
                  className="text-sm text-danger hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
