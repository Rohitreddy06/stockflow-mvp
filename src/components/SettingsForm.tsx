"use client";

import { useActionState } from "react";
import { updateSettings } from "@/app/actions";
import type { ActionState } from "@/lib/action-state";

const initialState: ActionState = {};

export default function SettingsForm({
  defaultLowStockAlert,
}: {
  defaultLowStockAlert: number;
}) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-lg space-y-4">
      <label htmlFor="defaultLowStockAlert" className="block text-sm font-medium text-slate-700">
        Default low-stock threshold
      </label>
      <p className="text-sm text-slate-500">
        Products without their own threshold use this quantity to trigger a low-stock alert.
      </p>
      <input
        id="defaultLowStockAlert"
        name="defaultLowStockAlert"
        type="number"
        min={0}
        step={1}
        defaultValue={defaultLowStockAlert}
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 sm:w-56"
      />
      {state.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-700">Settings saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="block rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
