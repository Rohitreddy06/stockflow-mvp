"use client";

import { useActionState } from "react";
import { deleteProduct, updateStock } from "@/app/actions";
import type { ActionState } from "@/lib/action-state";

interface ProductControlsProps {
  productId: string;
  quantityOnHand: number;
}

const initialState: ActionState = {};

export default function ProductControls({
  productId,
  quantityOnHand,
}: ProductControlsProps) {
  const [decrementState, decrementAction, decrementPending] = useActionState(
    updateStock,
    initialState,
  );
  const [incrementState, incrementAction, incrementPending] = useActionState(
    updateStock,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteProduct,
    initialState,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={decrementAction}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="change" value="-1" />
        <button
          type="submit"
          disabled={quantityOnHand <= 0 || decrementPending}
          aria-label="Decrease stock by one"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          −1
        </button>
      </form>
      <form action={incrementAction}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="change" value="1" />
        <button
          type="submit"
          disabled={incrementPending}
          aria-label="Increase stock by one"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          +1
        </button>
      </form>
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm("Delete this product? This cannot be undone.")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="productId" value={productId} />
        <button
          type="submit"
          disabled={deletePending}
          className="rounded-md px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40"
        >
          {deletePending ? "Deleting..." : "Delete"}
        </button>
      </form>
      {(decrementState.error || incrementState.error || deleteState.error) && (
        <p role="alert" className="basis-full text-xs text-rose-700">
          {decrementState.error || incrementState.error || deleteState.error}
        </p>
      )}
      {!(
        decrementState.error ||
        incrementState.error ||
        deleteState.error
      ) &&
        (decrementState.success || incrementState.success || deleteState.success) && (
          <p role="status" className="basis-full text-xs text-emerald-700">
            Product updated.
          </p>
        )}
    </div>
  );
}
