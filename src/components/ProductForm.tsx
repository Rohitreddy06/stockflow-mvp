"use client";

import { useActionState } from "react";
import { createProduct, updateProduct } from "@/app/actions";
import type { ActionState } from "@/lib/action-state";

export interface ProductFormValues {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantityOnHand: number;
  costPrice: number | null;
  sellingPrice: number | null;
  lowStockThreshold: number | null;
}

interface ProductFormProps {
  product?: ProductFormValues;
}

const initialState: ActionState = {};

export default function ProductForm({ product }: ProductFormProps) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {product && <input type="hidden" name="productId" value={product.id} />}
      <label className="text-sm font-medium text-slate-700">
        Name
        <input
          name="name"
          type="text"
          maxLength={200}
          defaultValue={product?.name}
          required
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        SKU
        <input
          name="sku"
          type="text"
          maxLength={100}
          defaultValue={product?.sku}
          required
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </label>
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">
        Description
        <textarea
          name="description"
          maxLength={2000}
          rows={2}
          defaultValue={product?.description ?? ""}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Quantity on hand
        <input
          name="quantityOnHand"
          type="number"
          min={0}
          step={1}
          defaultValue={product?.quantityOnHand ?? 0}
          required
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Low-stock threshold
        <input
          name="lowStockThreshold"
          type="number"
          min={0}
          step={1}
          defaultValue={product?.lowStockThreshold ?? ""}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Cost price
        <input
          name="costPrice"
          type="number"
          min={0}
          step="0.01"
          defaultValue={product?.costPrice ?? ""}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Selling price
        <input
          name="sellingPrice"
          type="number"
          min={0}
          step="0.01"
          defaultValue={product?.sellingPrice ?? ""}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </label>
      <div className="sm:col-span-2">
        {state.error && (
          <p role="alert" className="mb-3 text-sm text-rose-700">{state.error}</p>
        )}
        {state.success && (
          <p role="status" className="mb-3 text-sm text-emerald-700">Product saved.</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Saving..." : product ? "Save changes" : "Add product"}
        </button>
      </div>
    </form>
  );
}
