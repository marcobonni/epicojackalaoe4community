"use client";

import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className: string;
  disabledClassName?: string;
};

export default function PendingSubmitButton({
  idleLabel,
  pendingLabel,
  className,
  disabledClassName,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${className} ${
        pending
          ? disabledClassName ??
            "cursor-not-allowed opacity-75 saturate-75"
          : ""
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {pending ? (
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-current opacity-80 animate-pulse"
          />
        ) : null}
        {pending ? pendingLabel : idleLabel}
      </span>
      <span className="sr-only" aria-live="polite">
        {pending ? pendingLabel : ""}
      </span>
    </button>
  );
}
