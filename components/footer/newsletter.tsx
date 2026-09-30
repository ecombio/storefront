"use client";

import { cn } from "cn";
import { ChevronDown, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState, useId, useState } from "react";

import { subscribeToNewsletter } from "./newsletter-action";

export function Newsletter({ privacyHref }: { privacyHref?: string }) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, { status: "idle" });
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const noteId = useId();

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div className="max-w-sm">
        <h2 className="text-base font-semibold">Stay in the loop</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Be the first to hear about new arrivals, exclusive deals and news.
        </p>
      </div>

      <div className="w-full md:max-w-md">
        <form action={formAction} className="flex gap-2">
          <label htmlFor={inputId} className="sr-only">
            Email
          </label>
          <div className="relative flex-1">
            <input
              id={inputId}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className="h-10 w-full rounded-md border border-border bg-background pl-3 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            />
            <Mail
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-10 shrink-0 rounded-md bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p
          role="status"
          className={cn(
            "mt-2 text-sm",
            state.status === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {state.message}
        </p>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={noteId}
          onClick={() => setOpen((value) => !value)}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm underline underline-offset-2"
        >
          <ChevronDown
            className={cn("size-3.5 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
          Learn more
        </button>
        <div id={noteId} hidden={!open} className="mt-2 text-sm text-muted-foreground">
          <p>
            By signing up, you agree to receive marketing emails from us. You can unsubscribe at any
            time using the link in any email we send, and you can ask to access, correct or delete
            your data.
          </p>
          {privacyHref && (
            <p className="mt-2">
              <Link href={privacyHref} className="font-semibold text-foreground underline">
                Read our privacy policy
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
