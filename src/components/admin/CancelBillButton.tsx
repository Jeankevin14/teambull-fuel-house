"use client";

import { useActionState, useState } from "react";
import { cancelBillAction, type CancelState } from "@/app/actions/billing";
import { formatPrice } from "@/lib/format";

/**
 * Cancels a bill, behind a confirmation so it cannot happen on a stray tap.
 *
 * The bill is kept and marked cancelled rather than erased: its number can
 * never be given to another sale, and the shop keeps a record of what happened.
 */
export default function CancelBillButton({
  billNo,
  total,
  compact = false,
}: {
  billNo: string;
  total: number;
  /** true in the Recent bills list, where there is less room */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<CancelState, FormData>(
    cancelBillAction,
    { ok: false }
  );

  const btn =
    "rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold text-foreground hover:border-accent hover:text-accent";

  if (state.ok) {
    return (
      <span className="text-sm font-semibold text-green-700">
        ✓ Cancelled
      </span>
    );
  }

  if (!open) {
    return (
      <span className="inline-flex flex-col items-start gap-1">
        <button type="button" onClick={() => setOpen(true)} className={btn}>
          Cancel bill
        </button>
        {state.error && (
          <span className="text-xs font-semibold text-accent">{state.error}</span>
        )}
      </span>
    );
  }

  return (
    <form
      action={formAction}
      className={`rounded-lg border border-accent bg-accent-soft p-4 ${compact ? "w-full" : "w-full max-w-md"}`}
    >
      <input type="hidden" name="billNo" value={billNo} />

      <p className="text-sm font-semibold text-accent-dark">
        Cancel bill {billNo} · {formatPrice(total)}?
      </p>
      <p className="mt-1 text-xs text-muted">
        It stops counting towards your sales. The bill is kept and marked cancelled,
        so the number is never used again.
      </p>

      <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="restock" value="yes" defaultChecked className="h-4 w-4" />
        Put the items back in stock
      </label>
      <p className="mt-1 text-xs text-muted">
        Untick this if the customer kept the goods.
      </p>

      <label className="mt-3 block text-sm font-semibold text-foreground">
        Reason <span className="font-normal text-muted">(optional)</span>
        <input
          name="reason"
          maxLength={120}
          placeholder="wrong item, customer returned it…"
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>

      {state.error && (
        <p className="mt-3 text-sm font-semibold text-accent-dark">{state.error}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase text-white disabled:opacity-50"
        >
          {pending ? "Cancelling…" : "Yes, cancel it"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={btn}>
          Keep the bill
        </button>
      </div>
    </form>
  );
}
